import { BLURBS } from "./blurbs.js";
import { TARGETS } from "./targets.js";
import { MAPS, MAP_ORDER } from "./maps.js";
import { uiIcon } from "./uiIcons.js";

export function bindIndexBook({ root, getPersist, specimenIcon }) {
    const grid = root.querySelector("#index-grid");
    const detail = root.querySelector("#index-detail");
    const detailArt = root.querySelector("#index-detail-art");
    const detailName = root.querySelector("#index-detail-name");
    const detailBlurb = root.querySelector("#index-detail-blurb");

    function targetsFor(mapId) {
        return TARGETS.filter((d) => (d.maps || ["farm"]).includes(mapId));
    }

    function openDetail(def) {
        detailArt.innerHTML = specimenIcon(def);
        detailName.textContent = def.label;
        detailBlurb.textContent = BLURBS[def.id] || "Classification pending. It wiggles.";
        detail.classList.remove("hidden");
    }

    function makeCell(def, known) {
        const cell = document.createElement(known ? "button" : "div");
        if (known) cell.type = "button";
        cell.className = `index-cell${known ? "" : " locked"}`;
        cell.innerHTML = `
          <div class="index-art">${specimenIcon(def)}</div>
          <div class="index-name">${known ? def.label : uiIcon("lock", "index-lock")}</div>
        `;
        if (known) cell.addEventListener("click", () => openDetail(def));
        return cell;
    }

    function paint() {
        const p = getPersist();
        const found = new Set(p.discoveredSpecimens);
        const unlocked = new Set(p.unlockedMaps);
        detail.classList.add("hidden");
        grid.innerHTML = "";

        for (const mapId of MAP_ORDER) {
            const map = MAPS[mapId];
            const open = unlocked.has(mapId);
            const defs = targetsFor(mapId);
            const knownCount = defs.filter((d) => found.has(d.id)).length;

            const section = document.createElement("section");
            section.className = `index-section${open ? "" : " locked"}`;
            section.innerHTML = `
              <div class="index-section-head">
                ${uiIcon(mapId, "index-section-icon")}
                <h3>${map.label}</h3>
                ${open
                    ? `<span class="index-section-count">${knownCount}/${defs.length}</span>`
                    : uiIcon("lock", "index-section-lock")}
              </div>
            `;

            if (open) {
                const cells = document.createElement("div");
                cells.className = "index-section-grid";
                for (const def of defs) cells.appendChild(makeCell(def, found.has(def.id)));
                section.appendChild(cells);
            }

            grid.appendChild(section);
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
