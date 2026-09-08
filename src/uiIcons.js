import { ICON_SVG } from "./iconData.js";

export const ICON = {
    research: "research",
    suspicion: "suspicion",
    settings: "settings",
    ufo: "ufo",
    warning: "warning",
    check: "check",
    info: "info",
    close: "close",
    sound: "sound",
    soundOff: "sound-off",
    lock: "lock",
    index: "index",
    shop: "shop",
    farm: "map-farm",
    town: "map-town",
    zoo: "map-zoo",
    core: "core",
    beam: "beam",
    cloak: "cloak",
    scanner: "scanner",
    propulsion: "engines",
    engines: "engines",
    upgrade: "upgrade",
    quest: "quest",
    trophy: "trophy",
    alert: "alert",
    stats: "stats",
    star: "star",
    police: "police",
    meteorite: "meteorite",
};

const SPECIMEN_ICON = {
    mailbox: "spec-mailbox",
    hydrant: "spec-hydrant",
    car: "spec-car",
    sedan: "spec-sedan",
    firetruck: "spec-firetruck",
    bus: "spec-bus",
    human: "spec-human",
    pedestrian: "spec-human",
    visitor: "spec-human",
    trash: "spec-trash",
    barn: "spec-barn",
    house: "spec-house",
    bungalow: "spec-bungalow",
    townhouse: "spec-townhouse",
    shop: "spec-shop",
    giftshop: "spec-giftshop",
    bench: "spec-bench",
    gate: "spec-gate",
    theatre: "spec-theatre",
    van: "spec-van",
    tram: "spec-tram",
    mall: "spec-mall",
    supermarket: "spec-supermarket",
};

const SPECIMEN_EMOJI = {
    frog: "🐸",
    chicken: "🐔",
    cat: "🐱",
    dog: "🐶",
    sheep: "🐑",
    cow: "🐄",
    deer: "🦌",
    horse: "🐴",
    bigfoot: "🦶",
    penguin: "🐧",
    seal: "🦭",
    polarbear: "🐻‍❄️",
    meerkat: "🐿️",
    flamingo: "🦩",
    zebra: "🦓",
    lion: "🦁",
    giraffe: "🦒",
    elephant: "🐘",
    monkey: "🐵",
    panda: "🐼",
    gorilla: "🦍",
    hippo: "🦛",
    motorcycle: "🏍️",
    tractor: "🚜",
    apartment: "🏙️",
    office: "🏢",
};

export function specimenEmoji(id) {
    return SPECIMEN_EMOJI[id] || null;
}

export const MAP_ICON = {
    farm: ICON.farm,
    town: ICON.town,
    zoo: ICON.zoo,
};

function resolveName(name) {
    return ICON[name] || name;
}

export function iconSrc(name) {
    const file = resolveName(name);
    const raw = ICON_SVG[file];
    if (!raw) return "";
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raw)}`;
}

export function uiIcon(name, extraClass = "", label = "") {
    const src = iconSrc(name);
    if (!src) return "";
    const alt = label ? ` alt="${label}"` : ` alt=""`;
    return `<img class="ui-icon ${extraClass}" src="${src}"${alt} draggable="false" />`;
}

export function specimenVectorSrc(id) {
    const file = SPECIMEN_ICON[id];
    return file ? iconSrc(file) : null;
}

export function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((el) => {
        const src = iconSrc(el.dataset.icon);
        if (!src) return;
        if (el.tagName === "IMG") {
            el.src = src;
            return;
        }
        el.innerHTML = uiIcon(el.dataset.icon, el.className.replace(/\bui-icon\b/g, "").trim());
    });
}
