import * as THREE from "three";
import {
    BALANCE,
    DEBUG,
    beamRadiusFor,
    calculateExpeditionQuota,
    cloakSuspicionMultiplier,
    escalationBand,
    moveStats,
    pullDurationFor,
    scannerRareMultiplier,
    suspicionDecayRate,
    upgradeCost,
} from "./balance.js";
import { TARGET_BY_ID, spawnWeightFor, targetsForMap } from "./targets.js";
import { defaultPersistent, loadPersistent, savePersistent } from "./persist.js";
import { bindManagement } from "./management.js";
import { createDebugHelpers, createPoliceCar, createSpecimenMesh, createUfo, setPlayfield, updateBlobShadow } from "./meshes.js";
import { headingY, nearRoad, pickRoute, setActiveRoutes } from "./roads.js";
import { bindPickups, specimenIcon } from "./pickups.js";
import { bindPolice } from "./police.js";
import { bindIndexBook } from "./indexBook.js";
import {
    allSystemsAt,
    clampInEnclosure,
    enclosurePoint,
    mapDef,
    newestMap,
    sessionCaptureGoal,
    systemCap,
} from "./maps.js";

const STATE = {
    MENU: "MENU",
    EXPEDITION: "EXPEDITION",
    SETTINGS: "SETTINGS",
    EXPEDITION_RESULT: "EXPEDITION_RESULT",
    UFO_MANAGEMENT: "UFO_MANAGEMENT",
    RARE_EVENT: "RARE_EVENT",
};

const $ = (id) => document.getElementById(id);
const stage = $("stage");
const canvas = $("game-canvas");
const labelsEl = $("labels");
const toastEl = $("toasts");
const debugEl = $("debug");
const pickups = bindPickups($("pickups"));

const els = {
    quotaLabel: $("quota-label"),
    researchFill: $("research-fill"),
    hudCore: $("hud-core"),
    hudBeam: $("hud-beam"),
    hudCloak: $("hud-cloak"),
    susFill: $("sus-fill"),
    susPct: $("sus-pct"),
    goalBanner: $("goal-banner"),
    goalText: $("goal-text"),
    warn: $("warn"),
    extractBtn: $("extract-btn"),
    settingsBtn: $("settings-btn"),
    alertFrame: $("alert-frame"),
    redAlert: $("red-alert"),
    menu: $("menu"),
    menuRestart: $("menu-restart"),
    modal: $("modal"),
    modalPanel: $("modal-panel"),
    confirm: $("confirm"),
    endScreen: $("end-screen"),
    endTitle: $("end-title"),
    endSub: $("end-sub"),
    endStats: $("end-stats"),
};

let persist = loadPersistent();
let gameState = STATE.MENU;
let settingsReturn = STATE.MENU;
let debugOn = DEBUG;

const expedition = emptyExpedition();
const specimens = [];
let slots = [];
let slotBusy = [];
let spawnTimer = 0;
let bigfootTimer = 0;
let lastAbductAt = -999;
let extractUnlockAt = 0;
let rareBannerUntil = 0;
const ufoVel = new THREE.Vector2();
const tmp = new THREE.Vector3();
const camFwd = new THREE.Vector3();
const camRight = new THREE.Vector3();
const joyInput = new THREE.Vector2();
const clock = new THREE.Clock();
const joyEl = $("joystick");
const joyKnob = $("joy-knob");
let joyActive = false;
let joyPointerId = null;
let joyOriginX = 0;
let joyOriginY = 0;
let beamExtend = 0;
let goalBannerUntil = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152418);
scene.add(new THREE.HemisphereLight(0xc8d8ff, 0x3a2a18, 0.72));
const sun = new THREE.DirectionalLight(0xfff4e0, 0.55);
sun.position.set(5, 14, 7);
scene.add(sun);

