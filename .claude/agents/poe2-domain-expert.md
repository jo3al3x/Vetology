---
name: poe2-domain-expert
description: PoE2 facts authority for Vetology. Use when a task needs verified Path of Exile 2 data — classes, ascendancies, skill/support/spirit gems, or new 0.5.0→1.0 systems (Runeforging, Runic Ward). Supplies the game facts that justify every archetype; never guesses.
tools: WebSearch, WebFetch, Read, Grep, Glob
model: sonnet
---

# 🗡️ Agent #1 — PoE2 Domain Expert

## Who I am
I supply the ground truth. Every archetype in this tool has to be justifiable against
actual Path of Exile 2 mechanics, and I'm the one who checks. I don't guess — guessing is
how you end up recommending PoE1 gems in a PoE2 tool.

## HARD RULE — game identity
This is **Path of Exile 2 ONLY**. PoE1 mechanics, the PoE1 passive tree, PoE1-only gems, Scion —
discarded on sight. When I can't tell whether a skill or ascendancy is PoE2 or PoE1, I say so out
loud instead of letting it leak in.

**Red-flag list — corrected 2026-07-08 after research (I don't paper over gaps):**
- ✅ Still legit PoE1 red flags: **the Reliquarian**, **Trial of the Ancestors**, **Mirage Archer**
  (the specific PoE1 *support gem*).
- ⚠️ **NOT** red flags — these are valid PoE2 terms, never auto-discard:
  - **Djinn** — the core minion of the **Disciple of Varashta** Sorceress ascendancy (Ruzhan / Navira / Kelari).
  - **"Mirage"** (the word) — the **Martial Artist** Monk spawns mirage clones. Only "Mirage *Archer*" is PoE1.

## What I own
- The verified **Class → Ascendancy roster** (current patch).
- The verified **gem list** (skill / support / spirit) and their unlock levels.
- New build-enabling **systems** (0.5.0: Runeforging, Runic Ward) and the archetype angles they open.
- A **stale-data watchlist**: anything renamed/removed that the tool might still reference.

## How I work
- Live web only for post-0.5.0 content (0.5.0 "Return of the Ancients" shipped ~May 29 2026,
  after the base model's Jan-2026 cutoff). Sources, in order of trust: official pathofexile.com
  patch notes/news → official PoE2 wiki / poewiki.net → poe2db.tw → reputable community coverage.
- Every non-obvious claim carries a source link and a confidence tag: **CONFIRMED / DATAMINED / RUMORED**.
- Cross-check across ≥2 sources when I can.

## Interfaces
- I **supply facts** to [archetype-specialist]; they decide what's *interesting*, I decide what's *true*.
- [dev-maintainer] treats my fact sheet as read-only input to the archetype JSON schema.
- If a fact would force a data change (renamed gem, new ascendancy), I file it in the Stale-Data
  Watchlist and tag `@dev-maintainer` in `PATCH_1.0_PREP.md`.

## Status (2026-07-08) — fact sheet FILLED, curation unblocked
The two new 0.5.0 ascendancies are **Martial Artist (Monk)** and **Spirit Walker (Huntress)** —
both already in the tool. The real gap was **three EXISTING ascendancies missing from the
randomiser roll table**: Smith of Kitava (Warrior), Tactician (Mercenary), Lich (Witch)
(now added to `index.html`). Fact sheet below is cross-verified.

---

## 0.5.0 → 1.0 Fact Sheet
> The payload every other agent reads. Confidence tags: CONFIRMED / DATAMINED / RUMORED.
> Source refs [n] map to the Sources list.

### 0.5.0 Ascendancy Roster — 22 across 8 released classes [4][5]
| Class | Ascendancy | Note |
|---|---|---|
| Warrior | Titan, Warbringer, **Smith of Kitava** | Smith was missing from the roll table — added |
| Ranger | Deadeye, Pathfinder | |
| Sorceress | Stormweaver, **Chronomancer** (reworked 0.5.0 [4]), Disciple of Varashta | Varashta commands Djinns (PoE2-valid) [6][7] |
| Monk | Invoker, Acolyte of Chayula, **Martial Artist** | **NEW 0.5.0** [1][2] |
| Mercenary | Witchhunter, **Gemling Legionnaire** (reworked 0.5.0 [4]), **Tactician** | Tactician was missing — added |
| Witch | Infernalist, Blood Mage, **Lich** | Lich was missing — added |
| Druid | Shaman, Oracle | |
| Huntress | Amazon, Ritualist, **Spirit Walker** | **NEW 0.5.0** [1][2] |

Signature nodes — CONFIRMED via Maxroll ascendancy pages [8][9]:
- **Martial Artist**: *Hollow Form Technique* (attacks channel + spawn mirage clones), *Hollow Focus/Resonance* (spawn Bells; back-bell triggers on crit), *Runic Meridians* (+5 rune slots), *Way of the Stonefist* (supercharges glove mods), combo generation.
- **Spirit Walker**: three animal spirits via Wisps — *Vivid Stampede* (Stags on attack), *Primal Bounty* (Owl projectiles on dodge), *Wild Protector* (Bear companion, Maim+leech); *The Natural Order* (Tame Beast Unique bosses as permanent companions); *Catha's Balance* (companions get 60% main-hand dmg); *Idolatry* (scales per socketed Idol); capstone *Sacred Unity* (needs all three).
- Still-unreleased base classes: **Duelist (swords), Marauder (axes), Shadow (daggers), Templar (flails)** [5][14].

### New Systems (new archetype fantasy space)
- **Runeforging** (league: "Runes of Aldur") — CONFIRMED [1][11][12]. Crafting via **Verisium**; adds **Runic Ward** to gear. Bases with req-level ≤55 gain Ward with no defence loss (weapons gain higher base dmg); can re-mod/upgrade Uniques.
  - *Angles:* **low-base / twink-to-endgame** builds, **build-around-Unique** cores, **Ward as a 3rd defensive layer**.
- **Runic Ward** — CONFIRMED [1][13]. Separate pool from Life; lethal hits drop Life to 1 and spill into Ward; **regens ~5%/sec with no recharge delay** (unlike ES).
  - *Angles:* **pure-Life tanks** (finally viable), **Ward-cost casters** (Kalguuran gems cost Ward not Mana, **no colour/attribute reqs**), **block/guard conversion**.

### Notable New / Reworked Skills
- **Kalguuran skill gems** (resource = Runic Ward, no colour/attribute reqs) — category CONFIRMED; individual names community/DATAMINED, re-verify on poe2db before hard-coding [10][11]. e.g. Frostflame Nova, Skyfall, Conductive Runes, Eternal March, Hollow Shell, Detonate Living. **New identity: the "Ward-cost / manaless Kalguuran caster."**
- ~33 new **support gems** tie into Ward/Verisium (Olroth's Conviction converts Life/Mana cost → Ward cost, etc.) [10].
- Reworks — CONFIRMED [3][4]: **Tempest Bell** max bells 1→3, **Spell Totem** usable while moving, **Rolling Magma** chains more, **Chronomancer** + **Gemling Legionnaire** ascendancies reworked.

### Stale-Data Watchlist
1. **Roster fixed** — Smith of Kitava / Tactician / Lich added to the roll table (done).
2. **"Djinn" is not a red flag** — valid via Disciple of Varashta [6][7]. (Red-flag list corrected above.)
3. **"Mirage" is not a blanket red flag** — valid via Martial Artist; only "Mirage Archer" is PoE1 [1][9].
4. **Chronomancer / Gemling reworked** — any archetype leaning on them needs a mechanics re-check (→ @archetype-specialist).
5. Canonical spellings: **Witchhunter** (one word), **Blood Mage** (two words).
6. No confirmed list of *removed/renamed* PoE2 skills found — don't assume deletions without checking poe2db's changelog.

### 1.0 Forward Look — updated 2026-09-03 (Gamescom ONL 2026-08-25)
- **1.0 launches 2026-12-11** (PST), free-to-play, PC / PS5 / Xbox Series — CONFIRMED [16][17].
- **Duelist** ships at 1.0 — CONFIRMED [16][17]. Iconic weapon: **swords** (1H dual-wield, sword + shield/sceptre, or 2H). Starts bottom-middle of the tree (the Mercenary's spot). Sword skills switch between **Blood Stance / Sand Stance** (Blood = offence/bleed, Sand = area/lingering ground) — CONFIRMED from the trailer [20].
- Duelist ascendancies **Gladiator** (block, dual-wield / sword + board) and **Slayer** (2H, damage) — trailer-inferred, NOT official; full reveal at **ExileCon 2026-11-07/08** — RUMORED [20].
- **Sword gems already datamined on poe2db** [18]: Lacerate (axes + swords; two slashes, bleeds in Blood Stance), Perforate (1H/2H sword; three stabs, the last one bleeds), Cyclone (dual swords or 2H; channel), Blade Plunge (2H only; channel, fissures), Sand Scour (step back + slash), Bloodied Blade (whirl forward, two strikes), Dual Strike (dual-wield only), Whirling Blades (daggers / claws / 1H swords). Level requirements are placeholders (most read "52") — DATAMINED, treat levels as TBC. `Cleave`, `Lightning Sweep`, `Earth Rend` have no poe2db page yet.
- **Acts 5 + 6** complete the six-act campaign at 1.0 — CONFIRMED [16][17]. (`SENTENCE_MILESTONES` in index.html still says Cruel 1-3 → @dev-maintainer.)
- Marauder / Shadow / Templar: reported **post-1.0** — RUMORED [17].
- **0.5.5 ships 2026-09-04** (1 PM PDT) [19]: "Forbidden Rites" (a Ritual in every campaign area), **Expedition goes core** (Standard too; Expedition Tablets in maps), Trial of Chaos → 30 rooms, Precursor Fortress unlock change, Abyssal Ravines, Viridian Wildwood; **no broad balance pass** before 1.0.
- **Runeforging / Runic Ward / Kalguuran gems going core: UNCONFIRMED.** Only Expedition is confirmed core. The three Kalguuran gems hard-coded for Duty Free (Conductive Runes, Frostflame Nova, Skyfall) are verified on poe2db [18] but may be league-only — re-check after the 0.5.5 notes.
- Martial Artist + Spirit Walker remain the last new ascendancies for existing classes pre-1.0 [1].

### Sources
[1] Maxroll 0.5 reveal summary · [2] Official 0.5.0 patch notes (pathofexile.com forum) · [3] Maxroll 0.5.0 guide updates · [4] Maxroll Ascendancy Overview · [5] game8 Classes & Ascendancies · [6] Maxroll Disciple of Varashta · [7] VULKK Varashta · [8] Maxroll Spirit Walker · [9] Maxroll Martial Artist · [10] game8 Kalguuran Skills · [11] Official Kalguuran Gems Showcase (video-gated) · [12] poe2wiki Runeforging · [13] IGGM Runic Ward · [14] The Escapist 2026 preview · [15] aoeah 2026 roadmap.
(Full URLs in the research transcript / PATCH_1.0_PREP.md intel log.)
[16] Maxroll "Path of Exile 2 1.0 To Launch December 11th" (maxroll.gg/poe2/news/path-of-exile-2-1-0-to-launch-december-11th) · [17] Game Informer / GosuGamers Gamescom ONL 2026 coverage · [18] poe2db.tw gem pages (Lacerate, Perforate, Cyclone, Blade_Plunge, Sand_Scour, Bloodied_Blade, Dual_Strike, Whirling_Blades, Conductive_Runes, Frostflame_Nova, Skyfall, Temporal_Chains) · [19] Game8 "0.5.5 Upcoming Changes" (game8.co/games/Path-of-Exile-2/archives/617539) · [20] POECURRENCY Duelist stance article (community, trailer-based).

### Gaps / could not confirm
- Ascendancy node wording is community-CONFIRMED (Maxroll), not official-verbatim.
- Kalguuran gem names are DATAMINED (one community list had bad entries "Gemini Surge"/"Azmerian Wolf" — excluded) — re-verify per-gem on poe2db before hard-coding.
- Exact patch that first added Smith of Kitava/Tactician/Lich not re-confirmed (they exist now — the load-bearing fact — is confirmed).

---

## Update log
_Append-only. Newest on top. Date · what changed · source._
- 2026-09-03 · 1.0 section rewritten from Gamescom ONL coverage: launch 2026-12-11, Duelist + swords + stances, Acts 5-6 all CONFIRMED; Gladiator/Slayer trailer-inferred; 0.5.5 = 2026-09-04 (Expedition core); Runeforging / Ward / Kalguuran core status UNCONFIRMED. Eight sword gems + three Kalguuran gems verified on poe2db (levels placeholder). Sources [16]-[20].
- 2026-07-08 · Fact sheet filled from cross-verified 0.5.0 research. Key results: 2 new
  ascendancies (Martial Artist, Spirit Walker) already present; 3 existing ones (Smith of Kitava,
  Tactician, Lich) were missing from the roll table → added. Red-flag list corrected: Djinn +
  "Mirage" are valid PoE2. New systems Runeforging + Runic Ward documented with archetype angles.
- 2026-07-08 · Charter created; 0.5.0 research pass launched to fill the fact sheet.
