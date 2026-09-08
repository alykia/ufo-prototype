# Build Log

## Iteration 001 — UFO Abduction Greybox Core Loop

Date:
2026-09-04

AI Tool:
Cursor

Goal:
Create the first playable greybox prototype for a one-screen UFO Simulation/Management game built around tractor-beam abductions, Research investment, upgrades and Suspicion management.

Prompt / Instruction:
Build a first greybox of a mobile portrait Simulation & Management game in Three.js: humorous UFO research-management around a claw-machine tractor beam. One 9:16 screen, automatic UFO patrol, DROP to abduct one Specimen, Research as the only currency, five Research Stages, Power vs Beam breakthroughs, Suspicion with decay, 5-minute Session, Stage 5 = win, Bigfoot as optional Rare Event, localStorage persistence, fully offline, greybox visuals only. Do not add extra systems.

Grilled decisions locked in this iteration:
- Each Session starts Stage 1 / Research 0 / Suspicion 0 / 5:00. Power, Beam, discoveries and best stats persist.
- Stages 1–4 fill → Breakthrough. Stage 5 fill → WIN (no fifth upgrade).
- Extra Research past a stage requirement is capped and lost (does not spill).
- On DROP: lock closest centre in the beam column; living non-locked Specimens flee; locked Specimen freezes; fast drop; resolve at full extension.
- Power and Beam never show MAXED; levels stack across Sessions. Power 1–5 unlocks Weight Tiers; every Power level also speeds the yoink. Beam width clamps at 40% of the Playfield; cycle speed keeps a diminishing bonus.
- Higher stages add heavier types but keep a reduced light-tier spawn share.

Decisions Locked:

- Three.js
- 2D presentation using OrthographicCamera
- 9:16 portrait
- fixed one-screen landscape
- automatic left/right UFO movement
- tractor beam as primary action
- one target per beam
- closest target to beam centre wins overlap selection
- moving specimens
- increasingly absurd specimen scale
- Research as only currency
- five Research stages
- Power vs Beam upgrade choices
- different possible builds
- Suspicion meter
- Suspicion decays while player waits
- 100% Suspicion = loss
- 5-minute session
- Stage 5 completion = prototype win
- Bigfoot as optional rare bonus event, not final boss
- funny low-value specimens
- persistent progress using localStorage
- settings with Sound and Delete Progress
- fully offline architecture
- greybox visuals only

Implementation:
Playable one-screen greybox. Orthographic Three.js night landscape with a patrolling UFO, trapezoid tractor beam, data-driven Specimens (tiers 1–5 plus Bigfoot Rare Event), DROP lock/flee/yoink/too-heavy/miss, Research stages with overflow cap, Power vs Beam Breakthroughs, Suspicion + decay, 300s timer, win/lose overlays, settings (Sound placeholder + confirmed Delete Progress), localStorage persistence split from session state, DEBUG overlay/keys (off by default). Three.js loaded locally as `vendor/three.module.min.js` (r169 ES module) because UMD `three.min.js` is no longer shipped.

Files Created / Changed:
- index.html
- src/main.js
- vendor/three.module.min.js
- CONTEXT.md
- docs/adr/0001-three-es-module.md
- docs/adr/0002-session-vs-persistent.md
- BUILD_LOG.md

Testing:
- `node --check` on src/main.js
- Local static server; zero CDN / external URLs in game files
- Headless Chrome (390×844, 1280×800, 320×640): stage ratio 0.5625 (9:16) in all three; no page errors; no external network requests
- DROP disables while the beam is active, then re-enables
- Settings pauses the timer; CLOSE resumes
- DEBUG overlay hidden when DEBUG=false; visible when true
- Breakthrough (R cheat): panel + paused timer; Power upgrade applied; Session still starts Stage 1 after reload with Power 2 kept
- Suspicion 100% → UFO DETECTED!; TRY AGAIN restores Session, keeps Power
- Timer cheat → RESEARCH WINDOW CLOSED
- Stage 5 fill → EARTH RESEARCH COMPLETE / YOU WIN with PLAY AGAIN + CONTINUE
- DELETE PROGRESS shows confirm, then resets Power/Beam/discoveries/best stats and keeps Sound ON
- Forced Bigfoot (debug B) + DROP at Power 1 → TOO HEAVY! +2% Suspicion, 0 Research