const camera = new THREE.PerspectiveCamera(
    BALANCE.cameraFov,
    9 / 16,
    BALANCE.cameraNear,
    BALANCE.cameraFar,
);
camera.position.fromArray(BALANCE.cameraPos);
camera.lookAt(new THREE.Vector3().fromArray(BALANCE.cameraLookAt));
camera.up.set(0, 1, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

syncMapUnlocks(false);
applyPlayfield(resolvePlayMap());
paintMapRow();
const ufo = createUfo();
scene.add(ufo);
const debugHelpers = createDebugHelpers(scene);
const police = bindPolice({
    scene,
    labelsEl,
    createPoliceCar,
    toast,
});
syncBeam();

const management = bindManagement({
    els: {
        root: $("management"),
        saucer: $("saucer"),
        banked: $("mgmt-banked"),
        statCore: $("stat-core"),
        statBeam: $("stat-beam"),
        statCloak: $("stat-cloak"),
        statProp: $("stat-prop"),
        statScan: $("stat-scan"),
        panel: $("upgrade-panel"),
        panelTitle: $("upgrade-title"),
        panelBody: $("upgrade-body"),
        panelCost: $("upgrade-cost"),
        upgradeBtn: $("upgrade-btn"),
        closePanel: $("upgrade-close"),
        nextBtn: $("next-expedition"),
    },
    getPersist: () => persist,
    onUpgrade: buyUpgrade,
    onNext: startNextExpedition,
});

const indexBook = bindIndexBook({
    root: $("index-book"),
    getPersist: () => persist,
    specimenIcon,
});

bindShell();
resize();
showMenu();
requestAnimationFrame(tick);

function emptyExpedition() {
    return {
        sessionResearch: 0,
        quota: calculateExpeditionQuota(1, 0),
        captureGoal: 6,
        quotaReached: false,
        suspicion: 0,
        abducted: 0,
        largestLabel: "—",
        largestResearch: 0,
        maxSuspicion: 0,
        rareCaptures: 0,
        result: null,
        elapsed: 0,
    };
}

function playBounds() {
    const halfW = BALANCE.worldWidth / 2 - BALANCE.playInset;
    return {
        xMin: -halfW,
        xMax: halfW,
        zMin: -BALANCE.worldDepth / 2 + BALANCE.hudSafeZTop,
        zMax: BALANCE.worldDepth / 2 - BALANCE.hudSafeZBottom,
    };
}

function clampToPlay(x, z) {
    const b = playBounds();
    return {
        x: Math.min(b.xMax, Math.max(b.xMin, x)),
        z: Math.min(b.zMax, Math.max(b.zMin, z)),
    };
}

function isBeamHeld() {
    return simRunning() && !police.isSurrounding() && (joyActive || joyInput.lengthSq() > 1e-4);
}

function applyBeamVisual() {
    const r = beamRadiusFor(persist.upgrades.beam);
    const hover = BALANCE.ufoHoverY;
    const t = beamExtend;
    const h = Math.max(0.05, hover * Math.max(t, 0.04));
    const shown = t > 0.06;
    ufo.userData.beam.visible = shown;
    ufo.userData.ring.visible = t > 0.2;
    ufo.userData.beam.scale.set(r * Math.max(0.22, t), h, r * Math.max(0.22, t));
    ufo.userData.beam.position.y = -h / 2;
    ufo.userData.ring.scale.setScalar(r);
    ufo.userData.ring.position.y = -h + 0.03;
    if (debugHelpers?.userData.beamGuide) {
        debugHelpers.userData.beamGuide.scale.setScalar(r);
        debugHelpers.userData.beamGuide.visible = t > 0.2 && (debugOn || DEBUG);
    }
}

function syncBeam() {
    applyBeamVisual();
}

function updateBeam(dt) {
    const want = isBeamHeld() ? 1 : 0;
    const rate = want > beamExtend ? 18 : 20;
    beamExtend += (want - beamExtend) * Math.min(1, rate * dt);
    if (Math.abs(want - beamExtend) < 0.02) beamExtend = want;
    applyBeamVisual();
}

function dropAllBeamTargets() {
    for (const spec of specimens) {
        if (spec.state === "abducting" || spec.state === "resisting") releaseFromBeam(spec);
    }
}

function releaseFromBeam(spec) {
    spec.state = "idle";
    spec.abductT = 0;
    spec.resistT = 0;
    spec.mesh.position.y = 0;
    spec.mesh.rotation.x = 0;
    spec.mesh.rotation.z = 0;
    spec.mesh.scale.set(1, 1, 1);
    spec.rest.x = spec.mesh.position.x;
    spec.rest.y = 0;
    spec.rest.z = spec.mesh.position.z;
    spec.rest.ry = spec.mesh.rotation.y;
    refreshLabel(spec);
    updateBlobShadow(spec.mesh);
}

function showGoalBanner(n) {
    if (!els.goalBanner || !els.goalText) return;
    els.goalText.textContent = `ABDUCT ${n}`;
    els.goalBanner.classList.remove("hidden");
    goalBannerUntil = 2.4;
}

function hideGoalBanner() {
    goalBannerUntil = 0;
    if (els.goalBanner) els.goalBanner.classList.add("hidden");
}

function derived() {
    const move = moveStats(persist.upgrades.propulsion);
    return {
        core: persist.upgrades.core,
        beam: persist.upgrades.beam,
        cloak: persist.upgrades.cloak,
        scanner: persist.upgrades.scanner,
        radius: beamRadiusFor(persist.upgrades.beam),
        maxSpeed: move.maxSpeed,
        accel: move.accel,
        decel: move.decel,
        cloakMul: cloakSuspicionMultiplier(persist.upgrades.cloak),
        decay: suspicionDecayRate(persist.upgrades.cloak),
        rareMul: scannerRareMultiplier(persist.upgrades.scanner),
    };
}

function simRunning() {
    return gameState === STATE.EXPEDITION || gameState === STATE.RARE_EVENT;
}

function save() {
    savePersistent(persist);
}

function resolvePlayMap() {
    if (!persist.unlockedMaps.includes(persist.selectedMap)) {
        persist.selectedMap = newestMap(persist.unlockedMaps);
    }
    return persist.selectedMap;
}

function applyPlayfield(mapId) {
    const map = mapDef(mapId);
    setPlayfield(scene, mapId);
    setActiveRoutes(map.routes);
    slots = map.slots.slice();
    slotBusy = slots.map(() => false);
}

function mapLimits() {
    const map = mapDef(persist.selectedMap);
    return { maxBuildings: map.maxBuildings, maxVehicles: map.maxVehicles };
}

function syncMapUnlocks(announce) {
    let unlocked = false;
    if (!persist.unlockedMaps.includes("town") && allSystemsAt(persist.upgrades, 5)) {
        persist.unlockedMaps.push("town");
        persist.selectedMap = "town";
        unlocked = true;
        if (announce) toast("TOWN UNLOCKED");
    }
    if (!persist.unlockedMaps.includes("zoo") && allSystemsAt(persist.upgrades, 12)) {
        persist.unlockedMaps.push("zoo");
        persist.selectedMap = "zoo";
        unlocked = true;
        if (announce) toast("ZOO UNLOCKED");
    }
    if (unlocked) save();
    return unlocked;
}

function paintMapRow() {
    const row = $("map-row");
    if (!row) return;
    const newest = newestMap(persist.unlockedMaps);
    row.querySelectorAll("[data-map]").forEach((btn) => {
        const id = btn.dataset.map;
        const open = persist.unlockedMaps.includes(id);
        btn.disabled = !open;
        btn.classList.toggle("locked", !open);
        btn.classList.toggle("selected", persist.selectedMap === id);
        btn.classList.toggle("newest", open && id === newest);
    });
}

function nextWander(def) {
    if (def.enclosure) {
        return enclosurePoint(persist.selectedMap, def.enclosure) || randomFieldPoint(true);
    }
    return randomFieldPoint(true);
}

function showMenu() {
    gameState = STATE.MENU;
    stage.classList.add("on-menu");
    els.menu.classList.remove("hidden");
    els.modal.classList.add("hidden");
    els.endScreen.classList.add("hidden");
    els.confirm.classList.add("hidden");
    indexBook.hide();
    management.hide();
    pickups.clear();
    police.clear();
    endJoystick();
    hideGoalBanner();
    beamExtend = 0;
    applyBeamVisual();
    els.menuRestart.classList.toggle("hidden", !persist.hasPlayed);
    paintMapRow();
    syncHud();
}

function startExpedition() {
    persist.selectedMap = resolvePlayMap();
    const map = mapDef(persist.selectedMap);
    Object.assign(expedition, emptyExpedition());
    expedition.quota = calculateExpeditionQuota(
        persist.upgrades.core,
        persist.successfulExpeditions,
        map.quotaBonus,
    );
    expedition.captureGoal = sessionCaptureGoal(persist.selectedMap, persist.successfulExpeditions);
    persist.hasPlayed = true;
    save();
    clearSpecimens();
    applyPlayfield(persist.selectedMap);
    spawnTimer = 0.15;
    bigfootTimer = BALANCE.bigfootCheckInterval * 0.45;
    lastAbductAt = -999;
    extractUnlockAt = BALANCE.extractLockout;
    rareBannerUntil = 0;
    ufo.position.set(0, BALANCE.ufoHoverY, 0);
    ufoVel.set(0, 0);
    police.clear();
    endJoystick();
    syncBeam();
    pickups.clear();
    seedField();
    beamExtend = 0;
    applyBeamVisual();
    gameState = STATE.EXPEDITION;
    stage.classList.remove("on-menu");
    els.menu.classList.add("hidden");
    els.modal.classList.add("hidden");
    els.endScreen.classList.add("hidden");
    management.hide();
    indexBook.hide();
    showGoalBanner(expedition.captureGoal);
    syncHud();
}

function seedField() {
    const band = escalationBand(0, expedition.captureGoal);
    for (let i = 0; i < 6; i++) {
        const c = counts();
        spawnSpecimen(pickLiftable(band, c));
    }
    trySpawn(false);
    trySpawn(false);
}

function endExpedition(reason) {
    if (!simRunning()) return;
    hideGoalBanner();
    beamExtend = 0;
    applyBeamVisual();
    persist.bankedResearch += expedition.sessionResearch;
    persist.hasPlayed = true;
    persist.bestSessionResearch = Math.max(persist.bestSessionResearch, expedition.sessionResearch);
    if (reason === "detected") {
        expedition.result = "detected";
        persist.failedExpeditions += 1;
    } else if (expedition.quotaReached) {
        expedition.result = "success";
        persist.successfulExpeditions += 1;
    } else {
        expedition.result = "failed";
        persist.failedExpeditions += 1;
    }
    save();
    gameState = STATE.EXPEDITION_RESULT;
    endJoystick();
    const titles = {
        success: "SUCCESS",
        failed: "FAILED",
        detected: "UFO DETECTED",
    };
    const subs = {
        success: "Goal met. Session Research banked.",
        failed: "Goal missed. Session Research still banked.",
        detected: "Forced extract. Session Research still banked.",
    };
    els.endTitle.textContent = titles[expedition.result];
    els.endSub.textContent = subs[expedition.result];
    els.endStats.textContent = [
        `Session Research  ${expedition.sessionResearch}`,
        `Goal              ${expedition.abducted} / ${expedition.captureGoal}  ${expedition.quotaReached ? "✓" : ""}`,
        `Abducted          ${expedition.abducted}`,
        `Largest target    ${expedition.largestLabel}`,
        `Max Suspicion     ${Math.round(expedition.maxSuspicion)}%`,
        `Rare captures     ${expedition.rareCaptures}`,
        `Banked now        ${persist.bankedResearch}`,
    ].join("\n");
    if (reason === "quota") {
        openManagement();
        return;
    }
    els.endScreen.classList.remove("hidden");
}

function completeQuota() {
    if (expedition.quotaReached) return;
    expedition.quotaReached = true;
    toast("GOAL COMPLETE");
    endExpedition("quota");
}

function openManagement() {
    gameState = STATE.UFO_MANAGEMENT;
    els.endScreen.classList.add("hidden");
    management.show();
}

function startNextExpedition() {
    save();
    startExpedition();
}

function buyUpgrade(system) {
    const lv = persist.upgrades[system];
    const cap = systemCap(persist.unlockedMaps);
    const cost = upgradeCost(system, lv, cap);
    if (cost == null || persist.bankedResearch < cost) return;
    persist.bankedResearch -= cost;
    persist.upgrades[system] += 1;
    syncMapUnlocks(true);
    save();
    syncBeam();
    syncHud();
    paintMapRow();
}

function resetProgress() {
    const soundOn = persist.settings.soundOn;
    persist = defaultPersistent();
    persist.settings.soundOn = soundOn;
    save();
    clearSpecimens();
    applyPlayfield("farm");
    paintMapRow();
    showMenu();
}

function toast(text, kind = "") {
    const node = document.createElement("div");
    node.className = `toast${kind ? ` ${kind}` : ""}`;
    node.textContent = text;
    toastEl.appendChild(node);
    setTimeout(() => node.remove(), BALANCE.toastDuration * 1000);
}

function makeLabel(def) {
    const el = document.createElement("div");
    el.className = "spec-label";
    el.textContent = labelText(def, "idle");
    labelsEl.appendChild(el);
    return el;
}

function labelText(def, state) {
    if (state === "resisting") return "TOO HEAVY";
    return def.label;
}

function refreshLabel(spec) {
    spec.label.textContent = labelText(spec.def, spec.state);
    spec.label.classList.toggle("abducting", spec.state === "abducting");
    spec.label.classList.toggle("resisting", spec.state === "resisting");
    spec.label.classList.toggle(
        "high-value",
        persist.upgrades.scanner >= 3 && spec.def.researchValue >= BALANCE.highValueThreshold,
    );
}

function disposeSpecimen(spec) {
    if (spec.slotIndex != null) slotBusy[spec.slotIndex] = false;
    scene.remove(spec.mesh);
    spec.label.remove();
}

function clearSpecimens() {
    while (specimens.length) disposeSpecimen(specimens.pop());
    slotBusy.fill(false);
}

function pickDef(band, prefer) {
    const core = persist.upgrades.core;
    const pool = targetsForMap(persist.selectedMap).filter((d) => !d.rareEvent && (!prefer || prefer(d)));
    let total = 0;
    const weights = pool.map((d) => {
        const w = spawnWeightFor(d, band, core);
        total += w;
        return w;
    });
    if (total <= 0) return targetsForMap(persist.selectedMap)[0] || TARGET_BY_ID.chicken;
    let roll = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return pool[i];
    }
    return pool[pool.length - 1];
}

