import { BALANCE } from "./balance.js";
import { LANE, ROAD_HALF } from "./roads.js";

const halfW = BALANCE.worldWidth / 2 + 0.35;
const halfD = BALANCE.worldDepth / 2 + 0.45;

export const SYSTEMS = ["core", "beam", "cloak", "scanner", "propulsion"];
export const MAP_ORDER = ["farm", "town", "zoo"];

const FARM_ROUTES = [
    { id: "ns-south", points: [{ x: 1.55 - LANE, z: halfD }, { x: 1.55 - LANE, z: -halfD }] },
    { id: "ns-north", points: [{ x: 1.55 + LANE, z: -halfD }, { x: 1.55 + LANE, z: halfD }] },
    { id: "ew-west", points: [{ x: halfW, z: 0.15 + LANE }, { x: -halfW, z: 0.15 + LANE }] },
    { id: "ew-east", points: [{ x: -halfW, z: 0.15 - LANE }, { x: halfW, z: 0.15 - LANE }] },
    {
        id: "turn-south-west",
        points: [
            { x: 1.55 - LANE, z: halfD },
            { x: 1.55 - LANE, z: 0.15 + LANE },
            { x: -halfW, z: 0.15 + LANE },
        ],
    },
    {
        id: "turn-east-north",
        points: [
            { x: -halfW, z: 0.15 - LANE },
            { x: 1.55 + LANE, z: 0.15 - LANE },
            { x: 1.55 + LANE, z: halfD },
        ],
    },
];

const TOWN_NS = -0.15;
const TOWN_EW = -2.4;
const TOWN_EW2 = 2.6;

const TOWN_ROUTES = [
    { id: "t-ns1", points: [{ x: 1.55 - LANE, z: halfD }, { x: 1.55 - LANE, z: -halfD }] },
    { id: "t-ns2", points: [{ x: TOWN_NS - LANE, z: halfD }, { x: TOWN_NS - LANE, z: -halfD }] },
    { id: "t-ew1", points: [{ x: halfW, z: 0.15 + LANE }, { x: -halfW, z: 0.15 + LANE }] },
    { id: "t-ew2", points: [{ x: -halfW, z: TOWN_EW - LANE }, { x: halfW, z: TOWN_EW - LANE }] },
    { id: "t-ew3", points: [{ x: halfW, z: TOWN_EW2 + LANE }, { x: -halfW, z: TOWN_EW2 + LANE }] },
];

const ZOO_ROUTES = [
    {
        id: "zoo-loop",
        points: [
            { x: -3.2, z: 5.4 },
            { x: 3.2, z: 5.4 },
            { x: 3.2, z: -5.6 },
            { x: -3.2, z: -5.6 },
            { x: -3.2, z: 5.4 },
        ],
    },
    { id: "zoo-ns", points: [{ x: 0.15, z: halfD }, { x: 0.15, z: -halfD }] },
];

export const MAPS = {
    farm: {
        id: "farm",
        label: "FARM",
        cap: 5,
        quotaBonus: 0,
        maxBuildings: 3,
        maxVehicles: 5,
        routes: FARM_ROUTES,
        slots: [
            { x: -2.45, z: -2.5 },
            { x: -2.15, z: 2.55 },
            { x: -2.0, z: -4.55 },
        ],
        enclosures: null,
    },
    town: {
        id: "town",
        label: "TOWN",
        cap: 12,
        quotaBonus: 90,
        maxBuildings: 6,
        maxVehicles: 7,
        routes: TOWN_ROUTES,
        slots: [
            { x: -2.6, z: -4.2 },
            { x: -2.55, z: -1.1 },
            { x: -2.5, z: 1.6 },
            { x: 2.55, z: -4.0 },
            { x: 2.6, z: -0.8 },
            { x: 2.5, z: 3.4 },
        ],
        enclosures: null,
    },
    zoo: {
        id: "zoo",
        label: "ZOO",
        cap: 20,
        quotaBonus: 180,
        maxBuildings: 2,
        maxVehicles: 3,
        routes: ZOO_ROUTES,
        slots: [
            { x: -2.4, z: 4.6 },
            { x: 2.4, z: 4.55 },
        ],
        enclosures: {
            ice: { xMin: -3.6, xMax: -0.35, zMin: -1.1, zMax: 2.8 },
            savanna: { xMin: 0.45, xMax: 3.7, zMin: -1.3, zMax: 3.0 },
            forest: { xMin: -3.4, xMax: 3.4, zMin: -5.5, zMax: -2.0 },
        },
    },
};

export function systemCap(unlockedMaps = ["farm"]) {
    if (unlockedMaps.includes("zoo")) return 20;
    if (unlockedMaps.includes("town")) return 12;
    return 5;
}

export function sessionCaptureGoal(mapId, successfulExpeditions = 0) {
    const base = mapId === "zoo" ? 10 : mapId === "town" ? 7 : 5;
    const climb = Math.min(4, Math.max(0, successfulExpeditions));
    const roll = 1 + Math.floor(Math.random() * 3);
    return base + climb + roll;
}

export function newestMap(unlockedMaps = ["farm"]) {
    for (let i = MAP_ORDER.length - 1; i >= 0; i--) {
        if (unlockedMaps.includes(MAP_ORDER[i])) return MAP_ORDER[i];
    }
    return "farm";
}

export function allSystemsAt(upgrades, cap) {
    return SYSTEMS.every((s) => (upgrades[s] || 1) >= cap);
}

export function mapDef(id) {
    return MAPS[id] || MAPS.farm;
}

export function enclosurePoint(mapId, enclosureId) {
    const box = MAPS[mapId]?.enclosures?.[enclosureId];
    if (!box) return null;
    const pad = 0.12;
    return {
        x: box.xMin + pad + Math.random() * Math.max(0.05, box.xMax - box.xMin - pad * 2),
        z: box.zMin + pad + Math.random() * Math.max(0.05, box.zMax - box.zMin - pad * 2),
    };
}

export function clampInEnclosure(mapId, enclosureId, x, z) {
    const box = MAPS[mapId]?.enclosures?.[enclosureId];
    if (!box) return { x, z };
    const pad = 0.08;
    return {
        x: Math.min(box.xMax - pad, Math.max(box.xMin + pad, x)),
        z: Math.min(box.zMax - pad, Math.max(box.zMin + pad, z)),
    };
}

export { ROAD_HALF, TOWN_NS, TOWN_EW, TOWN_EW2 };
