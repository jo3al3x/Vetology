---
name: ux-pixel-art
description: Owner of Vetology's look and the /assets + styling layer. Use for visual direction, pixel-art asset generation, and CSS. Enforces a static asset pipeline — assets are generated at dev time and committed as PNGs; no runtime image-API calls, no keys in the shipped site.
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

# 🎨 Agent #4 — UX / Frontend

## The look
**Medieval × 80s/90s pixel-art** — illuminated-manuscript-meets-DOS-CRPG. Chunky beveled
buttons, a parchment/stone palette, a bitmap serif or a good pixel display font, maybe a subtle
scanline. It should feel like a cursed spellbook someone ran through a VGA card.

The current site is a dark gold/oxblood "book of laws" theme (`--gold`, `--bg-deep`, Cinzel
Decorative). The pixel direction is an *evolution* of that, not a repaint from zero — keep the
mock-legal gravitas, add the CRT/manuscript texture.

## THE ARCHITECTURE CALL — assets are static, generated at dev time
Vetology is static hosting (GitHub Pages). So:
- I **generate** frames, borders, icons, and button states **locally at dev time** with my tools
  (PixelLab is my sketchbook), then **export PNGs, commit them, and serve them static**.
- I do **NOT** call any image API at runtime. A runtime call would leak Joe's key to every
  visitor and bill him per page load. The API is part of my *workflow*, never part of the *shipped site*.
- The rotated key never leaves Joe's machine. See [dev-maintainer] for `.gitignore` enforcement.

## What I own
- `/assets/**` — all generated PNGs, sprites, borders, fonts, favicon.
- The styling layer — CSS, theme tokens, print stylesheet.
- Responsive + accessibility of the visual layer (contrast, focus states, reduced-motion).

## Asset pipeline (the seam)
1. Design a frame/icon/button-state → generate locally → export PNG (prefer power-of-two, crisp
   `image-rendering: pixelated`).
2. Optimize (lossless) → drop in `/assets/` with a predictable name.
3. Reference by relative path in CSS. No external CDNs (keeps the site self-contained + offline-openable).
4. Commit source-of-truth prompts/params for each asset in `/assets/_recipes.md` so any asset can be regenerated.

## Constraints
- Keep it openable via `file://` double-click — no build step required to view.
- Every asset must have a committed recipe; nothing un-regenerable.
- Don't bloat: pixel art is small — watch total page weight, lazy-load the heavy stuff.

## Interfaces
- **With** [dev-maintainer]: agree on asset paths + the key-safety / `.gitignore` rules.
- **With** [archetype-specialist]/[archetype-judge]: per-archetype or per-class iconography once the list stabilizes.

---

## Update log
_Append-only. Newest on top._
- 2026-07-08 · **Ported the theme to `guide.html` (Build Guide) for a cohesive site.** Read the CURRENT
  `index.html` fresh (it had been reworked by another agent: canvas rain via `initRain()`, the navy
  "Midnight & Gold" dark palette, refined Pixelify/Crimson/VT323 type system) and mirrored it onto the
  guide. Changes: (1) added the Pixelify Sans + VT323 font link; (2) replaced the guide's single old
  brown/gold `:root` with BOTH the Day (`:root`) and Night (`:root[data-theme="dark"]`) token blocks
  copied from index, PLUS day/night variants of the guide-only accents (`--spirit`/`--green`/`--asc`
  ramps — darkened for the Day light panels, brightened for the navy Night) and new `--veil`/`--veil-soft`
  readability tokens; (3) ported the whole cohesion layer — Pixelify on display/labels/buttons with size
  bumps for legibility, sharp corners, chunky beveled buttons, night-only CRT scanlines; (4) ported the
  full `#stormscape` backdrop (castle center/cover, drifting clouds, day birds, `<canvas class="rain-fx">`
  + the `initRain()` particle system, lightning flash/bolt) + markup + the fixed theme-toggle button +
  `toggleTheme()`/`updateThemeToggle()` + the pre-paint theme-init, all on the SAME `'vetology-theme'`
  localStorage key so the choice carries across both pages. **Readability (the guide is a dense tool):**
  `body` is transparent so the castle shows, but the dense **left panel gets a strong `--veil`** and the
  header/footer a soft veil, while top-controls, right-panel (gem search) and every content card stay
  fully OPAQUE via themed tokens — castle is atmospheric, never behind live text. Print stylesheet now
  hides `#stormscape`/toggle and drops the panel veil. Verified both themes in-browser with a dense build
  loaded (Palpatine/Chronomancer: 8 asc nodes, timeline, keystones, cosmetics, 80 gem results) — all
  readable; `node tools/validate.js` 13/13 green (it compiles the guide script too). Default stays Night.
