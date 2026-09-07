import { upgradeCost } from "./balance.js";
import { systemCap } from "./maps.js";

const SYSTEM_META = {
    scanner: { title: "SCANNER ARRAY", body: "Finds high-value and rare Specimens.", loc: "Dome" },
    core: { title: "GRAVITON CORE", body: "Raises the Weight Tier you can lift.", loc: "Centre" },
    beam: { title: "TRACTOR BEAM", body: "Widens the Capture Zone and speeds the pull.", loc: "Underside" },
    cloak: { title: "CLOAKING", body: "Cuts Suspicion gain, then speeds decay.", loc: "Hull" },
    propulsion: { title: "PROPULSION", body: "Raises max speed and acceleration.", loc: "Engines" },
};

function nextBlurb(system, level, cap) {
    if (level >= cap) return "MAXED";
    const n = level + 1;
    if (system === "core") return `Next: lift Weight Tier ${n}`;
    if (system === "beam") return `Next: larger Capture Zone, faster pull`;
    if (system === "cloak") return n >= 3 ? "Next: faster Suspicion decay" : "Next: less Suspicion per lift";
    if (system === "scanner") {
        if (n === 2) return "Next: Research labels";
        if (n === 3) return "Next: highlight high-value targets";
        return "Next: better rare-event chance";
    }
    return "Next: faster UFO";
}

export function bindManagement({ els, getPersist, onUpgrade, onNext }) {
    let openSystem = null;

    const GROWTH_IDS = {
        scanner: "growth-scanner",
        core: "growth-core",
        beam: "growth-beam",
        cloak: "growth-cloak",
        propulsion: "growth-prop",
    };

    function paintSaucer(upgrades) {
        for (const key of Object.keys(SYSTEM_META)) {
            const node = els.saucer.querySelector(`[data-system="${key}"]`);
            if (!node) continue;
            node.dataset.level = String(upgrades[key]);
            node.querySelector(".hot-lv").textContent = `LV ${upgrades[key]}`;
            const extras = document.getElementById(GROWTH_IDS[key]);
            if (extras) extras.dataset.level = String(upgrades[key]);
        }
    }

    function paintStatus(p) {
        els.banked.textContent = `BANKED ${p.bankedResearch}`;
        els.statCore.textContent = `MASS ${p.upgrades.core}`;
        els.statBeam.textContent = `BEAM ${p.upgrades.beam}`;
        els.statCloak.textContent = `STEALTH ${p.upgrades.cloak}`;
        els.statProp.textContent = `SPEED ${p.upgrades.propulsion}`;
        els.statScan.textContent = `SCAN ${p.upgrades.scanner}`;
    }

    function paintPanel(p) {
        if (!openSystem) {
            els.panel.classList.add("hidden");
            return;
        }
        const lv = p.upgrades[openSystem];
        const cap = systemCap(p.unlockedMaps);
        const cost = upgradeCost(openSystem, lv, cap);
        const meta = SYSTEM_META[openSystem];
        els.panel.classList.remove("hidden");
        els.panelTitle.textContent = meta.title;
        els.panelBody.textContent = `${meta.loc}. ${meta.body} Current LV ${lv}. ${nextBlurb(openSystem, lv, cap)}.`;
        if (cost == null) {
            els.panelCost.textContent = "MAXED";
            els.upgradeBtn.disabled = true;
            els.upgradeBtn.textContent = "MAXED";
        } else {
            els.panelCost.textContent = `COST ${cost}`;
            const afford = p.bankedResearch >= cost;
            els.upgradeBtn.disabled = !afford;
            els.upgradeBtn.textContent = afford ? "UPGRADE" : "CAN'T AFFORD";
        }
    }

    function refresh() {
        const p = getPersist();
        paintSaucer(p.upgrades);
        paintStatus(p);
        paintPanel(p);
    }

    function show() {
        els.root.classList.remove("hidden");
        openSystem = null;
        refresh();
    }

    function hide() {
        els.root.classList.add("hidden");
        els.panel.classList.add("hidden");
        openSystem = null;
    }

    els.saucer.querySelectorAll("[data-system]").forEach((btn) => {
        btn.addEventListener("click", () => {
            openSystem = btn.dataset.system;
            refresh();
        });
    });

    els.closePanel.addEventListener("click", () => {
        openSystem = null;
        refresh();
    });

    els.upgradeBtn.addEventListener("click", () => {
        if (!openSystem) return;
        onUpgrade(openSystem);
        refresh();
    });

    els.nextBtn.addEventListener("click", () => onNext());

    return { show, hide, refresh };
}

export { SYSTEM_META };