Issues / Observations:
- Balance is placeholder; first 30s / 5-minute win pacing needs a real playtest, not the debug keys.
- Force-debug Bigfoot stands still under the UFO briefly so TOO HEAVY can be QA'd; natural Bigfoot still walks in from the side at Stage 3+ only.
- Beam-only (Power 1) can still see cows/buildings later but cannot lift them; light-tier spawns remain so farming is possible. Whether that feels fair is a playtest question.
- Sound is saved and toggled; there is no audio.
- Decorative barn is not the abductable Barn Specimen.

Next Iteration:
The next iteration must be based on playtesting the core loop and balance. Do not automatically add features.

## Playtest tweak — slower beam

Date:
2026-09-04

Change:
`baseBeamSpeed` 22 → 13, `beamSpeedPerLevel` 2.4 → 1.6. Deploy/retract is slower to read; Beam upgrades still speed the cycle, but less aggressively. Yoink lift speed unchanged.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — slower flee, props sit still

Date:
2026-09-04

Change:
Living flee is about half as fast (`fleeSpeedMultiplier` 2.35 → 1.25). Junk, vehicles, and structures no longer slide: they spawn in place and stay put. They despawn after a dwell time so the ground does not fill up. Only animals/humans/Bigfoot walk and flee. The “one giant” cap now applies to structures only, not mailboxes.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — flee at ground contact

Date:
2026-09-04

Change:
Living targets no longer scatter on DROP. They keep walking until the beam is ~86% of the way down (just before it touches the ground), then flee. The locked specimen still freezes at DROP.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — capture on walk-in

Date:
2026-09-04

Change:
DROP no longer requires the specimen to already be in the column. During deploy, the first specimen whose centre enters the beam is locked and frozen. A late walk-in after the click still counts. Still one capture; if several overlap, closest to beam centre wins.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — living Research payout

Date:
2026-09-04

Change:
Living specimens pay about 2× more (chicken 5→12, cow 18→36, human 25→45, Bigfoot 60→90). Junk stays at 1–2 so accidents still feel bad. Stage bars lowered to 30 / 50 / 85 / 130 / 180 (475 total, down from 800) so a strong animal-focused run can finish Stage 5 inside five minutes.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — slower walking targets

Date:
2026-09-04

Change:
Living walk/flee speeds scaled to 78% via `BALANCE.targetSpeedScale`. Props still sit still.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — hotter Suspicion

Date:
2026-09-04

Change:
Grabs raise Suspicion much more (chicken +6%, cow +12%, human +16%, mall +30%). Cooling down is slower (1.8%/s, and only 0.9%/s once you are at 50%+). Waiting 2.1s after a drop before decay starts. TOO HEAVY is +5%. A greedy streak should hit HIGH SUSPICION; a human or building at 70%+ is a real risk.

Files Changed:
- src/main.js
- BUILD_LOG.md

## Playtest tweak — RED ALERT sign

Date:
2026-09-04

Change:
At 75% Suspicion a pulsing red frame appears around the playfield. At 90% a flashing RED ALERT sign is shown in the upper play area (does not block DROP).

Files Changed:
- index.html
- src/main.js
- BUILD_LOG.md

## Playtest tweak — title menu

Date:
2026-09-04

Change:
Added a first-run title menu: PLAY, SHOP (placeholder), SETTINGS. After the first PLAY, RESTART appears. RESTART asks “all the progress will be lost, are you sure?” before wiping save data (Sound is kept). Shop is empty for future UFO designs / beam colours. In-game Settings includes MAIN MENU to return to the title without wiping upgrades.

Files Changed:
- index.html
- src/main.js
- BUILD_LOG.md

## Playtest tweak — remove session timer

Date:
2026-09-04

Change:
Removed the 5-minute countdown and the time-out lose. Suspicion at 100% is the only fail state. Stage 5 still wins. HUD no longer shows TIME.

Files Changed:
- index.html
- src/main.js
- CONTEXT.md
- docs/adr/0002-session-vs-persistent.md
- BUILD_LOG.md

## Iteration 002 — Continuous Abduction and UFO Management

Date:
2026-09-07

AI Tool:
Cursor

Goal:
Replace the claw-machine Drop loop with a tilted top-down drag-to-vacuum Expedition, bank Session Research after EXTRACT or detection, and spend Banked Research on five physical UFO systems on a Management screen.

