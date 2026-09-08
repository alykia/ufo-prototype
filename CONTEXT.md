# UFO Abduction Greybox

One-screen portrait UFO research-management prototype: the player steers a UFO with a Joystick to vacuum Specimens during an Expedition, banks Session Research, spends Banked Research on five physical UFO systems, and spends Meteorite from Expedition Goals on Cosmetics in the Shop.

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
Spendable Research stored after a successful Expedition. UFO Management spends only this.
_Avoid_: wallet, money, credits, mixing it with Session Research or Meteorite

**Meteorite**:
The second currency. Expedition Goals pay a flat amount per Site (Farm 10, Town 15, Zoo 25) the moment they complete; it is kept even when the Expedition fails, and only the Shop spends it. It never affects Quota, Research, or any system level.
_Avoid_: gems, premium currency, crystals, mixing it with Research, Meteorites (always singular as a currency)

**Quota**:
The Expedition success bar. Filling it ends the Expedition as a success and banks Session Research.
_Avoid_: stage, timer, a bar the run continues past

**Expedition Goal**:
A request for a set number of specific Specimens, announced at the start of an Expedition. Completing it pays a Goal Bonus of Meteorite (never Research), shows TARGETS ACQUIRED!, and a new Expedition Goal rolls at once for the rest of the run. Missing it costs nothing. The Training Expedition's goal pays but does not re-roll.
_Avoid_: Session Goal, "THIS SESSION", quest, mission, objective, shopping list (except in Bridge dialogue)

**Goal Bonus**:
The Meteorite paid when an Expedition Goal completes. It is not Research.
_Avoid_: trophy, bonus Research, reward

**Extract**:
The player-chosen early Expedition end, available after a short lockout. Session Research is banked only when Quota is met; leaving before Quota is a failed Expedition and the Session Research is lost. Meteorite earned during the run is always kept.
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
The post-Expedition schematic where Banked Research is spent on the five systems. Cosmetics never appear on it.
_Avoid_: Shop (that is the title-screen store), Breakthrough, card choice, skill tree

**Refit**:
The visible change the 3D UFO gains when a system reaches a Site cap (level 5, 12, 20). Refits stack, are purely visual, and cover Graviton Core, Cloaking, Scanner Array and Propulsion; the Tractor Beam already grows on its own. Management shows a REFIT toast and the first one fires a Tip.
_Avoid_: skin, evolution, upgrade tier, milestone (in copy)

**Shop**:
The title-screen store where Meteorite buys Cosmetics. It shows a live rotating preview of the player's UFO with everything equipped, and is hidden until Onboarding is done.
_Avoid_: store, market, inventory, UFO Management

**Cosmetic**:
A Shop item that changes only how the UFO looks: a Hull (colours and rivets), a Beam Tint (beam colour, including Rainbow) or an Accessory (a hat, dice, sticker, antenna). One Cosmetic per slot is Equipped; the free defaults are always owned. Cosmetics have no gameplay effect.
_Avoid_: skin, perk, item that changes stats, loot

**Equip**:
Selecting an owned Cosmetic for its slot from the Shop. Buying equips at once; the UFO in the next Expedition wears it. There is no separate inventory.
_Avoid_: install, wear (outside Bridge dialogue), activate

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
