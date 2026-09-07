import { BLURBS } from "./blurbs.js";
import { TARGETS } from "./targets.js";

export function bindIndexBook({ root, getPersist, specimenIcon }) {
    const grid = root.querySelector("#index-grid");
    const detail = root.querySelector("#index-detail");
    const detailArt = root.querySelector("#index-detail-art");
    const detailName = root.querySelector("#index-detail-name");
    const detailBlurb = root.querySelector("#index-detail-blurb");

    function entries(p) {
        const unlocked = new Set(p.unlockedMaps);
        return TARGETS.filter((d) => (d.maps || ["farm"]).some((m) => unlocked.has(m)));
    }

    function openDetail(def) {
        detailArt.innerHTML = specimenIcon(def);
        detailName.textContent = def.label;
        detailBlurb.textContent = BLURBS[def.id] || "Classification pending. It wiggles.";
        detail.classList.remove("hidden");
    }

    function paint() {
        const p = getPersist();
        const found = new Set(p.discoveredSpecimens);
        detail.classList.add("hidden");
        grid.innerHTML = "";
        for (const def of entries(p)) {
            const known = found.has(def.id);
            const cell = document.createElement(known ? "button" : "div");
            if (known) cell.type = "button";
            cell.className = `index-cell${known ? "" : " locked"}`;
            cell.innerHTML = `
              <div class="index-art">${specimenIcon(def)}</div>
              <div class="index-name">${known ? def.label : "???"}</div>
            `;
            if (known) cell.addEventListener("click", () => openDetail(def));
            grid.appendChild(cell);
        }
    }

    function show() {
        paint();
        root.classList.remove("hidden");
    }

    function hide() {
        root.classList.add("hidden");
        detail.classList.add("hidden");
    }

    root.querySelector("#index-close").addEventListener("click", hide);
    root.querySelector("#index-detail-back").addEventListener("click", () => {
        detail.classList.add("hidden");
    });

    return { show, hide, paint };
}
