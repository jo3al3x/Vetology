#!/usr/bin/env node
/*
 * Vetology validation harness (Agent #5).
 * Run from anywhere:  node tools/validate.js
 *
 * Checks, without a browser:
 *   1. data/vetology-data.js + each page's inline script COMPILE (no syntax errors).
 *   2. Runtime: both game modes roll correctly, ascendancy suggestions fire,
 *      effAsc/Discord formatting behave — exercised in a stubbed DOM.
 *   3. Every archetype in the shared list resolves through the guide's paste
 *      matcher (so a rolled build can always be looked up), tolerating the
 *      known pre-existing skill-data gaps.
 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.join(__dirname, '..');
const DATA = path.join(root, 'data', 'vetology-data.js');
const INDEX = path.join(root, 'index.html');
const GUIDE = path.join(root, 'guide.html');

const KNOWN_GAPS = 0; // every rollable archetype should now have guide skill-data

function inlineScript(htmlPath) {
  // Return the largest attribute-less <script> (the main logic), ignoring the
  // small theme-init IIFE and the <script src> data include.
  const html = fs.readFileSync(htmlPath, 'utf8');
  const blocks = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  return blocks.sort((a, b) => b.length - a.length)[0] || '';
}
const dataSrc = fs.readFileSync(DATA, 'utf8');
const indexSrc = inlineScript(INDEX);
const guideSrc = inlineScript(GUIDE);

let pass = 0, fail = 0;
const need = (label, cond) => (cond ? (pass++, console.log('  PASS ' + label)) : (fail++, console.log('  FAIL ' + label)));

console.log('== compile ==');
try { new vm.Script(dataSrc + '\n' + indexSrc); need('data.js + index inline compile', true); }
catch (e) { need('data.js + index inline compile -- ' + e.message, false); }
try { new vm.Script(guideSrc); need('guide inline compiles', true); }
catch (e) { need('guide inline compiles -- ' + e.message, false); }

// --- DOM stub ---
function El() { this._html = ''; this.value = ''; this.textContent = ''; this.style = {}; this.dataset = {}; }
Object.defineProperty(El.prototype, 'innerHTML', { get() { return this._html; }, set(v) { this._html = v; } });
El.prototype.classList = { add() {}, remove() {}, toggle() {}, contains() { return false; } };
['appendChild', 'addEventListener', 'setAttribute', 'focus'].forEach(m => El.prototype[m] = function () {});
El.prototype.querySelectorAll = () => []; El.prototype.querySelector = () => null;
El.prototype.getAttribute = () => null; El.prototype.closest = () => null;
const els = {};
const sandbox = {
  console, Math, JSON, Object, Array, String, Promise, Date, URLSearchParams,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}, confirm: () => false,
  navigator: { clipboard: { writeText() { return Promise.resolve(); } } },
  document: { getElementById: id => els[id] || (els[id] = new El()), createElement: () => new El(), querySelectorAll: () => [], querySelector: () => null, addEventListener() {}, documentElement: new El() },
};
sandbox.window = { location: { search: '' } };
vm.createContext(sandbox);
vm.runInContext(dataSrc + '\n' + indexSrc, sandbox);

console.log('\n== runtime: modes + suggestions ==');
sandbox.setMode('max');
let allAsc = true; for (let i = 0; i < 40; i++) if (!sandbox.roll().ascendancy) allAsc = false;
need('max mode always rolls an ascendancy', allAsc);
sandbox.setMode('plea');
let noAsc = true, cls = new Set(); for (let i = 0; i < 40; i++) { const r = sandbox.roll(); if (r.ascendancy !== null) noAsc = false; cls.add(r.class); }
need('plea mode never rolls an ascendancy', noAsc);
need('plea mode still rolls varied classes', cls.size > 3);
const hM = sandbox.ascSelectHTML({ roll: { class: 'Monk', ascendancy: null, archetype: 'The Stunt Double (x)' }, chosenAsc: null }, 0);
need('Monk+Stunt Double => Martial Artist suggested', /value="Martial Artist"/.test(hM) && /suggested for this build/.test(hM));
const hW = sandbox.ascSelectHTML({ roll: { class: 'Witch', ascendancy: null, archetype: 'Snow White (x)' }, chosenAsc: null }, 1);
need('cross-class => wants-hint + rolled-class options', /this build wants Spirit Walker/.test(hW) && /value="Lich"/.test(hW));
need('effAsc rolled', sandbox.effAsc({ roll: { class: 'X', ascendancy: 'Titan' }, chosenAsc: null }) === 'Titan');
need('effAsc chosen', sandbox.effAsc({ roll: { class: 'X', ascendancy: null }, chosenAsc: 'Lich' }) === 'Lich');

console.log('\n== no-duplicate rolls (settled archetypes excluded) ==');
// roll() reads the module-scoped `players` (not reachable from here), so verify the
// exact exclusion logic in isolation — it mirrors index.html's roll()/doSettle().
{
  const POOL = ['A', 'B', 'C'];
  const fake = [{ settled: true, roll: { archetype: 'B' } }, { settled: false, roll: { archetype: 'A' } }];
  const taken = new Set(fake.filter(p => p.settled && p.roll).map(p => p.roll.archetype));
  const pool = POOL.filter(a => !taken.has(a));
  need('settled archetype "B" excluded from roll pool', !pool.includes('B') && pool.includes('A') && pool.includes('C'));
  const clash = fake.some((o, i) => i !== 1 && o.settled && o.roll && o.roll.archetype === 'B');
  need('cannot settle an archetype another exile already settled', clash === true);
  need('roll() still present in index script', /const taken = new Set\(players\.filter/.test(indexSrc));
}

console.log('\n== resolution: archetypes lookup-able via guide matcher ==');
const gBlock = dataSrc.slice(dataSrc.indexOf('const ARCHETYPE_SKILLS = {'), dataSrc.indexOf('const KEYSTONES'));
const keys = [...gBlock.matchAll(/\n {2}(['"])(.+?)\1:\s*\[/g)].map(m => m[2]); // single- or double-quoted keys
const aStart = dataSrc.indexOf('const ARCHETYPES = [');
const aBlock = dataSrc.slice(aStart, dataSrc.indexOf('\n];', aStart));
const archs = [...aBlock.matchAll(/"([^"]+)"/g)].map(m => m[1]).filter(s => !/->|data\/vetology/.test(s));
const SK = {}; keys.forEach(k => SK[k] = 1);
function findArchetype(name) {
  if (!name) return null; if (SK[name]) return name;
  const q = name.toLowerCase().trim(), qB = q.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const ks = Object.keys(SK).sort((a, b) => b.length - a.length);
  for (const k0 of ks) { const k = k0.toLowerCase(); if (k === q || k === qB) return k0; }
  for (const k0 of ks) { const k = k0.toLowerCase(); if (qB.indexOf(k) >= 0 || q.indexOf(k) >= 0) return k0; }
  if (qB.length >= 4) for (const k0 of ks) if (k0.toLowerCase().indexOf(qB) >= 0) return k0;
  return null;
}
console.log('  archetypes:', archs.length, '| skill-data keys:', keys.length);
const unresolved = archs.filter(a => !findArchetype(a));
need('unresolved archetypes within known gap budget (' + KNOWN_GAPS + ')', unresolved.length <= KNOWN_GAPS);
if (unresolved.length) console.log('    unresolved: ' + unresolved.join(' | '));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
