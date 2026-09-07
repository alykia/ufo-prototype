import { BALANCE } from "./balance.js";

const halfW = BALANCE.worldWidth / 2 + 0.35;
const halfD = BALANCE.worldDepth / 2 + 0.45;

export const NS_X = 1.55;
export const EW_Z = 0.15;
export const ROAD_HALF = 0.72;
export const LANE = 0.28;

export const ROUTES = [
    {
        id: "ns-south",
        points: [
            { x: NS_X - LANE, z: halfD },
            { x: NS_X - LANE, z: -halfD },
        ],
    },
    {
        id: "ns-north",
        points: [
            { x: NS_X + LANE, z: -halfD },
            { x: NS_X + LANE, z: halfD },
        ],
    },
    {
        id: "ew-west",
        points: [
            { x: halfW, z: EW_Z + LANE },
            { x: -halfW, z: EW_Z + LANE },
        ],
    },
    {
        id: "ew-east",
        points: [
            { x: -halfW, z: EW_Z - LANE },
            { x: halfW, z: EW_Z - LANE },
        ],
    },
    {
        id: "turn-south-west",
        points: [
            { x: NS_X - LANE, z: halfD },
            { x: NS_X - LANE, z: EW_Z + LANE },
            { x: -halfW, z: EW_Z + LANE },
        ],
    },
    {
        id: "turn-east-north",
        points: [
            { x: -halfW, z: EW_Z - LANE },
            { x: NS_X + LANE, z: EW_Z - LANE },
            { x: NS_X + LANE, z: halfD },
        ],
    },
];

let activeRoutes = ROUTES;

export function setActiveRoutes(routes) {
    activeRoutes = routes && routes.length ? routes : ROUTES;
}

function distToSegment(px, pz, ax, az, bx, bz) {
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    if (len2 < 1e-8) return Math.hypot(px - ax, pz - az);
    let t = ((px - ax) * dx + (pz - az) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

export function nearRoad(x, z, pad = 0.95) {
    for (const route of activeRoutes) {
        const pts = route.points;
        for (let i = 1; i < pts.length; i++) {
            if (distToSegment(x, z, pts[i - 1].x, pts[i - 1].z, pts[i].x, pts[i].z) < pad) return true;
        }
    }
    return false;
}

export function headingY(dx, dz) {
    return Math.atan2(dx, dz) - Math.PI / 2;
}

export function pickRoute() {
    return activeRoutes[Math.floor(Math.random() * activeRoutes.length)];
}