Prompt / Instruction:
Implement the locked Iteration 002 plan: delete Drop, auto-patrol, flee, breakthroughs, stages, and the timer; add pointer-follow UFO, always-on Capture Zone, multi-abduct vacuum, too-heavy cooldown, quota, EXTRACT, research-band world mix, and a five-hotspot UFO Management schematic. Save as v2. Rewrite CONTEXT. Append this log only. No Iteration 003.

Grilled decisions locked in this iteration:
- No HUD clock and no time-out. Player taps EXTRACT (10s lockout). Quota met = success; quota missed = failed. Session Research is always banked. Suspicion 100% force-ends as UFO DETECTED.
- Quota-complete toast does not end the run.
- Field mix escalates by Session Research / quota, not a hidden clock.
- Expedition gameplay is full 3D Three.js with a fixed angled PerspectiveCamera (not 2D/2.5D ortho).
- Title keeps PLAY / SHOP (empty) / SETTINGS + RESTART after first play. Expedition end → result → Management → NEXT EXPEDITION skips title. MAIN MENU returns to title.
- No beam-flee. Living wander; vehicles use a road; buildings sit in slots.

Decisions Locked:

- Expedition replaces Session as the run name
- Session Research and Banked Research are never mixed
- EXTRACT is the player-chosen end
- always-on 3D tractor beam whose ground footprint is the Capture Zone
- many concurrent abductions (cap 8)
- five persistent systems: Core / Beam / Cloak / Scanner / Propulsion
- UFO Management schematic, not a card shop
- save key `ufo-greybox-save-v2`; v1 ignored except Sound
- rapid-abduction Suspicion multiplier documented only, off
- expedition gameplay changed from 2D/2.5D presentation to full 3D Three.js
- fixed angled PerspectiveCamera
- UFO movement on the X/Z plane
- raycast-based touch/mouse movement
- 3D tractor beam
- fully 3D targets/environment
- scripted 3D lifting/shrinking abduction animations
- HTML/CSS remains responsible for HUD and menus
- UFO Management remains a 2D interface
- no physics engine

What Was Built:
Playable one-screen greybox. Fixed-angle PerspectiveCamera 3D diorama with farm, road, suburb, civic pad, trees, and house slots. Drag-follow UFO on X/Z with hover Y, translucent 3D beam, and low-poly greybox Specimens. Multi-abduct vacuum with lift/spin/shrink, too-heavy store-and-restore, quota bar, EXTRACT lockout, Suspicion decay after no successful abduction. Post-run result then HTML schematic Management with five hotspots and visible greybox growth. Persistence split into `src/persist.js` (v2). Shared meshes in `src/meshes.js`. DEBUG overlay/keys and optional 3D helpers (off by default). Three.js still local `vendor/three.module.min.js`. No CDN. No physics library.

Removed:
- DROP button, beam deploy/retract, lock, miss accounting
- auto left/right UFO patrol
- flee
- Power vs Beam breakthroughs, research stages, Stage 5 win
- timer HUD and time-out lose

Balance starting points:
- Quota = 120 + 40 × (coreLevel − 1)
- Core 1–5 = Weight Tiers 1–5
- Beam radius 0.78 + 0.18 per extra level; pull 0.30–0.68s by Weight Tier, shortened by Beam, clamped 0.20–0.80s
- Cloak −10% Suspicion gain per extra level; decay bonus from level 3
- Scanner L2 labels, L3 high-value highlight, L4/L5 rare chance
- Propulsion +0.55 max speed and +3.2 accel per extra level
- Suspicion placeholders: chicken 1%, cow 4%, mall 22%
- Upgrade costs: Core [60,140,300,600], Beam [50,120,250,500], Cloak [55,130,280,550], Scanner [40,100,220,450], Propulsion [45,110,240,480]

Known Issues / Follow-ups:
- Rapid-abduction Suspicion multiplier is specified as off
- Shop remains empty
- Sound toggle is still a placeholder with no audio
- Playtest may want EXTRACT lockout or quota numbers retuned

Files Changed:
- index.html
- src/main.js
- src/balance.js
- src/targets.js
- src/persist.js
- src/management.js
- src/meshes.js
- CONTEXT.md
- docs/adr/0003-extract-and-save-v2.md
- BUILD_LOG.md

## Playtest tweak — keep lift-able targets on the field

Date:
2026-09-07

Change:
Early Expeditions were filling with cars, buildings, and tier-2+ animals after a few chickens, so Core 1 could not finish Quota. Spawns now keep at least 7 Specimens at or under current Core, boost lift-able weights, and only sprinkle heavier preview targets for TOO HEAVY.

