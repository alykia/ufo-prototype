export const DEBUG = false;

export const SAVE_KEY_V2 = "ufo-greybox-save-v2";
export const SAVE_KEY_V1 = "ufo-greybox-save-v1";

export const BALANCE = {
    worldWidth: 8.6,
    worldDepth: 12.2,
    visualGroundWidth: 36,
    visualGroundDepth: 48,
    playInset: 0.62,
    hudSafeZBottom: 2.35,
    hudSafeZTop: 1.85,

    cameraFov: 38,
    cameraNear: 0.1,
    cameraFar: 80,
    cameraPos: [0, 13.4, 11.2],
    cameraLookAt: [0, 0.15, 0.25],

    ufoHoverY: 1.88,
    ufoBobAmp: 0.04,
    ufoBobHz: 0.65,
    ufoYawSpeed: 0.1,

    baseResearchQuota: 120,
    quotaPerCoreLevel: 50,
    quotaPerExpedition: 35,

    maxActiveTargets: 14,
    maxConcurrentAbductions: 8,
    maxBuildings: 3,
    maxVehicles: 5,
    minLiftableTargets: 7,
    liftableSpawnBoost: 2.4,
    townStillSpawnBoost: 1.18,
    townBuildingSpawnChance: 0.17,
    zooAnimalSpawnBoost: 1.22,
    zooAnimalSpawnChance: 0.2,
    heavyPreviewNear: 0.2,
    heavyPreviewFar: 0.07,
    spawnIntervalMin: 0.7,
    spawnIntervalMax: 1.45,
    buildingRespawnDelay: 14,
    propDwellMin: 9,
    propDwellMax: 16,

    baseMoveSpeed: 4.4,
    moveAccel: 18,
    propulsionSpeedPerLevel: 0.55,
    propulsionAccelPerLevel: 3.2,
    moveSmoothing: 0.18,
    moveDecel: 10,
    propulsionDecelPerLevel: 1.6,
    joyRadius: 52,
    joyDeadzone: 0.12,
    joyActivateTop: 0.62,

    baseBeamRadius: 0.78,
    beamRadiusPerLevel: 0.18,
    pullDurationByTier: [0, 0.3, 0.36, 0.46, 0.56, 0.68, 0.72, 0.75, 0.78, 0.8, 0.82, 0.84, 0.86, 0.88, 0.9, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97],
    pullDurationPerLevel: 0.03,
    minPullDuration: 0.2,
    maxPullDuration: 0.8,

    tooHeavySuspicion: 0.6,
    tooHeavyCooldown: 1.8,
    tooHeavyWobble: 0.14,
    tooHeavyLift: 0.09,
    tooHeavyDuration: 0.42,

    suspicionDecayDelay: 1.6,
    baseSuspicionDecay: 1.9,
    suspicionGainMul: 0.75,
    policeAt80: 80,
    policeAt90: 90,
    policeCount80: 1,
    policeCount90: 3,
    policeCount100: 5,
    policeSpeed: 3.35,
    policeSpeedHot: 3.9,
    policeCatchRadius: 0.92,
    policeCatchSuspicion: 5,
    policeCatchCooldown: 1.15,
    policeSurroundTime: 1.65,
    policeSurroundRadius: 1.42,
    cloakSuspicionReductionPerLevel: 0.1,
    cloakDecayBonusPerLevel: 0.18,
    cloakDecayFromLevel: 3,

    bigfootMinSessionResearch: 35,
    bigfootEventChance: 0.12,
    bigfootCheckInterval: 18,
    bigfootResearchValue: 90,
    bigfootSuspicionValue: 20,
    bigfootDuration: 11,
    bigfootWeightTier: 3,
    scannerRareBonusLv4: 1.25,
    scannerRareBonusLv5: 1.5,
    highValueThreshold: 25,
    goalBonusQuotaFrac: 0.2,
    goalBonusMin: 20,
    goalBonusStep: 5,

    // Training Expedition (Onboarding)
    trainingQuota: 60,
    trainingGoalNeed: 5,
    trainingSeedChickens: 6,
    trainingSeedFrogs: 2,
    trainingCowDistance: 1.6,
    trainingSuspicionBump: 25,
    trainingSuspicionBeatAt: 25,
    trainingFloor: 40,

    toastDuration: 1.3,
    pickupDuration: 2.2,
    pickupHoldCommon: 0.38,
    pickupHoldUncommon: 0.82,
    pickupHoldRare: 1.55,
    pickupRushCommon: 0.14,
    pickupRushUncommon: 0.36,
    pickupRushRare: 1.05,
    pickupRushAt: 2,
    pickupExitMs: 90,
    rareEventBanner: 1.0,

    upgradeCosts: {
        core: [60, 140, 300, 600],
        beam: [50, 120, 250, 500],
        cloak: [55, 130, 280, 550],
        scanner: [40, 100, 220, 450],
        propulsion: [45, 110, 240, 480],
    },

    maxSystemLevel: 5,
    hardSystemCap: 20,
};

