// Bridge copy for the Shop. One idea per line, ~14 words, confidently wrong
// about Earth and always right about the saucer. Keyed by shop item id.

export const SHOP_LINES = {
    // Hulls
    hull_standard: "Factory plating. Reliable, grey, and invisible to Earth weather reporters.",
    hull_brass: "Antique Earth metal. Humans keep it on doors. We keep it on saucers.",
    hull_stealth: "Matte black with a red rim. Earth calls this 'a very fast car'.",
    hull_candy: "Pink and glossy. Earth children will assume we are a dessert.",
    hull_gold: "Solid gold plating. The Council cannot see it, so it counts as savings.",

    // Beam tints
    beam_green: "Standard green. Earth cows find it soothing. Probably.",
    beam_cyan: "Cyan beam. Looks like water. Earth fish will volunteer.",
    beam_magenta: "Magenta beam. Humans will think it is a concert. They love concerts.",
    beam_amber: "Amber beam. Earth uses this colour to mean 'slow down'. We will not.",
    beam_rainbow: "All colours at once. Earth believes rainbows end in gold. We end in chickens.",

    // Accessories
    acc_none: "Nothing on the dome. Clean lines. The Council approves of nothing.",
    acc_party_hat: "Earth headgear for celebrations. Every Abduction is a celebration.",
    acc_propeller: "Earth hat with a fan. It does not help us fly. We fly anyway.",
    acc_cowboy: "Earth headgear for herding cows. We will herd them upward.",
    acc_antenna: "Blinks red. Earth thinks blinking red means important. Correct.",
    acc_cat_ears: "Earth cats are small, judgmental, and in charge. We wish to blend in.",
    acc_fuzzy_dice: "Earth pilots hang these for luck. Our luck is a beam. Still, nice.",
    acc_sticker: "It reads: MY OTHER SHIP IS A MOTHERSHIP. Humans will not get it.",
    acc_crown: "Tiny Earth crown. Whoever wears it is in charge. Now we are in charge.",
};

export const SHOP_INTRO = "Meteorite buys decorations. Decorations do nothing. We want them anyway.";

export function shopLine(id) {
    return SHOP_LINES[id] || "Classification pending. It is shiny.";
}
