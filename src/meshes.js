import * as THREE from "three";
import { BALANCE } from "./balance.js";
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

export function createUfo() {
    const g = new THREE.Group();
    const hull = cyl(0.52, 0.74, 0.16, 0xc8d0d8, 0, 20);
    const dome = new THREE.Mesh(
        geo("dome", () => new THREE.SphereGeometry(0.28, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
        mat("dome", 0x7ad8ff),
    );
    dome.position.y = 0.09;
    const rim = new THREE.Mesh(
        geo("rim", () => new THREE.TorusGeometry(0.58, 0.04, 8, 20)),
        mat("rim", 0x8a94a0),
    );
    rim.rotation.x = Math.PI / 2;
    const emitter = cyl(0.1, 0.16, 0.08, 0x9dff6a, -0.1, 10);
    const engL = box(0.12, 0.08, 0.1, 0xe07a3a, -0.02);
    engL.position.x = -0.52;
    const engR = box(0.12, 0.08, 0.1, 0xe07a3a, -0.02);
    engR.position.x = 0.52;

    const beamH = BALANCE.ufoHoverY;
    const beam = new THREE.Mesh(
        geo("beam", () => new THREE.CylinderGeometry(0.12, 1, 1, 20, 1, true)),
        basic("beam", 0x9dff6a, { transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }),
    );
    beam.position.y = -beamH / 2;
    beam.scale.set(1, beamH, 1);

    const ring = new THREE.Mesh(
        geo("ring", () => new THREE.RingGeometry(0.82, 1, 28)),
        basic("ring", 0x9dff6a, { transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -beamH + 0.03;

    g.add(hull, dome, rim, emitter, engL, engR, beam, ring);
    g.userData.beam = beam;
    g.userData.ring = ring;
    g.position.set(0, BALANCE.ufoHoverY, 0);
    return g;
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

function buildFarm(group) {
    group.add(plane(BALANCE.visualGroundWidth, BALANCE.visualGroundDepth, 0x1e3420, 0, -0.01, -6));
    group.add(plane(BALANCE.worldWidth + 2.4, BALANCE.worldDepth + 6, 0x2a4628, 0, 0, -1.8));
    group.add(plane(3.4, 4.6, 0x3a5a2c, -2.05, 0.01, -2.4));
    group.add(plane(3.2, 3.2, 0x355034, -2.0, 0.012, 3.15));
    group.add(plane(2.8, 2.8, 0x2e3a38, -1.9, 0.011, -4.6));
    group.add(plane(ROAD_HALF * 2.05, BALANCE.visualGroundDepth * 0.7, 0x3a3a42, NS_X, 0.014, -4));
    group.add(plane(BALANCE.visualGroundWidth * 0.55, ROAD_HALF * 2.05, 0x3a3a42, 0, 0.015, EW_Z));
    addDashes(group, true, NS_X, EW_Z);
    addDashes(group, false, 0, NS_X, 0, EW_Z);
    for (const z of [-3.4, -2.4, -1.4]) {
        const post = cyl(0.035, 0.04, 0.32, 0x6a5030, 0.16, 5);
        post.position.set(-0.35, 0.16, z);
        group.add(post);
    }
    addTrees(group, [
        [-3.7, -5.4], [3.7, -5.2], [-3.7, 5.2], [3.7, 5.1], [3.6, -2.4], [-3.6, -1.4], [3.55, 2.8],
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
    const m = box(len, 0.08, 0.06, color, 0.22);
    m.position.set((x1 + x2) / 2, 0.22, (z1 + z2) / 2);
    m.rotation.y = Math.atan2(dx, dz);
    group.add(m);
}

function enclosurePad(group, boxPad, color) {
    const w = boxPad.xMax - boxPad.xMin;
    const d = boxPad.zMax - boxPad.zMin;
    group.add(plane(w, d, color, (boxPad.xMin + boxPad.xMax) / 2, 0.012, (boxPad.zMin + boxPad.zMax) / 2));
    rail(group, boxPad.xMin, boxPad.zMin, boxPad.xMax, boxPad.zMin);
    rail(group, boxPad.xMin, boxPad.zMax, boxPad.xMax, boxPad.zMax);
    rail(group, boxPad.xMin, boxPad.zMin, boxPad.xMin, boxPad.zMax);
    rail(group, boxPad.xMax, boxPad.zMin, boxPad.xMax, boxPad.zMax);
}

function buildZoo(group) {
    group.add(plane(BALANCE.visualGroundWidth, BALANCE.visualGroundDepth, 0x1a2818, 0, -0.01, -6));
    group.add(plane(BALANCE.worldWidth + 2.4, BALANCE.worldDepth + 6, 0x2c3c24, 0, 0, -1.8));
    enclosurePad(group, { xMin: -3.6, xMax: -0.35, zMin: -1.1, zMax: 2.8 }, 0xc8d8e0);
    enclosurePad(group, { xMin: 0.45, xMax: 3.7, zMin: -1.3, zMax: 3.0 }, 0xc4a86a);
    enclosurePad(group, { xMin: -3.4, xMax: 3.4, zMin: -5.5, zMax: -2.0 }, 0x2a4a28);
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
