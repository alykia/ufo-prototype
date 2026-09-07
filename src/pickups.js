import { BALANCE } from "./balance.js";

function hex(n) {
    return `#${n.toString(16).padStart(6, "0")}`;
}

function iconSvg(def) {
    const c = hex(def.colour);
    const art = {
        trash: `<rect x="13" y="14" width="18" height="20" rx="3" fill="${c}"/><rect x="11" y="12" width="22" height="5" rx="2" fill="#4a5058"/>`,
        gnome: `<rect x="16" y="20" width="12" height="12" fill="${c}"/><circle cx="22" cy="18" r="5" fill="#e0b090"/><polygon points="22,6 30,20 14,20" fill="#c03030"/>`,
        mailbox: `<rect x="20" y="22" width="4" height="14" fill="#888"/><rect x="12" y="12" width="20" height="12" rx="2" fill="${c}"/>`,
        frog: `<ellipse cx="22" cy="26" rx="12" ry="8" fill="${c}"/><circle cx="16" cy="16" r="5" fill="${c}"/><circle cx="28" cy="16" r="5" fill="${c}"/>`,
        chicken: `<ellipse cx="18" cy="26" rx="10" ry="8" fill="${c}"/><circle cx="28" cy="18" r="6" fill="${c}"/><polygon points="33,18 40,20 33,22" fill="#e07a3a"/><rect x="26" y="10" width="4" height="5" fill="#c03030"/>`,
        cat: `<ellipse cx="22" cy="26" rx="12" ry="7" fill="${c}"/><circle cx="30" cy="18" r="6" fill="${c}"/><polygon points="25,14 26,8 30,14" fill="${c}"/>`,
        dog: `<ellipse cx="20" cy="26" rx="11" ry="7" fill="${c}"/><rect x="26" y="16" width="10" height="8" rx="3" fill="${c}"/>`,
        sheep: `<ellipse cx="22" cy="24" rx="13" ry="9" fill="${c}"/><circle cx="32" cy="22" r="5" fill="#3a3028"/>`,
        wheelbarrow: `<rect x="10" y="18" width="22" height="8" fill="${c}"/><circle cx="30" cy="30" r="6" fill="#333"/>`,
        cow: `<ellipse cx="20" cy="24" rx="13" ry="9" fill="${c}"/><rect x="28" y="16" width="10" height="8" rx="2" fill="${c}"/><rect x="34" y="14" width="3" height="4" fill="#222"/>`,
        deer: `<ellipse cx="20" cy="26" rx="11" ry="7" fill="${c}"/><rect x="28" y="16" width="8" height="8" fill="${c}"/><path d="M30 16 L28 8 L32 12 L36 8 L34 16" stroke="${c}" fill="none" stroke-width="2"/>`,
        human: `<circle cx="22" cy="12" r="6" fill="#e0b090"/><rect x="16" y="18" width="12" height="16" rx="4" fill="${c}"/>`,
        motorcycle: `<rect x="10" y="18" width="24" height="6" fill="${c}"/><circle cx="14" cy="30" r="6" fill="#222"/><circle cx="32" cy="30" r="6" fill="#222"/>`,
        horse: `<ellipse cx="18" cy="26" rx="12" ry="8" fill="${c}"/><rect x="26" y="14" width="10" height="10" fill="${c}"/>`,
        car: `<rect x="6" y="20" width="32" height="10" rx="2" fill="${c}"/><rect x="12" y="14" width="16" height="8" fill="#88b4d0"/><circle cx="14" cy="32" r="5" fill="#222"/><circle cx="30" cy="32" r="5" fill="#222"/>`,
        tractor: `<rect x="8" y="16" width="20" height="12" fill="${c}"/><rect x="24" y="10" width="10" height="10" fill="#3a6ea8"/><circle cx="14" cy="32" r="7" fill="#333"/><circle cx="30" cy="30" r="5" fill="#333"/>`,
        van: `<rect x="6" y="12" width="32" height="18" rx="2" fill="${c}"/><rect x="8" y="14" width="8" height="8" fill="#88b4d0"/><circle cx="14" cy="34" r="5" fill="#222"/><circle cx="30" cy="34" r="5" fill="#222"/>`,
        house: `<rect x="10" y="20" width="24" height="16" fill="${c}"/><polygon points="8,20 22,8 36,20" fill="#6a4030"/>`,
        barn: `<rect x="8" y="18" width="28" height="18" fill="${c}"/><polygon points="6,18 22,6 38,18" fill="#5a2a22"/>`,
        theatre: `<rect x="8" y="16" width="28" height="20" fill="${c}"/><rect x="16" y="8" width="12" height="8" fill="#d6c26a"/>`,
        mall: `<rect x="6" y="14" width="18" height="22" fill="${c}"/><rect x="22" y="8" width="16" height="28" fill="#3a5268"/>`,
        bigfoot: `<rect x="16" y="16" width="12" height="18" rx="4" fill="${c}"/><circle cx="22" cy="12" r="6" fill="${c}"/>`,
        hydrant: `<rect x="19" y="14" width="6" height="20" rx="2" fill="${c}"/><rect x="14" y="18" width="16" height="4" fill="${c}"/><rect x="18" y="10" width="8" height="5" rx="2" fill="#8a2020"/>`,
        bench: `<rect x="8" y="20" width="28" height="5" fill="${c}"/><rect x="8" y="14" width="28" height="4" fill="#4a3a28"/><rect x="9" y="25" width="3" height="8" fill="#4a3a28"/><rect x="32" y="25" width="3" height="8" fill="#4a3a28"/>`,
        pedestrian: `<circle cx="22" cy="12" r="6" fill="#e0b090"/><rect x="16" y="18" width="12" height="16" rx="4" fill="${c}"/>`,
        taxi: `<rect x="6" y="20" width="32" height="10" rx="2" fill="${c}"/><rect x="12" y="14" width="16" height="8" fill="#222"/><rect x="18" y="10" width="8" height="5" fill="${c}"/><circle cx="14" cy="32" r="5" fill="#222"/><circle cx="30" cy="32" r="5" fill="#222"/>`,
        sedan: `<rect x="6" y="20" width="32" height="10" rx="2" fill="${c}"/><rect x="12" y="14" width="16" height="8" fill="#88b4d0"/><circle cx="14" cy="32" r="5" fill="#222"/><circle cx="30" cy="32" r="5" fill="#222"/>`,
        bus: `<rect x="4" y="10" width="36" height="20" rx="2" fill="${c}"/><rect x="8" y="14" width="8" height="8" fill="#88b4d0"/><rect x="18" y="14" width="8" height="8" fill="#88b4d0"/><circle cx="12" cy="34" r="5" fill="#222"/><circle cx="32" cy="34" r="5" fill="#222"/>`,
        firetruck: `<rect x="4" y="16" width="36" height="14" rx="2" fill="${c}"/><rect x="8" y="10" width="12" height="8" fill="#222"/><rect x="26" y="8" width="8" height="10" fill="#c8c8c8"/><circle cx="12" cy="34" r="5" fill="#222"/><circle cx="32" cy="34" r="5" fill="#222"/>`,
        bungalow: `<rect x="8" y="22" width="28" height="14" fill="${c}"/><polygon points="6,22 22,10 38,22" fill="#6a4030"/>`,
        shop: `<rect x="8" y="16" width="28" height="20" fill="${c}"/><rect x="12" y="22" width="10" height="14" fill="#88b4d0"/><rect x="24" y="8" width="8" height="8" fill="#d6ff6a"/>`,
        townhouse: `<rect x="12" y="10" width="20" height="26" fill="${c}"/><polygon points="10,10 22,2 34,10" fill="#5a2a22"/>`,
        apartment: `<rect x="10" y="6" width="24" height="32" fill="${c}"/><rect x="14" y="10" width="6" height="6" fill="#88b4d0"/><rect x="24" y="10" width="6" height="6" fill="#88b4d0"/><rect x="14" y="20" width="6" height="6" fill="#88b4d0"/>`,
        office: `<rect x="10" y="4" width="24" height="34" fill="${c}"/><rect x="14" y="8" width="16" height="4" fill="#88b4d0"/><rect x="14" y="16" width="16" height="4" fill="#88b4d0"/><rect x="14" y="24" width="16" height="4" fill="#88b4d0"/>`,
        penguin: `<ellipse cx="22" cy="26" rx="8" ry="12" fill="${c}"/><ellipse cx="22" cy="28" rx="5" ry="8" fill="#f4f4f4"/><circle cx="22" cy="12" r="5" fill="${c}"/><polygon points="22,14 28,16 22,17" fill="#e07a3a"/>`,
        seal: `<ellipse cx="20" cy="24" rx="13" ry="8" fill="${c}"/><ellipse cx="32" cy="22" rx="6" ry="5" fill="${c}"/>`,
        polarbear: `<ellipse cx="20" cy="24" rx="13" ry="9" fill="${c}"/><circle cx="32" cy="18" r="6" fill="${c}"/>`,
        meerkat: `<rect x="18" y="16" width="8" height="18" rx="3" fill="${c}"/><circle cx="22" cy="12" r="5" fill="${c}"/>`,
        flamingo: `<rect x="20" y="16" width="3" height="20" fill="${c}"/><ellipse cx="26" cy="14" rx="8" ry="5" fill="${c}"/><circle cx="32" cy="12" r="3" fill="${c}"/>`,
        zebra: `<ellipse cx="18" cy="26" rx="12" ry="8" fill="${c}"/><rect x="26" y="14" width="10" height="10" fill="#222"/><rect x="14" y="20" width="4" height="10" fill="#222"/>`,
        lion: `<ellipse cx="18" cy="26" rx="12" ry="8" fill="${c}"/><circle cx="30" cy="18" r="8" fill="#b8860b"/>`,
        giraffe: `<rect x="12" y="24" width="16" height="12" fill="${c}"/><rect x="24" y="6" width="5" height="22" fill="${c}"/><rect x="22" y="4" width="12" height="8" fill="${c}"/>`,
        elephant: `<ellipse cx="18" cy="24" rx="13" ry="10" fill="${c}"/><rect x="28" y="16" width="10" height="10" fill="${c}"/><path d="M32 24 C36 30 34 36 30 34" stroke="${c}" fill="none" stroke-width="3"/>`,
        monkey: `<ellipse cx="22" cy="26" rx="9" ry="8" fill="${c}"/><circle cx="22" cy="14" r="6" fill="#e0b090"/>`,
        panda: `<ellipse cx="22" cy="24" rx="12" ry="10" fill="${c}"/><circle cx="16" cy="16" r="4" fill="#222"/><circle cx="28" cy="16" r="4" fill="#222"/>`,
        gorilla: `<rect x="14" y="16" width="16" height="18" rx="5" fill="${c}"/><circle cx="22" cy="12" r="7" fill="${c}"/>`,
        hippo: `<ellipse cx="18" cy="24" rx="13" ry="9" fill="${c}"/><rect x="28" y="18" width="12" height="8" rx="3" fill="${c}"/>`,
        visitor: `<circle cx="22" cy="12" r="6" fill="#e0b090"/><rect x="16" y="18" width="12" height="16" rx="4" fill="${c}"/>`,
        tram: `<rect x="4" y="14" width="36" height="16" rx="3" fill="${c}"/><rect x="8" y="18" width="10" height="8" fill="#88b4d0"/><rect x="22" y="18" width="10" height="8" fill="#88b4d0"/><circle cx="12" cy="34" r="4" fill="#222"/><circle cx="32" cy="34" r="4" fill="#222"/>`,
        giftshop: `<rect x="8" y="16" width="28" height="20" fill="${c}"/><polygon points="6,16 22,6 38,16" fill="#8a2a22"/><rect x="18" y="24" width="8" height="12" fill="#88b4d0"/>`,
        gate: `<rect x="8" y="10" width="5" height="26" fill="${c}"/><rect x="31" y="10" width="5" height="26" fill="${c}"/><rect x="8" y="12" width="28" height="5" fill="#8a8a70"/>`,
    };
    return `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">${art[def.id] || `<rect x="10" y="10" width="24" height="24" rx="4" fill="${c}"/>`}</svg>`;
}

