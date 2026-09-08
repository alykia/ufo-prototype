import * as THREE from "three";
import { BALANCE } from "./balance.js";
import { MAPS } from "./maps.js";
import { EW_Z, NS_X, ROAD_HALF } from "./roads.js";

const geos = new Map();
const mats = new Map();

function geo(key, make) {
    if (!geos.has(key)) geos.set(key, make());
    return geos.get(key);
}

function mat(key, color, extra = {}) {
    const id = `${key}:${color}:${JSON.stringify(extra)}`;
    if (!mats.has(id)) {
        mats.set(id, new THREE.MeshLambertMaterial({ color, ...extra }));
    }
    return mats.get(id);
}

function basic(key, color, extra = {}) {
    const id = `b:${key}:${color}:${JSON.stringify(extra)}`;
    if (!mats.has(id)) {
        mats.set(id, new THREE.MeshBasicMaterial({ color, ...extra }));
    }
    return mats.get(id);
}

function box(sx, sy, sz, color, y, extras = {}) {
    const mesh = new THREE.Mesh(
        geo(`box:${sx}:${sy}:${sz}`, () => new THREE.BoxGeometry(sx, sy, sz)),
        mat(`m`, color),
    );
    mesh.position.y = y;
    Object.assign(mesh.rotation, extras);
    return mesh;
}

function cyl(rt, rb, h, color, y, segs = 8) {
    const mesh = new THREE.Mesh(
        geo(`cyl:${rt}:${rb}:${h}:${segs}`, () => new THREE.CylinderGeometry(rt, rb, h, segs)),
        mat(`m`, color),
    );
    mesh.position.y = y;
    return mesh;
}

function sphere(r, color, y, wSeg = 8, hSeg = 6) {
    const mesh = new THREE.Mesh(
        geo(`sph:${r}:${wSeg}:${hSeg}`, () => new THREE.SphereGeometry(r, wSeg, hSeg)),
        mat(`m`, color),
    );
    mesh.position.y = y;
    return mesh;
}