Files Changed:
- src/balance.js
- src/targets.js
- src/main.js
- BUILD_LOG.md

## Playtest tweak — through-roads

Date:
2026-09-07

Change:
Vehicles no longer bounce up and down one strip. A north–south road and an east–west crossing cut through the diorama. Cars, bikes, tractors and vans spawn at an edge, drive through (some turn at the junction), and leave the far side.

Files Changed:
- src/roads.js
- src/meshes.js
- src/main.js
- src/balance.js
- BUILD_LOG.md

## Iteration 003 — Onboarding and Bridge voice

Date:
2026-09-07

AI Tool:
Cursor

Goal:
Give a fresh save a Bridge-guided first Expedition and first UFO Management visit that teach every core rule without walls of text, then follow up with one-shot Tips for concepts that appear later. Tighten the Bridge's result-screen voice and extend it to failed and detected results.

Grilled decisions locked in this iteration:
- Onboarding covers move + hold-to-beam, Abduction, Expedition Goal, Quota, Too Heavy, Suspicion, EXTRACT, result, Management upgrade, NEXT EXPEDITION. Sites, INDEX and SHOP are hidden on a fresh save and revealed after the first NEXT EXPEDITION.
- The first Expedition is a scripted Training Expedition on the Farm: Quota 60, Expedition Goal CHICKEN ×5, field seeded with 6 chickens + 2 frogs, tier-1 living spawns only, one scripted cow placed ahead of the UFO so TOO HEAVY fires once, a one-off +25% Suspicion on that TOO HEAVY so the eye visibly fills, Bigfoot suppressed, Goal banner replaced by a Bridge beat.
- Three bubble modes: gate (bubble stays until the action happens, world runs), pause (world frozen via STATE.ONBOARDING; tap after the text finishes or a 4.5s timer dismisses), note (non-blocking, 3s). Action-gated beats never advance by reading.
- SKIP from beat 2 onward silences the remaining beats but keeps the training field; Tips stay enabled. REPLAY TUTORIAL lives in title Settings; RESTART / DELETE PROGRESS also replay because they wipe the flag.
- Training Research banks normally and Discoveries count; success/fail counters are not incremented. A one-time floor tops Banked Research up to 40 so the guided Management visit can always afford one upgrade.
- The Bridge speaks as a collective "we". Rule: confidently wrong about Earth, never wrong about the controls. One idea per bubble, ~14 words.
- Tips (once per save): first Police call and first Bigfoot pause the world; Town/Zoo unlock and Scanner high-value glow are non-blocking; the first failed and first detected result speak the Tip line through the result screen's own Bridge bubble; a "New buttons" Tip fires on the first title visit after Onboarding.
- Glossary rulings recorded in CONTEXT.md: Quota completion ends the Expedition (ADR 0003 amended); the Capture Zone is active only while the Joystick is held; Police, Site, Expedition Goal, Pickup, Discovery, Index, Bridge, Onboarding, Training Expedition and Tip are canonical terms. Goal banner kicker renamed THIS EXPEDITION.

Decisions Locked:

- Onboarding state stored in save v2 under `onboarding` (done, skipped, floorUsed, seenTips); saves that predate it and have played are treated as done
- new STATE.ONBOARDING for held world; Settings opened during a hold returns to the hold
- Joystick is not released on hold, so a held finger resumes movement on dismiss
- Pickup cards freeze while the world is held
- NEXT EXPEDITION is disabled during training until one upgrade is bought
- Bridge bubble docks under the HUD (or under the Management status row); highlight ring tracks its anchor every frame
- `sessionQuips.js` replaced by `bridgeQuips.js` with success / failed / detected pools; end screen gets the alien and a quip

What Was Built:
`src/onboarding.js` beat engine (bubble, typewriter, TAP/SKIP, ring, dim, Tips), `src/bridgeLines.js` copy, `src/bridgeQuips.js` result quips, `onboarding` block in `src/persist.js`, training tunables in `src/balance.js`, `onOpen` hook in `src/management.js`, `setFrozen` in `src/pickups.js`, hooks throughout `src/main.js` (training setup, spawns, Too Heavy, abduction, extract unlock, expedition end, floor, management gate, Tips, progressive title disclosure, REPLAY TUTORIAL, debug readout `window.__ufoDebug` behind the D overlay), bubble/ring/dim markup and CSS plus end-screen Bridge in `index.html`.