- 2026-07-08 · **Backdrop iteration: animated weather + bigger castle (Joe's feedback).** Root cause of
  "not animated": in `#stormscape` every child was `position:absolute` with no z-index, so the castle
  (last in DOM) painted over the rain/lightning. Fixed the stacking: `.castle` z-index 1 (back),
  clouds z-index 2, `.rain`/`.rain.b`/`.flash`/`.bolt` z-index 3 (front) — weather now renders OVER
  the art. Enlarged the scene: `.castle` is now `inset:0; height:100%` with the PNG as
  `center center / cover` (was a 46%-tall bottom strip) → a full-viewport immersive backdrop the
  opaque cards float over. Added a CSS-only **drifting cloud** system (two parallax layers, seamless
  200%/tile horizontal loop, colour via new `--cloud` token) — faint slate storm clouds at Night,
  soft white clouds by Day. Added tiny **flapping birds** (Day only; `--bird` is `transparent` at
  Night). Night keeps the animated rain + periodic lightning (now visible); Day stays sunny (rain/
  flash already `transparent`). Extended the `prefers-reduced-motion` guard to clouds + birds.
  Verified in-browser on tall (setup) and wide viewports, both themes; `node tools/validate.js` 13/13.
- 2026-07-08 · **Day/Night theme pass + real PixelLab backdrops (Joe's direction).** Dropped the brown
  parchment "light" theme entirely. Themes are now **Night (stormy)** = default and **Day (bright)**.
  Smoke-tested the PixelLab API (works; no `usd`/cost field returned in the response — spend not shown).
  Reworked `tools/assets.manifest.json`: replaced `castle-parchment` with a bright **`castle-day`**
  prompt (blue sky, sunlit pale-grey stone, green flowered hill, banners, explicitly "no sepia/brown")
  and upgraded the **`castle-night`** prompt to a dramatic stormy-night fortress. Generated both at
  384×216 → `assets/castle-day.png`, `assets/castle-night.png` (regenerated night twice via `--force`
  to drop a faux-signature artifact and get a frame-filling symmetric castle). In `index.html`:
  rebuilt the `:root` (was light/parchment) as a **Day palette** — cool stone-grey backgrounds,
  heraldic slate-blue accent (the `--gold*` tokens now hold slate-blue), navy ink, `--rain`/`--flash`
  set `transparent` so no rain/lightning in daylight, `--sky-*` saturated to match the PNG's sky
  (seamless horizon). Kept the dark "gilded obsidian" night theme (nudged `--sky-top` for storm
  atmosphere). Pointed `--castle-art` at `castle-day.png` (light) / `castle-night.png` (dark).
  **Changed the pre-paint theme-init default from `light` → `dark`** (Joe prefers dark) and updated the
  toggle glyph/aria/title to "day / night". CRT scanline+vignette overlay stays dark-only. Verified
  in-browser (both themes screenshotted, setup + game screens) and `node tools/validate.js` 13/13 green.
  Added `.claude/launch.json` for the preview server. TODO unchanged: wire sigils/seal into cards;
  roll the theme onto `guide.html`.
- 2026-07-08 · **First pass shipped on `index.html`** — a CSS-only, reversible override block
  (labelled "PIXEL-MEDIEVAL THEME") + Google pixel fonts (Pixelify Sans display, VT323 for the
  chronicle/log). Sharp corners, chunky beveled DOS buttons, square inventory-style veto pips,
  drop-shadowed panels, CRT scanlines + vignette overlay. Verified in-browser via `tools/serve.js`
  (no console errors, app fully functional). No image assets yet — pure CSS. TODO: same pass on
  `guide.html`; then start the real PixelLab asset pipeline (borders/icons) at dev time.
- 2026-07-08 · Charter created. Pipeline decided: generate-at-dev-time, commit static PNGs, no runtime API.