function addBlob(group, radius) {
    const blob = new THREE.Mesh(
        geo("blob", () => new THREE.CircleGeometry(1, 16)),
        basic("blob", 0x000000, { transparent: true, opacity: 0.28, depthWrite: false }),
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.02;
    blob.scale.setScalar(radius);
    blob.userData.blob = true;
    blob.userData.baseRadius = radius;
    group.add(blob);
    return blob;
}

function animal(def, extras) {
    const g = new THREE.Group();
    const [sx, sy, sz] = def.size;
    const c = def.colour;
    g.add(box(sx, sy * 0.62, sz, c, sy * 0.46));
    extras(g, sx, sy, sz, c);
    addBlob(g, Math.max(sx, sz) * 0.55);
    return g;
}

export function createSpecimenMesh(def) {
    const builders = {
        trash: () => {
            const g = new THREE.Group();
            g.add(cyl(0.13, 0.15, 0.28, def.colour, 0.16, 8));
            g.add(cyl(0.16, 0.16, 0.04, 0x4a5058, 0.32, 8));
            addBlob(g, 0.18);
            return g;
        },
        gnome: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.09, 0.16, 0xe0b090, 0.1, 6));
            g.add(box(0.14, 0.12, 0.12, def.colour, 0.22));
            g.add(cyl(0.01, 0.1, 0.16, 0xc03030, 0.36, 6));
            addBlob(g, 0.12);
            return g;
        },
        mailbox: () => {
            const g = new THREE.Group();
            g.add(cyl(0.03, 0.03, 0.22, 0x888888, 0.11, 6));
            g.add(box(0.16, 0.12, 0.1, def.colour, 0.3));
            addBlob(g, 0.12);
            return g;
        },
        frog: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(sphere(0.07, c, sy * 0.55, 6, 5));
            g.add(box(0.05, 0.05, 0.08, c, 0.04));
        }),
        chicken: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(sphere(0.07, c, sy * 0.78, 6, 5));
            g.add(box(0.04, 0.03, 0.06, 0xe07a3a, sy * 0.78));
            g.add(box(0.03, 0.06, 0.03, 0xc03030, sy * 0.92));
        }),
        cat: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.1, 0.1, 0.12, c, sy * 0.7));
            g.add(box(0.04, 0.06, 0.03, c, sy * 0.86));
        }),
        dog: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.14, 0.12, 0.12, c, sy * 0.72));
            g.add(cyl(0.02, 0.02, 0.16, c, sy * 0.4, 5));
        }),
        sheep: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(sx * 0.9, sy * 0.7, sz * 0.9, c, sy * 0.5));
            g.add(box(0.12, 0.12, 0.12, 0x3a3028, sy * 0.62));
            g.add(cyl(0.035, 0.035, 0.14, 0x3a3028, 0.08, 5));
        }),
        wheelbarrow: () => {
            const g = new THREE.Group();
            g.add(box(0.42, 0.12, 0.26, def.colour, 0.2));
            g.add(cyl(0.08, 0.08, 0.05, 0x333333, 0.1, 8));
            addBlob(g, 0.24);
            return g;
        },
        cow: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(sx * 0.95, sy * 0.55, sz * 0.85, c, sy * 0.5));
            g.add(box(0.18, 0.16, 0.16, c, sy * 0.62));
            g.add(box(0.06, 0.08, 0.04, 0x222222, sy * 0.72));
            g.add(cyl(0.05, 0.05, 0.22, 0x4a4038, 0.11, 5));
        }),
        deer: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.14, 0.16, 0.12, c, sy * 0.78));
            g.add(box(0.02, 0.16, 0.08, c, sy * 1.02));
            g.add(cyl(0.03, 0.03, 0.28, c, 0.14, 5));
        }),
        human: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.08, 0.34, def.colour, 0.28, 6));
            g.add(sphere(0.08, 0xe0b090, 0.54, 6, 5));
            addBlob(g, 0.12);
            return g;
        },
        motorcycle: () => {
            const g = new THREE.Group();
            g.add(box(0.42, 0.1, 0.16, def.colour, 0.2));
            const w1 = cyl(0.09, 0.09, 0.06, 0x222222, 0.1, 8);
            w1.position.x = -0.14;
            const w2 = cyl(0.09, 0.09, 0.06, 0x222222, 0.1, 8);
            w2.position.x = 0.16;
            g.add(w1, w2);
            addBlob(g, 0.26);
            return g;
        },
        horse: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.2, 0.18, 0.14, c, sy * 0.72));
            g.add(cyl(0.04, 0.04, 0.32, c, 0.16, 5));
        }),
        car: () => {
            const g = new THREE.Group();
            g.add(box(0.86, 0.18, 0.4, def.colour, 0.2));
            g.add(box(0.42, 0.14, 0.36, 0x88b4d0, 0.34));
            for (const [x, z] of [[-0.28, 0.18], [0.28, 0.18], [-0.28, -0.18], [0.28, -0.18]]) {
                const w = cyl(0.08, 0.08, 0.08, 0x222222, 0.08, 8);
                w.position.set(x, 0.08, z);
                g.add(w);
            }
            addBlob(g, 0.42);
            return g;
        },
        tractor: () => {
            const g = new THREE.Group();
            g.add(box(0.7, 0.28, 0.38, def.colour, 0.32));
            g.add(box(0.28, 0.22, 0.32, 0x3a6ea8, 0.54));
            const tw = cyl(0.18, 0.18, 0.12, 0x333333, 0.18, 8);
            tw.position.set(-0.22, 0.18, 0.22);
            const fw = cyl(0.12, 0.12, 0.1, 0x333333, 0.12, 8);
            fw.position.set(0.24, 0.12, 0.2);
            g.add(tw, fw);
            addBlob(g, 0.46);
            return g;
        },
        van: () => {
            const g = new THREE.Group();
            g.add(box(1.0, 0.42, 0.44, def.colour, 0.32));
            g.add(box(0.22, 0.16, 0.4, 0x88b4d0, 0.48));
            for (const x of [-0.32, 0.32]) {
                const w = cyl(0.09, 0.09, 0.08, 0x222222, 0.09, 8);
                w.position.set(x, 0.09, 0.2);
                g.add(w);
            }
            addBlob(g, 0.5);
            return g;
        },
        house: () => building(def, 0x6a4030),
        barn: () => building(def, 0x5a2a22, true),
        theatre: () => {
            const g = building(def, 0x3a2a4a);
            const [sx, sy] = def.size;
            g.add(box(sx * 0.35, sy * 0.35, 0.2, 0xd6c26a, sy * 0.85));
            return g;
        },
        mall: () => {
            const [sx, sy, sz] = def.size;
            const g = new THREE.Group();
            g.add(box(sx * 0.7, sy * 0.75, sz, def.colour, sy * 0.38));
            g.add(box(sx * 0.45, sy * 0.95, sz * 0.7, 0x3a5268, sy * 0.48));
            g.add(box(sx * 0.2, sy * 0.2, sz * 0.2, 0x88b4d0, sy * 1.02));
            addBlob(g, Math.max(sx, sz) * 0.48);
            return g;
        },
        bigfoot: () => {
            const g = new THREE.Group();
            g.add(cyl(0.1, 0.12, 0.42, def.colour, 0.32, 6));
            g.add(sphere(0.1, def.colour, 0.62, 6, 5));
            g.add(box(0.22, 0.08, 0.08, def.colour, 0.42));
            addBlob(g, 0.16);
            return g;
        },
        hydrant: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.08, 0.22, def.colour, 0.12, 6));
            g.add(box(0.16, 0.05, 0.05, def.colour, 0.2));
            addBlob(g, 0.1);
            return g;
        },
        bench: () => {
            const g = new THREE.Group();
            g.add(box(0.58, 0.06, 0.18, def.colour, 0.16));
            g.add(box(0.58, 0.16, 0.04, 0x4a3a28, 0.24));
            addBlob(g, 0.28);
            return g;
        },
        pedestrian: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.08, 0.34, def.colour, 0.28, 6));
            g.add(sphere(0.08, 0xe0b090, 0.54, 6, 5));
            addBlob(g, 0.12);
            return g;
        },
        taxi: () => {
            const g = new THREE.Group();
            g.add(box(0.82, 0.18, 0.38, def.colour, 0.2));
            g.add(box(0.4, 0.14, 0.34, 0x222222, 0.34));
            addBlob(g, 0.4);
            return g;
        },
        sedan: () => {
            const g = new THREE.Group();
            g.add(box(0.8, 0.16, 0.36, def.colour, 0.18));
            g.add(box(0.38, 0.12, 0.32, 0x88b4d0, 0.3));
            addBlob(g, 0.38);
            return g;
        },
        bus: () => {
            const g = new THREE.Group();
            g.add(box(1.4, 0.48, 0.46, def.colour, 0.36));
            g.add(box(0.3, 0.16, 0.4, 0x88b4d0, 0.52));
            addBlob(g, 0.62);
            return g;
        },
        firetruck: () => {
            const g = new THREE.Group();
            g.add(box(1.42, 0.42, 0.44, def.colour, 0.32));
            g.add(box(0.32, 0.2, 0.4, 0x222222, 0.52));
            addBlob(g, 0.64);
            return g;
        },
        bungalow: () => building(def, 0x6a4030),
        shop: () => building(def, 0x2a3a4a),
        bakery: () => {
            const g = storefront(def, 0x6a4030, 0xc45a3a);
            const [sx, sy] = def.size;
            const chim = box(0.12, 0.22, 0.12, 0x8a6a50, sy * 1.02);
            chim.position.x = sx * 0.28;
            g.add(chim);
            return g;
        },
        butcher: () => storefront(def, 0x6a2020, 0xc02020),
        cafe: () => {
            const g = storefront(def, 0x3a2a22, 0x6a4030);
            const [, , sz] = def.size;
            const table = cyl(0.08, 0.08, 0.05, 0x6a5030, 0.12, 8);
            table.position.z = sz * 0.62;
            g.add(table);
            return g;
        },
        supermarket: () => {
            const [sx, sy, sz] = def.size;
            const g = new THREE.Group();
            g.add(box(sx, sy * 0.82, sz, def.colour, sy * 0.41));
            g.add(box(sx * 0.98, 0.08, sz * 0.98, 0x3a4850, sy * 0.86));
            const glass = box(sx * 0.72, sy * 0.28, 0.06, 0x88b4d0, sy * 0.28);
            glass.position.z = sz * 0.5;
            g.add(glass);
            addBlob(g, Math.max(sx, sz) * 0.48);
            return g;
        },
        townhouse: () => building(def, 0x5a2a22, true),
        apartment: () => {
            const [sx, sy, sz] = def.size;
            const g = new THREE.Group();
            g.add(box(sx, sy, sz, def.colour, sy / 2));
            g.add(box(sx * 0.2, sy * 0.12, sz * 0.2, 0x88b4d0, sy + 0.06));
            addBlob(g, Math.max(sx, sz) * 0.48);
            return g;
        },
        office: () => {
            const [sx, sy, sz] = def.size;
            const g = new THREE.Group();
            g.add(box(sx, sy, sz, def.colour, sy / 2));
            g.add(box(sx * 0.7, sy * 0.08, sz * 0.7, 0x88b4d0, sy + 0.04));
            addBlob(g, Math.max(sx, sz) * 0.48);
            return g;
        },
        penguin: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.09, 0.22, def.colour, 0.14, 6));
            g.add(sphere(0.07, 0xf4f4f4, 0.18, 6, 5));
            addBlob(g, 0.1);
            return g;
        },
        seal: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(cyl(0.06, 0.08, 0.18, c, sy * 0.4, 6));
        }),
        polarbear: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.22, 0.18, 0.18, c, sy * 0.7));
        }),
        meerkat: () => {
            const g = new THREE.Group();
            g.add(cyl(0.04, 0.05, 0.2, def.colour, 0.16, 5));
            g.add(sphere(0.05, def.colour, 0.28, 5, 4));
            addBlob(g, 0.08);
            return g;
        },
        flamingo: () => {
            const g = new THREE.Group();
            g.add(cyl(0.02, 0.02, 0.28, def.colour, 0.16, 5));
            g.add(box(0.12, 0.08, 0.08, def.colour, 0.38));
            addBlob(g, 0.1);
            return g;
        },
        zebra: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.16, 0.16, 0.12, 0x222222, sy * 0.72));
        }),
        lion: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(sphere(0.12, 0xb8860b, sy * 0.72, 6, 5));
        }),
        giraffe: () => {
            const g = new THREE.Group();
            g.add(box(0.42, 0.32, 0.28, def.colour, 0.28));
            g.add(cyl(0.05, 0.06, 0.55, def.colour, 0.7, 5));
            g.add(box(0.16, 0.12, 0.14, def.colour, 1.02));
            addBlob(g, 0.28);
            return g;
        },
        elephant: () => {
            const g = new THREE.Group();
            g.add(box(1.0, 0.55, 0.5, def.colour, 0.4));
            g.add(box(0.28, 0.22, 0.22, def.colour, 0.58));
            g.add(cyl(0.04, 0.05, 0.28, def.colour, 0.28, 5));
            addBlob(g, 0.52);
            return g;
        },
        monkey: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(sphere(0.08, 0xe0b090, sy * 0.85, 5, 4));
        }),
        panda: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.16, 0.14, 0.14, 0x222222, sy * 0.7));
        }),
        gorilla: () => {
            const g = new THREE.Group();
            g.add(cyl(0.14, 0.16, 0.36, def.colour, 0.28, 6));
            g.add(sphere(0.12, def.colour, 0.52, 6, 5));
            addBlob(g, 0.2);
            return g;
        },
        hippo: () => animal(def, (g, sx, sy, sz, c) => {
            g.add(box(0.28, 0.16, 0.2, c, sy * 0.55));
        }),
        visitor: () => {
            const g = new THREE.Group();
            g.add(cyl(0.07, 0.08, 0.32, def.colour, 0.26, 6));
            g.add(sphere(0.08, 0xe0b090, 0.5, 6, 5));
            addBlob(g, 0.12);
            return g;
        },
        tram: () => {
            const g = new THREE.Group();
            g.add(box(1.15, 0.36, 0.4, def.colour, 0.28));
            g.add(box(0.9, 0.14, 0.36, 0x88b4d0, 0.48));
            addBlob(g, 0.52);
            return g;
        },
        giftshop: () => building(def, 0x8a2a22),
        gate: () => {
            const g = new THREE.Group();
            g.add(box(0.08, 0.5, 0.08, def.colour, 0.26));
            g.add(box(0.08, 0.5, 0.08, def.colour, 0.26));
            g.children[1].position.x = 0.36;
            g.add(box(0.44, 0.08, 0.06, 0x8a8a70, 0.42));
            addBlob(g, 0.28);
            return g;
        },
    };
    const make = builders[def.id];
    return make ? make() : fallbackBox(def);
}

