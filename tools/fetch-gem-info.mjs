#!/usr/bin/env node
// ================================================================
// fetch-gem-info.mjs — DEV-TIME ONLY gem description baker.
//
// Reads data/vetology-data.js, collects the UNIQUE gems referenced by
// ARCHETYPE_SKILLS (the gems the guide actually renders — NOT all ~860),
// fetches each gem's poe2db page, extracts a 1-2 sentence description
// (og:description first, meta description second, first paragraph last)
// plus the GemTags anchors, and bakes the result back INTO
// data/vetology-data.js as an appended `const GEM_INFO = {...}` between
// marker comments (idempotent: re-running replaces the block in place).
//
// The SHIPPED SITE makes zero API calls — this is the same dev-time
// pattern as tools/generate-assets.mjs. Node 18+ (global fetch), no npm.
//
// Usage (from the project root):
//   node tools/fetch-gem-info.mjs            # fetch + bake (skips gems already described)
//   node tools/fetch-gem-info.mjs --force    # refetch everything, ignore baked entries
//   node tools/fetch-gem-info.mjs --dry-run  # fetch + report, no write
//   node tools/fetch-gem-info.mjs --limit=5  # only the first N gems (smoke test)
//
// Resumable: by default, gems that already have a non-null entry in the
// baked GEM_INFO block are kept as-is and not refetched — only missing or
// null entries hit the network. If a gem's listed url 404s, a URL derived
// from its display name (spaces -> underscores) is tried as a fallback.
// ================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA_PATH = join(ROOT, 'data', 'vetology-data.js');
const BEGIN = '// -- GEM_INFO (baked by tools/fetch-gem-info.mjs — do not hand-edit) BEGIN --';
const END = '// -- GEM_INFO BEGIN/END markers are replaced wholesale on re-run — END --';

const DRY = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');
const limitArg = process.argv.find(a => a.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const DELAY_MS = 300;
const FETCH_TIMEOUT_MS = 25000;

// poe2db's generic site-wide meta description — never a gem description.
const GENERIC_JUNK = /path of exile is simply a tool/i;

// ── load the data file and pull ARCHETYPE_SKILLS out of it ──────
const dataSrc = readFileSync(DATA_PATH, 'utf8');
const ctx = {};
vm.createContext(ctx);
try {
  vm.runInContext(dataSrc + '\n;globalThis.__EXPORT__ = { ARCHETYPE_SKILLS, GEM_INFO: (typeof GEM_INFO !== "undefined" ? GEM_INFO : {}) };', ctx);
} catch (e) {
  console.error('Could not evaluate data/vetology-data.js:', e.message);
  process.exit(1);
}
const ARCHETYPE_SKILLS = ctx.__EXPORT__.ARCHETYPE_SKILLS;
const BAKED = FORCE ? {} : (ctx.__EXPORT__.GEM_INFO || {});

const gems = new Map(); // name -> url
for (const arch of Object.keys(ARCHETYPE_SKILLS)) {
  for (const g of ARCHETYPE_SKILLS[arch]) {
    if (g && g.name && g.url && !gems.has(g.name)) gems.set(g.name, g.url);
  }
}
const allNames = [...gems.keys()];
const names = allNames.filter(n => !(BAKED[n] && BAKED[n].desc)).slice(0, LIMIT);
const kept = allNames.length - allNames.filter(n => !(BAKED[n] && BAKED[n].desc)).length;
console.log(`Archetypes: ${Object.keys(ARCHETYPE_SKILLS).length} · unique gems referenced: ${gems.size} · already described (kept): ${kept} · fetching: ${names.length}`);

// ── helpers ─────────────────────────────────────────────────────
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '...', rsquo: '’', lsquo: '‘',
  rdquo: '”', ldquo: '“', percnt: '%',
};
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (_, n) => NAMED_ENTITIES[n.toLowerCase()] ?? `&${n};`);
}
function cleanText(s) {
  return decodeEntities(s)
    .replace(/<[^>]+>/g, ' ')
    // house style: no em dashes in rendered text — soften to a spaced hyphen
    .replace(/\s*—\s*/g, ' - ')
    .replace(/\s+/g, ' ')
    .trim();
}
function firstSentences(s, n = 2) {
  const parts = s.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!parts) return s.length > 240 ? s.slice(0, 237) + '...' : s;
  const out = parts.slice(0, n).join('').trim();
  return out || s;
}
function extractDesc(html) {
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  if (og && og[1] && !GENERIC_JUNK.test(og[1])) {
    const t = cleanText(og[1]);
    if (t.length >= 20) return firstSentences(t);
  }
  const md = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  if (md && md[1] && !GENERIC_JUNK.test(md[1])) {
    const t = cleanText(md[1]);
    if (t.length >= 20) return firstSentences(t);
  }
  // last resort: the first plausible paragraph of the body
  const paras = html.match(/<p[^>]*>([\s\S]{40,600}?)<\/p>/gi);
  if (paras) {
    for (const p of paras) {
      const t = cleanText(p);
      if (t.length >= 40 && !GENERIC_JUNK.test(t)) return firstSentences(t);
    }
  }
  return null;
}
function extractTags(html) {
  const tags = [];
  const re = /<a[^>]+class=["'][^"']*GemTags[^"']*["'][^>]*>([^<]{1,32})<\/a>/gi;
  let m;
  while ((m = re.exec(html)) && tags.length < 12) {
    const t = decodeEntities(m[1]).trim();
    if (/^[A-Za-z][A-Za-z' -]{1,28}$/.test(t) && !tags.includes(t)) tags.push(t);
  }
  return tags.slice(0, 6); // first block on the page = the headline gem
}
function fetchWithTimeout(url) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, {
    signal: ac.signal,
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'accept': 'text/html,application/xhtml+xml',
      'accept-language': 'en-US,en;q=0.9',
    },
  }).finally(() => clearTimeout(timer));
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── fetch loop ──────────────────────────────────────────────────
// Candidate URLs per gem: the listed url first, then one derived from the
// display name (spaces -> underscores) — poe2db page slugs sometimes differ
// from the urls recorded in ARCHETYPE_SKILLS (e.g. tiered supports, renames).
function candidateUrls(name, url) {
  const out = [url];
  const derived = 'https://poe2db.tw/us/' + name.replace(/[^A-Za-z0-9 ]/g, '').trim().replace(/ +/g, '_');
  if (!out.includes(derived)) out.push(derived);
  return out;
}

const info = {};
let ok = 0, nulls = 0, errs = 0;
for (let i = 0; i < names.length; i++) {
  const name = names[i];
  const tag = `[${String(i + 1).padStart(3)}/${names.length}]`;
  const urls = candidateUrls(name, gems.get(name));
  let done = false, lastNote = '';
  for (let u = 0; u < urls.length && !done; u++) {
    const url = urls[u];
    const via = u > 0 ? ' (name-derived fallback)' : '';
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        lastNote = `HTTP ${res.status}`;
      } else {
        const html = await res.text();
        const desc = extractDesc(html);
        const tags = extractTags(html);
        if (desc) {
          info[name] = { desc, tags };
          ok++; done = true;
          console.log(`${tag} ${name} · ok (${desc.length} chars, ${tags.length} tags)${via}`);
        } else {
          lastNote = 'page yielded nothing usable';
        }
      }
    } catch (e) {
      lastNote = `ERROR ${e.message}`; errs++;
    }
    if (!done && u < urls.length - 1) await sleep(DELAY_MS);
  }
  if (!done) {
    info[name] = null; nulls++;
    console.log(`${tag} ${name} · ${lastNote} · null`);
  }
  if (i < names.length - 1) await sleep(DELAY_MS);
}
console.log(`\nFetched: ${ok} with descriptions · ${nulls} null (${errs} fetch errors along the way) · ${names.length} attempted · ${kept} kept from previous bake`);

