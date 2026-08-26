# Vetology — Patch 1.0 Prep Board

Everything here is prep for **PoE2 1.0** (expected end of 2026). The site can be updated now, but
the north star is being ready — and *correct* — the day 1.0 drops. Last touched: **2026-08-26**.

## The team
Living charters in [`.claude/agents/`](.claude/agents/). Each has its own append-only update log.

| # | Agent | Owns | Charter |
|---|---|---|---|
| 1 | 🗡️ PoE2 Domain Expert | verified game facts (classes, ascendancies, gems, new systems) | [poe2-domain-expert](.claude/agents/poe2-domain-expert.md) |
| 2 | 📚 Archetype Specialist | the archetype list + flavor (`data/vetology-data.js`) | [archetype-specialist](.claude/agents/archetype-specialist.md) |
| 3 | ⚖️ Archetype Judge | tone / voice / de-AI-ing | [archetype-judge](.claude/agents/archetype-judge.md) |
| 4 | 🎨 UX / Pixel-Art | `/assets/**` + styling | [ux-pixel-art](.claude/agents/ux-pixel-art.md) |
| 5 | 🔧 Dev / Maintainer | randomiser + planner code, build, deploy, secrets | [dev-maintainer](.claude/agents/dev-maintainer.md) |

## Non-negotiables (apply to everyone)
- **PoE2 only.** Discard PoE1: **the Reliquarian, Trial of the Ancestors, Mirage Archer** (the PoE1 gem).
  ⚠️ *Corrected 2026-07-08:* **Djinn** (Disciple of Varashta) and **"Mirage"** (Martial Artist clones) are
  valid PoE2 — do **not** discard them. Only "Mirage *Archer*" is the PoE1 flag.
- **Static + self-contained.** No build step required to view; opens via `file://`. No runtime API calls.
- **No secrets in the repo.** Image-gen/API keys live in a `.gitignore`d local file, never committed.
- **One source of truth** for archetype data, consumed by both `index.html` and `guide.html`.

## Dependency chain (why order matters)
```
#1 Domain pulls 0.5.0 facts  ──►  #2 Specialist audits/curates  ──►  #3 Judge de-AIs the flavor
                                    │                                        │
                                    └──►  #5 Dev implements constraints  ◄───┘
#5 Dev extracts shared data file (schema) ──► unblocks #2 editing without merge wars
#4 UX runs in parallel: pixel-art pipeline + styling, keyed off the stable data shape
```
**Gate:** no archetype curation off the new 0.5.0 ascendancies until #1's fact sheet section is filled.