export function calculateExpeditionQuota(coreLevel, successfulExpeditions = 0, quotaBonus = 0) {
    return BALANCE.baseResearchQuota
        + Math.max(0, coreLevel - 1) * BALANCE.quotaPerCoreLevel
        + Math.max(0, successfulExpeditions) * BALANCE.quotaPerExpedition
        + Math.max(0, quotaBonus);
}

export function goalBonusFor(quota) {
    const raw = Math.max(BALANCE.goalBonusMin, quota * BALANCE.goalBonusQuotaFrac);
    return Math.round(raw / BALANCE.goalBonusStep) * BALANCE.goalBonusStep;
}

export function escalationBand(sessionResearch, quota) {
    const p = quota > 0 ? sessionResearch / quota : 0;
    if (p < 0.25) return 1;
    if (p < 0.5) return 2;
    if (p < 0.85) return 3;
    if (p < 1.15) return 4;
    return 5;
}

export function beamRadiusFor(level) {
    const n = Math.max(0, level - 1);
    const full = Math.min(4, n);
    const extra = Math.max(0, n - 4);
    return BALANCE.baseBeamRadius + BALANCE.beamRadiusPerLevel * full + 0.07 * extra;
}

export function pullDurationFor(level, weightTier) {
    const tier = Math.min(20, Math.max(1, weightTier));
    const raw = (BALANCE.pullDurationByTier[tier] ?? 0.8)
        - BALANCE.pullDurationPerLevel * Math.max(0, Math.min(level, 8) - 1);
    return Math.min(BALANCE.maxPullDuration, Math.max(BALANCE.minPullDuration, raw));
}

export function moveStats(propulsionLevel) {
    const lv = Math.max(0, propulsionLevel - 1);
    const full = Math.min(4, lv);
    const extra = Math.max(0, lv - 4);
    return {
        maxSpeed: BALANCE.baseMoveSpeed + BALANCE.propulsionSpeedPerLevel * full + 0.22 * extra,
        accel: BALANCE.moveAccel + BALANCE.propulsionAccelPerLevel * full + 1.1 * extra,
        decel: BALANCE.moveDecel + BALANCE.propulsionDecelPerLevel * full + 0.55 * extra,
    };
}

export function cloakSuspicionMultiplier(cloakLevel) {
    return Math.max(0.35, 1 - BALANCE.cloakSuspicionReductionPerLevel * Math.max(0, cloakLevel - 1));
}

export function suspicionDecayRate(cloakLevel) {
    const extra = cloakLevel >= BALANCE.cloakDecayFromLevel
        ? BALANCE.cloakDecayBonusPerLevel * (cloakLevel - BALANCE.cloakDecayFromLevel + 1)
        : 0;
    return BALANCE.baseSuspicionDecay + extra;
}

export function scannerRareMultiplier(scannerLevel) {
    if (scannerLevel >= 5) return BALANCE.scannerRareBonusLv5;
    if (scannerLevel >= 4) return BALANCE.scannerRareBonusLv4;
    return 1;
}

export function upgradeCost(system, currentLevel, cap = BALANCE.maxSystemLevel) {
    if (currentLevel >= cap) return null;
    const costs = BALANCE.upgradeCosts[system];
    if (!costs) return null;
    if (currentLevel < 5) return costs[currentLevel - 1];
    const base = costs[costs.length - 1];
    return Math.round(base * (1.55 ** (currentLevel - 4)));
}
