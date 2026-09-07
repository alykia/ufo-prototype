import * as THREE from "three";
import {
    BALANCE,
    DEBUG,
    beamRadiusFor,
    calculateExpeditionQuota,
    goalBonusFor,
    cloakSuspicionMultiplier,
    escalationBand,
    moveStats,
    pullDurationFor,
    scannerRareMultiplier,
    suspicionDecayRate,
    upgradeCost,
} from "./balance.js";
import { TARGET_BY_ID, spawnWeightFor, targetsForMap } from "./targets.js";
import { defaultOnboarding, defaultPersistent, loadPersistent, savePersistent } from "./persist.js";
import { bindManagement } from "./management.js";
import { createDebugHelpers, createPoliceCar, createSpecimenMesh, createUfo, setPlayfield, updateBlobShadow } from "./meshes.js";
import { headingY, nearRoad, pickRoute, setActiveRoutes } from "./roads.js";
import { bindPickups, specimenIcon } from "./pickups.js";
import { bindPolice } from "./police.js";
import { bindIndexBook } from "./indexBook.js";
import {
    SYSTEMS,
    allSystemsAt,
    clampInEnclosure,
    enclosurePoint,
    mapDef,
    mapUnlockCore,
    newestMap,
    relativeWeight,
    systemCap,
} from "./maps.js";
import { creditGoal, goalFilled, goalLabel, goalSpawnMul, rollSessionGoal } from "./goals.js";
import { BLURBS } from "./blurbs.js";
import { bridgeQuip } from "./bridgeQuips.js";
import { FLOOR_LINE, TRAINING_RESULT_LINE } from "./bridgeLines.js";
import { ALIEN_SVG, bindOnboarding } from "./onboarding.js";
import { hydrateIcons, uiIcon } from "./uiIcons.js";

const STATE = {
    MENU: "MENU",
    EXPEDITION: "EXPEDITION",
    SETTINGS: "SETTINGS",
    EXPEDITION_RESULT: "EXPEDITION_RESULT",
    UFO_MANAGEMENT: "UFO_MANAGEMENT",
    RARE_EVENT: "RARE_EVENT",
    ONBOARDING: "ONBOARDING",
};

const $ = (id) => document.getElementById(id);
hydrateIcons();
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
    goalRow: $("goal-row"),
    warn: $("warn"),
    settingsBtn: $("settings-btn"),
    quotaChip: $("quota-chip"),
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
    researchSuccess: $("research-success"),
    researchList: $("research-list"),
    researchInfo: $("research-info"),
    researchInfoArt: $("research-info-art"),
    researchInfoName: $("research-info-name"),
    researchInfoBlurb: $("research-info-blurb"),
    researchQuotaStat: $("research-quota-stat"),
    researchGoalStat: $("research-goal-stat"),
    researchPoliceStat: $("research-police-stat"),
    goalBonus: $("goal-bonus"),
    researchQuip: $("research-quip"),
    researchTitle: $("research-title"),
    researchHint: $("research-hint"),
    endQuip: $("end-quip"),
    endAlien: $("end-alien"),
    nextBtn: $("next-expedition"),
};

let persist = loadPersistent();
let gameState = STATE.MENU;
let settingsReturn = STATE.MENU;
let debugOn = DEBUG;
// Per-run Training Expedition flags (reset in startExpedition).
const trainingRun = { cowSpawned: false, bumpDone: false, suspicionFired: false, upgraded: false, floorLine: false };

const expedition = emptyExpedition();
const specimens = [];
let slots = [];
let slotBusy = [];
let spawnTimer = 0;
let bigfootTimer = 0;
let lastAbductAt = -999;
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
    onCall: () => {
        expedition.policeCalls += 1;
        onboarding.tip("police");
    },
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
    onOpen: () => onboarding.event("hotspot"),
});

const indexBook = bindIndexBook({
    root: $("index-book"),
    getPersist: () => persist,
    specimenIcon,
});

let confirmYes = null;

function askConfirm({ title, hint, actionLabel, danger = true, onYes }) {
    $("confirm-title").textContent = title;
    $("confirm-hint").textContent = hint || "";
    $("confirm-hint").classList.toggle("hidden", !hint);
    const btn = $("confirm-delete");
    btn.textContent = actionLabel;
    btn.classList.toggle("ok", !danger);
    confirmYes = onYes;
    els.confirm.classList.remove("hidden");
}

