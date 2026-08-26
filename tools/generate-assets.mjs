#!/usr/bin/env node
/*
 * Vetology pixel-art asset generator (Agent #4).
 * Calls the PixelLab API at DEV TIME on your machine and writes PNGs to /assets.
 * The shipped site never calls PixelLab; your key never leaves this machine.
 *
 * Setup:  cp .env.example .env   then paste your key into .env
 * Run:    node tools/generate-assets.mjs            # all missing assets
 *         node tools/generate-assets.mjs --force    # regenerate everything
 *         node tools/generate-assets.mjs castle-night castle-day
 *         node tools/generate-assets.mjs --manifest tools/bestiary.manifest.json
 *
 * Prints the PixelLab balance before and after a batch (never the key).
 * Requires Node 18+ (built-in fetch). No npm install needed.
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

async function generate(key, endpoint, description, width, height, noBackground) {
  const body = { description, image_size: { width, height } };
  if (noBackground) body.no_background = true; // transparent PNG (pixflux supports it)
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const b64 = (data.image && data.image.base64) || '';
  if (!b64) throw new Error('no image in response: ' + JSON.stringify(data).slice(0, 200));
  const usd = data.usage ? (data.usage.usd ?? data.usage.cost ?? null) : null;
  return { buf: Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64'), usd };
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error('✗ No PIXELLAB_API_KEY found.\n  Copy .env.example to .env and paste your key (https://pixellab.ai/account).');
    process.exit(1);
  }
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const mIdx = args.indexOf('--manifest');
  const manifestPath = mIdx >= 0 && args[mIdx + 1]
    ? path.resolve(root, args[mIdx + 1])
    : path.join(root, 'tools', 'assets.manifest.json');
  const only = args.filter((a, i) => !a.startsWith('--') && i !== mIdx + 1);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const outDir = path.join(root, manifest.outDir || 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  async function balance() {
    try {
      const res = await fetch(`${API}/balance`, { headers: { Authorization: `Bearer ${key}` } });
      if (res.ok) return Number((await res.json()).usd);
    } catch (e) { /* balance is informational only */ }
    return null;
  }
  const before = await balance();
  if (before != null) console.log(`Balance before: $${before.toFixed(2)}`);

  let made = 0, total = 0, failed = 0;
  for (const a of manifest.assets) {
    if (only.length && !only.includes(a.name)) continue;
    const file = path.join(outDir, a.name + '.png');
    if (fs.existsSync(file) && !force) { console.log(`skip  ${a.name}  (exists; --force to redo)`); continue; }
    process.stdout.write(`gen   ${a.name}  ${a.width}x${a.height} … `);
    try {
      const { buf, usd } = await generate(key, a.endpoint || manifest.endpoint, a.description, a.width, a.height, a.no_background);
      fs.writeFileSync(file, buf);
      made++; total += usd || 0;
      console.log(`ok  (${buf.length} B${usd != null ? `, $${Number(usd).toFixed(4)}` : ''})`);
    } catch (e) { failed++; console.log('FAILED\n      ' + e.message); }
  }
  console.log(`\n${made} generated, ${failed} failed${total ? `, ~$${total.toFixed(4)} spent` : ''}. → ${path.relative(root, outDir)}/`);
  const after = await balance();
  if (after != null) console.log(`Balance after:  $${after.toFixed(2)}${before != null ? `  (delta $${(before - after).toFixed(2)})` : ''}`);
}
main();
