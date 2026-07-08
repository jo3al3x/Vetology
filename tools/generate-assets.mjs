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
 *
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

async function generate(key, endpoint, description, width, height) {
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, image_size: { width, height } }),
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
  const only = args.filter(a => !a.startsWith('--'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'assets.manifest.json'), 'utf8'));
  const outDir = path.join(root, manifest.outDir || 'assets');
  fs.mkdirSync(outDir, { recursive: true });

  let made = 0, total = 0, failed = 0;
  for (const a of manifest.assets) {
    if (only.length && !only.includes(a.name)) continue;
    const file = path.join(outDir, a.name + '.png');
    if (fs.existsSync(file) && !force) { console.log(`skip  ${a.name}  (exists; --force to redo)`); continue; }
    process.stdout.write(`gen   ${a.name}  ${a.width}x${a.height} … `);
    try {
      const { buf, usd } = await generate(key, a.endpoint || manifest.endpoint, a.description, a.width, a.height);
      fs.writeFileSync(file, buf);
      made++; total += usd || 0;
      console.log(`ok  (${buf.length} B${usd != null ? `, $${Number(usd).toFixed(4)}` : ''})`);
    } catch (e) { failed++; console.log('FAILED\n      ' + e.message); }
  }
  console.log(`\n${made} generated, ${failed} failed${total ? `, ~$${total.toFixed(4)} spent` : ''}. → ${path.relative(root, outDir)}/`);
  console.log('The site auto-uses assets/castle-night.png & castle-day.png once present (SVG fallback otherwise).');
}
main();