Files Created / Changed:
- src/onboarding.js (new)
- src/bridgeLines.js (new)
- src/bridgeQuips.js (new; replaces src/sessionQuips.js)
- src/main.js
- src/persist.js
- src/balance.js
- src/management.js
- src/pickups.js
- index.html
- CONTEXT.md
- docs/adr/0003-extract-and-save-v2.md (amended)
- BUILD_LOG.md

Testing:
- `node --check` on every module; static server; no external URLs
- Headless Chrome CDP playthrough at 390×844 and 320×640 driving the real Joystick: fresh title shows only PLAY/SETTINGS; PLAY → welcome card pauses the world; hold-and-drag fires move → beam → first Abduction → pickup/goal/quota pauses; scripted cow → TOO HEAVY (+25%) → Suspicion beat; EXTRACT note at lockout end; Quota 60 → training result line → Management gate → ringed cheapest hotspot → UPGRADE → NEXT EXPEDITION enabled → normal Expedition (Quota 120, Goal banner, no bubbles, `onboarding.done` persisted)
- Early EXTRACT on a normal run: end screen shows the alien and the failed Tip line once; no second floating bubble
- Title after Onboarding: Sites/INDEX/SHOP revealed with the "New buttons" Tip; REPLAY TUTORIAL present only in title Settings, restarts training and keeps Banked Research; SKIP hides bubbles, keeps quota 60, persists `skipped`
- Settings during a paused beat hides the bubble and returns to the pause on CLOSE
- Early EXTRACT during training floors Banked Research to 40 and shows the floor line; an upgrade is affordable
- Bubble stays above the 62% Joystick zone at both sizes; zero console errors

Issues / Observations:
- Pause beats auto-dismiss 4.5s after the text finishes so the game can never stall; there is no way to hold a bubble open, so raise the timer if playtests show slow readers losing lines.
- The `mid` bubble placement (Pickup beat) sits slightly inside the Joystick zone on very short screens; it only appears during a pause, where the Joystick is inert.
- No audio; the alien mouth animation is the only "speech" cue.

Next Iteration:
Playtest the Training Expedition with real new players. Tune line lengths, the 4.5s auto-dismiss, the +25% Suspicion bump, and whether Quota 60 finishes inside two minutes.

## Iteration 004 — Meteorite, Shop, Refits

Date:
2026-09-08

AI Tool:
Cursor

Goal:
Give Expedition Goals their own currency (Meteorite) and a place to spend it (the title-screen Shop, previously an EMPTY stub), keep goals rolling for the whole run, and make the five-system UFO visibly grow at each Site cap.

Prompt / Instruction:
Add a new "meteorite" currency paid by goals instead of Research; find a meteorite icon; show a "targets acquired!" popup with the amount and current total (keep the goal SFX); start a new goal right away; show Meteorite won on the success/fail screen; fill the Shop with UFOs, beams and funny accessories at prices that take a few runs; equip from the Shop with no inventory; give every UFO part except the beam a small visual change at levels 5, 12 and 20.

