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
- 2026-08-26 · **POE RARITY FLAVOUR + ILLUMINATED BESTIARY (index).** Started in one session,
  cut off at a usage limit mid-pass; the completion round found the work fully on disk, then
  verified, measured and logged it. What shipped:
  - **Codex rarity tiers.** `.ref-item.special` = UNIQUE orange, `.ref-item.crossover` = MAGIC
    blue (purple retired). Post-type-pass rules applied: the *text* colour is a per-theme token
    tuned to its real background (Day `#96490f` / `#4646c8` = 6.09 / 6.68 on `--bg-card #f5f9fc`;
    Night `#e08b4a` / `#8888ff` = 6.51 / 5.73 on `#141b2c`, hovers all 7.5+), while the saturated
    authentic PoE hue lives on the 2px left-border accent (`--rarity-border-*`), decorative only.
    Lesson kept: authentic `#8888ff` clears Night as-is but lands at 2.83:1 in Day — one hex can
    never serve both themes as text; borders can share, text cannot. Night values were also
    checked under the .18 CRT vignette (they improve: darker ground, light text).
  - **Unique-drop frame.** `.unique-frame` wraps the class + ascendancy block on the ritual
    reveal and on Settled cards with a PoE-unique-style double rule (1px outer + 2px inner via
    one ::before/::after pair, `--border-gold` so it is steel-blue in Day and gold at Night).
    Borders only, no text restyling, and "Considering" stays unframed on purpose.
  - **Bestiary emblems.** 16 category emblems at `assets/bestiary/` (96x96 transparent PixelLab
    pixflux), one per `.ref-category-title`, shown at 32px = crisp 3:1 integer downscale with
    `image-rendering:pixelated`, `alt=""` + onerror self-hide (file:// safe). All 16 reviewed as
    images, no regens needed, $0.00 delta. The generator grew `--manifest` support
    (`tools/bestiary.manifest.json`, 16 entries, names match disk and HTML 1:1) — future asset
    families should ship the same way: own manifest, same generator.
  Verified in-browser via computed styles in both themes (16/16 emblems loaded, colours and frame
  confirmed, zero console errors; screenshots unavailable — hidden pane, DOM-level checks used).
  `node tools/validate.js` 13/13 green.
- 2026-08-26 · **TYPE SYSTEM PASS (both pages).** Implemented by the *typography critic* after a
  two-round design debate with the lead agent; **ownership of the styling layer stays with me
  (#4)**; this is an amendment to my pixel-medieval layer, not a replacement of it. The DOS-CRPG
  look, the beveled controls, the stormscape and the CRT are all intact.

  **What was actually wrong.** My cohesion layer assigned fonts by *selector list*, and that was the
  root cause of both of Joe's complaints:
  - It captured prose (`.btn-faq` is a sentence) and missed chrome (`.modal-special-label`, the inline
    "Session Complete" div), leaving **2 Cinzel Decorative + 4 IM Fell English survivors**.
  - Worse, it applied Pixelify to selectors that carried `font-style:italic`. **Pixelify Sans ships a
    single variable file with no italic**, so the browser synthesised an oblique and sheared a
    pixel-grid face off its grid (`.logo-eyebrow`, `.modal-title-small`, guide `.gem-result-type`).
    Same story for `.modal-article-title{font-weight:bold}` on IM Fell, which has no bold.
    Those two fakes are what Joe was seeing as "multiple types": **7 apparent voices, not 3.**
  - `.log-title` was in *both* my VT323 rule and my Pixelify rule; the later one won, so the terminal
    log's own header was rendering pixel, and its size had silently jumped 9px -> 15px.
  - Six selectors in index.html's list (`.ctrl-label`, `.section-title`, `.required-badge`,
    `.cosmetic-type-badge`, `.btn-add-rule`, `.filter-btn`) only exist in guide.html. Dead.

  **The sizing lesson worth keeping.** My "pixel faces read small, size the controls up" comment was
  right in direction and wrong in magnitude, because px is the wrong unit across these faces. Parsed
  from the shipped woff2 files: Cinzel cap/em **0.853** vs Pixelify **0.631**, so swapping the
  families at equal px **shrank every label by 26%** and my 9px -> 10/11px bump was still a net loss.
  The real multiplier is **1.35x**. Crimson x-height is **0.424em**, so the 16px body was rendering at
  the x-height of a 13px UI sans (base is 18px now). VT323's advance is exactly **0.400em**, so it
  only sits on a whole-pixel cell at multiples of 2.5px; the log is **20px** (an 8.00px VGA cell);
  at my 15px it was the smallest text on the page.

  **Two bugs of mine in the same family, both now fixed structurally.** A hard-coded dark surface with
  tokenised text on it breaks completely in Day:
  - `.modal` (`#0d0a05`); Day body text **1.96:1**, title **1.73:1**. Now a scoped `--modal-*`
    palette so the Book of Laws stays dark vellum in both themes without reading theme tokens.
  - `.logo-block`'s scrim (`rgba(6,9,16,.82)`); Day wordmark/eyebrow/tagline at **1.15:1**. Now
    `--scrim` + `--hero-halo` per theme: dark plaque with dark halos at Night (unchanged), pale
    plaque with white halos in Day. **Check any new scrim/veil I add against BOTH themes.**

  **Token architecture change I should keep to.** `--gold-dark` was simultaneously a text colour, the
  `.btn-primary` plate and a border, which is why it could not be raised; `--text-dim` was doing quiet
  text *and* the rest state of interactive controls (Day `.mode-btn` measured **2.02:1**). Split into
  `--gold-ink` (gold as text), `--text-control` (control rest state, >=4.5:1), `--text-disabled`
  (replaces every `opacity` on text; opacity multiplies contrast away: the footer seal was
  **1.51:1**, the disabled CTA **1.01:1**). `--gold-muted` is now borders/scrollbar only, never text.

  **CRT stays over content** per the lead's ruling, but scanline `.10 -> .06` and vignette
  `.38 -> .18`. Worth knowing for future work: the vignette's default farthest-corner ellipse puts
  t=0.707 along the **whole perimeter**, not just the corners, so `.38` was laying ~11.5% black over
  the tab bar, log panel and footer and taxing every contrast ratio the tokens promised.

  Font `<link>`s: 5 families -> 3 (index) and 2 (guide, which was downloading VT323 and Cinzel for
  **zero** rendered glyphs), plus `preconnect` to fonts.gstatic.com.
  `node tools/validate.js` **13/13 green**; verified in-browser via computed styles in both themes on
  both pages and for layout overflow at 320/375px (fixed a tab-bar overflow my size bump caused, and a
  pre-existing `.paste-row{min-width:300px}` overflow in guide).
  **My next item:** the glyph controls (`☀ 🔊 × ⚜ ♠`) are a fourth, uncontrolled voice rendering in the
  OS symbol/emoji font at whatever size the parent sets. Stacks and sizes are pinned; replacing them
  with CSS/SVG pixel icons is mine and is still open.
- 2026-07-08 · **Shipped both flagship features: LIVING EXILES + THE ROLL RITUAL.**
  **Living Exiles:** every class now has an animated 64×64 pixel character on the roll card, living
  in a CSS "stone-arch diorama window" (interior stays dark in both themes so the transparent
  sprites always read; empty state shows *awaiting the accused*). Pipeline: new
  `tools/generate-exiles.mjs` + `tools/exiles.manifest.json` — base sprite per class via
  `generate-image-pixflux` (`no_background:true`, view side, direction south) then three 4-frame
  animations via `animate-with-text` (64×64 only; `reference_image` = base sprite b64; response =
  `{usage, images[4]}` — shapes verified against the live openapi.json first). Frames saved as
  separate PNGs `assets/exiles/<class>-<action>-<n>.png` (n=0..3; idle/hit/victory) — 104 files,
  8 classes. Prompt template: per-class description + shared `styleSuffix` ("dark fantasy pixel art
  character, full body, centered, facing the viewer, clean silhouette, rich colors with gold
  accents") + `animNegative` ("smoke, fire, clouds… background, motion blur") + per-action
  `image_guidance_scale` (idle 3.2 / hit 3.0 / victory 3.0) — the key lesson: guidance <2.5 lets the
  animate model drift off-character and invent white smoke swooshes; 3+ holds the reference. Quality
  gate ran on Warrior first (3 prompt iterations), then batch; targeted regens for monk:victory,
  witch:idle+victory (per-class `overrides` support added; witch victory needed guidance 6),
  druid:idle. Review sheet: `tools/exiles-preview.html?c=class,...` (cache-busted, 2× scale).
  Balance endpoint polled before/after every run — Joe's plan reports $0.00 throughout (subscription
  allowance; the usd balance is top-up credit only, calls aren't metered against it). ~45 generations total.
  **Roll Ritual:** `doRoll` is now a ~2.2s ceremony — face-down CSS-3D card (filigree back, "The
  Court Deliberates", VT323 shuffle ticker with WebAudio ticks) → flip reveal (chime) → sprite wakes
  into idle → small wax-seal stamp pops on (thud). Settle = gold pulse + **big wax seal pressed
  across the stage** + ascending resolve arpeggio + victory anim → idle. Hostile veto = card-only
  shake + hit/collapse anim + descending minor sting on the OLD DOM, then deferred re-render (~850ms)
  empties the stage; Vengeance Clause adds a diminished sting + the reprisal pulse after re-render.
  Game logic/state untouched — only choreography timing (same setTimeout pattern as the old reprisal
  pulse). `assets/wax-seal.png` regenerated transparent (`no_background` support added to
  generate-assets.mjs). **Audio:** all synthesized (oscillators + noise through lowpass for thunder,
  every sting <400ms, quiet-mixed); AudioContext created/resumed only on first pointer/key gesture;
  🔊/🔇 mute toggle next to the theme toggle, persisted in localStorage `vetology-sound`. Lightning
  moved from a CSS infinite loop to a JS scheduler (`.strike` class + `lightning-once` keyframes,
  ~6.5–10.5s cadence, Night only, random bolt position) so flash + thunder share one trigger.
  Reduced-motion: static frame 0, no flip/shake/scanline strikes. Missing sprite/seal files degrade
  gracefully (onerror hides the img — verified live with huntress mid-generation). Harness-safe:
  everything gates on stub-DOM nulls / guarded window.* exactly like initRain; `node
  tools/validate.js` 13/13 green. Verified in-browser end-to-end (roll/settle/veto, both themes,
  frame cycling + seal load checked via DOM). NOTE: sigils/pips from the old manifest are still
  ungenerated — the exiles supersede the sigil idea for cards; decide before deleting.
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