// ── bake into data/vetology-data.js ─────────────────────────────
// Merge: kept entries from the previous bake + everything fetched this run,
// emitted in ARCHETYPE_SKILLS order so the block is deterministic.
const merged = {};
for (const n of allNames) {
  if (n in info) merged[n] = info[n];
  else if (BAKED[n] && BAKED[n].desc) merged[n] = BAKED[n];
  else merged[n] = null;
}
const totalOk = Object.values(merged).filter(v => v && v.desc).length;
const totalNull = allNames.length - totalOk;
const lines = Object.keys(merged).map(n =>
  `  ${JSON.stringify(n)}: ${merged[n] ? JSON.stringify(merged[n]) : 'null'},`
);
const block = [
  BEGIN,
  '// Descriptions quoted from poe2db (fetched dev-time; the shipped site never fetches).',
  `// Coverage: ${totalOk}/${allNames.length} described, ${totalNull} null. Baked: ${new Date().toISOString().slice(0, 10)}.`,
  'const GEM_INFO = {',
  ...lines,
  '};',
  END,
].join('\n');

if (DRY) {
  console.log('\n--dry-run: not writing. Block preview (first 800 chars):\n');
  console.log(block.slice(0, 800));
  process.exit(0);
}

let next;
const bi = dataSrc.indexOf(BEGIN);
const ei = dataSrc.indexOf(END);
if (bi >= 0 && ei > bi) {
  next = dataSrc.slice(0, bi) + block + dataSrc.slice(ei + END.length);
} else {
  next = dataSrc.replace(/\s*$/, '\n\n\n') + block + '\n';
}
writeFileSync(DATA_PATH, next, 'utf8');
console.log(`Wrote GEM_INFO (${Object.keys(merged).length} entries, ${totalOk} described) into data/vetology-data.js`);
console.log('Now run: node --check data/vetology-data.js && node tools/validate.js');
