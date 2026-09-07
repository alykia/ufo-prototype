import { BALANCE } from "./balance.js";
import { headingY, pickRoute } from "./roads.js";

const EDGES = [
    { x: 0, z: 7.4 },
    { x: 5.4, z: 0.2 },
    { x: -5.4, z: 0.15 },
    { x: 0.4, z: -7.2 },
    { x: 4.6, z: 6.4 },
];

function wantedCount(suspicion, surrounding, held) {
    if (surrounding || suspicion >= 100) return BALANCE.policeCount100;
    if (suspicion >= BALANCE.policeAt90 || (held >= BALANCE.policeCount90 && suspicion >= 85)) {
        return BALANCE.policeCount90;
    }
    if (suspicion >= BALANCE.policeAt80 || (held >= BALANCE.policeCount80 && suspicion >= 74)) {
        return BALANCE.policeCount80;
    }
    return 0;
}

function surroundPoint(ufo, index, count) {
    const a = (index / count) * Math.PI * 2 - Math.PI / 2;
    return {
        x: ufo.position.x + Math.cos(a) * BALANCE.policeSurroundRadius,
        z: ufo.position.z + Math.sin(a) * BALANCE.policeSurroundRadius,
    };
}

export function bindPolice({ scene, labelsEl, createPoliceCar, project, toast, onCall }) {
    const cars = [];
    let surrounding = false;
    let surroundT = 0;
    let finished = false;
    let announced80 = false;
    let announced90 = false;
    let spawnCursor = 0;

    function makeLabel() {
        const el = document.createElement("div");
        el.className = "spec-label police";
        el.textContent = "POLICE";
        labelsEl.appendChild(el);
        return el;
    }

    function spawnCar(patrol) {
        const mesh = createPoliceCar();
        const route = pickRoute();
        const edge = EDGES[spawnCursor % EDGES.length];
        spawnCursor += 1;
        if (patrol) {
            mesh.position.set(route.points[0].x, 0, route.points[0].z);
        } else {
            mesh.position.set(edge.x, 0, edge.z);
        }
        scene.add(mesh);
        const car = {
            mesh,
            label: makeLabel(),
            catchReady: 0,
            leaving: false,
            route,
            routeI: 1,
        };
        cars.push(car);
        return car;
    }

    function disposeCar(car) {
        scene.remove(car.mesh);
        car.label.remove();
        const i = cars.indexOf(car);
        if (i >= 0) cars.splice(i, 1);
    }

    function flash(car, elapsed) {
        const on = Math.floor(elapsed * 8) % 2 === 0;
        if (car.mesh.userData.lightRed) car.mesh.userData.lightRed.visible = on;
        if (car.mesh.userData.lightBlue) car.mesh.userData.lightBlue.visible = !on;
    }

    function driveToward(car, tx, tz, dt, speed) {
        const dx = tx - car.mesh.position.x;
        const dz = tz - car.mesh.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.04) return 0;
        const step = speed * dt;
        if (dist <= step) {
            car.mesh.position.x = tx;
            car.mesh.position.z = tz;
        } else {
            car.mesh.position.x += (dx / dist) * step;
            car.mesh.position.z += (dz / dist) * step;
        }
        car.mesh.rotation.y = headingY(dx, dz);
        return dist;
    }

    function patrolToward(car, dt, speed) {
        if (!car.route) {
            car.route = pickRoute();
            car.routeI = 1;
        }
        const dest = car.route.points[car.routeI];
        if (!dest) {
            car.route = pickRoute();
            car.routeI = 1;
            return;
        }
        const dist = driveToward(car, dest.x, dest.z, dt, speed);
        if (dist < 0.1) {
            car.routeI += 1;
            if (car.routeI >= car.route.points.length) {
                car.route = pickRoute();
                car.routeI = 1;
            }
        }
    }

    function syncCount(want) {
        const patrol = want <= BALANCE.policeCount80;
        while (cars.length < want) spawnCar(patrol);
        if (surrounding) {
            for (const car of cars) car.leaving = false;
            return;
        }
        for (let i = 0; i < cars.length; i++) cars[i].leaving = i >= want;
    }

    function update(dt, ufo, suspicion, cloakMul, addSuspicion, elapsed = 0, detectable = true) {
        if (finished) return { surrounding: true };

        if (suspicion >= 100 && !surrounding) {
            surrounding = true;
            surroundT = 0;
            toast("UFO SPOTTED", "bad");
        }

        const held = cars.filter((c) => !c.leaving).length;
        const want = wantedCount(suspicion, surrounding, held);
        if (want >= BALANCE.policeCount80 && !announced80) {
            announced80 = true;
            toast("POLICE INBOUND", "warn");
            if (onCall) onCall();
        }
        if (want >= BALANCE.policeCount90 && !announced90) {
            announced90 = true;
            toast("POLICE REINFORCEMENTS", "bad");
            if (onCall) onCall();
        }
        if (want === 0) {
            announced80 = false;
            announced90 = false;
        }
        syncCount(want);

        const speed = surrounding
            ? 7.2
            : suspicion >= BALANCE.policeAt90
                ? BALANCE.policeSpeedHot
                : BALANCE.policeSpeed;

        let ringReady = cars.length >= BALANCE.policeCount100;
        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            flash(car, elapsed + i * 0.07);
            car.catchReady = Math.max(0, car.catchReady - dt);

            if (car.leaving) {
                const edge = EDGES[i % EDGES.length];
                const dist = driveToward(car, edge.x, edge.z, dt, speed + 0.6);
                if (dist < 0.2) {
                    disposeCar(car);
                    i -= 1;
                    continue;
                }
            } else if (surrounding) {
                const slot = surroundPoint(ufo, i, Math.max(cars.length, BALANCE.policeCount100));
                const dist = driveToward(car, slot.x, slot.z, dt, speed);
                if (dist > 0.28) ringReady = false;
            } else if (want <= BALANCE.policeCount80) {
                patrolToward(car, dt, speed);
                const d = Math.hypot(car.mesh.position.x - ufo.position.x, car.mesh.position.z - ufo.position.z);
                if (detectable && d < BALANCE.policeCatchRadius && car.catchReady <= 0) {
                    car.catchReady = BALANCE.policeCatchCooldown;
                    addSuspicion(BALANCE.policeCatchSuspicion * cloakMul);
                    toast("SPOTTED", "warn");
                }
            } else {
                driveToward(car, ufo.position.x, ufo.position.z, dt, speed);
                const d = Math.hypot(car.mesh.position.x - ufo.position.x, car.mesh.position.z - ufo.position.z);
                if (detectable && d < BALANCE.policeCatchRadius && car.catchReady <= 0) {
                    car.catchReady = BALANCE.policeCatchCooldown;
                    addSuspicion(BALANCE.policeCatchSuspicion * cloakMul);
                    toast("SPOTTED", "warn");
                }
            }
        }

        if (surrounding) {
            surroundT += dt;
            if (surroundT >= BALANCE.policeSurroundTime && (ringReady || surroundT >= BALANCE.policeSurroundTime + 0.55)) {
                finished = true;
                return { surrounding: true, complete: true };
            }
        }
        return { surrounding };
    }

    function projectLabels(projectFn) {
        for (const car of cars) projectFn(car.mesh, car.label, 0.42);
    }

    function clear() {
        while (cars.length) disposeCar(cars[cars.length - 1]);
        surrounding = false;
        surroundT = 0;
        finished = false;
        announced80 = false;
        announced90 = false;
        spawnCursor = 0;
    }

    function isSurrounding() {
        return surrounding;
    }

    function activeCount() {
        return cars.filter((c) => !c.leaving).length;
    }

    return { update, clear, projectLabels, isSurrounding, activeCount };
}
