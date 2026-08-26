#!/usr/bin/env node
/*
 * Living Exiles generator (Agent #4).
 * Generates 64x64 class character sprites + 4-frame animations via PixelLab,
 * at DEV TIME on your machine. Writes PNGs to /assets/exiles.
 * The shipped site never calls PixelLab; your key never leaves this machine.
 *
 * Base sprite : POST /generate-image-pixflux  (no_background: true)
 * Animations  : POST /animate-with-text       (64x64 only; returns 4 frames)
 * Balance     : GET  /balance                 (printed before/after, never the key)
 *
 * Run:   node tools/generate-exiles.mjs                 # everything missing
 *        node tools/generate-exiles.mjs --force warrior # redo one class
 *        node tools/generate-exiles.mjs warrior:hit     # one class one action
 *        node tools/generate-exiles.mjs --base-only warrior
 *
 * Files: assets/exiles/<class>-base.png  and  <class>-<action>-<n>.png (n=0..3)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.pixellab.ai/v1';

function loadKey() {
  if (process.env.PIXELLAB_API_KEY) return process.env.PIXELLAB_API_KEY.trim();
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*PIXELLAB_API_KEY\s*=\s*(.*)$/);
      if (m) return m[1].replace(/^["']|["']$/g, '').trim();
    }
  }
  return '';
}

async function api(key, method, endpoint, body) {
  const res = await fetch(`${API}/${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

const b64ToBuf = b64 => Buffer.from(String(b64).replace(/^data:image\/\w+;base64,/, ''), 'base64');

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('No PIXELLAB_API_KEY found. Copy .env.example to .env and paste your key.');
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const baseOnly = args.includes('--base-only');
  const only = args.filter(a => !a.startsWith('--')); // "warrior" or "warrior:hit"

  const man = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'exiles.manifest.json'), 'utf8'));
  const outDir = path.join(root, man.outDir);
  fs.mkdirSync(outDir, { recursive: true });
  const size = man.size || 64;

  // wants(cls) — any filter mentions the class; wants(cls, act) — filter allows the action.
  // wantsBase(cls) — true only for a bare "warrior" filter (so "warrior:hit --force"
  // does NOT force-redo the good base; a missing base is still created regardless).
  const wants = (cls, act) => {
    if (!only.length) return true;
    return only.some(o => {
      const [c, a] = o.split(':');
      return c === cls && (!a || !act || a === act);
    });
  };
  const wantsBase = cls => !only.length || only.includes(cls);

  const before = await api(key, 'GET', 'balance');
  console.log(`Balance before: $${Number(before.usd).toFixed(2)}`);

  let calls = 0, failed = 0;
  for (const cls of man.classes) {
    if (!wants(cls.name)) continue;
    const baseFile = path.join(outDir, `${cls.name}-base.png`);
    const desc = cls.description + man.styleSuffix;

    // 1. base sprite
    if (!fs.existsSync(baseFile) || (force && wantsBase(cls.name))) {
      process.stdout.write(`base  ${cls.name}  ${size}x${size} ... `);
      try {
        const r = await api(key, 'POST', 'generate-image-pixflux', {
          description: desc,
          negative_description: man.negative || '',
          image_size: { width: size, height: size },
          no_background: true,
          view: 'side',
          direction: 'south',
        });
        fs.writeFileSync(baseFile, b64ToBuf(r.image.base64));
        calls++;
        console.log('ok');
      } catch (e) { failed++; console.log('FAILED\n      ' + e.message); continue; }
    } else console.log(`skip  ${cls.name}-base (exists)`);

    if (baseOnly) continue;
    const refB64 = fs.readFileSync(baseFile).toString('base64');

    // 2. animations (per-class overrides in manifest "overrides" merge over the action)
    for (const baseAct of man.actions) {
      const ov = (cls.overrides && cls.overrides[baseAct.name]) || {};
      const act = { ...baseAct, ...ov };
      if (!wants(cls.name, act.name)) continue;
      const frameFile = n => path.join(outDir, `${cls.name}-${act.name}-${n}.png`);
      const have = [0, 1, 2, 3].every(n => fs.existsSync(frameFile(n)));
      if (have && !force) { console.log(`skip  ${cls.name}-${act.name} (4 frames exist)`); continue; }
      process.stdout.write(`anim  ${cls.name}-${act.name} ... `);
      try {
        const r = await api(key, 'POST', 'animate-with-text', {
          image_size: { width: 64, height: 64 },
          description: desc,
          negative_description: man.animNegative || man.negative || '',
          action: act.action,
          reference_image: { type: 'base64', base64: refB64 },
          image_guidance_scale: act.image_guidance_scale || 1.4,
          text_guidance_scale: act.text_guidance_scale || 8,
          view: 'side',
          direction: 'south',
        });
        const frames = r.images || [];
        frames.slice(0, 4).forEach((img, n) => fs.writeFileSync(frameFile(n), b64ToBuf(img.base64)));
        calls++;
        console.log(`ok  (${frames.length} frames)`);
      } catch (e) { failed++; console.log('FAILED\n      ' + e.message); }
    }
  }

  const after = await api(key, 'GET', 'balance');
  console.log(`\n${calls} API generations, ${failed} failed.`);
  console.log(`Balance after:  $${Number(after.usd).toFixed(2)}  (spent ~$${(before.usd - after.usd).toFixed(2)})`);
}
main();
