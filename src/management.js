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
            node.querySelector(".hot-lv").textContent = `Lv ${upgrades[key]}`;
            const extras = document.getElementById(GROWTH_IDS[key]);
            if (extras) extras.dataset.level = String(upgrades[key]);
        }
    }

    const LEAD_EDGES = {
        scanner: "bottom",
        core: "top",
        beam: "right",
    };

    function boxPoint(el, box, where) {
        const r = el.getBoundingClientRect();
        let x = r.left + r.width / 2;
        let y = r.top + r.height / 2;
        if (where === "top") y = r.top;
        if (where === "bottom") y = r.bottom;
        if (where === "left") x = r.left;
        if (where === "right") x = r.right;
        return {
            x: ((x - box.left) / box.width) * 100,
            y: ((y - box.top) / box.height) * 100,
        };
    }

    function layoutLeads() {
        const svg = document.getElementById("saucer-leads");
        if (!svg || els.root.classList.contains("hidden")) return;
        const box = els.saucer.getBoundingClientRect();
        if (box.width < 8 || box.height < 8) return;
        for (const [system, edge] of Object.entries(LEAD_EDGES)) {
            const btn = els.saucer.querySelector(`[data-system="${system}"]`);
            const node = els.saucer.querySelector(`.lead-node[data-lead="${system}"]`);
            const line = svg.querySelector(`line[data-lead="${system}"]`);
            if (!btn || !node || !line) continue;
            const from = boxPoint(btn, box, edge);
            const to = boxPoint(node, box, "center");
            line.setAttribute("x1", from.x.toFixed(2));
            line.setAttribute("y1", from.y.toFixed(2));
            line.setAttribute("x2", to.x.toFixed(2));
            line.setAttribute("y2", to.y.toFixed(2));
        }
    }

    function scheduleLeads() {
        requestAnimationFrame(() => requestAnimationFrame(layoutLeads));
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
        scheduleLeads();
    }

    function show() {
        els.root.classList.remove("hidden");
        openSystem = null;
        refresh();
        scheduleLeads();
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

    if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(() => layoutLeads()).observe(els.saucer);
    }
    window.addEventListener("resize", scheduleLeads);

    return { show, hide, refresh };
}

export { SYSTEM_META };