export function specimenIcon(def) {
    return iconSvg(def || { id: "?", colour: 0x333333 });
}

function flaskSvg() {
    return `<svg class="pickup-flask" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 2h6v2h-1.2v4.4l5.3 9.6A3.2 3.2 0 0 1 16.3 23H7.7a3.2 3.2 0 0 1-2.8-4.9l5.3-9.6V4H9V2z" fill="#3ec8ff"/>
      <path d="M8.2 16.2h7.6c.6 1.2.5 2.6-.4 3.6H8.6c-.9-1-.9-2.4-.4-3.6z" fill="#7adcff"/>
    </svg>`;
}

function rarityOf(def) {
    return def?.rarity || "common";
}

function holdSeconds(def, queued) {
    const rush = queued >= BALANCE.pickupRushAt;
    const rarity = rarityOf(def);
    if (rarity === "rare") return rush ? BALANCE.pickupRushRare : BALANCE.pickupHoldRare;
    if (rarity === "uncommon") return rush ? BALANCE.pickupRushUncommon : BALANCE.pickupHoldUncommon;
    return rush ? BALANCE.pickupRushCommon : BALANCE.pickupHoldCommon;
}

function cardHtml(def) {
    const rarity = rarityOf(def);
    return `
      <div class="pickup-glow"><div class="pickup-glow-tex"></div></div>
      <div class="pickup-art">${iconSvg(def)}</div>
      <div class="pickup-caption">
        <div class="pickup-name">${def.label}</div>
        <div class="pickup-gain"><span>+${def.researchValue}</span>${flaskSvg()}</div>
      </div>
    `.trim();
}

