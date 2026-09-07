import { upgradeCost } from "./balance.js";
import { systemCap } from "./maps.js";
import { uiIcon } from "./uiIcons.js";

const SYSTEM_META = {
    scanner: { title: "SCANNER ARRAY", body: "Rarer, richer finds." },
    core: { title: "GRAVITON CORE", body: "Lift heavier Specimens." },
    beam: { title: "TRACTOR BEAM", body: "Wider beam. Faster pull." },
    cloak: { title: "CLOAKING", body: "Less Suspicion." },
    propulsion: { title: "PROPULSION", body: "Faster UFO." },
};

function nextBlurb(system, level, cap) {
    if (level >= cap) return "MAXED";
    const n = level + 1;
    if (system === "core") return `Next: Weight ${n}`;
    if (system === "beam") return "Next: +radius, +speed";
    if (system === "cloak") return n >= 3 ? "Next: faster decay" : "Next: less Suspicion";
    if (system === "scanner") {
        if (n === 2) return "Next: Research labels";
        if (n === 3) return "Next: high-value glow";
        return "Next: rarer finds";
    }
    return "Next: +speed";
}

export function bindManagement({ els, getPersist, onUpgrade, onNext, onOpen }) {
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
            node.querySelector(".hot-lv").textContent = String(upgrades[key]);
            const extras = document.getElementById(GROWTH_IDS[key]);
            if (extras) extras.dataset.level = String(upgrades[key]);
        }
    }

    function paintStatus(p) {
        els.banked.innerHTML = `${uiIcon("research")}${p.bankedResearch}`;
        els.statCore.innerHTML = `${uiIcon("core")}${p.upgrades.core}`;
        els.statBeam.innerHTML = `${uiIcon("beam")}${p.upgrades.beam}`;
        els.statCloak.innerHTML = `${uiIcon("cloak")}${p.upgrades.cloak}`;
        els.statProp.innerHTML = `${uiIcon("propulsion")}${p.upgrades.propulsion}`;
        els.statScan.innerHTML = `${uiIcon("scanner")}${p.upgrades.scanner}`;
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
        els.panelTitle.innerHTML = `${uiIcon(openSystem)}${meta.title}`;
        els.panelBody.textContent = `${meta.body} ${nextBlurb(openSystem, lv, cap)}`;
        if (cost == null) {
            els.panelCost.innerHTML = `${uiIcon("check")} MAXED`;
            els.upgradeBtn.disabled = true;
            els.upgradeBtn.innerHTML = `${uiIcon("check")} MAXED`;
        } else {
            els.panelCost.innerHTML = `${uiIcon("research")} ${cost}`;
            const afford = p.bankedResearch >= cost;
            els.upgradeBtn.disabled = !afford;
            els.upgradeBtn.innerHTML = afford
                ? `${uiIcon("upgrade")} UPGRADE`
                : "CAN'T AFFORD";
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
            if (onOpen) onOpen(openSystem);
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
