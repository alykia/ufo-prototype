import { BALANCE, SAVE_KEY_V1, SAVE_KEY_V2 } from "./balance.js";
import { newestMap } from "./maps.js";
import { SHOP_ITEM_BY_ID, SHOP_SLOTS, defaultEquipped } from "./shopCatalog.js";

export function defaultPersistent() {
    return {
        bankedResearch: 0,
        meteorite: 0,
        cosmetics: defaultCosmetics(),
        upgrades: { core: 1, beam: 1, cloak: 1, scanner: 1, propulsion: 1 },
        discoveredSpecimens: [],
        unlockedMaps: ["farm"],
        selectedMap: "farm",
        bestSessionResearch: 0,
        successfulExpeditions: 0,
        failedExpeditions: 0,
        hasPlayed: false,
        onboarding: defaultOnboarding(),
        settings: { soundOn: true, musicVolume: 1 },
    };
}

export function defaultOnboarding() {
    return { done: false, skipped: false, floorUsed: false, seenTips: [] };
}

export function defaultCosmetics() {
    return { owned: [], equipped: defaultEquipped() };
}

// Owned Cosmetics must exist in the catalogue; an equipped slot must point at
// an item of that slot that is free or owned, otherwise it falls back to the
// free default so a stale save can never reference a missing mesh.
function validateCosmetics(raw) {
    const base = defaultCosmetics();
    if (!raw || typeof raw !== "object") return base;
    const owned = Array.isArray(raw.owned)
        ? raw.owned.filter((id) => typeof id === "string" && SHOP_ITEM_BY_ID[id] && SHOP_ITEM_BY_ID[id].price > 0)
        : [];
    const equipped = defaultEquipped();
    const rawEq = raw.equipped && typeof raw.equipped === "object" ? raw.equipped : {};
    for (const slot of SHOP_SLOTS) {
        const id = rawEq[slot];
        const def = typeof id === "string" ? SHOP_ITEM_BY_ID[id] : null;
        if (def && def.slot === slot && (def.price === 0 || owned.includes(id))) equipped[slot] = id;
    }
    return { owned: Array.from(new Set(owned)), equipped };
}

function validateOnboarding(raw, hasPlayed) {
    const base = defaultOnboarding();
    if (!raw || typeof raw !== "object") {
        // Saves written before Onboarding existed: a player who has already
        // played is not a new player. They can REPLAY TUTORIAL from Settings.
        if (hasPlayed) {
            base.done = true;
            base.seenTips.push("menuReveal");
        }
        return base;
    }
    return {
        done: Boolean(raw.done),
        skipped: Boolean(raw.skipped),
        floorUsed: Boolean(raw.floorUsed),
        seenTips: Array.isArray(raw.seenTips)
            ? raw.seenTips.filter((id) => typeof id === "string")
            : [],
    };
}

function clampLevel(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 1;
    return Math.min(BALANCE.hardSystemCap, Math.max(1, Math.round(v)));
}

function clampMusicVolume(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 1;
    return Math.min(1, Math.max(0, v));
}

function validate(raw) {
    const base = defaultPersistent();
    if (!raw || typeof raw !== "object") return base;
    const upgrades = raw.upgrades && typeof raw.upgrades === "object" ? raw.upgrades : {};
    const unlockedMaps = Array.isArray(raw.unlockedMaps) && raw.unlockedMaps.includes("farm")
        ? ["farm", ...raw.unlockedMaps.filter((id) => id === "town" || id === "zoo")]
        : ["farm"];
    if (unlockedMaps.includes("zoo") && !unlockedMaps.includes("town")) unlockedMaps.splice(1, 0, "town");
    const selected = ["farm", "town", "zoo"].includes(raw.selectedMap)
        ? raw.selectedMap
        : newestMap(unlockedMaps);
    return {
        bankedResearch: Math.max(0, Number(raw.bankedResearch) || 0),
        meteorite: Math.max(0, Math.round(Number(raw.meteorite) || 0)),
        cosmetics: validateCosmetics(raw.cosmetics),
        upgrades: {
            core: clampLevel(upgrades.core),
            beam: clampLevel(upgrades.beam),
            cloak: clampLevel(upgrades.cloak),
            scanner: clampLevel(upgrades.scanner),
            propulsion: clampLevel(upgrades.propulsion),
        },
        discoveredSpecimens: Array.isArray(raw.discoveredSpecimens)
            ? raw.discoveredSpecimens.filter((id) => typeof id === "string")
            : [],
        unlockedMaps,
        selectedMap: unlockedMaps.includes(selected) ? selected : "farm",
        bestSessionResearch: Math.max(0, Number(raw.bestSessionResearch) || 0),
        successfulExpeditions: Math.max(0, Number(raw.successfulExpeditions) || 0),
        failedExpeditions: Math.max(0, Number(raw.failedExpeditions) || 0),
        hasPlayed: Boolean(raw.hasPlayed),
        onboarding: validateOnboarding(raw.onboarding, Boolean(raw.hasPlayed)),
        settings: {
            soundOn: raw.settings && typeof raw.settings.soundOn === "boolean"
                ? raw.settings.soundOn
                : raw.soundOn !== false,
            musicVolume: clampMusicVolume(raw.settings && raw.settings.musicVolume),
        },
    };
}

function readSoundFromV1() {
    try {
        const raw = localStorage.getItem(SAVE_KEY_V1);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.soundOn === "boolean") return parsed.soundOn;
    } catch {
        /* ignore corrupt v1 */
    }
    return null;
}

export function loadPersistent() {
    try {
        const raw = localStorage.getItem(SAVE_KEY_V2);
        if (raw) return validate(JSON.parse(raw));
    } catch {
        /* fall through */
    }
    const fresh = defaultPersistent();
    const v1Sound = readSoundFromV1();
    if (v1Sound !== null) fresh.settings.soundOn = v1Sound;
    return fresh;
}

export function savePersistent(state) {
    localStorage.setItem(SAVE_KEY_V2, JSON.stringify(state));
}