function counts() {
    let buildings = 0;
    let vehicles = 0;
    let liftable = 0;
    const core = persist.upgrades.core;
    for (const s of specimens) {
        if (s.def.slotted) buildings += 1;
        if (s.def.onRoad) vehicles += 1;
        if (s.def.weightTier <= core && !s.def.rareEvent) liftable += 1;
    }
    return { buildings, vehicles, liftable, all: specimens.length };
}

function tooCloseToUfo(x, z) {
    const safe = beamRadiusFor(persist.upgrades.beam) + 0.9;
    return xzDist(x, z, ufo.position.x, ufo.position.z) < safe;
}

function randomFieldPoint(avoidRoad) {
    const b = playBounds();
    for (let i = 0; i < 12; i++) {
        const x = b.xMin + Math.random() * (b.xMax - b.xMin);
        const z = b.zMin + Math.random() * (b.zMax - b.zMin);
        if (avoidRoad && nearRoad(x, z)) continue;
        if (tooCloseToUfo(x, z)) continue;
        return { x, z };
    }
    return { x: -1.8, z: 2.2 };
}

function canFit(def, c) {
    const limits = mapLimits();
    if (def.slotted && c.buildings >= limits.maxBuildings) return false;
    if (def.onRoad && c.vehicles >= limits.maxVehicles) return false;
    return true;
}