## Status — 2026-07-08
| Task | Owner | State |
|---|---|---|
| Fix paste bridge (index ↔ guide lookup) | #5 | ✅ done (this session) |
| Pull real 0.5.0 ascendancy/skill/system data | #1 | ✅ done — fact sheet filled |
| Add missing ascendancies (Smith of Kitava/Tactician/Lich) to roll table | #5 | ✅ done |
| Charters + this board | #5 | ✅ done |
| Two game modes: Maximum Sentence / Plea Bargain (suggest+override asc) | #5 | ✅ done, verified |
| Ship first 6 new 0.5.0 archetypes (both files, verified) | #2/#3 | ✅ done |
| Paste-flow + runtime validation harness | #5 | ✅ committed to `tools/validate.js` |
| Extract `data/vetology-data.js` (shared global) | #5 | ✅ done, verified (both pages load it) |
| Re-soul the ~9 "stat-line" archetypes | #2/#3 | ✅ done (9 renamed, incl. Shapeshifter→Skinwalker) |
| Fill guide skill-data for unresolved archetypes | #2 | 🔄 6 → 3 (fixed via re-souls; 3 crossovers remain) |
| Mine Martial Artist + Spirit Walker for MORE fantasies | #2 | ⬜ 2 shipped, more available |
| Draft more Runeforging / Runic Ward archetypes | #2 | ⬜ 3 shipped, space wide open |
| Pixel-medieval UI first pass (index.html) | #4 | ✅ done — CSS override layer, verified in-browser |
| Day/Night themes (Night default + Day) + toggle | #4 | ✅ reworked — brown parchment dropped; Night(stormy) default, Day(bright), data-theme + localStorage |
| Storm backdrop (castle · rain · lightning) | #4 | ✅ real PixelLab PNGs; layering fixed so weather renders OVER the castle; full-viewport immersive; drifting clouds + Day birds; Day stays sunny |
| PixelLab asset pipeline + `.env` for the key | #4 | ✅ built (`tools/generate-assets.mjs`, `.env`) — Joe runs it locally |
| Generate the actual PixelLab PNGs | #4 | ✅ done — `assets/castle-night.png` (stormy) + `assets/castle-day.png` (bright) generated & committed |
| Wire sigils/seal/frame into cards & footer | #4 | 🔄 wax-seal ✅ wired into the Ritual; class sigils likely superseded by the Living Exiles — decide, then prune the manifest |
| **Living Exiles** — animated pixel characters per class on roll cards | #4 | ✅ SHIPPED — 8 classes × (base + idle/hit/victory ×4 frames) = 104 PNGs in `assets/exiles/`; arch-window stage; graceful degrade; reduced-motion safe |
| **Roll Ritual** — flip reveal, wax-seal stamp, screen shake, WebAudio stings | #4 | ✅ SHIPPED — ~2.2s flip ceremony, seal stamp (+big seal on Settle), card-only shake, synthesized chiptune SFX w/ mute toggle, JS-triggered lightning+thunder |
| Roll UI theme to guide.html | #4 | ✅ done — full Day/Night theme + stormscape + canvas rain ported; dense panels kept opaque/veiled for readability; shared theme key |
| Replace Lightning Javazon → Trapsin; close all paste-gaps (0 unresolved) | #2 | ✅ done |
| No-duplicate rolls (settled archetypes leave the pool) | #5 | ✅ done, verified |
| `.gitignore` + key-safety scaffolding | #5 | ⬜ before any image tooling |
| Data validation harness + `meta{patch,updated}` | #5 | ✅ done — `tools/validate.js` (13 checks) + `VETOLOGY_META` in the data file, rendered as the guide patch badge |
| **A5 session autosave + export/import codes** (index.html) | #5 | ✅ SHIPPED 2026-08-26 — localStorage `'vetology-session'` + Resume/Abandon panel + base64url Session Codes, verified end-to-end |
| **A4 Sentence Tracker** (post-settle act pips + death counter) | #5 | ✅ SHIPPED 2026-08-26 — persists in the session; Discord export extended; #1 to re-verify the milestone list |

