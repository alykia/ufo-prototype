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
            ice: {
                points: [
                    { x: -3.65, z: 2.85 },
                    { x: -0.62, z: 2.55 },
                    { x: -0.58, z: 0.15 },
                    { x: -1.55, z: -1.35 },
                    { x: -3.70, z: -0.85 },
                ],
                gapEdge: 1,
            },
            savanna: {
                points: [
                    { x: 0.62, z: 2.95 },
                    { x: 3.55, z: 2.65 },
                    { x: 3.70, z: 0.35 },
                    { x: 2.85, z: -1.45 },
                    { x: 0.58, z: -0.75 },
                ],
                gapEdge: 4,
            },
            forest: {
                points: [
                    { x: -3.50, z: -2.20 },
                    { x: 1.10, z: -2.15 },
                    { x: 3.45, z: -2.55 },
                    { x: 3.35, z: -5.35 },
                    { x: -0.40, z: -5.55 },
                    { x: -3.55, z: -4.65 },
                ],
                gapEdge: 0,
            },
        },
    },
};

export const MAP_UNLOCK_CORE = {
    farm: 1,
    town: 5,
    zoo: 12,
};

export function mapUnlockCore(mapId) {
    return MAP_UNLOCK_CORE[mapId] || 1;
}

export function relativeWeight(weightTier, mapId) {
    return Math.max(1, (weightTier || 1) - mapUnlockCore(mapId) + 1);
}

export function systemCap(unlockedMaps = ["farm"]) {
    if (unlockedMaps.includes("zoo")) return 20;
    if (unlockedMaps.includes("town")) return 12;
    return 5;
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

export function enclosureShape(enc) {
    if (!enc) return null;
    if (enc.points?.length >= 3) return enc.points;
    if (enc.xMin == null) return null;
    return [
        { x: enc.xMin, z: enc.zMin },
        { x: enc.xMax, z: enc.zMin },
        { x: enc.xMax, z: enc.zMax },
        { x: enc.xMin, z: enc.zMax },
    ];
}

function polyBounds(pts) {
    let xMin = Infinity;
    let xMax = -Infinity;
    let zMin = Infinity;
    let zMax = -Infinity;
    for (const p of pts) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.z < zMin) zMin = p.z;
        if (p.z > zMax) zMax = p.z;
    }
    return { xMin, xMax, zMin, zMax };
}

function polyCentroid(pts) {
    let x = 0;
    let z = 0;
    for (const p of pts) {
        x += p.x;
        z += p.z;
    }
    return { x: x / pts.length, z: z / pts.length };
}

function pointInPoly(x, z, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x;
        const zi = pts[i].z;
        const xj = pts[j].x;
        const zj = pts[j].z;
        if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-6) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

function projectToSeg(x, z, a, b) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / len2));
    return { x: a.x + dx * t, z: a.z + dz * t };
}

export function enclosurePoint(mapId, enclosureId) {
    const pts = enclosureShape(MAPS[mapId]?.enclosures?.[enclosureId]);
    if (!pts) return null;
    const b = polyBounds(pts);
    const pad = 0.16;
    for (let i = 0; i < 28; i++) {
        const x = b.xMin + pad + Math.random() * Math.max(0.05, b.xMax - b.xMin - pad * 2);
        const z = b.zMin + pad + Math.random() * Math.max(0.05, b.zMax - b.zMin - pad * 2);
        if (pointInPoly(x, z, pts)) return { x, z };
    }
    return polyCentroid(pts);
}

export function clampInEnclosure(mapId, enclosureId, x, z) {
    const pts = enclosureShape(MAPS[mapId]?.enclosures?.[enclosureId]);
    if (!pts) return { x, z };
    if (pointInPoly(x, z, pts)) return { x, z };
    let best = { x, z };
    let bestD = Infinity;
    for (let i = 0; i < pts.length; i++) {
        const p = projectToSeg(x, z, pts[i], pts[(i + 1) % pts.length]);
        const d = (p.x - x) ** 2 + (p.z - z) ** 2;
        if (d < bestD) {
            bestD = d;
            best = p;
        }
    }
    const c = polyCentroid(pts);
    const vx = c.x - best.x;
    const vz = c.z - best.z;
    const n = Math.hypot(vx, vz) || 1;
    return { x: best.x + (vx / n) * 0.1, z: best.z + (vz / n) * 0.1 };
}

export { ROAD_HALF, TOWN_NS, TOWN_EW, TOWN_EW2 };