function pickLiftable(band, c) {
    const core = persist.upgrades.core;
    return pickDef(band, (d) => d.weightTier <= core && canFit(d, c));
}

function trySpawn(force = false) {
    const c = counts();
    if (c.all >= BALANCE.maxActiveTargets) return;
    const band = escalationBand(expedition.abducted, expedition.captureGoal);
    const core = persist.upgrades.core;
    let def;
    const limits = mapLimits();
    if (c.liftable < BALANCE.minLiftableTargets) {
        def = pickLiftable(band, c);
    } else if (c.buildings < limits.maxBuildings && Math.random() < (core >= 4 ? 0.14 : 0.05)) {
        def = pickDef(band, (d) => d.slotted);
    } else if (c.vehicles < limits.maxVehicles && Math.random() < (core >= 3 ? 0.24 : 0.07)) {
        def = pickDef(band, (d) => d.onRoad);
    } else {
        def = pickDef(band, (d) => !d.slotted && canFit(d, c));
    }
    if (!canFit(def, c)) def = pickLiftable(band, c);
    spawnSpecimen(def);
}

function spawnSpecimen(def, at = null) {
    if (def.slotted) {
        const idx = slotBusy.findIndex((busy) => !busy);
        if (idx < 0) return null;
        slotBusy[idx] = true;
        at = { x: slots[idx].x, z: slots[idx].z, slotIndex: idx };
    }
    const pos = at || (def.onRoad
        ? startOnRoute()
        : def.enclosure
            ? (enclosurePoint(persist.selectedMap, def.enclosure) || randomFieldPoint(true))
            : randomFieldPoint(true));
    const mesh = createSpecimenMesh(def);
    mesh.position.set(pos.x, 0, pos.z);
    if (pos.route && pos.route.points[1]) {
        mesh.rotation.y = headingY(pos.route.points[1].x - pos.x, pos.route.points[1].z - pos.z);
    }
    scene.add(mesh);
    const spec = {
        def,
        mesh,
        label: makeLabel(def),
        state: "idle",
        tooHeavyUntil: 0,
        abductT: 0,
        abductDur: 0,
        startX: pos.x,
        startZ: pos.z,
        rest: { x: pos.x, y: 0, z: pos.z, rx: 0, ry: mesh.rotation.y, rz: 0 },
        wander: nextWander(def),
        slotIndex: pos.slotIndex ?? null,
        route: pos.route || null,
        routeI: 1,
        dwellUntil: def.movable ? Infinity : expedition.elapsed + lerp(BALANCE.propDwellMin, BALANCE.propDwellMax, Math.random()),
        resistT: 0,
        awarded: false,
    };
    refreshLabel(spec);
    specimens.push(spec);
    return spec;
}

function startOnRoute() {
    const route = pickRoute();
    const start = route.points[0];
    return { x: start.x, z: start.z, route };
}

function spawnBigfoot() {
    if (persist.selectedMap !== "farm") return;
    if (specimens.some((s) => s.def.id === "bigfoot")) return;
    const pos = randomFieldPoint(true);
    spawnSpecimen(TARGET_BY_ID.bigfoot, pos);
    toast("UNKNOWN SPECIMEN DETECTED", "rare");
    gameState = STATE.RARE_EVENT;
    rareBannerUntil = expedition.elapsed + BALANCE.rareEventBanner;
}

function abductingCount() {
    let n = 0;
    for (const s of specimens) if (s.state === "abducting") n += 1;
    return n;
}

function xzDist(ax, az, bx, bz) {
    return Math.hypot(ax - bx, az - bz);
}

