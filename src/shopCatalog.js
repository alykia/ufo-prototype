// Shop catalogue: every Cosmetic the title-screen Shop sells for Meteorite.
// Pure data. Cosmetics never touch gameplay numbers; meshes.js reads the
// `look` block to dress the 3D UFO.

export const SHOP_SLOTS = ["hull", "beamTint", "accessory"];

export const SLOT_META = {
    hull: { label: "HULLS", icon: "ufo" },
    beamTint: { label: "BEAMS", icon: "beam" },
    accessory: { label: "EXTRAS", icon: "shop-crown" },
};

export const SHOP_ITEMS = [
    // ---- Hulls -------------------------------------------------------------
    {
        id: "hull_standard", slot: "hull", label: "STANDARD", price: 0, icon: "ufo", swatch: "#c8d0d8",
        look: { hull: 0xc8d0d8, rim: 0x8a94a0, dome: 0x7ad8ff, engine: 0xe07a3a, domeOpacity: 1 },
    },
    {
        id: "hull_brass", slot: "hull", label: "BRASS ANTIQUE", price: 150, icon: "ufo", swatch: "#b8823a",
        look: { hull: 0xb8823a, rim: 0x6a4a1e, dome: 0xd8f0c0, engine: 0x8a5a2a, domeOpacity: 1, rivets: true },
    },
    {
        id: "hull_stealth", slot: "hull", label: "STEALTH BLACK", price: 200, icon: "ufo", swatch: "#1a1c22",
        look: { hull: 0x1a1c22, rim: 0xe0303a, dome: 0x40484f, engine: 0xe0303a, domeOpacity: 1 },
    },
    {
        id: "hull_candy", slot: "hull", label: "CANDY PINK", price: 200, icon: "ufo", swatch: "#ff7ac8",
        look: { hull: 0xff7ac8, rim: 0xffffff, dome: 0xffffff, engine: 0xffd0e8, domeOpacity: 1 },
    },
    {
        id: "hull_gold", slot: "hull", label: "GOLDEN SAUCER", price: 400, icon: "ufo", swatch: "#f0c040",
        look: { hull: 0xf0c040, rim: 0xfff0a0, dome: 0xfff6d0, engine: 0xffe08a, domeOpacity: 1, rivets: true },
    },

    // ---- Beam tints --------------------------------------------------------
    { id: "beam_green", slot: "beamTint", label: "GREEN", price: 0, icon: "shop-trail-green", swatch: "#9dff6a", look: { color: 0x9dff6a } },
    { id: "beam_cyan", slot: "beamTint", label: "CYAN", price: 80, icon: "shop-trail-blue", swatch: "#5ee6ff", look: { color: 0x5ee6ff } },
    { id: "beam_magenta", slot: "beamTint", label: "MAGENTA", price: 80, icon: "shop-trail-purple", swatch: "#ff5ad6", look: { color: 0xff5ad6 } },
    { id: "beam_amber", slot: "beamTint", label: "AMBER", price: 80, icon: "shop-trail-orange", swatch: "#ffb347", look: { color: 0xffb347 } },
    { id: "beam_rainbow", slot: "beamTint", label: "RAINBOW", price: 250, icon: "shop-rainbow", swatch: "linear-gradient(90deg,#ff5a5a,#ffd35a,#7aff7a,#5ad6ff,#c47aff)", look: { color: 0xff5a5a, rainbow: true } },

    // ---- Accessories -------------------------------------------------------
    { id: "acc_none", slot: "accessory", label: "NONE", price: 0, icon: "close", swatch: "#262a36", look: { kind: "none" } },
    { id: "acc_party_hat", slot: "accessory", label: "PARTY HAT", price: 60, icon: "shop-cone", swatch: "#ff6a8a", look: { kind: "partyHat" } },
    { id: "acc_propeller", slot: "accessory", label: "PROPELLER CAP", price: 80, icon: "shop-fan", swatch: "#4aa0ff", look: { kind: "propeller" } },
    { id: "acc_cowboy", slot: "accessory", label: "COWBOY HAT", price: 90, icon: "shop-hat", swatch: "#8a5a2a", look: { kind: "cowboy" } },
    { id: "acc_antenna", slot: "accessory", label: "BLINKING ANTENNA", price: 90, icon: "shop-dish", swatch: "#ff4a4a", look: { kind: "antenna" } },
    { id: "acc_cat_ears", slot: "accessory", label: "CAT EARS", price: 100, icon: "shop-paw", swatch: "#f0a0c0", look: { kind: "catEars" } },
    { id: "acc_fuzzy_dice", slot: "accessory", label: "FUZZY DICE", price: 100, icon: "shop-dice", swatch: "#ff5a5a", look: { kind: "fuzzyDice" } },
    { id: "acc_sticker", slot: "accessory", label: "BUMPER STICKER", price: 100, icon: "shop-note", swatch: "#ffe36a", look: { kind: "sticker" } },
    { id: "acc_crown", slot: "accessory", label: "TINY CROWN", price: 120, icon: "shop-crown", swatch: "#ffd35a", look: { kind: "crown" } },
];

export const SHOP_ITEM_BY_ID = Object.fromEntries(SHOP_ITEMS.map((d) => [d.id, d]));

export function itemsForSlot(slot) {
    return SHOP_ITEMS.filter((d) => d.slot === slot);
}

export function defaultEquipped() {
    return { hull: "hull_standard", beamTint: "beam_green", accessory: "acc_none" };
}

// Resolve an equipped map to the concrete `look` blocks meshes.js needs.
export function resolveLooks(equipped = defaultEquipped()) {
    const base = defaultEquipped();
    const pick = (slot) => SHOP_ITEM_BY_ID[equipped?.[slot]] || SHOP_ITEM_BY_ID[base[slot]];
    return {
        hull: pick("hull").look,
        beamTint: pick("beamTint").look,
        accessory: pick("accessory").look,
    };
}