Grilled decisions locked in this iteration:
- Expedition Goal pays Meteorite only, flat per Site: Farm 10 / Town 15 / Zoo 25 (Training pays the Farm value). The Research Goal Bonus (`goalBonusFor`, 20% of Quota) is deleted, so a goal can no longer tip the Quota.
- Meteorite is saved the moment a goal completes and is kept on failed and detected Expeditions; Research keeps banking only on success. ADR 0004 records this; ADR 0003 is amended because its "Session Research is always banked" sentence never matched the code.
- After a goal completes a new one rolls at once with the same roller, excluding the species just completed when the pool allows, no difficulty ramp. Not during the Training Expedition, whose single chicken goal pays once.
- Announcement: non-blocking TARGETS ACQUIRED! card (purple, slam-in, 1.8s, existing `goal` SFX) with `+N` and the new total, then the goal banner returns for 2.5s with the new set. Frozen with the world like the goal banner.
- Meteorite balance shows on the result screen (`+N` for the run, on failure too), as a chip on the title SHOP button, and in the Shop header. Not on the Expedition HUD.
- Icon: `Ore Amethyst.svg` copied (never moved) from Global Assets; shop card icons likewise copied from the Trail, Cone, Fan, Hat, Satellite Dish, Paw, Dice, Sticky Note, Crown and Rainbow packs. `iconData.js` regenerated from the icons folder with existing entries byte-identical.
- Shop: three slots (Hulls, Beams, Extras), one equipped per slot, BUY auto-equips, tap an owned card to equip, free defaults always owned. Pure cosmetics. Live rotating 3D preview of the player's own UFO with equipped Cosmetics and current Refits; a Bridge line per item. Hidden on a fresh save through the existing `#menu.fresh` rule. Cosmetics never appear on the Management schematic.
- Catalogue: Hulls Standard (free) / Brass Antique 150 / Stealth Black 200 / Candy Pink 200 / Golden Saucer 400. Beams Green (free) / Cyan 80 / Magenta 80 / Amber 80 / Rainbow 250 (hue cycles). Extras None (free) / Party Hat 60 / Propeller Cap 80 / Cowboy Hat 90 / Blinking Antenna 90 / Cat Ears 100 / Fuzzy Dice 100 / Bumper Sticker 100 / Tiny Crown 120.
- Refits (cumulative, 3D UFO only, Beam untouched): Core L5 emitter ring, L12 three orbiting graviton octahedra, L20 pulsing core sphere + tilted halo. Cloak L5 blue rim strip, L12 slow translucent refraction ring, L20 hull opacity breathing (solid while the beam is held). Scanner L5 side dish, L12 rotating sweep arm just below the dome top so hats still fit, L20 six blinking rim lights. Propulsion L5 exhaust cones, L12 two extra engines with brighter cones, L20 cones stretch into flame trails with speed.
- Management: REFIT toast with the part name at 5/12/20 and a one-shot `refit` Tip. `.growth` overlays now default to opacity 1 so levels 6–20 stay lit (they used to fall back to browser default only by accident of missing rules).
- Glossary additions: Meteorite, Goal Bonus (redefined), Refit, Shop, Cosmetic, Equip; Extract and Banked Research corrected to "success only".

Decisions Locked:

- `createUfo` owns its materials (no shared cache) and exposes `userData.parts`, `mats`, `anchors` (domeTop / underHull / rimEdge / domeSide), `cosmetics` and `refits` groups
- `applyCosmetics(ufo, looks, upgrades)` and `applyRefits(ufo, upgrades)` rebuild their groups; `animateUfo(ufo, dt, { speed, beamHeld })` drives every spinner, blinker, swinger, orbiter, pulser, sweep, thruster and the rainbow hue, shared by the Expedition and the Shop preview
- Save v2 gains `meteorite` (clamped ≥ 0) and `cosmetics { owned, equipped }`; `validate` drops unknown ids and falls unowned equipped slots back to the free defaults
- `expedition.goalBonus / goalReached` replaced by `goalPaid`, `goalsCompleted`, `meteoriteEarned`; Bridge quips read `goalsCompleted`
- Debug keys: `M` +50 Meteorite, `G` fills the current goal
- `#toasts` raised to z-index 9 so Management toasts (REFIT, Site unlocks) are visible

What Was Built:
`src/shopCatalog.js` (data + `resolveLooks`), `src/shopLines.js` (Bridge copy), `src/shop.js` (overlay, tabs, cards, buy/equip, second WebGL preview started on show and stopped on hide), Meteorite payout / continuous goal loop / acquired card / result chip / title chip in `src/main.js`, `excludeIds` in `src/goals.js`, UFO refactor plus Cosmetics, Refits and animator in `src/meshes.js`, `meteoritePerGoal` / `refitLevels` / card timings in `src/balance.js`, save fields and validation in `src/persist.js`, `refit` Tip in `src/bridgeLines.js`, markup and CSS for `#acquired-card`, `#shop-book` and `.meteorite-chip` in `index.html`, 14 icons copied into `assets/ui/icons`.

Files Created / Changed:
- src/shopCatalog.js (new)
- src/shopLines.js (new)
- src/shop.js (new)
- src/main.js
- src/goals.js
- src/meshes.js
- src/balance.js
- src/persist.js
- src/bridgeLines.js
- src/bridgeQuips.js
- src/uiIcons.js
- src/iconData.js (regenerated)
- assets/ui/icons/meteorite.svg, shop-*.svg (new, copied from Global Assets)
- index.html
- CONTEXT.md
- docs/adr/0003-extract-and-save-v2.md (amended)
- docs/adr/0004-meteorite-cosmetic-currency.md (new)
- BUILD_LOG.md