function tryCapture(spec, stats) {
    if (!isBeamHeld()) return;
    if (spec.state !== "idle") return;
    const d = xzDist(spec.mesh.position.x, spec.mesh.position.z, ufo.position.x, ufo.position.z);
    if (d > stats.radius) return;
    if (stats.core < spec.def.weightTier) {
        if (expedition.elapsed < spec.tooHeavyUntil) return;
        spec.rest.x = spec.mesh.position.x;
        spec.rest.y = 0;
        spec.rest.z = spec.mesh.position.z;
        spec.rest.rx = spec.mesh.rotation.x;
        spec.rest.ry = spec.mesh.rotation.y;
        spec.rest.rz = spec.mesh.rotation.z;
        spec.state = "resisting";
        spec.resistT = 0;
        spec.tooHeavyUntil = expedition.elapsed + BALANCE.tooHeavyCooldown;
        expedition.suspicion = Math.min(100, expedition.suspicion + BALANCE.tooHeavySuspicion * spec.def.weightTier * stats.cloakMul * BALANCE.suspicionGainMul);
        toast("TOO HEAVY", "warn");
        refreshLabel(spec);
        return;
    }
    if (abductingCount() >= BALANCE.maxConcurrentAbductions) return;
    spec.state = "abducting";
    spec.abductT = 0;
    spec.abductDur = pullDurationFor(stats.beam, spec.def.weightTier);
    spec.startX = spec.mesh.position.x;
    spec.startZ = spec.mesh.position.z;
    spec.awarded = false;
    refreshLabel(spec);
}

function finishAbduction(spec, stats) {
    if (!spec.awarded) {
        spec.awarded = true;
        expedition.sessionResearch += spec.def.researchValue;
        expedition.abducted += 1;
        expedition.suspicion = Math.min(100, expedition.suspicion + spec.def.suspicionValue * stats.cloakMul * BALANCE.suspicionGainMul);
        lastAbductAt = expedition.elapsed;
        if (!persist.discoveredSpecimens.includes(spec.def.id)) persist.discoveredSpecimens.push(spec.def.id);
        if (spec.def.researchValue >= expedition.largestResearch) {
            expedition.largestResearch = spec.def.researchValue;
            expedition.largestLabel = spec.def.label;
        }
        if (spec.def.rareEvent) expedition.rareCaptures += 1;
        pickups.show(spec.def);
        if (expedition.abducted >= expedition.captureGoal) {
            completeQuota();
        }
        save();
    }
    const idx = specimens.indexOf(spec);
    if (idx >= 0) specimens.splice(idx, 1);
    disposeSpecimen(spec);
}

function updateSpecimens(dt, stats) {
    const remove = [];
    const beamHeld = isBeamHeld();
    for (const spec of specimens) {
        if (!beamHeld && (spec.state === "abducting" || spec.state === "resisting")) {
            releaseFromBeam(spec);
        }
        if (spec.state === "abducting") {
            spec.abductT += dt;
            const t = Math.min(1, spec.abductT / spec.abductDur);
            const ease = t * t;
            const lift = ease * ease;
            spec.mesh.position.x = lerp(spec.startX, ufo.position.x, ease);
            spec.mesh.position.z = lerp(spec.startZ, ufo.position.z, ease);
            spec.mesh.position.y = lerp(0, ufo.position.y - 0.18, lift);
            spec.mesh.rotation.y += dt * (5 + ease * 9);
            spec.mesh.rotation.x = ease * 0.55;
            spec.mesh.scale.setScalar(1 - ease * 0.92);
            updateBlobShadow(spec.mesh);
            if (t >= 1) remove.push(spec);
            continue;
        }
        if (spec.state === "resisting") {
            spec.resistT += dt;
            const u = Math.min(1, spec.resistT / BALANCE.tooHeavyDuration);
            spec.mesh.position.x = spec.rest.x;
            spec.mesh.position.z = spec.rest.z;
            spec.mesh.position.y = spec.rest.y + Math.sin(u * Math.PI) * BALANCE.tooHeavyLift;
            spec.mesh.rotation.x = spec.rest.rx + Math.sin(spec.resistT * 20) * BALANCE.tooHeavyWobble * 0.6;
            spec.mesh.rotation.z = spec.rest.rz + Math.sin(spec.resistT * 26) * BALANCE.tooHeavyWobble;
            updateBlobShadow(spec.mesh);
            if (u >= 1) {
                spec.mesh.position.set(spec.rest.x, spec.rest.y, spec.rest.z);
                spec.mesh.rotation.set(spec.rest.rx, spec.rest.ry, spec.rest.rz);
                spec.mesh.scale.set(1, 1, 1);
                spec.state = "idle";
                refreshLabel(spec);
            }
        } else if (spec.def.onRoad && spec.route) {
            const dest = spec.route.points[spec.routeI];
            if (!dest) {
                remove.push(spec);
                continue;
            }
            const dx = dest.x - spec.mesh.position.x;
            const dz = dest.z - spec.mesh.position.z;
            const dist = Math.hypot(dx, dz);
            const spd = lerp(spec.def.speedMin, spec.def.speedMax, 0.55);
            if (dist <= spd * dt + 0.04) {
                spec.mesh.position.x = dest.x;
                spec.mesh.position.z = dest.z;
                spec.routeI += 1;
                if (spec.routeI >= spec.route.points.length) {
                    remove.push(spec);
                    continue;
                }
            } else {
                spec.mesh.position.x += (dx / dist) * spd * dt;
                spec.mesh.position.z += (dz / dist) * spd * dt;
                spec.mesh.rotation.y = headingY(dx, dz);
            }
        } else if (spec.def.movable && spec.state === "idle") {
            const dx = spec.wander.x - spec.mesh.position.x;
            const dz = spec.wander.z - spec.mesh.position.z;
            const dist = Math.hypot(dx, dz);
            const spd = lerp(spec.def.speedMin, spec.def.speedMax, 0.55);
            if (dist < 0.12) spec.wander = nextWander(spec.def);
            else {
                spec.mesh.position.x += (dx / dist) * spd * dt;
                spec.mesh.position.z += (dz / dist) * spd * dt;
            }
            if (spec.def.enclosure) {
                const held = clampInEnclosure(
                    persist.selectedMap,
                    spec.def.enclosure,
                    spec.mesh.position.x,
                    spec.mesh.position.z,
                );
                spec.mesh.position.x = held.x;
                spec.mesh.position.z = held.z;
            }
        } else if (!spec.def.movable && !spec.def.slotted && expedition.elapsed > spec.dwellUntil) {
            remove.push(spec);
            continue;
        }
        if (spec.state === "idle") {
            spec.mesh.position.y = 0;
            spec.mesh.scale.set(1, 1, 1);
            updateBlobShadow(spec.mesh);
        }
        tryCapture(spec, stats);
    }
    for (const spec of remove) {
        if (spec.state === "abducting") finishAbduction(spec, stats);
        else {
            const idx = specimens.indexOf(spec);
            if (idx >= 0) specimens.splice(idx, 1);
            disposeSpecimen(spec);
        }
    }
}