function askWipeConfirm() {
    askConfirm({
        title: "ALL THE PROGRESS WILL BE LOST, ARE YOU SURE?",
        hint: "Banked Research, UFO systems, maps, discoveries and best stats will be wiped. Sound setting is kept.",
        actionLabel: "RESTART",
        danger: true,
        onYes: resetProgress,
    });
}

const onboarding = bindOnboarding({
    stage,
    root: $("bridge-bubble"),
    ring: $("onboard-ring"),
    dim: $("onboard-dim"),
    getPersist: () => persist,
    save,
    holdWorld,
    anchorRect,
    confirmSkip: () => askConfirm({
        title: "Skip the tutorial?",
        hint: "You can replay it later from Settings.",
        actionLabel: "SKIP",
        danger: false,
        onYes: () => onboarding.skip(),
    }),
});
if (els.endAlien) els.endAlien.innerHTML = ALIEN_SVG;

bindShell();
resize();
showMenu();
requestAnimationFrame(tick);

function emptyExpedition() {
    return {
        sessionResearch: 0,
        quota: calculateExpeditionQuota(1, 0),
        goals: [],
        goalBonus: 0,
        goalReached: false,
        quotaReached: false,
        sessionCatches: {},
        sessionNew: [],
        policeCalls: 0,
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

function showGoalBanner(goals, bonus = 0) {
    if (!els.goalBanner || !els.goalText) return;
    els.goalText.innerHTML = goals.map((g) => {
        const def = TARGET_BY_ID[g.id];
        return `<div class="goal-banner-item">
          <div class="goal-art">${specimenIcon(def)}</div>
          <span class="goal-need">×${g.need}</span>
        </div>`;
    }).join("");
    if (els.goalBonus) {
        els.goalBonus.innerHTML = bonus > 0
            ? `${uiIcon("trophy", "goal-bonus-icon")} +${bonus}`
            : "";
    }
    els.goalBanner.classList.remove("hidden");
    goalBannerUntil = 3.8;
}

function goalSummary(goals = []) {
    if (!goals.length) return "—";
    return goals.map((g) => `${goalLabel(g)} ${g.have}/${g.need}`).join("  ");
}

function paintGoalRow() {
    if (!els.goalRow) return;
    const goals = expedition.goals || [];
    if (!goals.length) {
        els.goalRow.innerHTML = "";
        return;
    }
    els.goalRow.innerHTML = goals.map((g) => {
        const def = TARGET_BY_ID[g.id];
        const done = g.have >= g.need;
        return `<div class="goal-item${done ? " done" : ""}" aria-label="${goalLabel(g)} ${g.have} of ${g.need}">
          <div class="goal-art">${specimenIcon(def)}</div>
          ${done ? uiIcon("check", "goal-check") : ""}
          <span class="goal-count">${g.have}/${g.need}</span>
        </div>`;
    }).join("");
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

// Onboarding pause: freezes the sim without touching the Joystick, so a held
// finger resumes movement the moment the bubble is dismissed.
function holdWorld(on) {
    if (on) {
        if (simRunning()) {
            gameState = STATE.ONBOARDING;
            pickups.setFrozen(true);
        }
        return;
    }
    if (gameState === STATE.ONBOARDING) {
        gameState = STATE.EXPEDITION;
        pickups.setFrozen(false);
    } else if (gameState === STATE.SETTINGS && settingsReturn === STATE.ONBOARDING) {
        settingsReturn = STATE.EXPEDITION;
        pickups.setFrozen(false);
    }
}

function cheapestAffordable() {
    const cap = systemCap(persist.unlockedMaps);
    let best = null;
    let bestCost = Infinity;
    for (const sys of SYSTEMS) {
        const cost = upgradeCost(sys, persist.upgrades[sys], cap);
        if (cost == null || cost > persist.bankedResearch) continue;
        if (cost < bestCost) {
            bestCost = cost;
            best = sys;
        }
    }
    return best;
}

function stageRect(el) {
    if (!el) return null;
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
}

// Non-selector anchors for the Onboarding highlight ring.
function anchorRect(kind) {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (kind === "joyzone") {
        const r = BALANCE.joyRadius;
        return { left: w / 2 - r, top: h * 0.8 - r, width: r * 2, height: r * 2 };
    }
    if (kind === "chicken") {
        let best = null;
        let bestD = Infinity;
        for (const s of specimens) {
            if (s.def.id !== "chicken" || s.state !== "idle") continue;
            const d = xzDist(s.mesh.position.x, s.mesh.position.z, ufo.position.x, ufo.position.z);
            if (d < bestD) {
                bestD = d;
                best = s;
            }
        }
        if (!best) return null;
        tmp.set(best.mesh.position.x, 0.2, best.mesh.position.z).project(camera);
        const x = (tmp.x * 0.5 + 0.5) * w;
        const y = (-tmp.y * 0.5 + 0.5) * h;
        return { left: x - 22, top: y - 22, width: 44, height: 44 };
    }
    if (kind === "hotspots") {
        const sys = cheapestAffordable();
        if (!sys) return null;
        return stageRect($("saucer").querySelector(`[data-system="${sys}"]`));
    }
    return null;
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

function buildingSpawnChance(core) {
    if (persist.selectedMap === "town") return BALANCE.townBuildingSpawnChance;
    return core >= 4 ? 0.14 : 0.05;
}

function syncMapUnlocks(announce) {
    let unlocked = false;
    if (!persist.unlockedMaps.includes("town") && allSystemsAt(persist.upgrades, 5)) {
        persist.unlockedMaps.push("town");
        persist.selectedMap = "town";
        unlocked = true;
        if (announce) {
            toast("TOWN UNLOCKED", "", "town");
            onboarding.tip("townUnlocked");
        }
    }
    if (!persist.unlockedMaps.includes("zoo") && allSystemsAt(persist.upgrades, 12)) {
        persist.unlockedMaps.push("zoo");
        persist.selectedMap = "zoo";
        unlocked = true;
        if (announce) {
            toast("ZOO UNLOCKED", "", "zoo");
            onboarding.tip("zooUnlocked");
        }
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
        const need = mapUnlockCore(id);
        btn.classList.toggle("locked", !open);
        btn.classList.toggle("selected", persist.selectedMap === id);
        btn.classList.toggle("newest", open && id === newest);
        btn.setAttribute("aria-disabled", open ? "false" : "true");
        btn.setAttribute("aria-label", open ? mapDef(id).label : `${mapDef(id).label}, UFO stats to level ${need} to unlock`);
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
    onboarding.abort();
    stage.classList.add("on-menu");
    stage.classList.remove("settings-open");
    els.menu.classList.remove("hidden");
    els.modal.classList.add("hidden");
    els.endScreen.classList.add("hidden");
    els.confirm.classList.add("hidden");
    indexBook.hide();
    management.hide();
    hideResearchSuccess();
    pickups.clear();
    pickups.setFrozen(false);
    police.clear();
    endJoystick();
    hideGoalBanner();
    beamExtend = 0;
    applyBeamVisual();
    const fresh = !persist.onboarding.done;
    els.menu.classList.toggle("fresh", fresh);
    els.menuRestart.classList.toggle("hidden", fresh || !persist.hasPlayed);
    paintMapRow();
    syncHud();
    if (!fresh && persist.hasPlayed) onboarding.tip("menuReveal");
}

function resetTrainingRun() {
    trainingRun.cowSpawned = false;
    trainingRun.bumpDone = false;
    trainingRun.suspicionFired = false;
    trainingRun.upgraded = false;
    trainingRun.floorLine = false;
}

function startExpedition() {
    const training = !persist.onboarding.done;
    if (training) persist.selectedMap = "farm";
    persist.selectedMap = resolvePlayMap();
    const map = mapDef(persist.selectedMap);
    Object.assign(expedition, emptyExpedition());
    resetTrainingRun();
    if (training) {
        expedition.quota = BALANCE.trainingQuota;
        expedition.goals = [{ id: "chicken", need: BALANCE.trainingGoalNeed, have: 0 }];
    } else {
        expedition.quota = calculateExpeditionQuota(
            persist.upgrades.core,
            persist.successfulExpeditions,
            map.quotaBonus,
        );
        expedition.goals = rollSessionGoal(
            persist.selectedMap,
            persist.upgrades.core,
            persist.successfulExpeditions,
        );
    }
    expedition.goalBonus = goalBonusFor(expedition.quota);
    expedition.goalReached = false;
    persist.hasPlayed = true;
    save();
    clearSpecimens();
    applyPlayfield(persist.selectedMap);
    spawnTimer = 0.15;
    bigfootTimer = training ? Infinity : BALANCE.bigfootCheckInterval * 0.45;
    lastAbductAt = -999;
    rareBannerUntil = 0;
    ufo.position.set(0, BALANCE.ufoHoverY, 0);
    ufoVel.set(0, 0);
    police.clear();
    endJoystick();
    syncBeam();
    pickups.clear();
    pickups.setFrozen(false);
    if (training) onboarding.startTraining();
    else onboarding.abort();
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
    hideResearchSuccess();
    if (!training) showGoalBanner(expedition.goals, expedition.goalBonus);
    paintGoalRow();
    syncHud();
    // The welcome beat pauses the world; startTraining ran before the state
    // flipped to EXPEDITION, so apply the hold now that the sim is live.
    if (training && onboarding.hasBubble()) holdWorld(true);
}

function seedField() {
    if (onboarding.isTraining()) {
        for (let i = 0; i < BALANCE.trainingSeedChickens; i++) spawnSpecimen(TARGET_BY_ID.chicken);
        for (let i = 0; i < BALANCE.trainingSeedFrogs; i++) spawnSpecimen(TARGET_BY_ID.frog);
        return;
    }
    const band = escalationBand(0, expedition.quota);
    for (let i = 0; i < 6; i++) {
        const c = counts();
        spawnSpecimen(pickLiftable(band, c));
    }
    trySpawn(false);
    trySpawn(false);
}

function endExpedition(reason) {
    if (!simRunning() && gameState !== STATE.ONBOARDING) return;
    const training = onboarding.isTraining();
    hideGoalBanner();
    beamExtend = 0;
    applyBeamVisual();
    persist.bankedResearch += expedition.sessionResearch;
    persist.hasPlayed = true;
    persist.bestSessionResearch = Math.max(persist.bestSessionResearch, expedition.sessionResearch);
    if (reason === "detected") {
        expedition.result = "detected";
        if (!training) persist.failedExpeditions += 1;
    } else if (expedition.quotaReached) {
        expedition.result = "success";
        if (!training) persist.successfulExpeditions += 1;
    } else {
        expedition.result = "failed";
        if (!training) persist.failedExpeditions += 1;
    }
    // Training floor: the guided Management visit must always afford one upgrade.
    if (training && !persist.onboarding.floorUsed && persist.bankedResearch < BALANCE.trainingFloor) {
        persist.bankedResearch = BALANCE.trainingFloor;
        persist.onboarding.floorUsed = true;
        trainingRun.floorLine = true;
    }
    save();
    gameState = STATE.EXPEDITION_RESULT;
    pickups.setFrozen(false);
    endJoystick();
    onboarding.event("expeditionEnd");
    showResearchSuccess();
}

function resultQuip() {
    if (trainingRun.floorLine) return FLOOR_LINE;
    if (onboarding.isTraining()) return TRAINING_RESULT_LINE;
    // First failed / detected result: the Bridge explains what happened.
    if (expedition.result === "failed" || expedition.result === "detected") {
        const tipLine = onboarding.claimTip(expedition.result);
        if (tipLine) return tipLine;
    }
    return bridgeQuip(expedition, persist.selectedMap)
        || "Earth remains poorly guarded and excellently stocked. Recommend repeat visit.";
}

function completeQuota() {
    if (expedition.quotaReached) return;
    expedition.quotaReached = true;
    endExpedition("quota");
}

function openManagement() {
    gameState = STATE.UFO_MANAGEMENT;
    els.endScreen.classList.add("hidden");
    hideResearchSuccess();
    management.show();
    onboarding.event("management");
}

function hideResearchSuccess() {
    if (!els.researchSuccess) return;
    els.researchSuccess.classList.add("hidden");
    els.researchSuccess.classList.remove("detected", "failed");
    if (els.researchInfo) els.researchInfo.classList.add("hidden");
}

function openResearchInfo(def) {
    if (!def || !els.researchInfo) return;
    els.researchInfoArt.innerHTML = specimenIcon(def);
    els.researchInfoName.textContent = def.label;
    els.researchInfoBlurb.textContent = BLURBS[def.id] || "Classification pending. It wiggles.";
    els.researchInfo.classList.remove("hidden");
}

function showResearchSuccess() {
    if (!els.researchSuccess || !els.researchList) {
        openManagement();
        return;
    }
    pickups.clear();
    const result = expedition.result || "success";
    const titles = {
        success: `${uiIcon("research")} RESEARCH SUCCESSFUL`,
        failed: `${uiIcon("warning")} FAILED`,
        detected: `${uiIcon("warning")} UFO DETECTED`,
    };
    const hints = {
        success: "Quota met. Session Research banked.",
        failed: "Quota missed. Session Research still banked.",
        detected: "Forced extract. Session Research still banked.",
    };
    els.researchSuccess.classList.toggle("detected", result === "detected");
    els.researchSuccess.classList.toggle("failed", result === "failed");
    if (els.researchTitle) els.researchTitle.innerHTML = titles[result] || titles.success;
    if (els.researchHint) els.researchHint.textContent = hints[result] || hints.success;
    const catches = expedition.sessionCatches || {};
    const news = new Set(expedition.sessionNew || []);
    const rows = Object.keys(catches)
        .map((id) => ({ def: TARGET_BY_ID[id], count: catches[id], isNew: news.has(id) }))
        .filter((row) => row.def && row.count > 0)
        .sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.count - a.count || a.def.label.localeCompare(b.def.label));
    els.researchList.innerHTML = rows.length
        ? rows.map((row) => `
            <div class="research-row" data-id="${row.def.id}">
              <div class="research-art">${specimenIcon(row.def)}</div>
              <div class="research-meta">
                <div class="research-name">${row.def.label}</div>
                <div class="research-count">×${row.count}</div>
              </div>
              ${row.isNew ? `<span class="research-new">NEW</span>
              <button class="research-info-btn" type="button" data-info="${row.def.id}" aria-label="Info">${uiIcon("info")}</button>` : ""}
            </div>
          `).join("")
        : `<p class="hint">No specimens logged.</p>`;
    const calls = expedition.policeCalls || 0;
    if (els.researchQuotaStat) {
        els.researchQuotaStat.innerHTML = `${uiIcon("research")} ${expedition.sessionResearch} / ${expedition.quota}`;
    }
    if (els.researchGoalStat) {
        const bonus = expedition.goalBonus || 0;
        const got = expedition.goalReached && bonus > 0;
        els.researchGoalStat.innerHTML = got ? `${uiIcon("trophy")} +${bonus}` : "";
    }
    if (els.researchPoliceStat) {
        els.researchPoliceStat.innerHTML = `${uiIcon("police")} ${calls}`;
    }
    if (els.researchQuip) els.researchQuip.textContent = resultQuip();
    els.researchInfo.classList.add("hidden");
    els.endScreen.classList.add("hidden");
    els.researchSuccess.classList.remove("hidden");
}

function startNextExpedition() {
    if (onboarding.gatesActive() && !trainingRun.upgraded) return;
    onboarding.event("next");
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
    trainingRun.upgraded = true;
    syncMapUnlocks(true);
    save();
    syncBeam();
    syncHud();
    paintMapRow();
    onboarding.event("upgraded");
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

function toast(text, kind = "", icon = "") {
    const node = document.createElement("div");
    node.className = `toast${kind ? ` ${kind}` : ""}`;
    const mark = icon || (kind === "warn" ? "warning" : kind === "rare" ? "star" : kind === "bad" ? "alert" : "");
    node.innerHTML = `${mark ? uiIcon(mark, "toast-icon") : ""}<span>${text}</span>`;
    toastEl.appendChild(node);
    setTimeout(() => node.remove(), BALANCE.toastDuration * 1000);
}

function makeLabel() {
    const el = document.createElement("div");
    el.className = "spec-label";
    labelsEl.appendChild(el);
    return el;
}

function refreshLabel(spec) {
    spec.label.textContent = spec.state === "resisting" ? "TOO HEAVY" : "";
    spec.label.classList.toggle("abducting", spec.state === "abducting");
    spec.label.classList.toggle("resisting", spec.state === "resisting");
    const highValue = persist.upgrades.scanner >= 3 && spec.def.researchValue >= BALANCE.highValueThreshold;
    spec.label.classList.toggle("high-value", highValue);
    if (highValue && simRunning()) onboarding.tip("scannerGlow");
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
        const w = spawnWeightFor(d, band, core) * goalSpawnMul(expedition.goals, d);
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

// Training: a cow placed just ahead of the UFO so TOO HEAVY is guaranteed.
function spawnTrainingCow() {
    const b = playBounds();
    const dist = BALANCE.trainingCowDistance;
    let dirX = ufoVel.x;
    let dirZ = ufoVel.y;
    if (Math.hypot(dirX, dirZ) < 0.2) {
        dirX = -ufo.position.x;
        dirZ = -ufo.position.z;
    }
    if (Math.hypot(dirX, dirZ) < 0.2) {
        dirX = 0;
        dirZ = -1;
    }
    const base = Math.atan2(dirZ, dirX);
    for (let i = 0; i < 8; i++) {
        const a = base + (i % 2 ? -1 : 1) * Math.ceil(i / 2) * (Math.PI / 4);
        const x = Math.min(b.xMax, Math.max(b.xMin, ufo.position.x + Math.cos(a) * dist));
        const z = Math.min(b.zMax, Math.max(b.zMin, ufo.position.z + Math.sin(a) * dist));
        if (nearRoad(x, z)) continue;
        spawnSpecimen(TARGET_BY_ID.cow, { x, z });
        trainingRun.cowSpawned = true;
        return;
    }
    spawnSpecimen(TARGET_BY_ID.cow, randomFieldPoint(true));
    trainingRun.cowSpawned = true;
}

function trySpawn(force = false) {
    const c = counts();
    if (c.all >= BALANCE.maxActiveTargets) return;
    if (onboarding.isTraining()) {
        if (!trainingRun.cowSpawned && onboarding.waitingFor() === "tooHeavy") {
            spawnTrainingCow();
            return;
        }
        const band = escalationBand(expedition.sessionResearch, expedition.quota);
        const def = pickDef(band, (d) => d.weightTier <= 1 && d.category === "living" && !d.slotted && !d.onRoad);
        if (def) spawnSpecimen(def);
        return;
    }
    const band = escalationBand(expedition.sessionResearch, expedition.quota);
    const core = persist.upgrades.core;
    let def;
    const limits = mapLimits();
    if (c.liftable < BALANCE.minLiftableTargets) {
        def = pickLiftable(band, c);
    } else if (c.buildings < limits.maxBuildings && Math.random() < buildingSpawnChance(core)) {
        def = pickDef(band, (d) => d.slotted);
    } else if (c.vehicles < limits.maxVehicles && Math.random() < (core >= 3 ? 0.24 : 0.07)) {
        def = pickDef(band, (d) => d.onRoad);
    } else if (persist.selectedMap === "zoo" && Math.random() < BALANCE.zooAnimalSpawnChance) {
        def = pickDef(band, (d) => d.enclosure);
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
        label: makeLabel(),
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
    onboarding.tip("bigfoot");
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
        expedition.suspicion = Math.min(100, expedition.suspicion + BALANCE.tooHeavySuspicion * relativeWeight(spec.def.weightTier, persist.selectedMap) * stats.cloakMul * BALANCE.suspicionGainMul);
        toast("TOO HEAVY", "warn");
        refreshLabel(spec);
        if (onboarding.gatesActive() && !trainingRun.bumpDone) {
            // One-off jump so the Suspicion eye visibly fills for the next beat.
            trainingRun.bumpDone = true;
            expedition.suspicion = Math.min(100, expedition.suspicion + BALANCE.trainingSuspicionBump);
            lastAbductAt = expedition.elapsed;
        }
        onboarding.event("tooHeavy");
        return;
    }
    if (abductingCount() >= BALANCE.maxConcurrentAbductions) return;
    spec.state = "abducting";
    spec.abductT = 0;
    spec.abductDur = pullDurationFor(stats.beam, relativeWeight(spec.def.weightTier, persist.selectedMap));
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
        expedition.sessionCatches[spec.def.id] = (expedition.sessionCatches[spec.def.id] || 0) + 1;
        if (!persist.discoveredSpecimens.includes(spec.def.id)) {
            persist.discoveredSpecimens.push(spec.def.id);
            if (!expedition.sessionNew.includes(spec.def.id)) expedition.sessionNew.push(spec.def.id);
        }
        if (spec.def.researchValue >= expedition.largestResearch) {
            expedition.largestResearch = spec.def.researchValue;
            expedition.largestLabel = spec.def.label;
        }
        if (spec.def.rareEvent) expedition.rareCaptures += 1;
        pickups.show(spec.def);
        if (creditGoal(expedition.goals, spec.def.id)) {
            for (const other of specimens) refreshLabel(other);
        }
        if (goalFilled(expedition.goals) && !expedition.goalReached) {
            expedition.goalReached = true;
            const bonus = expedition.goalBonus || 0;
            if (bonus > 0) expedition.sessionResearch += bonus;
            toast(bonus > 0 ? `+${bonus}` : "DONE", "", "check");
        }
        paintGoalRow();
        onboarding.event("abducted");
        if (expedition.sessionResearch >= expedition.quota) {
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
    if (onboarding.isTraining()) {
        if (joyActive || joyInput.lengthSq() > 1e-4) onboarding.joystickHeld(dt, joyInput.length());
        if (!trainingRun.suspicionFired && expedition.suspicion >= BALANCE.trainingSuspicionBeatAt) {
            trainingRun.suspicionFired = true;
            onboarding.event("suspicion");
        }
    }
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        trySpawn(false);
        spawnTimer = lerp(BALANCE.spawnIntervalMin, BALANCE.spawnIntervalMax, Math.random());
    }
    if (expedition.sessionResearch >= BALANCE.bigfootMinSessionResearch && Number.isFinite(bigfootTimer)) {
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
    const q = expedition.quota;
    els.quotaLabel.textContent = `${expedition.sessionResearch} / ${q}`;
    if (els.quotaChip) els.quotaChip.classList.toggle("met", Boolean(expedition.quotaReached));
    els.researchFill.style.width = `${Math.min(100, (expedition.sessionResearch / Math.max(1, q)) * 100)}%`;
    paintGoalRow();
    els.hudCore.innerHTML = `${uiIcon("core")}${persist.upgrades.core}`;
    els.hudBeam.innerHTML = `${uiIcon("beam")}${persist.upgrades.beam}`;
    els.hudCloak.innerHTML = `${uiIcon("cloak")}${persist.upgrades.cloak}`;
    const sus = Math.round(expedition.suspicion);
    els.susPct.textContent = `${sus}%`;
    els.susFill.style.width = `${Math.min(100, expedition.suspicion)}%`;
    els.susFill.className = "";
    if (expedition.suspicion >= 90) els.susFill.classList.add("danger");
    else if (expedition.suspicion >= 75) els.susFill.classList.add("high");
    else if (expedition.suspicion >= 50) els.susFill.classList.add("warn");
    const warnText = police.isSurrounding() || expedition.suspicion >= 90
        ? "DETECTION"
        : police.activeCount() > 0 || expedition.suspicion >= 80
            ? "POLICE"
            : expedition.suspicion >= 75
                ? "ALERT"
                : "";
    els.warn.innerHTML = warnText ? `${uiIcon(warnText === "POLICE" ? "police" : "warning")}<span>${warnText}</span>` : "";
    const inField = simRunning() || gameState === STATE.ONBOARDING;
    els.alertFrame.classList.toggle("hidden", expedition.suspicion < 75 || !inField);
    els.alertFrame.classList.toggle("critical", expedition.suspicion >= 90);
    els.redAlert.classList.toggle("hidden", expedition.suspicion < 90 || !inField);
    if (els.nextBtn) els.nextBtn.disabled = onboarding.gatesActive() && !trainingRun.upgraded;
    debugHelpers.visible = debugOn || DEBUG;
    if (debugOn) {
        debugEl.classList.remove("hidden");
        const band = escalationBand(expedition.sessionResearch, expedition.quota);
        debugEl.textContent = [
            `state ${gameState}  band ${band}  map ${persist.selectedMap}  cap ${systemCap(persist.unlockedMaps)}`,
            `session ${expedition.sessionResearch}  banked ${persist.bankedResearch}  quota ${q}`,
            `goal ${goalSummary(expedition.goals)}`,
            `core ${persist.upgrades.core} beam ${persist.upgrades.beam} cloak ${persist.upgrades.cloak} scan ${persist.upgrades.scanner} prop ${persist.upgrades.propulsion}`,
            `specs ${specimens.length} abducting ${abductingCount()} sus ${expedition.suspicion.toFixed(1)}`,
            `R +session  U +banked  S +sus  Q quota  B bigfoot  E end`,
            `1-5 spawn tier   D overlay`,
        ].join("\n");
        // Read-only readout for automated playtests (debug overlay only).
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const toScreen = (x, z) => {
            tmp.set(x, 0, z).project(camera);
            return { x: (tmp.x * 0.5 + 0.5) * w, y: (-tmp.y * 0.5 + 0.5) * h };
        };
        window.__ufoDebug = {
            state: gameState,
            training: onboarding.isTraining(),
            waiting: onboarding.waitingFor(),
            suspicion: expedition.suspicion,
            sessionResearch: expedition.sessionResearch,
            quota: q,
            banked: persist.bankedResearch,
            ufo: toScreen(ufo.position.x, ufo.position.z),
            specimens: specimens.map((s) => ({ id: s.def.id, state: s.state, ...toScreen(s.mesh.position.x, s.mesh.position.z) })),
        };
    } else {
        debugEl.classList.add("hidden");
    }
}

function ignorePointer(target) {
    return Boolean(target.closest("button, #hud-bottom, #hud-top, #menu, #modal, #end-screen, #confirm, #management, #index-book, #research-success, #bridge-bubble"));
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
        if (!btn) return;
        const id = btn.dataset.map;
        if (!persist.unlockedMaps.includes(id)) {
            toast(`NEED UFO STATS AT LEVEL ${mapUnlockCore(id)}`, "warn", "lock");
            return;
        }
        persist.selectedMap = id;
        save();
        clearSpecimens();
        applyPlayfield(id);
        paintMapRow();
    });
    $("menu-restart").addEventListener("click", () => askWipeConfirm());
    $("menu-shop").addEventListener("click", () => toast("EMPTY", "", "shop"));
    $("menu-settings").addEventListener("click", () => openSettings(STATE.MENU));
    els.settingsBtn.addEventListener("click", () => openSettings(gameState));
    $("open-management").addEventListener("click", () => openManagement());
    $("research-continue").addEventListener("click", () => openManagement());
    $("research-info-close").addEventListener("click", () => els.researchInfo.classList.add("hidden"));
    els.researchList.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-info]");
        if (!btn) return;
        openResearchInfo(TARGET_BY_ID[btn.dataset.info]);
    });
    $("confirm-cancel").addEventListener("click", () => {
        els.confirm.classList.add("hidden");
        confirmYes = null;
    });
    $("confirm-delete").addEventListener("click", () => {
        const yes = confirmYes;
        confirmYes = null;
        els.confirm.classList.add("hidden");
        if (yes) yes();
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
    gameState = STATE.SETTINGS;
    stage.classList.add("settings-open");
    endJoystick();
    dropAllBeamTargets();
    beamExtend = 0;
    applyBeamVisual();
    const onTitle = settingsReturn === STATE.MENU;
    els.modal.classList.remove("hidden");
    els.modalPanel.innerHTML = `
      <h2>${uiIcon("settings")} SETTINGS</h2>
      <div class="setting-row">
        <span>Sound</span>
        <button id="sound-toggle" class="icon-toggle" type="button" aria-label="${persist.settings.soundOn ? "Sound on" : "Sound off"}">
          ${uiIcon(persist.settings.soundOn ? "sound" : "soundOff")}
        </button>
      </div>
      ${onTitle && persist.onboarding.done ? `<button id="replay-tutorial" type="button">REPLAY TUTORIAL</button>` : ""}
      <button id="delete-progress" type="button">DELETE PROGRESS</button>
      <button id="main-menu" type="button">MAIN MENU</button>
      <button id="close-settings" type="button">CLOSE</button>
    `;
    const replay = $("replay-tutorial");
    if (replay) {
        replay.addEventListener("click", () => {
            persist.onboarding = defaultOnboarding();
            save();
            closeSettings();
            startExpedition();
        });
    }
    $("sound-toggle").addEventListener("click", () => {
        persist.settings.soundOn = !persist.settings.soundOn;
        save();
        const on = persist.settings.soundOn;
        $("sound-toggle").innerHTML = uiIcon(on ? "sound" : "soundOff");
        $("sound-toggle").setAttribute("aria-label", on ? "Sound on" : "Sound off");
    });
    $("delete-progress").addEventListener("click", () => askWipeConfirm());
    $("main-menu").addEventListener("click", () => {
        els.modal.classList.add("hidden");
        showMenu();
    });
    $("close-settings").addEventListener("click", closeSettings);
}

function closeSettings() {
    els.modal.classList.add("hidden");
    stage.classList.remove("settings-open");
    gameState = settingsReturn === STATE.SETTINGS ? STATE.MENU : settingsReturn;
    if (gameState === STATE.MENU) showMenu();
    syncHud();
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
        if (expedition.sessionResearch >= expedition.quota) completeQuota();
    }
    if (ev.key === "u" || ev.key === "U") {
        persist.bankedResearch += 100;
        save();
    }
    if (ev.key === "s" || ev.key === "S") expedition.suspicion = Math.min(100, expedition.suspicion + 10);
    if (ev.key === "q" || ev.key === "Q") {
        expedition.sessionResearch = Math.max(expedition.sessionResearch, expedition.quota);
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
