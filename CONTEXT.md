# UFO Abduction Greybox

One-screen portrait UFO research-management prototype: the player steers a UFO with a Joystick to vacuum Specimens during an Expedition, banks Session Research, and spends Banked Research on five physical UFO systems.

## Language

**Expedition**:
One field run on the Playfield. It starts at Session Research 0 and Suspicion 0, and ends when Quota is met, the player Extracts, or Suspicion reaches 100%.
_Avoid_: Session as the run, run, round, match, Drop session

**Training Expedition**:
The first Expedition on a fresh save. The Bridge guides it beat by beat, the field is arranged so every core rule is met once, and its Research banks like any other Expedition.
_Avoid_: tutorial level, demo, practice mode, sandbox

**Session Research**:
Research earned during the current Expedition. It is never spendable until it is banked when the Expedition ends.
_Avoid_: Research as if it were already spendable, score, XP

**Banked Research**:
Spendable Research stored after an Expedition ends. UFO Management spends only this.
_Avoid_: wallet, money, credits, mixing it with Session Research

**Quota**:
The Expedition success bar. Filling it ends the Expedition as a success and banks Session Research.
_Avoid_: stage, timer, a bar the run continues past

**Expedition Goal**:
An optional request for a set number of specific Specimens, announced at the start of an Expedition. Completing it pays a Goal Bonus of Session Research. Missing it costs nothing.
_Avoid_: Session Goal, "THIS SESSION", quest, mission, objective, shopping list (except in Bridge dialogue)

**Extract**:
The player-chosen early Expedition end, available after a short lockout. Session Research is always banked; leaving before Quota is a failed Expedition.
_Avoid_: Drop, quit, retreat, time-out

**Site**:
One of the Earth locations a Playfield can show: Farm, Town, Zoo. Sites unlock in that order and each raises the level cap of the five systems.
_Avoid_: map, level, world, stage, biome

**Playfield**:
The fixed 9:16 angled 3D diorama of the selected Site. Ground movement is X/Z; height is Y.
_Avoid_: map, level, world, location, 2.5D playfield, side-view Playfield

**UFO**:
The craft the player steers with the Joystick. It never auto-patrols.
_Avoid_: ship, player, claw

**Joystick**:
The floating stick that appears where the player holds the lower part of the screen. Holding it steers the UFO and keeps the Capture Zone active; releasing it drops any Specimen mid-lift.
_Avoid_: drag-to-move, virtual pad, d-pad, tap-to-move

**Capture Zone**:
The 3D tractor-beam volume under the UFO, active only while the Joystick is held. Its ground footprint is the abduction radius. Specimens whose X/Z centre enters that radius are tested for Abduction.
_Avoid_: always-on beam, beam column, trapezoid, lock box, screen-space overlap

**Tractor Beam**:
The upgrade path that widens the Capture Zone and shortens pull time.
_Avoid_: laser, ray, claw, Drop beam

**Specimen**:
Anything that can be abducted: animals, people, junk, vehicles, or structures.
_Avoid_: enemy, unit, actor, item, collectible

**Weight Tier**:
The integer mass class of a Specimen. Abduction succeeds only if Graviton Core is at least this value.
_Avoid_: mass, HP, size class, difficulty

**Abduction**:
A successful vacuum of a Specimen into the UFO. Many can run at once.
_Avoid_: Drop lock, kill, collect, harvest (except the Research it yields)

**Pickup**:
The card that slams in when a Specimen is abducted, showing its name and Research value.
_Avoid_: loot popup, toast, notification, reward card

**Discovery**:
The first ever Abduction of a Specimen type on this save. It is stamped NEW on the result screen and added to the Index.
_Avoid_: unlock, new species (outside Bridge dialogue), collectible

**Index**:
The catalogue of Discovered Specimens with their Bridge descriptions, grouped by Site.
_Avoid_: bestiary, encyclopedia, codex, collection

**Too Heavy**:
A failed lift: the Specimen resists, a small Suspicion increase is applied, and a per-object cooldown starts.
_Avoid_: fail, bounce, reject, overload

**Graviton Core**:
The upgrade that raises the Weight Tier the UFO can lift.
_Avoid_: Power, strength, damage

**Cloaking**:
The upgrade that reduces Suspicion gain and later speeds decay.
_Avoid_: stealth as a separate resource, invisibility

**Scanner Array**:
The upgrade that reveals Research values, highlights high-value Specimens, and improves Rare Event chance.
_Avoid_: radar, minimap, fog of war

**Propulsion**:
The upgrade that raises UFO max speed and acceleration.
_Avoid_: engine as a separate system name, dash, boost

**UFO Management**:
The post-Expedition schematic where Banked Research is spent on the five systems.
_Avoid_: shop, Breakthrough, card choice, skill tree

**Suspicion**:
A 0–100% detection meter. Successful Abductions, Too Heavy, and Police contact raise it; waiting with no successful Abduction lowers it. High Suspicion summons Police. 100% force-ends the Expedition as UFO DETECTED.
_Avoid_: heat, wanted, alert, aggro, Police as a synonym

**Police**:
Earth patrol cars summoned by high Suspicion. A single car patrols first; more arrive and give chase as Suspicion climbs; at 100% they surround the UFO and force UFO DETECTED. Being near one raises Suspicion.
_Avoid_: enemies, cops, guards, law-cars or stripe-cars (outside Bridge dialogue)

**Rare Event**:
A brief surprise encounter architecture. This iteration only uses Bigfoot.
_Avoid_: boss, random event, spawn event

**Bridge**:
The UFO's alien crew, speaking as one collective "we" that reports to the Council. The Bridge is confidently wrong about Earth and always right about the controls. It guides the Onboarding and comments on every result screen.
_Avoid_: narrator, captain, the alien, tutorial voice, announcer

**Onboarding**:
Everything the Bridge does to teach a new player: the Training Expedition, the guided first UFO Management visit, and the Tips that follow.
_Avoid_: FTUE, tutorial (outside settings copy), help, walkthrough

**Tip**:
A one-shot Bridge remark that fires the first time a later concept appears, such as Police, a Rare Event, or a Site unlock. Each Tip shows once per save.
_Avoid_: hint, tooltip, coach mark, popup