function cameraGroundAxes() {
    camera.getWorldDirection(camFwd);
    camFwd.y = 0;
    if (camFwd.lengthSq() < 1e-6) camFwd.set(0, 0, -1);
    else camFwd.normalize();
    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
    camRight.y = 0;
    if (camRight.lengthSq() < 1e-6) camRight.set(1, 0, 0);
    else camRight.normalize();
}

function updateUfo(dt, stats) {
    cameraGroundAxes();
    if (police.isSurrounding()) {
        joyInput.set(0, 0);
        ufoVel.set(0, 0);
    }
    const strength = Math.min(1, joyInput.length());
    if (strength > 0.001) {
        const tx = (camRight.x * joyInput.x + camFwd.x * joyInput.y) * stats.maxSpeed;
        const tz = (camRight.z * joyInput.x + camFwd.z * joyInput.y) * stats.maxSpeed;
        const dvx = tx - ufoVel.x;
        const dvz = tz - ufoVel.y;
        const gap = Math.hypot(dvx, dvz);
        const step = stats.accel * dt;
        if (gap <= step || gap < 1e-6) {
            ufoVel.set(tx, tz);
        } else {
            ufoVel.x += (dvx / gap) * step;
            ufoVel.y += (dvz / gap) * step;
        }
    } else {
        const spd = Math.hypot(ufoVel.x, ufoVel.y);
        const drop = stats.decel * dt;
        if (spd <= drop) ufoVel.set(0, 0);
        else ufoVel.multiplyScalar(Math.max(0, 1 - drop / spd));
    }
    const cap = stats.maxSpeed;
    const spd = Math.hypot(ufoVel.x, ufoVel.y);
    if (spd > cap) ufoVel.multiplyScalar(cap / spd);
    ufo.position.x += ufoVel.x * dt;
    ufo.position.z += ufoVel.y * dt;
    const clamped = clampToPlay(ufo.position.x, ufo.position.z);
    ufo.position.x = clamped.x;
    ufo.position.z = clamped.z;
    ufo.position.y = BALANCE.ufoHoverY
        + Math.sin(expedition.elapsed * BALANCE.ufoBobHz * Math.PI * 2) * BALANCE.ufoBobAmp;
    ufo.rotation.y += dt * BALANCE.ufoYawSpeed;
    ufo.rotation.z = THREE.MathUtils.clamp(-ufoVel.x * 0.035, -0.14, 0.14);
    ufo.rotation.x = THREE.MathUtils.clamp(ufoVel.y * 0.025, -0.1, 0.1);
    if (debugHelpers.userData.beamGuide) {
        debugHelpers.userData.beamGuide.position.set(ufo.position.x, 0.04, ufo.position.z);
    }
}

function updateWorld(dt) {
    const stats = derived();
    expedition.elapsed += dt;
    extractUnlockAt = Math.max(0, extractUnlockAt - dt);
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        trySpawn(false);
        spawnTimer = lerp(BALANCE.spawnIntervalMin, BALANCE.spawnIntervalMax, Math.random());
    }
    if (expedition.sessionResearch >= BALANCE.bigfootMinSessionResearch) {
        bigfootTimer -= dt;
        if (bigfootTimer <= 0) {
            bigfootTimer = BALANCE.bigfootCheckInterval;
            if (Math.random() < BALANCE.bigfootEventChance * stats.rareMul) spawnBigfoot();
        }
    }
    if (gameState === STATE.RARE_EVENT && expedition.elapsed >= rareBannerUntil) {
        gameState = STATE.EXPEDITION;
    }
    updateUfo(dt, stats);
    updateBeam(dt);
    if (goalBannerUntil > 0) {
        goalBannerUntil = Math.max(0, goalBannerUntil - dt);
        if (goalBannerUntil <= 0) hideGoalBanner();
    }
    updateSpecimens(dt, stats);
    const cops = police.update(dt, ufo, expedition.suspicion, stats.cloakMul, (amt) => {
        expedition.suspicion = Math.min(100, expedition.suspicion + amt);
    }, expedition.elapsed, isBeamHeld());
    if (!cops.surrounding && expedition.elapsed - lastAbductAt >= BALANCE.suspicionDecayDelay) {
        expedition.suspicion = Math.max(0, expedition.suspicion - stats.decay * dt);
    }
    expedition.maxSuspicion = Math.max(expedition.maxSuspicion, expedition.suspicion);
    if (cops.complete) endExpedition("detected");
}

function projectMeshLabel(mesh, label, lift) {
    tmp.set(mesh.position.x, lift, mesh.position.z);
    tmp.project(camera);
    label.style.left = `${(tmp.x * 0.5 + 0.5) * canvas.clientWidth}px`;
    label.style.top = `${(-tmp.y * 0.5 + 0.5) * canvas.clientHeight}px`;
}