export function bindPickups(root) {
    root.innerHTML = `
      <div class="pickup-track">
        <div class="pickup-card peek prev empty"></div>
        <div class="pickup-card main empty"></div>
        <div class="pickup-card peek next empty"></div>
      </div>
      <div class="pickup-reel" aria-hidden="true"></div>
    `;
    const prevEl = root.querySelector(".pickup-card.prev");
    const mainEl = root.querySelector(".pickup-card.main");
    const nextEl = root.querySelector(".pickup-card.next");
    const reelEl = root.querySelector(".pickup-reel");

    const queue = [];
    let current = null;
    let previous = null;
    let holdTimer = 0;
    let hideTimer = 0;
    let busy = false;

    function paint(el, def, extraClass = "") {
        el.className = `pickup-card ${extraClass}`.trim();
        if (!def) {
            el.classList.add("empty");
            el.innerHTML = "";
            return;
        }
        el.classList.add(`rarity-${rarityOf(def)}`);
        el.innerHTML = cardHtml(def);
    }

    function slamReel(def) {
        const line = document.createElement("div");
        line.className = "pickup-reel-line";
        line.textContent = def.label;
        reelEl.appendChild(line);
        while (reelEl.children.length > 3) reelEl.firstElementChild.remove();
        for (const child of reelEl.children) {
            child.classList.remove("now");
            child.classList.add("past");
        }
        line.classList.remove("past");
        line.classList.add("now");
    }

    function syncPeek() {
        paint(nextEl, queue[0] || null, "peek next");
        if (queue[0]) nextEl.classList.add("armed");
    }

    function hide() {
        root.classList.add("hidden");
        root.classList.remove("rush", "holding-rare", "holding-uncommon");
        paint(prevEl, null, "peek prev");
        paint(mainEl, null, "main");
        paint(nextEl, null, "peek next");
        reelEl.replaceChildren();
        current = null;
        previous = null;
        busy = false;
    }

    function present(def) {
        const rushing = queue.length >= BALANCE.pickupRushAt;
        root.classList.remove("hidden");
        root.classList.toggle("rush", rushing);
        root.classList.toggle("holding-rare", rarityOf(def) === "rare");
        root.classList.toggle("holding-uncommon", rarityOf(def) === "uncommon");

        if (!previous) paint(prevEl, null, "peek prev");
        paint(mainEl, def, "main");
        mainEl.classList.remove("slam");
        void mainEl.offsetWidth;
        mainEl.classList.add("slam");
        slamReel(def);
        syncPeek();

        clearTimeout(holdTimer);
        holdTimer = window.setTimeout(advance, holdSeconds(def, queue.length) * 1000);
    }

    function advance() {
        if (!queue.length) {
            busy = false;
            current = null;
            clearTimeout(hideTimer);
            hideTimer = window.setTimeout(hide, 160);
            return;
        }
        previous = current;
        current = queue.shift();
        busy = true;
        if (previous) {
            paint(prevEl, previous, "peek prev exiting");
        }
        present(current);
    }

    function show(def) {
        if (!def) return;
        clearTimeout(hideTimer);
        queue.push(def);
        syncPeek();
        if (!busy && !current) {
            advance();
            return;
        }
        if (current && rarityOf(current) === "common" && queue.length >= BALANCE.pickupRushAt) {
            clearTimeout(holdTimer);
            holdTimer = window.setTimeout(advance, BALANCE.pickupRushCommon * 1000);
        }
    }

    function clear() {
        queue.length = 0;
        clearTimeout(holdTimer);
        clearTimeout(hideTimer);
        hide();
    }

    root.classList.add("hidden");
    root.addEventListener("queue-pickup", (ev) => {
        if (ev.detail) show(ev.detail);
    });
    return { show, clear };
}
