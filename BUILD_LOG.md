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