function projectLabel(spec) {
    const lift = spec.mesh.position.y + spec.def.size[1] * spec.mesh.scale.y + 0.12;
    projectMeshLabel(spec.mesh, spec.label, lift);
}

function syncHud() {
    const goal = expedition.captureGoal;
    const done = expedition.quotaReached ? " ✓" : "";
    els.quotaLabel.textContent = `GOAL ${expedition.abducted} / ${goal}${done}`;
    els.researchFill.style.width = `${Math.min(100, (expedition.abducted / Math.max(1, goal)) * 100)}%`;
    els.hudCore.textContent = `CORE ${persist.upgrades.core}`;
    els.hudBeam.textContent = `BEAM ${persist.upgrades.beam}`;
    els.hudCloak.textContent = `CLOAK ${persist.upgrades.cloak}`;
    const sus = Math.round(expedition.suspicion);
    els.susPct.textContent = `${sus}%`;
    els.susFill.style.width = `${Math.min(100, expedition.suspicion)}%`;
    els.susFill.className = "";
    if (expedition.suspicion >= 90) els.susFill.classList.add("danger");
    else if (expedition.suspicion >= 75) els.susFill.classList.add("high");
    else if (expedition.suspicion >= 50) els.susFill.classList.add("warn");
    els.warn.textContent = police.isSurrounding() || expedition.suspicion >= 90
        ? "DETECTION IMMINENT"
        : police.activeCount() > 0 || expedition.suspicion >= 80
            ? "POLICE ON SITE"
            : expedition.suspicion >= 75
                ? "HIGH ALERT"
                : "";
    els.alertFrame.classList.toggle("hidden", expedition.suspicion < 75 || !simRunning());
    els.alertFrame.classList.toggle("critical", expedition.suspicion >= 90);
    els.redAlert.classList.toggle("hidden", expedition.suspicion < 90 || !simRunning());
    const locked = extractUnlockAt > 0 || !simRunning() || police.isSurrounding();
    els.extractBtn.disabled = locked;
    els.extractBtn.textContent = extractUnlockAt > 0 ? `EXTRACT ${Math.ceil(extractUnlockAt)}` : "EXTRACT";
    debugHelpers.visible = debugOn || DEBUG;
    if (debugOn) {
        debugEl.classList.remove("hidden");
        const band = escalationBand(expedition.abducted, expedition.captureGoal);
        debugEl.textContent = [
            `state ${gameState}  band ${band}  map ${persist.selectedMap}  cap ${systemCap(persist.unlockedMaps)}`,
            `goal ${expedition.abducted}/${expedition.captureGoal}  session ${expedition.sessionResearch}  banked ${persist.bankedResearch}`,
            `core ${persist.upgrades.core} beam ${persist.upgrades.beam} cloak ${persist.upgrades.cloak} scan ${persist.upgrades.scanner} prop ${persist.upgrades.propulsion}`,
            `specs ${specimens.length} abducting ${abductingCount()} sus ${expedition.suspicion.toFixed(1)}`,
            `R +session  U +banked  S +sus  Q quota  B bigfoot  E extract`,
            `1-5 spawn tier   D overlay`,
        ].join("\n");
    } else {
        debugEl.classList.add("hidden");
    }
}

function ignorePointer(target) {
    return Boolean(target.closest("button, #hud-bottom, #hud-top, #menu, #modal, #end-screen, #confirm, #management, #index-book"));
}

function stagePoint(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        w: rect.width,
        h: rect.height,
    };
}

function clampJoyOrigin(x, y, w, h) {
    const r = BALANCE.joyRadius;
    return {
        x: Math.min(w - r, Math.max(r, x)),
        y: Math.min(h - r, Math.max(r, y)),
    };
}

function setJoyVisual(ox, oy, kx, ky) {
    joyEl.style.left = `${ox}px`;
    joyEl.style.top = `${oy}px`;
    joyEl.style.width = `${BALANCE.joyRadius * 2}px`;
    joyEl.style.height = `${BALANCE.joyRadius * 2}px`;
    joyKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
}

function applyJoyOffset(dx, dy) {
    const r = BALANCE.joyRadius;
    let ox = dx;
    let oy = dy;
    const len = Math.hypot(ox, oy);
    if (len > r && len > 0) {
        ox = (ox / len) * r;
        oy = (oy / len) * r;
    }
    const nx = ox / r;
    const ny = -oy / r;
    const mag = Math.hypot(nx, ny);
    if (mag < BALANCE.joyDeadzone) {
        joyInput.set(0, 0);
    } else {
        const t = (mag - BALANCE.joyDeadzone) / (1 - BALANCE.joyDeadzone);
        joyInput.set((nx / mag) * t, (ny / mag) * t);
    }
    setJoyVisual(joyOriginX, joyOriginY, ox, oy);
}

function endJoystick(ev) {
    if (ev && ev.pointerId != null && joyPointerId != null && ev.pointerId !== joyPointerId) return;
    if (joyPointerId != null && stage.hasPointerCapture?.(joyPointerId)) {
        try { stage.releasePointerCapture(joyPointerId); } catch { /* already released */ }
    }
    const wasHeld = joyActive;
    joyActive = false;
    joyPointerId = null;
    joyInput.set(0, 0);
    joyEl.classList.add("hidden");
    if (wasHeld) dropAllBeamTargets();
}

function beginJoystick(ev) {
    if (!simRunning() || ignorePointer(ev.target)) return;
    const p = stagePoint(ev.clientX, ev.clientY);
    if (p.y < p.h * BALANCE.joyActivateTop) return;
    const origin = clampJoyOrigin(p.x, p.y, p.w, p.h);
    joyActive = true;
    joyPointerId = ev.pointerId;
    joyOriginX = origin.x;
    joyOriginY = origin.y;
    joyEl.classList.remove("hidden");
    applyJoyOffset(0, 0);
    stage.setPointerCapture(ev.pointerId);
    ev.preventDefault();
}