## Open decisions
- **Shared data format:** `<script src="data/vetology-data.js">` global (file://-safe), *not* fetch()-ed
  JSON. Locked unless we adopt a dev server. (owner: #5)
- ~~New ascendancy roster unknown~~ **RESOLVED 2026-07-08:** 22 ascendancies confirmed; the 2 "new" ones
  (Martial Artist, Spirit Walker) were already present; 3 existing (Smith of Kitava/Tactician/Lich) added.
- **Pixel-art vs current gold/oxblood theme:** evolution, not repaint — keep the mock-legal tone. (owner: #4)
- **Kalguuran gem names:** DATAMINED — re-verify each on poe2db before hard-coding into the gem list. (owner: #1)

## Paste-flow: archetypes with no guide skill-data (harness finding, 2026-07-08)
Rollable in `index.html` but missing an `ARCHETYPE_SKILLS` entry in `guide.html`, so pasting them
into the Build Guide shows "couldn't match". Pre-existing (not caused by the 0.5.0 additions).
Fix = give each a skill list. **3 fixed** via the re-soul audit (Fimbulwinter, The Cryotherapist,
The Overdraft now have skills). **3 remain** (crossovers that just need skill-data — no rename needed):
- Ra's al Ghul · Poison Nova Witch Doctor · The Short Circuit

## Next-level wishlist (2026-07-08, from Joe's reference-site session)
References: hzla's Dynamic Calc (every entity has sprite art, deep editors, save/import) and
encounterrouter.github.io (per-split progression, persistent Box, export codes). PixelLab's API also
has ANIMATION endpoints (`/animate-with-text` 64×64 4-frame, `/animate-with-skeleton`, `/rotate`,
`/inpaint`, `GET /balance`) — dev-time only, as always.
- **S1 Living Exiles** — animated pixel character per class on the roll card (idle / hit-on-veto / victory-on-settle). 🔄 GREENLIT
- **S2 Roll Ritual** — tarot-flip reveal, wax-seal stamp, screen shake, synthesized WebAudio stings + thunder, mute toggle. 🔄 GREENLIT
- **S3 Illuminated Bestiary** — archetype portraits in the Codex (start per-category, ~14).
- **A4 Sentence Tracker** — post-settle league companion: act-progress pips + death counter per player, localStorage + Discord export. ✅ SHIPPED 2026-08-26
- **A5 Session export/import codes** ✅ SHIPPED 2026-08-26 · **A6 baked gem tooltips + patch badge** ✅ SHIPPED 2026-08-26 · **A7 build permalinks** ✅ SHIPPED 2026-08-26.
- **B8 parallax castle depth** (pixel d20 > 3D models — keep the pixel soul) · **B9 auto day/night by clock, embers, seasonal weather** · **B10 Court Record hall of fame**.

## 1.0 intel log
_Append-only. Newest on top. When we learn something about 1.0, drop it here and @tag the owner._
- 2026-08-26 · **#5 Dev: A5 + A4 SHIPPED to index.html (session persistence · Session Codes · the
  Sentence Tracker).** (a) **Autosave** — the whole session (players incl. rolls/vetoes/settled/
  chosenAsc/tracker, gameMode, chronicle) serializes to localStorage `'vetology-session'` at two
  choke points (`addLog` + `checkAllSettled`, which every mutation path crosses); a fresh load
  offers a themed "A Session Is In Progress · Resume the Trial / Abandon" panel on the setup
  screen. A mid-veto-war refresh restores byte-identical player state (verified by snapshot diff).
  (b) **Session Codes** — game-header button copies a `VET1.`-prefixed base64url of the same
  serialization (v-field inside; chronicle capped at 3 lines to stay inside one Discord message:
  ~1.5k chars for 3 players); setup-screen input + Import adopts it. Junk codes fail safely to the
  red toast; all imported strings are defensively coerced/stripped (innerHTML surfaces) and log
  classes whitelisted. (c) **Sentence Tracker** — when all settle, "Serving the Sentence" renders
  under the results: 7 clickable square act pips per player (`SENTENCE_MILESTONES` const; click N
  completes through N, clicking the last completed steps back one; keyboard buttons w/ aria-labels)
  + a skull death counter (min 0). Both live in the session, so autosave AND codes carry them; a
  late Reprisal un-settle hides the tracker (existing checkAllSettled show/hide) and progress
  survives in state. `copyDiscord()` now appends `Joe · Druid (Oracle) · Maps · 3 deaths` lines.
  Contrast measured live in BOTH themes (worst text 5.09:1; interactive pip boundary moved to
  `--gold-muted` for 4.84/3.97 vs the row); type floors kept (12px Pixelify chrome / 15px+ Crimson
  prose); zero new animations; validate **13/13**. ⚠ @poe2-domain-expert (#1): re-verify the 0.5.0
  interlude campaign structure behind `SENTENCE_MILESTONES` (Acts 1-3 · Cruel 1-3 · Maps) — 1.0's
  real Acts 4-6 will change the list (comment sits on the const in index.html).
- 2026-08-26 · **#5 Dev: A6 + A7 SHIPPED to guide.html (patch badge · baked gem tooltips · build
  permalinks).** Interrupted mid-verification at a usage limit; a completion round audited the disk
  (nearly everything had landed), finished it, and verified end-to-end. (a) **Patch badge** —
  `VETOLOGY_META` in the data file renders "Data: patch 0.5.0 · updated 2026-08-26" in the guide
  header, typeof-guarded so index is untouched; 7.2:1 Night / 7:1+ Day. (b) **Gem tooltips** —
  `tools/fetch-gem-info.mjs` now RESUMABLE (skips already-described entries; `--force` refetches)
  with a name-derived URL fallback, which recovered the 2 gems whose recorded poe2db urls 404
  (Corrupting Cry I, Raging Spirits): **GEM_INFO coverage is 88/88 described, 0 null**. Hover +
  keyboard-focus tooltips on timeline and search rows, viewport-clamped (flip-above verified at
  900x480), both themes, zero runtime fetches. (c) **Build permalinks** — Copy Build Link serializes
  archetype/asc/nodes/gems/rules to `#b=` base64url (~290 chars); full restore verified on a fresh
  load, junk hashes no-op safely, `?archetype=` legacy links still work; clipboard-blocked path
  drops the link into the paste box with a red toast. `node --check` clean, validate **13/13**.
  Follow-up for #1/#2: the two poe2db urls inside `ARCHETYPE_SKILLS` still point at the old slugs
  (`Corrupting_Cry`, `Summon_Raging_Spirits`) — fix when next editing that block (data edits were
  additive-only this round).
  cards).** The pass was interrupted mid-flight at a usage limit; a completion round audited the
  disk state (everything had in fact landed), then verified and measured it. Two features:
  **(a) Rarity language in the Codex** — plain `.ref-item` = normal item, `.special` = UNIQUE
  orange, `.crossover` = MAGIC blue (the old purple is gone). Text colours are per-theme tokens
  tuned for >=4.5:1 on `--bg-card`: Day `#96490f` 6.09:1 / `#4646c8` 6.68:1 (hovers 8.14 / 9.31 on
  `#f5f9fc`); Night `#e08b4a` 6.51:1 / authentic-PoE `#8888ff` 5.73:1 as-is (hovers 8.42 / 7.56 on
  `#141b2c`; all *improve* under the .18 CRT vignette, e.g. magic 5.73 -> 6.03). The saturated
  authentic hues live on 2px left-border accents only (`--rarity-border-*`), never as text. Plus
  the **unique-drop frame**: a PoE-style double rule (1px outer / 2px inner, `--border-gold`)
  above and below the class + ascendancy block on the ritual reveal and on Settled cards;
  "Considering" stays unframed, like an unconfirmed drop on the ground.
  **(b) Illuminated Bestiary** — 16 PixelLab emblems (one per Codex category, incl. all six
  crossover franchises) committed at `assets/bestiary/*.png`, 96x96 transparent, rendered 32px
  `image-rendering:pixelated` (crisp 3:1 integer downscale) in every `.ref-category-title`,
  decorative `alt=""` + onerror self-hide. All 16 quality-reviewed as images — zero duds, zero
  regens, **$0.00 balance delta**. New pipeline seam: `tools/generate-assets.mjs --manifest`
  + `tools/bestiary.manifest.json` (16 entries, matches disk and HTML 1:1; balance printed, key
  never). Verified live in both themes via computed styles (16/16 icons loaded at 32px, rarity
  colours + frame rules confirmed per theme, zero console errors); `node tools/validate.js`
  **13/13 green**. @dev-maintainer: `assets/bestiary/**` (16 files) + `tools/bestiary.manifest.json`
  are new commit payload.
- 2026-08-26 · **TYPE SYSTEM PASS shipped to both pages (settles Joe's "hard to read" + "multiple
  types").** Ran as a structured design debate: the lead agent proposed a spec, a typography critic
  attacked it, we converged over two rounds, then the critic implemented. Implemented by the
  typography critic; **@ux-pixel-art keeps ownership of the styling layer.**
  **Joe's complaint #2 answered:** the site was rendering **seven** apparent type voices, not three.
  Five real families (Pixelify Sans, Crimson Text, VT323, plus 2 Cinzel Decorative survivors and 4
  IM Fell English survivors) **plus two browser-synthesised fakes**: Pixelify ships no italic file, so
  `font-style:italic` on `.logo-eyebrow` / `.modal-title-small` / guide `.gem-result-type` was a
  synthetic oblique shearing a pixel-grid face off its grid; IM Fell ships no bold, so
  `.modal-article-title{font-weight:bold}` was synthetic emboldening. Those fakes were the "mush".
  Now exactly three voices, assigned **by role, not by selector list** (the old layer assigned by list,
  which is why it captured prose like `.btn-faq` and missed chrome like `.modal-special-label`).
  **Joe's complaint #1 answered**, with measured numbers rather than taste. Worst cases, centre-screen:
  `.mode-desc` (the line he screenshotted) 2.88 -> 10.54 Night / 2.82 -> 9.55 Day; every
  small-italic-dim caption killed; `--text-dim` 2.88 -> 6.30 Night and 2.82 -> 6.24 Day.
  **Two structural bugs neither of us had on the list**, both the same shape (a hard-coded dark
  surface with tokenised text on it): (a) the **Book of Laws modal** is dark vellum in both themes but
  read theme tokens, so in **Day its body text measured 1.96:1 and its title 1.73:1**; invisible;
  (b) the **hero `.logo-block` scrim** was hard-coded `rgba(6,9,16,.82)` in both themes, so the Day
  wordmark, eyebrow and tagline sat at **1.15:1** (found during implementation, not in the audit).
  Both fixed by scoping a palette to the surface (`--modal-*`) or tokenising it per theme (`--scrim`,
  `--hero-halo`). Day modal is now 8.33 to 14.15; Day hero 9.20 to 12.08.
  **Sizing is now derived from real font metrics** parsed from the shipped woff2 files, not from px:
  Crimson Text x-height is 0.424em, so the old 16px body rendered at the x-height of a **13px UI sans**
  (guide's 17px = 13.9px). Base is **18px on both pages** now. VT323's advance is exactly 0.400em, so
  it only lands on a whole-pixel cell at multiples of 2.5px: the chronicle log went **15px -> 20px**,
  an exact 8.00px VGA cell (at 15px it was the *smallest* text on the page). Cinzel's cap height is
  0.853em vs Pixelify's 0.631em, so the earlier Cinzel->Pixelify swap **shrank every label by 26%**
  and the old 9->10/11px bump was still a net loss; labels are rescaled by the real 1.35x.
  **Also:** every `opacity` on text replaced by real tokens (the footer seal was **1.51:1 Night /
  1.41:1 Day**, the disabled primary CTA **1.01:1**); all hard-coded colours tokenised (the crossover
  half of the Codex, ~60 items, was **2.00:1 in Day**); `--gold-dark` and `--text-dim` split so a
  token is not simultaneously a text colour, a button plate and a border (`--gold-ink`,
  `--text-control`, `--text-disabled`); font `<link>`s cut from 5 families to 3 (index) and 2 (guide,
  which was downloading VT323 and Cinzel for **zero** rendered glyphs) plus `preconnect`.
  **CRT overlay (Joe's approved look) kept over content**, but scanline `.10 -> .06` and vignette
  `.38 -> .18`: its default farthest-corner ellipse puts t=0.707 along the *whole* perimeter, so at
  .38 it was laying ~11.5% black over the tab bar, log panel and footer and taxing every token
  (`--text-muted` measured 5.87 centre but 4.58 at the edge). Token values were computed against the
  OLD tax, so this is margin, not a substitute. `node tools/validate.js` **13/13 green**; verified
  in-browser via computed styles in both themes on both pages, and for layout overflow at 320/375px.
  @ux-pixel-art follow-up: the glyph controls (`☀ 🔊 × ⚜ ♠`) are a fourth, uncontrolled voice rendering
  in the OS symbol/emoji font; sizes and stacks are pinned now, pixel-icon replacement is backlogged.
- 2026-07-08 · **#4 UX: LIVING EXILES + ROLL RITUAL shipped (Joe's two flagship features).** Every
  class has an animated 64×64 pixel exile living in a stone-arch window on its roll card: idle loop
  when rolled, hit/collapse on a hostile veto (then the stage empties), victory on settle (then back
  to idle), "awaiting the accused" when empty. 104 committed PNGs (`assets/exiles/`), generated
  dev-time via new `tools/generate-exiles.mjs` + `exiles.manifest.json` (pixflux base w/ transparency
  + animate-with-text ×3 actions ×4 frames; API shapes verified against openapi.json before
  spending). The roll is now a ~2.2s ritual: face-down filigree card + shuffle ticker → 3D flip
  reveal → wax-seal stamp; Settle presses the big seal across the card; hostile vetoes shake the
  struck card while the exile crumples. All SFX are synthesized WebAudio chiptune (<400ms, quiet;
  AudioContext only after first gesture; 🔊/🔇 toggle persisted as `vetology-sound`); lightning is
  now JS-scheduled so thunder + flash share a trigger. PixelLab balance printed before/after every
  batch — Joe's plan reports $0.00 usd throughout (subscription allowance, not per-call billing).
  Missing PNGs degrade gracefully (verified live); reduced-motion shows static frames, no
  flip/shake; `node tools/validate.js` 13/13; zero runtime API calls; key never printed. Sprite
  review sheet at `tools/exiles-preview.html`. @dev-maintainer: `assets/exiles/**` (104 files) +
  `assets/wax-seal.png` are new commit payload; the old sigil/pip manifest entries are probably
  superseded — prune or generate before 1.0.
- 2026-07-08 · **#4 UX: `guide.html` now matches `index.html` — the whole site is cohesive.** Ported the
  current index look to the Build Guide: Pixelify/Crimson/VT323 type system, the Day + Night ("Midnight
  & Gold" navy) palettes, chunky beveled sharp-cornered controls, and the full `#stormscape` castle
  backdrop with the `initRain()` canvas rain, drifting clouds, day birds and lightning. Same fixed
  theme toggle + pre-paint init + `'vetology-theme'` localStorage key, so a Night/Day choice carries
  across both pages. Because the guide is a DENSE tool, kept every content surface opaque via themed
  tokens (top-controls, gem-search panel, all cards) and put a strong readability **veil** behind the
  dense left panel + a soft veil behind header/footer — the castle is atmospheric, never behind live
  text. Default is Night. Verified both themes with a real build loaded; `node tools/validate.js`
  13/13 green. Guide-specific accents (`--spirit`/`--green`/`--asc`) got day/night variants tuned for
  each background. @archetype-specialist / @dev-maintainer: guide styling is stable now.
- 2026-07-08 · **#4 UX: backdrop now animates + is full-screen.** Joe loved the castle art but the
  weather wasn't visible and the castle looked small. Both were the same root cause — `#stormscape`
  children had no z-index, so the castle PNG (last in DOM) painted on top of the rain/lightning.
  Restacked: castle z1 (back), clouds z2, rain/lightning z3 (front) → animated weather now shows over
  the art. Enlarged `.castle` from a 46%-tall bottom strip to a full-viewport `center/cover` backdrop
  the opaque cards float over. Added CSS-only drifting clouds (both themes, via a new `--cloud` token)
  and a couple of flapping birds in Day only (`--bird`; transparent at Night). Night = rain + periodic
  lightning + slate storm clouds; Day = sunny with white clouds + birds, no rain. reduced-motion guard
  extended to the new layers. Static/self-contained, zero API calls; `node tools/validate.js` 13/13
  green; verified tall + wide, both themes. @ux-pixel-art next: sigils/seal into cards, then guide.html.
- 2026-07-08 · **#4 UX: brown theme dropped; Day/Night with real PixelLab backdrops.** Per Joe's
  direction the parchment/brown "light" theme is gone. The two themes are now **Night (stormy)** —
  the gilded-obsidian gold-on-black night, and **now the default** — and **Day (bright)**, a real
  daytime scene (cool stone-grey UI, heraldic slate-blue accent, navy ink; NO brown). Both backdrops
  are genuine PixelLab pixel-art committed as static PNGs (`assets/castle-night.png` stormy fortress,
  `assets/castle-day.png` sunlit castle on a green hill with blue sky). PixelLab API smoke-tested OK
  (endpoint `generate-image-pixflux`, 384×216; the response carried no cost field so spend wasn't
  reported). Default theme flipped `light`→`dark` in the pre-paint init. Day disables the rain/lightning
  and the CRT scanline overlay stays night-only. `node tools/validate.js` 13/13 green; both themes
  verified in-browser. Key never printed/committed; `.env` still gitignored; shipped site makes zero
  API calls. @ux-pixel-art next: wire the sigils/seal into cards, then roll the theme onto `guide.html`.
- 2026-07-08 · **Data extraction + re-soul audit done.** All game data now lives in one file,
  `data/vetology-data.js`, loaded by both pages via `<script src>` (works on file:// and Pages) —
  no more dual-maintenance. Harness committed at `tools/validate.js` (`node tools/validate.js`:
  compile + both-mode runtime + archetype-resolution). #2/#3 re-souled 9 stat-line names
  (Frozen Wasteland Builder→Fimbulwinter, Cold Snap Dotter→The Cryotherapist, Full Sorcery Glass
  Cannon→The Overdraft, Energy Shield Hoarder→The Doomsday Prepper, Detonate Dead Bomber→The Cremator,
  Cast On Crit Machine→The Slot Machine, Evasion Ghost→The No-Show, Bleed Arcane Build→Rivers of Blood,
  Shapeshifter→Skinwalker) and gave the first three real skill-data, dropping the paste-gap from 6 to 3.
- 2026-07-08 · **Two game modes shipped** (setup toggle in `index.html`): *Maximum Sentence* (rolls
  Class+Ascendancy+Archetype, unchanged) and *Plea Bargain* (rolls Class+Archetype; per-card ascendancy
  dropdown that pre-selects the archetype's suggested ascendancy ★ when it fits the rolled class, else
  shows a "wants X · Class" hint). Backed by an additive `ARCHETYPE_ASC` map (**@archetype-specialist owns/grows it**).
  Guide `parsePaste` hardened so a no-ascendancy (Plea) line isn't misread. Verified: 14/14 functional + 5/5 parse.
  Known rough edge to iterate: in Plea, class is still rolled independently, so an ascendancy-locked archetype
  can land on the "wrong" class (suggestion then shows as an aspirational hint).
- 2026-07-08 · #2/#3 shipped the first 6 0.5.0 archetypes (The Notary, The Insurance Adjuster,
  The Squatter, The Understudy, For Whom the Bell Tolls, Snow White) into both files + a new codex
  category "Runes of Aldur — 0.5.0". A validation harness confirmed all 6 resolve through the paste
  flow and flagged 6 pre-existing archetypes with no guide skill-data (see section above). @dev-maintainer
  to commit the harness to `tools/`.
- 2026-07-08 · **Research back (full fact sheet in [poe2-domain-expert](.claude/agents/poe2-domain-expert.md)).**
  Headlines: (a) the 2 new 0.5.0 ascendancies = Martial Artist (Monk) + Spirit Walker (Huntress), both
  already in the tool; (b) 3 existing ascendancies were missing from the roll table (Smith of Kitava,
  Tactician, Lich) → added; (c) red-flag list corrected — Djinn & "Mirage" are valid PoE2; (d) new fantasy
  space from **Runeforging** (low-base/twink + build-around-Unique) and **Runic Ward** (pure-Life tanks +
  Ward-cost "manaless" Kalguuran casters). Kalguuran gem names are datamined — verify on poe2db before use.
- 2026-07-08 · Board created. 0.5.0 "Return of the Ancients" is live (~May 29 2026); it's a big shake-up,
  so the current archetype pool almost certainly predates it. Runeforging + Runic Ward are new
  build-enabling systems → new archetype angles the tool can't know yet. @poe2-domain-expert researching.
