import { relativeWeight } from "./maps.js";
import { TARGET_BY_ID, targetsForMap } from "./targets.js";

function needFor(def, mapId) {
    const rel = relativeWeight(def.weightTier, mapId);
    if (mapId === "farm") {
        if (rel <= 1) return 5 + Math.floor(Math.random() * 3);
        if (rel === 2) return 4 + Math.floor(Math.random() * 2);
        if (rel === 3) return 3 + Math.floor(Math.random() * 2);
        return 2 + Math.floor(Math.random() * 2);
    }
    if (rel <= 1) return 10 + Math.floor(Math.random() * 5);
    if (rel === 2) return 7 + Math.floor(Math.random() * 4);
    if (rel === 3) return 5 + Math.floor(Math.random() * 3);
    return 3 + Math.floor(Math.random() * 3);
}

// `excludeIds` keeps a freshly completed Expedition Goal from rolling the same
// Specimens again; it is dropped when the Site pool is too small to honour it.
export function rollSessionGoal(mapId, coreLevel = 1, successfulExpeditions = 0, excludeIds = []) {
    const cap = Math.max(1, coreLevel);
    let pool = targetsForMap(mapId).filter((d) => !d.rareEvent && !d.slotted && d.weightTier <= cap);
    if (pool.length < 2) {
        pool = targetsForMap(mapId).filter((d) => !d.rareEvent && d.weightTier <= cap);
    }
    if (!pool.length) {
        const fallback = TARGET_BY_ID.chicken;
        return [{ id: fallback.id, need: mapId === "farm" ? 6 : 12, have: 0 }];
    }
    if (excludeIds.length) {
        const fresh = pool.filter((d) => !excludeIds.includes(d.id));
        if (fresh.length >= 2) pool = fresh;
    }
    const living = pool.filter((d) => d.category === "living");
    const bag = (living.length >= 2 ? living : pool).slice();
    bag.sort((a, b) => a.weightTier - b.weightTier || b.spawnWeight - a.spawnWeight);
    const slots = Math.min(bag.length, successfulExpeditions >= 3 || cap >= 4 ? 3 : 2);
    const chosen = [];
    while (chosen.length < slots && bag.length) {
        const i = chosen.length === 0 ? 0 : Math.floor(Math.random() * bag.length);
        chosen.push(bag.splice(i, 1)[0]);
    }
    return chosen.map((d) => ({ id: d.id, need: needFor(d, mapId), have: 0 }));
}

export function goalFilled(goals = []) {
    return goals.length > 0 && goals.every((g) => g.have >= g.need);
}

export function goalLabel(item) {
    return TARGET_BY_ID[item.id]?.label || item.id.toUpperCase();
}

export function creditGoal(goals, id) {
    const item = goals.find((g) => g.id === id);
    if (!item || item.have >= item.need) return false;
    item.have += 1;
    return true;
}

export function goalSpawnMul(goals, def) {
    const item = goals.find((g) => g.id === def.id);
    if (!item) return 1;
    if (item.have >= item.need) return 0.65;
    return 2.6;
}