function building(def, roofColor, tallRoof = false) {
    const [sx, sy, sz] = def.size;
    const g = new THREE.Group();
    g.add(box(sx, sy * 0.72, sz, def.colour, sy * 0.36));
    const roof = new THREE.Mesh(
        geo(`cone:${sx}:${sz}:${sy}`, () => new THREE.ConeGeometry(Math.max(sx, sz) * 0.58, sy * (tallRoof ? 0.42 : 0.28), 4)),
        mat("roof", roofColor),
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = sy * 0.86;
    g.add(roof);
    addBlob(g, Math.max(sx, sz) * 0.48);
    return g;
}

function storefront(def, roofColor, awningColor) {
    const g = building(def, roofColor);
    const [sx, sy, sz] = def.size;
    const door = box(sx * 0.22, sy * 0.28, 0.06, 0x88b4d0, sy * 0.22);
    door.position.z = sz * 0.5;
    g.add(door);
    const awning = box(sx * 0.92, 0.05, 0.22, awningColor, sy * 0.42);
    awning.position.z = sz * 0.52;
    g.add(awning);
    return g;
}

function fallbackBox(def) {
    const [sx, sy, sz] = def.size;
    const g = new THREE.Group();
    g.add(box(sx, sy, sz, def.colour, sy / 2));
    addBlob(g, Math.max(sx, sz) * 0.5);
    return g;
}

export function createPoliceCar() {
    const g = new THREE.Group();
    g.add(box(0.92, 0.2, 0.42, 0x1a2744, 0.2));
    g.add(box(0.4, 0.16, 0.38, 0xd8e4ee, 0.36));
    g.add(box(0.88, 0.05, 0.08, 0xf4f4f4, 0.24));
    const bar = box(0.28, 0.08, 0.22, 0x222222, 0.48);
    const lightR = new THREE.Mesh(geo("plight", () => new THREE.BoxGeometry(0.12, 0.07, 0.2)), basic("pred", 0xff2440));
    lightR.position.set(-0.08, 0.49, 0);
    const lightB = new THREE.Mesh(geo("plight", () => new THREE.BoxGeometry(0.12, 0.07, 0.2)), basic("pblue", 0x2a66ff));
    lightB.position.set(0.08, 0.49, 0);
    for (const [x, z] of [[-0.3, 0.18], [0.3, 0.18], [-0.3, -0.18], [0.3, -0.18]]) {
        const w = cyl(0.08, 0.08, 0.08, 0x111111, 0.08, 8);
        w.position.set(x, 0.08, z);
        g.add(w);
    }
    g.add(bar, lightR, lightB);
    addBlob(g, 0.44);
    g.userData.lightRed = lightR;
    g.userData.lightBlue = lightB;
    return g;
}

// ---- UFO --------------------------------------------------------------------
// The UFO owns its materials (not the shared cache) so Cosmetics can recolour
// it without touching any Specimen. Anchors are empty groups that Cosmetics
// and Refits attach to, so every hull keeps the same attachment points.
//   domeTop   : hats and other accessories on the canopy
//   underHull : things hanging below the saucer (Core refits, fuzzy dice)
//   rimEdge   : the hull edge (Cloak strips, sticker)
//   domeSide  : the canopy flank (Scanner dish)
//   engines   : the two stock engine blocks

const UFO_DIMS = {
    hullTop: 0.52,
    hullBottom: 0.74,
    hullH: 0.16,
    domeR: 0.28,
    domeY: 0.09,
    rimR: 0.58,
    engineX: 0.52,
    engineY: -0.02,
};

function ufoMat(color, extra = {}) {
    return new THREE.MeshLambertMaterial({ color, ...extra });
}

export function createUfo() {
    const g = new THREE.Group();
    const D = UFO_DIMS;
    const mats = {
        hull: ufoMat(0xc8d0d8),
        dome: ufoMat(0x7ad8ff, { transparent: true, opacity: 1 }),
        rim: ufoMat(0x8a94a0),
        engine: ufoMat(0xe07a3a),
        emitter: ufoMat(0x9dff6a, { emissive: 0x9dff6a, emissiveIntensity: 0.45 }),
        beam: new THREE.MeshBasicMaterial({ color: 0x9dff6a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
        ring: new THREE.MeshBasicMaterial({ color: 0x9dff6a, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
    };

    const hull = new THREE.Mesh(
        geo(`cyl:${D.hullTop}:${D.hullBottom}:${D.hullH}:20`, () => new THREE.CylinderGeometry(D.hullTop, D.hullBottom, D.hullH, 20)),
        mats.hull,
    );
    const dome = new THREE.Mesh(
        geo("dome", () => new THREE.SphereGeometry(D.domeR, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
        mats.dome,
    );
    dome.position.y = D.domeY;
    const rim = new THREE.Mesh(
        geo("rim", () => new THREE.TorusGeometry(D.rimR, 0.04, 8, 20)),
        mats.rim,
    );
    rim.rotation.x = Math.PI / 2;
    const emitter = new THREE.Mesh(
        geo("cyl:0.1:0.16:0.08:10", () => new THREE.CylinderGeometry(0.1, 0.16, 0.08, 10)),
        mats.emitter,
    );
    emitter.position.y = -0.1;
    const engineGeo = geo("box:0.12:0.08:0.1", () => new THREE.BoxGeometry(0.12, 0.08, 0.1));
    const engL = new THREE.Mesh(engineGeo, mats.engine);
    engL.position.set(-D.engineX, D.engineY, 0);
    const engR = new THREE.Mesh(engineGeo, mats.engine);
    engR.position.set(D.engineX, D.engineY, 0);

    const beamH = BALANCE.ufoHoverY;
    const beam = new THREE.Mesh(
        geo("beam", () => new THREE.CylinderGeometry(0.12, 1, 1, 20, 1, true)),
        mats.beam,
    );
    beam.position.y = -beamH / 2;
    beam.scale.set(1, beamH, 1);

    const ring = new THREE.Mesh(
        geo("ring", () => new THREE.RingGeometry(0.82, 1, 28)),
        mats.ring,
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -beamH + 0.03;

    const anchors = {
        domeTop: new THREE.Group(),
        underHull: new THREE.Group(),
        rimEdge: new THREE.Group(),
        domeSide: new THREE.Group(),
    };
    anchors.domeTop.position.y = D.domeY + D.domeR;
    anchors.underHull.position.y = -D.hullH / 2;
    anchors.domeSide.position.set(0.2, D.domeY + 0.12, 0.16);

    const cosmetics = new THREE.Group();
    const refits = new THREE.Group();

    g.add(hull, dome, rim, emitter, engL, engR, beam, ring, cosmetics, refits, ...Object.values(anchors));
    g.userData.beam = beam;
    g.userData.ring = ring;
    g.userData.parts = { hull, dome, rim, emitter, engines: [engL, engR] };
    g.userData.mats = mats;
    g.userData.anchors = anchors;
    g.userData.cosmetics = cosmetics;
    g.userData.refits = refits;
    g.userData.anim = emptyUfoAnim();
    g.userData.cloakBreath = false;
    g.userData.rainbow = false;
    g.userData.clock = 0;
    g.position.set(0, BALANCE.ufoHoverY, 0);
    return g;
}

function emptyUfoAnim() {
    return { spinners: [], blinkers: [], swingers: [], orbiters: [], pulsers: [], sweeps: [], thrusters: [], glide: [] };
}

function clearGroup(group) {
    while (group.children.length) group.remove(group.children[0]);
}

function glow(color, opacity = 1, extra = {}) {
    return new THREE.MeshLambertMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        transparent: opacity < 1,
        opacity,
        ...extra,
    });
}

// ---- Cosmetics ---------------------------------------------------------------

function applyHullLook(ufo, look) {
    const { mats, cosmetics } = ufo.userData;
    mats.hull.color.setHex(look.hull);
    mats.rim.color.setHex(look.rim);
    mats.dome.color.setHex(look.dome);
    mats.engine.color.setHex(look.engine);
    if (look.rivets) {
        const D = UFO_DIMS;
        const rivetGeo = geo("sph:0.025:6:4", () => new THREE.SphereGeometry(0.025, 6, 4));
        const rivetMat = mat("rivet", look.rim);
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const r = new THREE.Mesh(rivetGeo, rivetMat);
            r.position.set(Math.cos(a) * (D.hullTop + 0.04), D.hullH / 2 + 0.005, Math.sin(a) * (D.hullTop + 0.04));
            r.userData.cosmetic = "hull";
            cosmetics.add(r);
        }
    }
}

function applyBeamTint(ufo, look) {
    const { mats } = ufo.userData;
    mats.beam.color.setHex(look.color);
    mats.ring.color.setHex(look.color);
    mats.emitter.color.setHex(look.color);
    mats.emitter.emissive.setHex(look.color);
    ufo.userData.rainbow = Boolean(look.rainbow);
}

const ACCESSORY_BUILDERS = {
    none: () => null,
    partyHat: (anim) => {
        const g = new THREE.Group();
        const cone = new THREE.Mesh(geo("cone:0.12:0.26", () => new THREE.ConeGeometry(0.12, 0.26, 12)), mat("m", 0xff6a8a));
        cone.position.y = 0.11;
        const stripe = new THREE.Mesh(geo("torus:0.075:0.012", () => new THREE.TorusGeometry(0.075, 0.012, 6, 14)), mat("m", 0xfff0a0));
        stripe.rotation.x = Math.PI / 2;
        stripe.position.y = 0.09;
        const pom = new THREE.Mesh(geo("sph:0.04:8:6", () => new THREE.SphereGeometry(0.04, 8, 6)), mat("m", 0xffffff));
        pom.position.y = 0.25;
        g.add(cone, stripe, pom);
        return g;
    },
    propeller: (anim) => {
        const g = new THREE.Group();
        const cap = new THREE.Mesh(
            geo("halfsph:0.14", () => new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)),
            mat("m", 0x4aa0ff),
        );
        cap.position.y = -0.05;
        const stick = new THREE.Mesh(geo("cyl:0.012:0.012:0.1:6", () => new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6)), mat("m", 0xdde4ea));
        stick.position.y = 0.12;
        const blades = new THREE.Group();
        const bladeGeo = geo("box:0.3:0.01:0.04", () => new THREE.BoxGeometry(0.3, 0.01, 0.04));
        const b1 = new THREE.Mesh(bladeGeo, mat("m", 0xffd35a));
        const b2 = new THREE.Mesh(bladeGeo, mat("m", 0xff6a5a));
        b2.rotation.y = Math.PI / 2;
        blades.add(b1, b2);
        blades.position.y = 0.17;
        anim.spinners.push({ node: blades, speed: 9 });
        g.add(cap, stick, blades);
        return g;
    },
    cowboy: () => {
        const g = new THREE.Group();
        const brim = new THREE.Mesh(geo("cyl:0.34:0.34:0.02:18", () => new THREE.CylinderGeometry(0.34, 0.34, 0.02, 18)), mat("m", 0x8a5a2a));
        brim.position.y = -0.03;
        const crown = new THREE.Mesh(geo("cyl:0.15:0.17:0.16:14", () => new THREE.CylinderGeometry(0.15, 0.17, 0.16, 14)), mat("m", 0x9a6a34));
        crown.position.y = 0.06;
        const band = new THREE.Mesh(geo("torus:0.165:0.012", () => new THREE.TorusGeometry(0.165, 0.012, 6, 16)), mat("m", 0x3a2410));
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.0;
        g.add(brim, crown, band);
        return g;
    },
    antenna: (anim) => {
        const g = new THREE.Group();
        const rod = new THREE.Mesh(geo("cyl:0.012:0.016:0.3:6", () => new THREE.CylinderGeometry(0.012, 0.016, 0.3, 6)), mat("m", 0xdde4ea));
        rod.position.y = 0.15;
        const bulbMat = glow(0xff4a4a);
        const bulb = new THREE.Mesh(geo("sph:0.05:8:6", () => new THREE.SphereGeometry(0.05, 8, 6)), bulbMat);
        bulb.position.y = 0.32;
        anim.blinkers.push({ mat: bulbMat, period: 0.9, phase: 0 });
        g.add(rod, bulb);
        return g;
    },
    catEars: () => {
        const g = new THREE.Group();
        const earGeo = geo("cone:0.09:0.17", () => new THREE.ConeGeometry(0.09, 0.17, 8));
        const innerGeo = geo("cone:0.05:0.11", () => new THREE.ConeGeometry(0.05, 0.11, 8));
        for (const side of [-1, 1]) {
            const ear = new THREE.Mesh(earGeo, mat("m", 0xf0a0c0));
            ear.position.set(side * 0.17, -0.02, 0);
            ear.rotation.z = -side * 0.35;
            const inner = new THREE.Mesh(innerGeo, mat("m", 0xff6a9a));
            inner.position.set(side * 0.17, -0.02, 0.02);
            inner.rotation.z = -side * 0.35;
            g.add(ear, inner);
        }
        return g;
    },
    fuzzyDice: (anim) => {
        const g = new THREE.Group();
        const dieGeo = geo("box:0.1:0.1:0.1", () => new THREE.BoxGeometry(0.1, 0.1, 0.1));
        const stringGeo = geo("cyl:0.006:0.006:0.16:4", () => new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4));
        for (const side of [-1, 1]) {
            const pivot = new THREE.Group();
            pivot.position.set(side * 0.09, 0, 0.42);
            const str = new THREE.Mesh(stringGeo, mat("m", 0xffffff));
            str.position.y = -0.08;
            const die = new THREE.Mesh(dieGeo, mat("m", side < 0 ? 0xff5a5a : 0xffffff));
            die.position.y = -0.2;
            die.rotation.y = side * 0.4;
            pivot.add(str, die);
            anim.swingers.push({ node: pivot, amp: 0.35, speed: 2.2 + side * 0.3, axis: "x" });
            g.add(pivot);
        }
        return g;
    },
    sticker: () => {
        const D = UFO_DIMS;
        const g = new THREE.Group();
        const plate = new THREE.Mesh(geo("box:0.26:0.09:0.01", () => new THREE.BoxGeometry(0.26, 0.09, 0.01)), mat("m", 0xffe36a));
        const lineGeo = geo("box:0.2:0.014:0.012", () => new THREE.BoxGeometry(0.2, 0.014, 0.012));
        const l1 = new THREE.Mesh(lineGeo, mat("m", 0x2a2418));
        l1.position.y = 0.018;
        const l2 = new THREE.Mesh(lineGeo, mat("m", 0x2a2418));
        l2.position.y = -0.018;
        l2.scale.x = 0.7;
        g.add(plate, l1, l2);
        // Lie flat on the sloped hull side: tilt the plate's normal outward and up.
        const slope = Math.atan2(D.hullBottom - D.hullTop, D.hullH);
        g.position.set(0, 0.005, (D.hullTop + D.hullBottom) / 2 + 0.03);
        g.rotation.x = -slope * 0.9;
        return g;
    },
    crown: () => {
        const g = new THREE.Group();
        const band = new THREE.Mesh(geo("torus:0.12:0.025", () => new THREE.TorusGeometry(0.12, 0.025, 8, 16)), mat("m", 0xffd35a));
        band.rotation.x = Math.PI / 2;
        g.add(band);
        const spikeGeo = geo("cone:0.03:0.09", () => new THREE.ConeGeometry(0.03, 0.09, 6));
        const gemGeo = geo("sph:0.02:6:4", () => new THREE.SphereGeometry(0.02, 6, 4));
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2;
            const spike = new THREE.Mesh(spikeGeo, mat("m", 0xffd35a));
            spike.position.set(Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12);
            const gem = new THREE.Mesh(gemGeo, mat("m", [0xff5a5a, 0x5ad6ff, 0xa0ff6a, 0xff5ad6, 0xffffff][i]));
            gem.position.set(Math.cos(a) * 0.12, 0.1, Math.sin(a) * 0.12);
            g.add(spike, gem);
        }
        g.position.y = -0.01;
        return g;
    },
};

// Dress the UFO with the equipped Cosmetics. `looks` comes from
// shopCatalog.resolveLooks. Safe to call repeatedly; it rebuilds the
// cosmetics group and re-tags animations, then re-applies Refits so anything
// they registered in `anim` survives.
export function applyCosmetics(ufo, looks, upgrades = null) {
    const { cosmetics } = ufo.userData;
    clearGroup(cosmetics);
    ufo.userData.anim = emptyUfoAnim();
    applyHullLook(ufo, looks.hull);
    applyBeamTint(ufo, looks.beamTint);
    const build = ACCESSORY_BUILDERS[looks.accessory.kind] || ACCESSORY_BUILDERS.none;
    const node = build(ufo.userData.anim);
    if (node) {
        const anchorName = looks.accessory.kind === "fuzzyDice" ? "underHull" : looks.accessory.kind === "sticker" ? "rimEdge" : "domeTop";
        node.position.add(ufo.userData.anchors[anchorName].position);
        node.userData.cosmetic = "accessory";
        cosmetics.add(node);
    }
    if (upgrades) applyRefits(ufo, upgrades);
}

// ---- Refits ---------------------------------------------------------------
// Visible growth at the Site caps (5 / 12 / 20). Cumulative: level 12 shows
// the 5 and 12 details. The beam itself is left alone; it already widens.
//
// The Expedition camera looks down at the saucer from high up, and the whole
// saucer is only ~100 px wide, so every Refit sits on the hull TOP surface,
// the rim edge, or outside the hull silhouette, and nothing is thinner than
// ~0.02 world units. Hull top is y = hullH/2 (0.08); the accessory anchor on
// the dome top is left free so hats still fit.
//
// Layout zones seen from above (radius from centre):
//   0.30-0.47  Scanner radar sweep (hull top)
//   0.42       Core conduit ring + orbiting gems (hull top)
//   0.50       Scanner sensor lights (hull top edge)
//   0.60       Cloak rim strip (on the rim torus)
//   0.70-0.80  Propulsion pods and cones (poking out of the rim)
//   0.86       Cloak field plates (floating outside the hull)

const HULL_TOP_Y = UFO_DIMS.hullH / 2;

const REFIT_BUILDERS = {
    core: [
        // L5: a glowing purple conduit ring set into the hull top.
        (g) => {
            const ring = new THREE.Mesh(geo("torus:0.42:0.024", () => new THREE.TorusGeometry(0.42, 0.024, 6, 36)), glow(0xb040ff));
            ring.rotation.x = Math.PI / 2;
            ring.position.y = HULL_TOP_Y + 0.008;
            g.add(ring);
        },
        // L12: three purple power gems riding the conduit ring.
        (g, anim) => {
            const octGeo = geo("oct:0.07", () => new THREE.OctahedronGeometry(0.07));
            const m = glow(0xd769ff);
            const carrier = new THREE.Group();
            carrier.position.y = HULL_TOP_Y + 0.09;
            for (let i = 0; i < 3; i++) {
                const o = new THREE.Mesh(octGeo, m);
                const a = (i / 3) * Math.PI * 2;
                o.position.set(Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42);
                anim.spinners.push({ node: o, speed: 3 });
                carrier.add(o);
            }
            anim.orbiters.push({ node: carrier, speed: 1.2 });
            g.add(carrier);
        },
        // L20: a tilted reactor halo circling the dome, gently pulsing.
        (g, anim) => {
            const D = UFO_DIMS;
            const pivot = new THREE.Group();
            pivot.position.y = D.domeY + 0.17;
            const halo = new THREE.Mesh(geo("torus:0.37:0.02", () => new THREE.TorusGeometry(0.37, 0.02, 6, 40)), glow(0xd769ff, 0.85));
            halo.rotation.x = Math.PI / 2 + 0.42;
            pivot.add(halo);
            anim.orbiters.push({ node: pivot, speed: -0.9 });
            anim.pulsers.push({ node: halo, base: 1, amp: 0.05, speed: 2.4 });
            g.add(pivot);
        },
    ],
    cloak: [
        // L5: a thin blue light strip along the rim.
        (g) => {
            const strip = new THREE.Mesh(geo("torus:0.6:0.022", () => new THREE.TorusGeometry(0.6, 0.022, 6, 40)), glow(0x4ad0ff, 0.9));
            strip.rotation.x = Math.PI / 2;
            strip.position.y = 0.05;
            g.add(strip);
        },
        // L12: four translucent field plates slowly circling outside the hull.
        (g, anim) => {
            const carrier = new THREE.Group();
            carrier.position.y = -0.02;
            const plateGeo = geo("torusArc:0.86:0.03", () => new THREE.TorusGeometry(0.86, 0.03, 6, 12, Math.PI / 4));
            const m = new THREE.MeshLambertMaterial({
                color: 0x9ae8ff, emissive: 0x4ad0ff, emissiveIntensity: 0.7,
                transparent: true, opacity: 0.55, depthWrite: false,
            });
            for (let i = 0; i < 4; i++) {
                const plate = new THREE.Mesh(plateGeo, m);
                plate.rotation.x = Math.PI / 2;
                plate.rotation.z = (i / 4) * Math.PI * 2 + Math.PI / 8;
                carrier.add(plate);
            }
            anim.orbiters.push({ node: carrier, speed: 0.7 });
            g.add(carrier);
        },
        // L20: the hull phases in and out while idle (solid while vacuuming).
        (g, anim, ufo) => {
            ufo.userData.cloakBreath = true;
        },
    ],
    scanner: [
        // L5: a small dish beside the dome with a cyan tip light.
        (g, anim, ufo) => {
            const a = ufo.userData.anchors.domeSide.position;
            const dishG = new THREE.Group();
            const stem = new THREE.Mesh(geo("cyl:0.014:0.014:0.08:6", () => new THREE.CylinderGeometry(0.014, 0.014, 0.08, 6)), mat("m", 0xdde4ea));
            stem.position.y = 0.04;
            const dish = new THREE.Mesh(geo("cyl:0.1:0.035:0.035:12", () => new THREE.CylinderGeometry(0.1, 0.035, 0.035, 12)), mat("m", 0xeef3f6));
            dish.position.y = 0.09;
            dish.rotation.x = 0.7;
            const tip = new THREE.Mesh(geo("sph:0.024:6:4", () => new THREE.SphereGeometry(0.024, 6, 4)), glow(0x5ee6ff));
            tip.position.set(0, 0.125, 0.055);
            dishG.add(stem, dish, tip);
            dishG.position.copy(a);
            dishG.rotation.y = -0.6;
            g.add(dishG);
        },
        // L12: a radar sweep line with a fading wedge, turning on the hull top.
        (g, anim) => {
            const arm = new THREE.Group();
            arm.position.y = HULL_TOP_Y + 0.02;
            const bar = new THREE.Mesh(geo("box:0.17:0.012:0.03", () => new THREE.BoxGeometry(0.17, 0.012, 0.03)), glow(0x5ee6ff));
            bar.position.x = 0.385;
            const wedge = new THREE.Mesh(
                geo("ringSector:0.3:0.47", () => new THREE.RingGeometry(0.3, 0.47, 12, 1, -0.85, 0.85)),
                new THREE.MeshBasicMaterial({ color: 0x5ee6ff, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
            );
            // RingGeometry lies in XY; lay it flat so the wedge trails behind the
            // bar (arm turns +y, which carries +x toward -z).
            wedge.rotation.x = -Math.PI / 2;
            wedge.position.y = -0.008;
            arm.add(bar, wedge);
            anim.sweeps.push({ node: arm, speed: 2.4 });
            g.add(arm);
        },
        // L20: six blinking cyan sensor lights around the hull top edge.
        (g, anim) => {
            const lightGeo = geo("sph:0.04:6:4", () => new THREE.SphereGeometry(0.04, 6, 4));
            for (let i = 0; i < 6; i++) {
                const m = glow(0x5ee6ff);
                const l = new THREE.Mesh(lightGeo, m);
                const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
                l.position.set(Math.cos(a) * 0.5, HULL_TOP_Y + 0.02, Math.sin(a) * 0.5);
                anim.blinkers.push({ mat: m, period: 1.5, phase: i / 6 });
                g.add(l);
            }
        },
    ],
    propulsion: [
        // L5: engine pods on the left/right rim with orange exhaust cones.
        (g, anim, ufo) => {
            for (const side of [-1, 1]) {
                addEnginePod(g, anim, ufo, side * Math.PI / 2, 0xff8a30, 0.75);
            }
        },
        // L12: a second pair of pods fore/aft with slightly brighter cones.
        (g, anim, ufo) => {
            for (const side of [-1, 1]) {
                addEnginePod(g, anim, ufo, side > 0 ? 0 : Math.PI, 0xffb040, 0.85);
            }
        },
        // L20: cones stretch into flame trails while moving.
        (g, anim) => {
            for (const t of anim.thrusters) t.trail = true;
        },
    ],
};

// An engine pod sticking out of the rim, firing a flame cone outward. `yaw`
// is the direction it points in the XZ plane (0 = +z).
function addEnginePod(g, anim, ufo, yaw, color, scale) {
    const pivot = new THREE.Group();
    pivot.rotation.y = yaw;
    pivot.position.y = -0.03;
    const pod = new THREE.Mesh(geo("box:0.14:0.09:0.16", () => new THREE.BoxGeometry(0.14, 0.09, 0.16)), ufo.userData.mats.engine);
    pod.position.z = 0.7;
    const nozzle = new THREE.Mesh(geo("cyl:0.045:0.055:0.04:10", () => new THREE.CylinderGeometry(0.045, 0.055, 0.04, 10)), mat("m", 0x3a3438));
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.z = 0.79;
    pivot.add(pod, nozzle);
    addThruster(pivot, anim, 0, 0, 0.8, 0, color, scale);
    g.add(pivot);
}

// A small flame cone pointing outward from an engine. `yaw` is the direction
// it fires along in the XZ plane (0 = +z).
function addThruster(g, anim, x, y, z, yaw, color, scale) {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    pivot.rotation.y = yaw;
    const cone = new THREE.Mesh(geo("cone:0.055:0.18", () => new THREE.ConeGeometry(0.055, 0.18, 8, 1, true)), glow(color, 0.85));
    // Cone tip points +y; tilt so it fires along the pivot's +z (outward).
    cone.rotation.x = Math.PI / 2;
    cone.position.z = 0.09;
    cone.scale.setScalar(scale);
    pivot.add(cone);
    anim.thrusters.push({ node: cone, base: scale, trail: false });
    g.add(pivot);
}

export function applyRefits(ufo, upgrades) {
    const { refits, anim, mats } = ufo.userData;
    clearGroup(refits);
    // Drop refit-owned animations while keeping cosmetic ones.
    for (const key of Object.keys(anim)) {
        anim[key] = anim[key].filter((entry) => !entry.refit);
    }
    ufo.userData.cloakBreath = false;
    const scratch = emptyUfoAnim();
    const thresholds = BALANCE.refitLevels;
    for (const [system, builders] of Object.entries(REFIT_BUILDERS)) {
        const lv = upgrades[system] || 1;
        builders.forEach((build, i) => {
            if (lv >= thresholds[i]) build(refits, scratch, ufo);
        });
    }
    for (const key of Object.keys(scratch)) {
        for (const entry of scratch[key]) {
            entry.refit = true;
            anim[key].push(entry);
        }
    }
    const breath = ufo.userData.cloakBreath;
    for (const m of [mats.hull, mats.rim, mats.engine]) {
        m.transparent = breath;
        if (!breath) m.opacity = 1;
    }
    if (!breath) mats.dome.opacity = 1;
}

// Advance every UFO animation (Cosmetics and Refits). `speed` is the UFO's
// ground speed, `beamHeld` keeps a cloaked hull solid while vacuuming.
export function animateUfo(ufo, dt, { speed = 0, beamHeld = false } = {}) {
    const ud = ufo.userData;
    ud.clock += dt;
    const t = ud.clock;
    const { anim, mats } = ud;
    if (ud.rainbow) {
        const hue = (t * 0.25) % 1;
        mats.beam.color.setHSL(hue, 1, 0.65);
        mats.ring.color.copy(mats.beam.color);
        mats.emitter.color.copy(mats.beam.color);
        mats.emitter.emissive.copy(mats.beam.color);
    }
    for (const s of anim.spinners) s.node.rotation.y += dt * s.speed;
    for (const o of anim.orbiters) o.node.rotation[o.axis || "y"] += dt * o.speed;
    for (const s of anim.sweeps) s.node.rotation.y += dt * s.speed;
    for (const b of anim.blinkers) {
        const on = ((t / b.period + b.phase) % 1) < 0.5;
        b.mat.emissiveIntensity = on ? 1.1 : 0.12;
    }
    for (const s of anim.swingers) {
        s.node.rotation[s.axis || "x"] = Math.sin(t * s.speed) * s.amp;
    }
    for (const p of anim.pulsers) {
        p.node.scale.setScalar(p.base + Math.sin(t * p.speed) * p.amp);
    }
    for (const g of anim.glide) {
        g.node.rotation.z += dt * g.speed;
        g.node.position.y = Math.sin(t * 1.7) * g.wobble;
    }
    for (const th of anim.thrusters) {
        const flick = 1 + Math.sin(t * 17 + th.node.position.z * 10) * 0.12;
        const trail = th.trail ? 1 + Math.min(1.2, speed * 0.28) : 1;
        th.node.scale.set(th.base * flick, th.base * flick * trail, th.base * flick);
        th.node.position.z = 0.09 * th.base * flick * trail;
    }
    if (ud.cloakBreath) {
        // Light phase shimmer: never drops far enough to lose the silhouette.
        const target = beamHeld ? 1 : 0.76 + Math.sin(t * 1.3) * 0.12;
        for (const m of [mats.hull, mats.rim, mats.engine, mats.dome]) {
            m.opacity += (target - m.opacity) * Math.min(1, dt * 4);
        }
    }
}

function plane(w, d, color, x, y, z) {
    const m = new THREE.Mesh(
        geo(`pl:${w}:${d}`, () => new THREE.PlaneGeometry(w, d)),
        mat(`p:${color}`, color),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    return m;
}

function addDashes(group, vertical, along, skipAt, x0, z0) {
    const dashMat = mat("dash", 0xc8c4b0);
    if (vertical) {
        const dashNs = geo("dashNs", () => new THREE.PlaneGeometry(0.07, 0.38));
        for (let z = -16; z <= 7; z += 0.86) {
            if (Math.abs(z - skipAt) < 0.85) continue;
            const dash = new THREE.Mesh(dashNs, dashMat);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(along, 0.021, z);
            group.add(dash);
        }
    } else {
        const dashEw = geo("dashEw", () => new THREE.PlaneGeometry(0.38, 0.07));
        for (let x = -4.0; x <= 4.0; x += 0.86) {
            if (Math.abs(x - skipAt) < 0.85) continue;
            const dash = new THREE.Mesh(dashEw, dashMat);
            dash.rotation.x = -Math.PI / 2;
            dash.position.set(x, 0.022, z0);
            group.add(dash);
        }
    }
}

function addTrees(group, spots) {
    for (const [x, z] of spots) {
        const trunk = cyl(0.07, 0.09, 0.42, 0x5a3a22, 0.21, 6);
        trunk.position.set(x, 0.21, z);
        const canopy = box(0.48, 0.42, 0.48, 0x245a28, 0.56);
        canopy.position.set(x, 0.56, z);
        group.add(trunk, canopy);
    }
}

const FARM_PADS = [
    {
        color: 0x3d6230,
        points: [
            { x: -3.55, z: 4.35 },
            { x: -0.55, z: 4.15 },
            { x: -0.45, z: 1.55 },
            { x: -1.85, z: 1.05 },
            { x: -3.60, z: 1.35 },
        ],
        gapEdge: 1,
    },
    {
        color: 0x4a6a32,
        points: [
            { x: -3.50, z: -0.85 },
            { x: -0.50, z: -0.75 },
            { x: -0.65, z: -2.55 },
            { x: -2.20, z: -3.15 },
            { x: -3.55, z: -2.35 },
        ],
        gapEdge: 0,
    },
    {
        color: 0x355434,
        points: [
            { x: -3.45, z: -3.45 },
            { x: -0.85, z: -3.55 },
            { x: -0.55, z: -5.35 },
            { x: -3.50, z: -5.15 },
        ],
        gapEdge: 0,
    },
    {
        color: 0x3a552c,
        points: [
            { x: 2.45, z: 4.20 },
            { x: 3.65, z: 3.85 },
            { x: 3.55, z: 2.15 },
            { x: 2.55, z: 1.85 },
        ],
        gapEdge: 3,
    },
];

const ZOO_PAD_COLOR = {
    ice: 0xc8d8e0,
    savanna: 0xc4a86a,
    forest: 0x2a4a28,
};

function buildFarm(group) {
    group.add(plane(BALANCE.visualGroundWidth, BALANCE.visualGroundDepth, 0x1e3420, 0, -0.01, -6));
    group.add(plane(BALANCE.worldWidth + 2.4, BALANCE.worldDepth + 6, 0x2a4628, 0, 0, -1.8));
    for (const pad of FARM_PADS) enclosurePad(group, pad, pad.color);
    group.add(plane(ROAD_HALF * 2.05, BALANCE.visualGroundDepth * 0.7, 0x3a3a42, NS_X, 0.014, -4));
    group.add(plane(BALANCE.visualGroundWidth * 0.55, ROAD_HALF * 2.05, 0x3a3a42, 0, 0.015, EW_Z));
    addDashes(group, true, NS_X, EW_Z);
    addDashes(group, false, 0, NS_X, 0, EW_Z);
    addTrees(group, [
        [-3.7, -5.4], [3.7, -5.2], [-3.7, 5.2], [3.7, 5.1], [3.6, -2.4], [-3.6, -0.2], [3.85, 1.35],
        [-4.2, -8.2], [4.1, -8.6], [-2.4, -9.4], [2.8, -10.2], [-5.0, -7.1], [5.2, -7.4],
        [-3.2, -12.0], [3.4, -12.6], [0.6, -11.4], [-5.4, -10.8], [5.6, -11.2],
    ]);
}

function buildTown(group) {
    group.add(plane(BALANCE.visualGroundWidth, BALANCE.visualGroundDepth, 0x1a1e22, 0, -0.01, -6));
    group.add(plane(BALANCE.worldWidth + 2.4, BALANCE.worldDepth + 6, 0x2a3034, 0, 0, -1.8));
    group.add(plane(2.6, 2.4, 0x3a4044, -2.5, 0.01, -4.1));
    group.add(plane(2.6, 2.2, 0x384044, -2.5, 0.01, -1.0));
    group.add(plane(2.6, 2.4, 0x3a3e42, -2.45, 0.01, 1.7));
    group.add(plane(2.5, 2.4, 0x3a4248, 2.55, 0.01, -3.9));
    group.add(plane(2.5, 2.2, 0x404850, 2.6, 0.01, -0.7));
    group.add(plane(2.5, 2.6, 0x3a4048, 2.5, 0.01, 3.3));
    group.add(plane(ROAD_HALF * 2.05, BALANCE.visualGroundDepth * 0.7, 0x33333a, NS_X, 0.014, -4));
    group.add(plane(ROAD_HALF * 1.9, BALANCE.visualGroundDepth * 0.65, 0x33333a, -0.15, 0.014, -3));
    group.add(plane(BALANCE.visualGroundWidth * 0.55, ROAD_HALF * 1.9, 0x33333a, 0, 0.015, EW_Z));
    group.add(plane(BALANCE.visualGroundWidth * 0.5, ROAD_HALF * 1.8, 0x33333a, 0, 0.015, -2.4));
    group.add(plane(BALANCE.visualGroundWidth * 0.5, ROAD_HALF * 1.8, 0x33333a, 0, 0.015, 2.6));
    addDashes(group, true, NS_X, EW_Z);
    addDashes(group, false, 0, NS_X, 0, EW_Z);
    addTrees(group, [[-3.8, 5.0], [3.8, 5.1], [-3.9, -6.2], [3.9, -6.4]]);
}

function rail(group, x1, z1, x2, z2, color = 0x8a8a70) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.05) return;
    const m = box(len, 0.08, 0.06, color, 0.22);
    m.position.set((x1 + x2) / 2, 0.22, (z1 + z2) / 2);
    m.rotation.y = Math.atan2(dx, dz) - Math.PI / 2;
    group.add(m);
}

function polyPlane(points, color, y) {
    const shape = new THREE.Shape();
    shape.moveTo(points[0].x, -points[0].z);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, -points[i].z);
    shape.closePath();
    const mesh = new THREE.Mesh(
        new THREE.ShapeGeometry(shape),
        mat(`poly:${color}`, color, { side: THREE.DoubleSide }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    return mesh;
}

function enclosurePad(group, pad, color) {
    const pts = pad.points;
    if (!pts?.length) return;
    group.add(polyPlane(pts, color, 0.012));
    const gap = pad.gapEdge ?? -1;
    for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        if (i !== gap) rail(group, a.x, a.z, b.x, b.z);
        const post = cyl(0.035, 0.04, 0.3, 0x6a6a50, 0.16, 5);
        post.position.set(a.x, 0.16, a.z);
        group.add(post);
    }
}

function buildZoo(group) {
    group.add(plane(BALANCE.visualGroundWidth, BALANCE.visualGroundDepth, 0x1a2818, 0, -0.01, -6));
    group.add(plane(BALANCE.worldWidth + 2.4, BALANCE.worldDepth + 6, 0x2c3c24, 0, 0, -1.8));
    const zoo = MAPS.zoo.enclosures;
    for (const id of Object.keys(zoo)) {
        enclosurePad(group, zoo[id], ZOO_PAD_COLOR[id] || 0x4a6a38);
    }
    group.add(plane(0.55, 11.2, 0x5a5348, 0.15, 0.016, 0));
    group.add(plane(7.2, 0.5, 0x5a5348, 0, 0.016, 4.0));
    addTrees(group, [[-3.8, 5.2], [3.8, 5.1], [-3.9, -6.0], [3.8, -6.1], [0, -6.4]]);
}

let playfield = null;

export function setPlayfield(scene, mapId) {
    if (playfield) {
        scene.remove(playfield);
        playfield.traverse((obj) => {
            if (obj.geometry && !geos.has(obj.geometry.uuid)) {
                /* shared geos stay */
            }
        });
        playfield = null;
    }
    playfield = new THREE.Group();
    playfield.name = "playfield";
    if (mapId === "town") buildTown(playfield);
    else if (mapId === "zoo") buildZoo(playfield);
    else buildFarm(playfield);
    scene.add(playfield);
    return playfield;
}

export function populateWorld(scene) {
    setPlayfield(scene, "farm");
}
export function updateBlobShadow(group) {
    const blob = group.children.find((c) => c.userData.blob);
    if (!blob) return;
    const lift = group.position.y;
    const k = Math.max(0.18, 1 - lift * 0.38);
    blob.scale.setScalar(blob.userData.baseRadius * k);
    blob.position.y = 0.02 - lift;
}

export function createDebugHelpers(scene) {
    const group = new THREE.Group();
    group.name = "debugHelpers";
    const halfW = BALANCE.worldWidth / 2 - BALANCE.playInset;
    const zMin = -BALANCE.worldDepth / 2 + BALANCE.hudSafeZTop;
    const zMax = BALANCE.worldDepth / 2 - BALANCE.hudSafeZBottom;
    const pts = [
        new THREE.Vector3(-halfW, 0.05, zMin),
        new THREE.Vector3(halfW, 0.05, zMin),
        new THREE.Vector3(halfW, 0.05, zMax),
        new THREE.Vector3(-halfW, 0.05, zMax),
        new THREE.Vector3(-halfW, 0.05, zMin),
    ];
    const bound = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x66ffcc }),
    );
    const beamGuide = new THREE.Mesh(
        geo("dbgRing", () => new THREE.RingGeometry(0.95, 1.02, 28)),
        basic("dbgRing", 0xffff66, { transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false }),
    );
    beamGuide.rotation.x = -Math.PI / 2;
    beamGuide.position.y = 0.04;
    const axes = new THREE.AxesHelper(1.4);
    axes.position.y = 0.05;
    group.add(bound, beamGuide, axes);
    group.userData.beamGuide = beamGuide;
    group.visible = false;
    scene.add(group);
    return group;
}
