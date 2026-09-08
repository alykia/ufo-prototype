import { BALANCE } from "./balance.js";

function farm(def) {
    return { maps: ["farm"], ...def };
}

export const TARGETS = [
    farm({ id: "trash", label: "TRASH CAN", category: "junk", weightTier: 1, researchValue: 1, suspicionValue: 0.5, spawnWeight: 9, speedMin: 0, speedMax: 0, movable: false, spawnBand: 1, rarity: "common", colour: 0x6d7380, size: [0.28, 0.32, 0.28] }),
    farm({ id: "gnome", label: "GNOME", category: "junk", weightTier: 1, researchValue: 2, suspicionValue: 0.6, spawnWeight: 8, speedMin: 0, speedMax: 0, movable: false, spawnBand: 1, rarity: "common", colour: 0xc45c4a, size: [0.22, 0.38, 0.22] }),
    farm({ id: "mailbox", label: "MAILBOX", category: "junk", weightTier: 1, researchValue: 2, suspicionValue: 0.6, spawnWeight: 7, speedMin: 0, speedMax: 0, movable: false, spawnBand: 1, rarity: "common", colour: 0x3d5aa8, size: [0.2, 0.4, 0.2] }),
    farm({ id: "frog", label: "FROG", category: "living", weightTier: 1, researchValue: 3, suspicionValue: 0.8, spawnWeight: 10, speedMin: 0.55, speedMax: 0.95, movable: true, spawnBand: 1, rarity: "common", colour: 0x4caf50, size: [0.26, 0.16, 0.26] }),
    farm({ id: "chicken", label: "CHICKEN", category: "living", weightTier: 1, researchValue: 5, suspicionValue: 1, spawnWeight: 10, speedMin: 0.5, speedMax: 0.85, movable: true, spawnBand: 1, rarity: "common", colour: 0xf0d0a0, size: [0.3, 0.22, 0.26] }),
    farm({ id: "cat", label: "CAT", category: "living", weightTier: 2, researchValue: 8, suspicionValue: 3.5, spawnWeight: 8, speedMin: 0.7, speedMax: 1.15, movable: true, spawnBand: 2, rarity: "common", colour: 0xd8a04a, size: [0.34, 0.22, 0.28] }),
    farm({ id: "dog", label: "DOG", category: "living", weightTier: 2, researchValue: 8, suspicionValue: 3.5, spawnWeight: 8, speedMin: 0.65, speedMax: 1.05, movable: true, spawnBand: 2, rarity: "common", colour: 0x8d6e4a, size: [0.4, 0.28, 0.3] }),
    farm({ id: "sheep", label: "SHEEP", category: "living", weightTier: 2, researchValue: 10, suspicionValue: 4, spawnWeight: 8, speedMin: 0.4, speedMax: 0.7, movable: true, spawnBand: 1, rarity: "common", colour: 0xece6dc, size: [0.46, 0.34, 0.36] }),
    farm({ id: "wheelbarrow", label: "WHEELBARROW", category: "vehicle", weightTier: 2, researchValue: 10, suspicionValue: 4, spawnWeight: 5, speedMin: 0, speedMax: 0, movable: false, spawnBand: 2, rarity: "common", colour: 0xb55a2a, size: [0.48, 0.28, 0.32] }),
    farm({ id: "cow", label: "COW", category: "living", weightTier: 3, researchValue: 18, suspicionValue: 9, spawnWeight: 7, speedMin: 0.35, speedMax: 0.55, movable: true, spawnBand: 2, rarity: "common", colour: 0xf2f0ea, size: [0.72, 0.42, 0.4] }),
    farm({ id: "deer", label: "DEER", category: "living", weightTier: 3, researchValue: 20, suspicionValue: 9, spawnWeight: 6, speedMin: 0.7, speedMax: 1.1, movable: true, spawnBand: 2, rarity: "common", colour: 0xa67c52, size: [0.58, 0.48, 0.32] }),
    farm({ id: "human", label: "HUMAN", category: "living", weightTier: 3, researchValue: 25, suspicionValue: 14, spawnWeight: 5, speedMin: 0.4, speedMax: 0.7, movable: true, spawnBand: 2, rarity: "uncommon", colour: 0xe0b090, size: [0.22, 0.62, 0.2] }),
    farm({ id: "motorcycle", label: "MOTORCYCLE", category: "vehicle", weightTier: 3, researchValue: 30, suspicionValue: 12, spawnWeight: 5, speedMin: 1.4, speedMax: 2.0, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0xc03030, size: [0.55, 0.28, 0.28], onRoad: true }),
    farm({ id: "horse", label: "HORSE", category: "living", weightTier: 4, researchValue: 30, suspicionValue: 16, spawnWeight: 5, speedMin: 0.6, speedMax: 1.0, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0x6b4a32, size: [0.78, 0.58, 0.36] }),
    farm({ id: "car", label: "CAR", category: "vehicle", weightTier: 4, researchValue: 40, suspicionValue: 20, spawnWeight: 6, speedMin: 1.2, speedMax: 1.8, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0x3a6ea8, size: [0.9, 0.32, 0.42], onRoad: true }),
    farm({ id: "tractor", label: "TRACTOR", category: "vehicle", weightTier: 4, researchValue: 50, suspicionValue: 22, spawnWeight: 4, speedMin: 0.55, speedMax: 0.85, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0xd4a017, size: [0.95, 0.5, 0.5], onRoad: true }),
    farm({ id: "van", label: "VAN", category: "vehicle", weightTier: 4, researchValue: 55, suspicionValue: 24, spawnWeight: 4, speedMin: 0.9, speedMax: 1.4, movable: true, spawnBand: 4, rarity: "uncommon", colour: 0xc8c2b4, size: [1.05, 0.48, 0.48], onRoad: true }),
    farm({ id: "house", label: "HOUSE", category: "structure", weightTier: 5, researchValue: 80, suspicionValue: 32, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "rare", colour: 0xc47a5a, size: [1.15, 0.85, 1.05], slotted: true }),
    farm({ id: "barn", label: "BARN", category: "structure", weightTier: 5, researchValue: 90, suspicionValue: 34, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 4, rarity: "rare", colour: 0xa33a32, size: [1.4, 0.95, 1.15], slotted: true }),
    farm({ id: "theatre", label: "THEATRE", category: "structure", weightTier: 5, researchValue: 120, suspicionValue: 38, spawnWeight: 2, speedMin: 0, speedMax: 0, movable: false, spawnBand: 4, rarity: "rare", colour: 0x6a4a8a, size: [1.55, 1.0, 1.2], slotted: true }),
    farm({ id: "mall", label: "MALL", category: "structure", weightTier: 5, researchValue: 160, suspicionValue: 45, spawnWeight: 2, speedMin: 0, speedMax: 0, movable: false, spawnBand: 5, rarity: "rare", colour: 0x4a6a88, size: [1.85, 1.05, 1.35], slotted: true }),
    farm({ id: "bigfoot", label: "BIGFOOT", category: "living", weightTier: BALANCE.bigfootWeightTier, researchValue: BALANCE.bigfootResearchValue, suspicionValue: BALANCE.bigfootSuspicionValue, spawnWeight: 0, speedMin: 1.5, speedMax: 2.1, movable: true, spawnBand: 2, rarity: "rare", colour: 0x4a3428, size: [0.34, 0.85, 0.3], rareEvent: true }),

    { maps: ["town"], id: "hydrant", label: "HYDRANT", category: "junk", weightTier: 5, researchValue: 2, suspicionValue: 0.5, spawnWeight: 8, speedMin: 0, speedMax: 0, movable: false, spawnBand: 1, rarity: "common", colour: 0xc03030, size: [0.16, 0.28, 0.16] },
    { maps: ["town"], id: "bench", label: "BENCH", category: "junk", weightTier: 5, researchValue: 6, suspicionValue: 2, spawnWeight: 7, speedMin: 0, speedMax: 0, movable: false, spawnBand: 1, rarity: "common", colour: 0x6a5030, size: [0.62, 0.22, 0.22] },
    { maps: ["town"], id: "pedestrian", label: "PEDESTRIAN", category: "living", weightTier: 5, researchValue: 22, suspicionValue: 12, spawnWeight: 8, speedMin: 0.45, speedMax: 0.85, movable: true, spawnBand: 1, rarity: "common", colour: 0x3a5a88, size: [0.22, 0.62, 0.2] },
    { maps: ["town"], id: "taxi", label: "TAXI", category: "vehicle", weightTier: 6, researchValue: 38, suspicionValue: 16, spawnWeight: 6, speedMin: 1.3, speedMax: 1.9, movable: true, spawnBand: 2, rarity: "uncommon", colour: 0xe0c040, size: [0.88, 0.32, 0.4], onRoad: true },
    { maps: ["town"], id: "sedan", label: "SEDAN", category: "vehicle", weightTier: 6, researchValue: 36, suspicionValue: 15, spawnWeight: 6, speedMin: 1.15, speedMax: 1.7, movable: true, spawnBand: 2, rarity: "uncommon", colour: 0x3a3a48, size: [0.86, 0.3, 0.4], onRoad: true },
    { maps: ["town"], id: "bus", label: "BUS", category: "vehicle", weightTier: 9, researchValue: 70, suspicionValue: 26, spawnWeight: 4, speedMin: 0.85, speedMax: 1.2, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0xd6a017, size: [1.45, 0.55, 0.5], onRoad: true },
    { maps: ["town"], id: "firetruck", label: "FIRE TRUCK", category: "vehicle", weightTier: 10, researchValue: 95, suspicionValue: 30, spawnWeight: 3, speedMin: 1.0, speedMax: 1.45, movable: true, spawnBand: 4, rarity: "rare", colour: 0xc02020, size: [1.5, 0.52, 0.48], onRoad: true },
    { maps: ["town"], id: "bungalow", label: "BUNGALOW", category: "structure", weightTier: 7, researchValue: 70, suspicionValue: 28, spawnWeight: 4, speedMin: 0, speedMax: 0, movable: false, spawnBand: 2, rarity: "uncommon", colour: 0xc8a070, size: [1.1, 0.7, 1.0], slotted: true },
    { maps: ["town"], id: "shop", label: "SHOP", category: "structure", weightTier: 8, researchValue: 85, suspicionValue: 30, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "uncommon", colour: 0x4a7a9a, size: [1.2, 0.8, 1.05], slotted: true },
    { maps: ["town"], id: "bakery", label: "BAKERY", category: "structure", weightTier: 8, researchValue: 80, suspicionValue: 28, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "uncommon", colour: 0xe8c878, size: [1.15, 0.78, 1.0], slotted: true },
    { maps: ["town"], id: "butcher", label: "BUTCHER", category: "structure", weightTier: 8, researchValue: 84, suspicionValue: 29, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "uncommon", colour: 0xe8d4cc, size: [1.12, 0.76, 0.98], slotted: true },
    { maps: ["town"], id: "cafe", label: "CAFÉ", category: "structure", weightTier: 6, researchValue: 72, suspicionValue: 26, spawnWeight: 4, speedMin: 0, speedMax: 0, movable: false, spawnBand: 2, rarity: "uncommon", colour: 0xc47858, size: [1.05, 0.72, 0.95], slotted: true },
    { maps: ["town"], id: "supermarket", label: "SUPERMARKET", category: "structure", weightTier: 11, researchValue: 145, suspicionValue: 40, spawnWeight: 2, speedMin: 0, speedMax: 0, movable: false, spawnBand: 4, rarity: "rare", colour: 0x4a6a78, size: [1.65, 0.92, 1.28], slotted: true },
    { maps: ["town"], id: "townhouse", label: "TOWNHOUSE", category: "structure", weightTier: 8, researchValue: 90, suspicionValue: 31, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "uncommon", colour: 0xa45a48, size: [0.95, 1.05, 0.85], slotted: true },
    { maps: ["town"], id: "apartment", label: "APARTMENT", category: "structure", weightTier: 11, researchValue: 130, suspicionValue: 38, spawnWeight: 2, speedMin: 0, speedMax: 0, movable: false, spawnBand: 4, rarity: "rare", colour: 0x6a7080, size: [1.35, 1.25, 1.1], slotted: true },
    { maps: ["town"], id: "office", label: "OFFICE", category: "structure", weightTier: 12, researchValue: 160, suspicionValue: 42, spawnWeight: 2, speedMin: 0, speedMax: 0, movable: false, spawnBand: 5, rarity: "rare", colour: 0x3a5268, size: [1.45, 1.35, 1.15], slotted: true },

    { maps: ["zoo"], id: "penguin", label: "PENGUIN", category: "living", weightTier: 12, researchValue: 42, suspicionValue: 12, spawnWeight: 9, speedMin: 0.7, speedMax: 1.15, movable: true, spawnBand: 1, rarity: "common", colour: 0x1a1a22, size: [0.2, 0.32, 0.18], enclosure: "ice" },
    { maps: ["zoo"], id: "seal", label: "SEAL", category: "living", weightTier: 15, researchValue: 70, suspicionValue: 22, spawnWeight: 7, speedMin: 0.35, speedMax: 0.6, movable: true, spawnBand: 2, rarity: "common", colour: 0x8a8a96, size: [0.55, 0.22, 0.28], enclosure: "ice" },
    { maps: ["zoo"], id: "polarbear", label: "POLAR BEAR", category: "living", weightTier: 19, researchValue: 165, suspicionValue: 50, spawnWeight: 4, speedMin: 0.4, speedMax: 0.7, movable: true, spawnBand: 4, rarity: "uncommon", colour: 0xf2f0ea, size: [0.85, 0.52, 0.4], enclosure: "ice" },
    { maps: ["zoo"], id: "meerkat", label: "MEERKAT", category: "living", weightTier: 12, researchValue: 40, suspicionValue: 11, spawnWeight: 8, speedMin: 0.95, speedMax: 1.45, movable: true, spawnBand: 1, rarity: "common", colour: 0xc4a06a, size: [0.16, 0.28, 0.14], enclosure: "savanna" },
    { maps: ["zoo"], id: "flamingo", label: "FLAMINGO", category: "living", weightTier: 13, researchValue: 50, suspicionValue: 15, spawnWeight: 7, speedMin: 0.5, speedMax: 0.8, movable: true, spawnBand: 1, rarity: "common", colour: 0xf48aa8, size: [0.18, 0.48, 0.16], enclosure: "savanna" },
    { maps: ["zoo"], id: "zebra", label: "ZEBRA", category: "living", weightTier: 16, researchValue: 88, suspicionValue: 30, spawnWeight: 6, speedMin: 0.85, speedMax: 1.3, movable: true, spawnBand: 2, rarity: "uncommon", colour: 0xf0ece6, size: [0.7, 0.5, 0.32], enclosure: "savanna" },
    { maps: ["zoo"], id: "lion", label: "LION", category: "living", weightTier: 17, researchValue: 118, suspicionValue: 38, spawnWeight: 5, speedMin: 0.9, speedMax: 1.4, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0xd4a03a, size: [0.72, 0.4, 0.36], enclosure: "savanna" },
    { maps: ["zoo"], id: "giraffe", label: "GIRAFFE", category: "living", weightTier: 19, researchValue: 190, suspicionValue: 54, spawnWeight: 3, speedMin: 0.45, speedMax: 0.75, movable: true, spawnBand: 4, rarity: "rare", colour: 0xd8a04a, size: [0.55, 1.15, 0.4], enclosure: "savanna" },
    { maps: ["zoo"], id: "elephant", label: "ELEPHANT", category: "living", weightTier: 20, researchValue: 260, suspicionValue: 66, spawnWeight: 2, speedMin: 0.28, speedMax: 0.48, movable: true, spawnBand: 5, rarity: "rare", colour: 0x8a8680, size: [1.15, 0.85, 0.55], enclosure: "savanna" },
    { maps: ["zoo"], id: "monkey", label: "MONKEY", category: "living", weightTier: 13, researchValue: 52, suspicionValue: 16, spawnWeight: 8, speedMin: 1.0, speedMax: 1.55, movable: true, spawnBand: 1, rarity: "common", colour: 0x8a5a32, size: [0.24, 0.3, 0.2], enclosure: "forest" },
    { maps: ["zoo"], id: "panda", label: "PANDA", category: "living", weightTier: 16, researchValue: 100, suspicionValue: 32, spawnWeight: 5, speedMin: 0.3, speedMax: 0.55, movable: true, spawnBand: 2, rarity: "uncommon", colour: 0xf4f4f4, size: [0.5, 0.42, 0.36], enclosure: "forest" },
    { maps: ["zoo"], id: "gorilla", label: "GORILLA", category: "living", weightTier: 18, researchValue: 140, suspicionValue: 42, spawnWeight: 4, speedMin: 0.4, speedMax: 0.7, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0x2a2a30, size: [0.55, 0.58, 0.38], enclosure: "forest" },
    { maps: ["zoo"], id: "hippo", label: "HIPPO", category: "living", weightTier: 20, researchValue: 220, suspicionValue: 58, spawnWeight: 3, speedMin: 0.22, speedMax: 0.4, movable: true, spawnBand: 5, rarity: "rare", colour: 0x8a6a72, size: [0.95, 0.48, 0.5], enclosure: "forest" },
    { maps: ["zoo"], id: "visitor", label: "VISITOR", category: "living", weightTier: 14, researchValue: 20, suspicionValue: 12, spawnWeight: 6, speedMin: 0.4, speedMax: 0.75, movable: true, spawnBand: 1, rarity: "common", colour: 0x4a88c0, size: [0.22, 0.6, 0.2] },
    { maps: ["zoo"], id: "tram", label: "TRAM", category: "vehicle", weightTier: 16, researchValue: 65, suspicionValue: 20, spawnWeight: 4, speedMin: 0.7, speedMax: 1.05, movable: true, spawnBand: 3, rarity: "uncommon", colour: 0x3a8a6a, size: [1.2, 0.42, 0.42], onRoad: true },
    { maps: ["zoo"], id: "giftshop", label: "GIFT SHOP", category: "structure", weightTier: 18, researchValue: 88, suspicionValue: 24, spawnWeight: 3, speedMin: 0, speedMax: 0, movable: false, spawnBand: 3, rarity: "uncommon", colour: 0xc45a3a, size: [1.15, 0.75, 0.95], slotted: true },
    { maps: ["zoo"], id: "gate", label: "ENCLOSURE GATE", category: "structure", weightTier: 14, researchValue: 40, suspicionValue: 10, spawnWeight: 4, speedMin: 0, speedMax: 0, movable: false, spawnBand: 2, rarity: "common", colour: 0x6a6a58, size: [0.85, 0.55, 0.2], slotted: true },
];

export const TARGET_BY_ID = Object.fromEntries(TARGETS.map((t) => [t.id, t]));

export function targetsForMap(mapId) {
    return TARGETS.filter((d) => (d.maps || ["farm"]).includes(mapId));
}

export function spawnWeightFor(def, band, coreLevel = 1) {
    if (def.rareEvent) return 0;
    let w = def.spawnWeight;
    if (def.spawnBand > band) w *= 0.16;
    else if (def.spawnBand === band) w *= 1.2;
    else w *= Math.max(0.45, 1 - (band - def.spawnBand) * 0.08);

    if (def.weightTier <= coreLevel) {
        w *= BALANCE.liftableSpawnBoost;
        if (def.weightTier === 1) w *= 1.2;
    } else {
        const over = def.weightTier - coreLevel;
        w *= over <= 1 ? BALANCE.heavyPreviewNear : BALANCE.heavyPreviewFar;
    }
    if (!def.movable && (def.maps || ["farm"]).includes("town")) {
        w *= BALANCE.townStillSpawnBoost;
    }
    if (def.enclosure && (def.maps || ["farm"]).includes("zoo")) {
        w *= BALANCE.zooAnimalSpawnBoost;
    }
    return w;
}
