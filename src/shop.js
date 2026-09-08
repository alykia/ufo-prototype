import * as THREE from "three";
import { animateUfo, applyCosmetics, createUfo } from "./meshes.js";
import { SHOP_ITEM_BY_ID, SHOP_SLOTS, SLOT_META, itemsForSlot, resolveLooks } from "./shopCatalog.js";
import { SHOP_INTRO, shopLine } from "./shopLines.js";
import { uiIcon } from "./uiIcons.js";

// Title-screen Shop: Meteorite buys Cosmetics, one equipped per slot. The
// preview is a second small Three.js scene showing the player's own UFO with
// its equipped Cosmetics and current Refits. Rendering only runs while open.
//
// Tapping a card first previews it on the saucer (locked items included);
// tapping the same card again buys or equips it. Previews are remembered per
// slot so a hull and a hat can be tried together before spending.
export function bindShop({ root, getPersist, onBuy, onEquip, onDeny }) {
    const grid = root.querySelector("#shop-grid");
    const tabs = root.querySelector("#shop-tabs");
    const balance = root.querySelector("#shop-balance");
    const quip = root.querySelector("#shop-quip");
    const canvas = root.querySelector("#shop-canvas");
    const previewBox = root.querySelector("#shop-preview");
    const previewTag = root.querySelector("#shop-preview-tag");
    const previewName = root.querySelector("#shop-preview-name");
    const previewHint = root.querySelector("#shop-preview-hint");

    let slot = SHOP_SLOTS[0];
    let focusId = null;
    // slot -> item id being tried on instead of the equipped one.
    let previewIds = {};
    let raf = 0;
    let renderer = null;
    let scene = null;
    let camera = null;
    let ufo = null;
    let lastTime = 0;

    function ensurePreview() {
        if (renderer) return true;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        } catch {
            renderer = null;
            return false;
        }
        renderer.setClearColor(0x000000, 0);
        scene = new THREE.Scene();
        scene.add(new THREE.HemisphereLight(0xc8d8ff, 0x3a2a48, 0.9));
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.7);
        sun.position.set(3, 5, 4);
        scene.add(sun);
        camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
        camera.position.set(0, 1.35, 2.9);
        camera.lookAt(0, -0.05, 0);
        ufo = createUfo();
        ufo.position.set(0, 0.12, 0);
        // Show a stub of beam so tints read; the ground ring has no ground here.
        ufo.userData.ring.visible = false;
        ufo.userData.beam.scale.set(0.95, 1.05, 0.95);
        ufo.userData.beam.position.y = -0.6;
        scene.add(ufo);
        return true;
    }

    function fitPreview() {
        if (!renderer) return;
        const w = Math.max(1, previewBox.clientWidth);
        const h = Math.max(1, previewBox.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    // Drop previews that now match what is equipped (after a buy/equip).
    function prunePreviews(p) {
        for (const s of Object.keys(previewIds)) {
            if (previewIds[s] === p.cosmetics.equipped[s]) delete previewIds[s];
        }
    }

    function previewLook(p) {
        return { ...p.cosmetics.equipped, ...previewIds };
    }

    function dressPreview() {
        if (!ufo) return;
        const p = getPersist();
        applyCosmetics(ufo, resolveLooks(previewLook(p)), p.upgrades);
    }

    function ownedOrFree(p, item) {
        return item.price === 0 || p.cosmetics.owned.includes(item.id);
    }

    function itemById(id) {
        return SHOP_ITEM_BY_ID[id] || null;
    }

    function paintPreviewTag(p) {
        if (!previewTag) return;
        const ids = Object.values(previewIds);
        if (!ids.length) {
            previewTag.classList.add("hidden");
            return;
        }
        previewTag.classList.remove("hidden");
        const names = ids.map((id) => itemById(id)?.label || id);
        previewName.textContent = names.join(" + ");
        // Hint follows the card in the open tab if it is being previewed.
        const active = itemById(previewIds[slot]);
        let hint = "TAP A PREVIEWED CARD AGAIN TO CONFIRM";
        if (active) {
            if (ownedOrFree(p, active)) hint = "TAP AGAIN TO EQUIP";
            else if (p.meteorite >= active.price) hint = "TAP AGAIN TO BUY";
            else hint = `NEED ${active.price - p.meteorite} MORE METEORITE`;
        }
        previewHint.textContent = hint;
    }

    function frame(now) {
        if (!renderer) return;
        const dt = Math.min(0.05, lastTime ? (now - lastTime) / 1000 : 0.016);
        lastTime = now;
        ufo.rotation.y += dt * 0.55;
        animateUfo(ufo, dt, { speed: 1.2, beamHeld: false });
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
    }

    function startLoop() {
        if (!ensurePreview()) return;
        fitPreview();
        dressPreview();
        lastTime = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
    }

    function stopLoop() {
        cancelAnimationFrame(raf);
        raf = 0;
    }

    function paintBalance(p) {
        if (balance) balance.innerHTML = `${uiIcon("meteorite")}<span>${p.meteorite}</span>`;
    }

    function paintTabs() {
        tabs.innerHTML = SHOP_SLOTS.map((s) => `
          <button type="button" class="shop-tab${s === slot ? " active" : ""}" data-slot="${s}">
            ${uiIcon(SLOT_META[s].icon, "shop-tab-icon")}<span>${SLOT_META[s].label}</span>
          </button>`).join("");
    }

    function paintGrid(p) {
        const items = itemsForSlot(slot);
        grid.innerHTML = items.map((item) => {
            const equipped = p.cosmetics.equipped[slot] === item.id;
            const previewing = !equipped && previewIds[slot] === item.id;
            const owned = ownedOrFree(p, item);
            const afford = p.meteorite >= item.price;
            const state = equipped ? "equipped" : owned ? "owned" : afford ? "buyable" : "poor";
            let action;
            if (equipped) action = `${uiIcon("check")} EQUIPPED`;
            else if (owned) action = previewing ? `${uiIcon("check")} EQUIP` : "EQUIP";
            else if (previewing && afford) action = `BUY ${uiIcon("meteorite")} ${item.price}`;
            else action = `${uiIcon("meteorite")} ${item.price}`;
            const classes = ["shop-card", state];
            if (item.id === focusId) classes.push("focus");
            if (previewing) classes.push("previewing");
            return `
              <button type="button" class="${classes.join(" ")}" data-id="${item.id}" aria-label="${item.label}">
                <div class="shop-art" style="--swatch:${item.swatch}">${uiIcon(item.icon)}</div>
                <div class="shop-name">${item.label}</div>
                <div class="shop-action">${action}</div>
              </button>`;
        }).join("");
    }

    function refresh() {
        const p = getPersist();
        prunePreviews(p);
        paintBalance(p);
        paintTabs();
        paintGrid(p);
        paintPreviewTag(p);
        if (quip) quip.textContent = focusId ? shopLine(focusId) : SHOP_INTRO;
        dressPreview();
    }

    function show() {
        focusId = null;
        previewIds = {};
        root.classList.remove("hidden");
        refresh();
        startLoop();
    }

    function hide() {
        root.classList.add("hidden");
        stopLoop();
    }

    function isOpen() {
        return !root.classList.contains("hidden");
    }

    tabs.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-slot]");
        if (!btn) return;
        slot = btn.dataset.slot;
        focusId = null;
        refresh();
    });

    grid.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-id]");
        if (!btn) return;
        const id = btn.dataset.id;
        const p = getPersist();
        const item = itemsForSlot(slot).find((d) => d.id === id);
        if (!item) return;
        // Tapping the equipped card puts the saucer back to what it wears.
        if (p.cosmetics.equipped[slot] === id) {
            focusId = id;
            delete previewIds[slot];
            refresh();
            return;
        }
        // First tap: try it on. Second tap on the same card: commit.
        if (previewIds[slot] !== id) {
            focusId = id;
            previewIds[slot] = id;
            refresh();
            return;
        }
        focusId = id;
        if (ownedOrFree(p, item)) {
            onEquip(item);
        } else if (p.meteorite >= item.price) {
            onBuy(item);
        } else if (onDeny) {
            onDeny(item);
        }
        refresh();
    });

    root.querySelector("#shop-close").addEventListener("click", hide);
    window.addEventListener("resize", () => {
        if (isOpen()) fitPreview();
    });

    return { show, hide, refresh, isOpen };
}
