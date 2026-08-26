# Pixel-art assets (PixelLab pipeline)

Agent #4's rule: **PixelLab runs at dev time on your machine; the shipped site never calls it.**
Generated PNGs get committed to `/assets/` and served static. Your key never leaves your machine.

## One-time setup
1. Get a key at <https://pixellab.ai/account>.
2. Put it in the project's env file:
   ```
   cp .env.example .env
   # then edit .env and paste your key after PIXELLAB_API_KEY=
   ```
   `.env` is git-ignored (see `.gitignore`) so the key is never committed.

## Generate
```
node tools/generate-assets.mjs            # generate any missing assets
node tools/generate-assets.mjs --force    # regenerate everything
node tools/generate-assets.mjs castle-night castle-day   # just these
```
Requires **Node 18+** (built-in fetch). No `npm install`. Each image costs a few cents; the script
prints a running total when the API reports one (PixelLab's pixflux response currently omits cost).

## What it makes
Prompts and sizes live in [`assets.manifest.json`](assets.manifest.json) — edit them freely. Ships with:
`castle-night` (stormy), `castle-day` (bright daylight), `lightning-bolt`, `wax-seal`, `frame-corner`, `pip-gold`,
`pip-spent`, and 8 class sigils (`sigil-warrior` … `sigil-huntress`).

## How the site uses them
- **Castle background** is wired now: `index.html` overlays `assets/castle-night.png` (Night theme)
  / `assets/castle-day.png` (Day theme) on top of the built-in SVG castle via
  `#stormscape .castle::after` + the `--castle-art` variable. **Until you generate them, the CSS/SVG
  castle shows as a placeholder** — no broken images, it just falls back.
- The other assets (sigils, seal, pips, frame) are generated for you to wire in next — say the word
  and I'll hook the class sigils into the roll cards and the wax seal into the footer.

## Living Exiles (animated class sprites)
`tools/generate-exiles.mjs` + `tools/exiles.manifest.json` generate the 64x64 class
characters that live on the roll cards: a transparent base sprite per class
(`generate-image-pixflux`, `no_background`) plus three 4-frame animations each via
`animate-with-text` (idle / hit / victory), saved as separate PNGs —
`assets/exiles/<class>-<action>-<n>.png` (n=0..3). It prints your PixelLab balance
before and after a batch. Iterate one class/action at a time:
```
node tools/generate-exiles.mjs                    # everything missing
node tools/generate-exiles.mjs --force warrior    # redo one class (base + anims)
node tools/generate-exiles.mjs --force monk:victory   # redo one action only
```
Review frames at scale with `tools/exiles-preview.html` (via `node tools/serve.js`,
then `/tools/exiles-preview.html?c=warrior,witch`). Missing sprite files degrade
gracefully in the site — the stage just stays empty.

## Preview locally
```
node tools/serve.js   # http://localhost:8137
```