Testing:
- `node --check` on every module; static server; no external requests during any run
- Headless Chrome (SwiftShader) Playwright playthrough at 450×860: title chip shows the balance; Shop opens with balance, three tabs and card states (equipped / owned / buyable / poor); buying with too little Meteorite toasts NOT ENOUGH METEORITE and spends nothing; `M` then buy deducts, adds to `owned`, equips, flips the card to EQUIPPED and updates the preview and Bridge line; equip swap None → Party Hat round-trips; Rainbow beam and Golden Saucer bought and shown in the preview; reload keeps purchases and balance; fresh save hides SHOP; RESTART wipes Meteorite and Cosmetics; corrupt save (`meteorite: -5`, junk owned ids, unowned equipped) clamps to 0 and falls back to defaults
- Goal loop: start banner shows `[meteorite] +10`; `G` completes the goal → TARGETS ACQUIRED! `+10`, TOTAL 10, goal row already shows a different species set; card hides at 1.8s and the banner returns with the new goals; second goal → TOTAL 20 with Quota still 0 / 290; early Extract → FAILED screen shows `[meteorite] +20`, save keeps 20 Meteorite and 0 Banked Research
- Training: the chicken goal pays +10 and stays DONE without re-rolling; pressing `G` again does not pay twice
- Refits: Core 4 → 5 in Management shows `REFIT: EMITTER RING` and the Bridge Tip; all systems at 20 render every Refit in the Shop preview and in the Expedition (cloak breathing, rim strip, refraction ring, orbiters, dish, sweep, rim lights, four engines with trails); `.growth` overlays report opacity 1 at level 20

Issues / Observations:
- The `menuReveal` Tip can appear over the open Shop on the first title visit after Onboarding because Shop is a title overlay; harmless but worth moving the Tip to fire before overlays open.
- The Shop preview uses a second WebGL context; it is created lazily on first open and never disposed, which is fine for one page but should be watched on low-end phones.
- Refits are small at gameplay camera distance by design; the Shop preview is where they read clearly.
- No new SFX: buying reuses `upgrade`, equipping reuses `confirm`, deny reuses `deny`.

Next Iteration:
Playtest Meteorite income against prices (target: first Accessory after 2–3 runs, Golden Saucer after ~10), and check whether continuous goal re-rolls make long runs feel farmable.

### 004a — Shop try-on and Refits readable in play

- Shop: tapping any card (locked or not) now dresses the preview saucer with it and shows a PREVIEW tag over the canvas (`GOLDEN SAUCER + PARTY HAT` / `TAP AGAIN TO BUY`, `TAP AGAIN TO EQUIP`, `NEED n MORE METEORITE`). Tapping the same card again buys or equips. Previews are remembered per slot so hull + hat can be combined; tapping the equipped card reverts that slot; closing the Shop clears previews. Nothing is saved until the second tap.
- Refits redesigned for the Expedition camera. The old Core L5/L12/L20 details hung under the hull and the Propulsion cones sat inside the hull frustum, so nothing showed in play (the report was "Core 5, no change"). Every Refit now lives on the hull top, the rim edge, or outside the silhouette, and nothing is thinner than ~0.02 units (the saucer is ~100 px wide in play):
  - Core: L5 purple conduit ring on the hull top (r 0.42), L12 three power gems orbiting along that ring, L20 tilted reactor halo circling the dome.
  - Cloak: L5 blue rim strip (thicker), L12 four translucent field plates circling outside the hull (the old torus spun about its own axis, invisibly), L20 phase shimmer softened to opacity 0.64–0.88 so the silhouette never drops out.
  - Scanner: L5 dish (slightly larger), L12 radar sweep on the hull top with a trailing translucent wedge, L20 six blinking sensor lights on the hull top edge.
  - Propulsion: L5 two engine pods poking out of the left/right rim with orange cones, L12 fore/aft pods, L20 flame trails capped at 2.2× so they stay tasteful.
  - Dome top stays free for hats. REFIT toast labels renamed to match (CONDUIT RING, POWER GEMS, REACTOR HALO, RIM LIGHT STRIP, FIELD PLATES, PHASE SHIMMER, ENGINE PODS, FORE + AFT PODS).
- Verified headless at 2× DPR: Core 5 alone reads as a purple ring in play; Scanner 12 alone shows the sweep; Propulsion 5 alone shows two pods; all four at 20 render in play and in the Shop preview with a Party Hat still fitting.