function moveJoystick(ev) {
    if (!joyActive || ev.pointerId !== joyPointerId) return;
    const p = stagePoint(ev.clientX, ev.clientY);
    applyJoyOffset(p.x - joyOriginX, p.y - joyOriginY);
    ev.preventDefault();
}

function bindShell() {
    $("menu-play").addEventListener("click", () => startExpedition());
    $("menu-index").addEventListener("click", () => indexBook.show());
    $("map-row").addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-map]");
        if (!btn || btn.disabled) return;
        const id = btn.dataset.map;
        if (!persist.unlockedMaps.includes(id)) return;
        persist.selectedMap = id;
        save();
        clearSpecimens();
        applyPlayfield(id);
        paintMapRow();
    });
    $("menu-restart").addEventListener("click", () => {
        els.confirm.classList.remove("hidden");
    });
    $("menu-shop").addEventListener("click", () => toast("SHOP EMPTY"));
    $("menu-settings").addEventListener("click", () => openSettings(STATE.MENU));
    els.settingsBtn.addEventListener("click", () => openSettings(gameState));
    els.extractBtn.addEventListener("click", () => {
        if (simRunning() && extractUnlockAt <= 0) endExpedition("extract");
    });
    $("open-management").addEventListener("click", () => openManagement());
    $("confirm-cancel").addEventListener("click", () => els.confirm.classList.add("hidden"));
    $("confirm-delete").addEventListener("click", () => {
        els.confirm.classList.add("hidden");
        resetProgress();
    });

    stage.addEventListener("pointerdown", beginJoystick);
    stage.addEventListener("pointermove", moveJoystick);
    stage.addEventListener("pointerup", endJoystick);
    stage.addEventListener("pointercancel", endJoystick);

    window.addEventListener("keydown", onDebugKey);
    window.addEventListener("keyup", (ev) => applyDebugJoyKeys(ev, false));
    window.addEventListener("resize", resize);
}

function openSettings(from) {
    settingsReturn = from === STATE.SETTINGS ? STATE.MENU : from;
    if (simRunning()) gameState = STATE.SETTINGS;
    else gameState = STATE.SETTINGS;
    endJoystick();
    dropAllBeamTargets();
    beamExtend = 0;
    applyBeamVisual();
    els.modal.classList.remove("hidden");
    els.modalPanel.innerHTML = `
      <h2>SETTINGS</h2>
      <div class="setting-row"><span>Sound</span><button id="sound-toggle" type="button">${persist.settings.soundOn ? "ON" : "OFF"}</button></div>
      <button id="delete-progress" type="button">DELETE PROGRESS</button>
      <button id="main-menu" type="button">MAIN MENU</button>
      <button id="close-settings" type="button">CLOSE</button>
    `;
    $("sound-toggle").addEventListener("click", () => {
        persist.settings.soundOn = !persist.settings.soundOn;
        save();
        $("sound-toggle").textContent = persist.settings.soundOn ? "ON" : "OFF";
    });
    $("delete-progress").addEventListener("click", () => {
        els.confirm.classList.remove("hidden");
    });
    $("main-menu").addEventListener("click", () => {
        els.modal.classList.add("hidden");
        showMenu();
    });
    $("close-settings").addEventListener("click", () => {
        els.modal.classList.add("hidden");
        gameState = settingsReturn === STATE.SETTINGS ? STATE.MENU : settingsReturn;
        if (gameState === STATE.MENU) showMenu();
        syncHud();
    });
}

function applyDebugJoyKeys(ev, down) {
    if (!DEBUG || !simRunning() || joyActive) return false;
    const k = ev.key.toLowerCase();
    let x = joyInput.x;
    let y = joyInput.y;
    if (k === "a" || k === "arrowleft") x = down ? -1 : 0;
    else if (k === "d" || k === "arrowright") x = down ? 1 : 0;
    else if (k === "w" || k === "arrowup") y = down ? 1 : 0;
    else if (k === "s" || k === "arrowdown") y = down ? -1 : 0;
    else return false;
    const mag = Math.hypot(x, y);
    if (mag > 1) joyInput.set(x / mag, y / mag);
    else joyInput.set(x, y);
    ev.preventDefault();
    return true;
}

function onDebugKey(ev) {
    if (applyDebugJoyKeys(ev, true)) return;
    if (ev.key === "d" || ev.key === "D") {
        debugOn = !debugOn;
        syncHud();
        return;
    }
    if (!debugOn && !DEBUG) return;
    if (ev.key === "r" || ev.key === "R") {
        expedition.sessionResearch += 20;
        expedition.abducted += 1;
        if (expedition.abducted >= expedition.captureGoal) completeQuota();
    }
    if (ev.key === "u" || ev.key === "U") {
        persist.bankedResearch += 100;
        save();
    }
    if (ev.key === "s" || ev.key === "S") expedition.suspicion = Math.min(100, expedition.suspicion + 10);
    if (ev.key === "q" || ev.key === "Q") {
        expedition.abducted = Math.max(expedition.abducted, expedition.captureGoal);
        completeQuota();
    }
    if (ev.key === "b" || ev.key === "B") spawnBigfoot();
    if (ev.key === "e" || ev.key === "E") endExpedition("extract");
    const tier = Number(ev.key);
    if (tier >= 1 && tier <= 5) {
        const def = targetsForMap(persist.selectedMap).find((d) => d.weightTier === tier && !d.rareEvent);
        if (def) spawnSpecimen(def);
    }
    syncHud();
}

function resize() {
    const w = canvas.clientWidth || stage.clientWidth;
    const h = canvas.clientHeight || stage.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function tick() {
    const dt = Math.min(0.05, clock.getDelta());
    if (simRunning()) updateWorld(dt);
    for (const spec of specimens) projectLabel(spec);
    police.projectLabels(projectMeshLabel);
    syncHud();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
}
