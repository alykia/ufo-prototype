import { BALANCE, SAVE_KEY_V1, SAVE_KEY_V2 } from "./balance.js";
import { newestMap } from "./maps.js";

export function defaultPersistent() {
    return {
        bankedResearch: 0,
        upgrades: { core: 1, beam: 1, cloak: 1, scanner: 1, propulsion: 1 },
        discoveredSpecimens: [],
        unlockedMaps: ["farm"],
        selectedMap: "farm",
        bestSessionResearch: 0,
        successfulExpeditions: 0,
        failedExpeditions: 0,
        hasPlayed: false,
        settings: { soundOn: true },
    };
}

function clampLevel(n) {
    const v = Number(n);
    if (!Number.isFinite(v)) return 1;
    return Math.min(BALANCE.hardSystemCap, Math.max(1, Math.round(v)));
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
        settings: {
            soundOn: raw.settings && typeof raw.settings.soundOn === "boolean"
                ? raw.settings.soundOn
                : raw.soundOn !== false,
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
