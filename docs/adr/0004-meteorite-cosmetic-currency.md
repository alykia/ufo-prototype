# 0004. Meteorite as a second, cosmetic-only currency

Date: 2026-09-08

## Status

Accepted

## Context

Through iteration 003 the Expedition Goal paid a Goal Bonus of Session Research (20% of Quota, minimum 20). That made the goal a Quota shortcut rather than its own reward, tied its value to the Research economy, and left the title-screen SHOP button as an "EMPTY" stub. The player also had no reward that survived a failed Expedition, so an early Extract felt like pure loss.

## Decision

Introduce **Meteorite**, a second persistent currency with its own rules:

- Paid only by completing an Expedition Goal: flat per Site, Farm 10 / Town 15 / Zoo 25. The Training Expedition pays the Farm amount.
- Paid immediately on completion and saved at once, so it is **kept when the Expedition fails or is detected**. Research keeps its existing rule (banked only on success).
- Expedition Goals no longer add Session Research. After one completes, a new goal rolls straight away (excluding the species just completed when the Site pool allows) so a long run can earn several payouts. Not during the Training Expedition.
- Meteorite buys only **Cosmetics** in the Shop: Hulls, Beam Tints, Accessories. One equipped per slot, buying equips, no separate inventory. Cosmetics change how the UFO looks and nothing else; Refits (visual growth at levels 5/12/20) are likewise decorative.
- Meteorite and Cosmetics live in save v2 (`meteorite`, `cosmetics.owned`, `cosmetics.equipped`) with defaults; RESTART / DELETE PROGRESS wipe them with everything else.

## Consequences

- Two currencies, two sinks: Research → UFO Management (power), Meteorite → Shop (looks). Neither converts into the other; a Research buff can never be bought with Meteorite and a goal can never tip the Quota.
- Failure now leaves something behind, which softens early Extracts without weakening the "bank only on success" rule for Research.
- Prices (60–400) assume roughly 2–5 completed goals per successful run, so a first purchase takes a few Expeditions and the Golden Saucer several. Tune `BALANCE.meteoritePerGoal` and the catalogue prices together.
- `validate()` in `persist.js` has to know the catalogue (owned ids and slot defaults), so `shopCatalog.js` must stay free of imports from `persist.js`.
- The 3D UFO now owns its materials and exposes anchors; every future part must attach through `applyCosmetics` / `applyRefits` so the Shop preview and the in-Expedition UFO stay identical.
