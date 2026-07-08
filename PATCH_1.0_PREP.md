# Vetology — Patch 1.0 Prep Board

Everything here is prep for **PoE2 1.0** (expected end of 2026). The site can be updated now, but
the north star is being ready — and *correct* — the day 1.0 drops. Last touched: **2026-07-08**.

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
| Wire sigils/seal/frame into cards & footer | #4 | ⬜ after PNGs exist |
| Roll UI theme to guide.html | #4 | ✅ done — full Day/Night theme + stormscape + canvas rain ported; dense panels kept opaque/veiled for readability; shared theme key |
| Replace Lightning Javazon → Trapsin; close all paste-gaps (0 unresolved) | #2 | ✅ done |
| No-duplicate rolls (settled archetypes leave the pool) | #5 | ✅ done, verified |
| `.gitignore` + key-safety scaffolding | #5 | ⬜ before any image tooling |
| Data validation harness + `meta{patch,updated}` | #5 | ⬜ with the extraction |

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

## 1.0 intel log
_Append-only. Newest on top. When we learn something about 1.0, drop it here and @tag the owner._
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
