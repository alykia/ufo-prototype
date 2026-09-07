# UFO Abduction Greybox

One-screen portrait UFO research-management prototype: the player drags a UFO to vacuum Specimens during an Expedition, banks Session Research, and spends Banked Research on five physical UFO systems.

## Language

**Expedition**:
One field run on the Playfield. It starts at Session Research 0 and Suspicion 0, and ends when the player Extracts or Suspicion reaches 100%.
_Avoid_: Session as the run, run, round, match, Drop session

**Session Research**:
Research earned during the current Expedition. It is never spendable until it is banked at Extract or detection.
_Avoid_: Research as if it were already spendable, score, XP

**Banked Research**:
Spendable Research stored after an Expedition ends. UFO Management spends only this.
_Avoid_: wallet, money, credits, mixing it with Session Research

**Quota**:
The Expedition success bar. Completing it does not end the run.
_Avoid_: stage, timer, win condition that force-ends play

**Extract**:
The player-chosen Expedition end. Session Research is always banked. Quota met is success; quota missed is failed.
_Avoid_: Drop, quit, retreat, time-out

**Playfield**:
The fixed 9:16 angled 3D diorama. There is only one. Ground movement is X/Z; height is Y.
_Avoid_: map, level, world, location, 2.5D playfield, side-view Playfield

**UFO**:
The craft the player steers by dragging. It never auto-patrols.
_Avoid_: ship, player, claw

**Capture Zone**:
The always-on 3D tractor-beam volume under the UFO. Its ground footprint is the abduction radius. Specimens whose X/Z centre enters that radius are tested for Abduction.
_Avoid_: beam column, trapezoid, lock box, screen-space overlap

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
A 0–100% detection meter. Successful Abductions and Too Heavy raise it; waiting with no successful Abduction lowers it. 100% force-ends the Expedition as UFO DETECTED.
_Avoid_: heat, wanted, alert, aggro, police

**Rare Event**:
A brief surprise encounter architecture. This iteration only uses Bigfoot.
_Avoid_: boss, random event, spawn event
