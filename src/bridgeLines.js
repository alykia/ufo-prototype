// Every line the Bridge says during Onboarding.
// Voice rule: confidently wrong about Earth, never wrong about the controls.
// One idea per bubble. Keep each line under ~14 words where possible.

// mode:    "gate"  -> bubble stays until `waitFor` fires; world keeps running.
//          "pause" -> world frozen; tap (after the text finishes) or timer dismisses.
//          "note"  -> non-blocking; fades on its own.
// showOn:  the beat is not shown until this event has fired.
// waitFor: (gate only) the event that dismisses the bubble.
// delayMs: wait this long after showOn fires before the bubble appears.
// place:   "high" (under the HUD, default), "mid" (below the Pickup cards),
//          "mgmt" (under the Management status row), "low" (bottom), "card" (centred).
export const TRAINING_BEATS = [
    {
        id: "welcome",
        mode: "pause",
        place: "card",
        line: "Welcome, pilot. We steal Earth's animals. They call it a farm. Tap to begin.",
    },
    {
        id: "move",
        mode: "gate",
        waitFor: "moved",
        anchor: "joyzone",
        line: "Hold here and drag. The saucer follows your finger. It is clingy.",
    },
    {
        id: "beam",
        mode: "gate",
        waitFor: "abducted",
        anchor: "chicken",
        line: "Keep holding. Hover over a chicken until it flies into the saucer.",
    },
    {
        id: "pickup",
        mode: "pause",
        place: "mid",
        anchor: "#pickups",
        line: "Got one. That card is your catch. Grab more chickens.",
    },
    {
        id: "goal",
        mode: "pause",
        anchor: "#goal-row",
        line: "This row wants five chickens. Fill it. The Council will not explain why.",
    },
    {
        id: "quota",
        mode: "pause",
        anchor: "#quota-chip",
        line: "Fill this green bar to finish the run. Then we leave. Humans call that Friday.",
    },
    {
        id: "tooHeavy",
        mode: "pause",
        showOn: "tooHeavy",
        line: "Too heavy. Leave the cow. Upgrade Core later to lift bigger things.",
    },
    {
        id: "suspicion",
        mode: "pause",
        showOn: "suspicion",
        anchor: "#sus-row",
        line: "That eye is filling. Stop beaming or humans call the stripe-cars.",
    },
    {
        // First success screen: point at the (i) next to a NEW specimen.
        // Arrives a beat after the panel so the result line is read first.
        // CONTINUE also clears it (see onboarding.js "management").
        id: "discovery",
        mode: "gate",
        showOn: "resultShown",
        waitFor: "infoOpened",
        delayMs: 1600,
        anchor: "#research-list .research-info-btn",
        place: "low",
        line: "New find. Tap the blue (i) to read our notes. Some of them are true.",
    },
    {
        id: "management",
        mode: "gate",
        showOn: "management",
        waitFor: "hotspot",
        anchor: "hotspots",
        place: "mgmt",
        line: "Tap a label on the saucer. Then spend Research to upgrade that part.",
    },
    {
        id: "upgrade",
        mode: "gate",
        waitFor: "upgraded",
        anchor: "#upgrade-btn",
        place: "mgmt",
        line: "Tap UPGRADE. Research goes in. That part gets stronger. We call it science.",
    },
    {
        id: "next",
        mode: "gate",
        waitFor: "next",
        anchor: "#next-expedition",
        place: "mgmt",
        line: "Good. Tap NEXT EXPEDITION to go back to Earth. They still have chickens.",
    },
];

export const TRAINING_RESULT_LINE =
    "Research is banked. Spend it on the saucer before the Council notices.";

export const FLOOR_LINE =
    "We topped up your Research so you can upgrade. Do not tell the Council.";

export const SKIP_LABEL = "SKIP";

// One-shot Tips. `mode` follows the same rules as beats.
export const TIPS = {
    police: {
        mode: "pause",
        line: "Police. Do not let them surround you. Fly away. The lights are not a greeting.",
    },
    bigfoot: {
        mode: "pause",
        line: "Rare creature. Grab it now. Large, hairy, and writing a complaint.",
    },
    // detected / failed are spoken through the result screen's own Bridge
    // bubble the first time (see main.js resultQuip), not as a floating note.
    detected: {
        mode: "note",
        line: "Caught. Nothing banked. Next time, beam less when the eye is full.",
    },
    failed: {
        mode: "note",
        line: "You left before the bar was full. Nothing banked. Hit RETRY.",
    },
    townUnlocked: {
        mode: "note",
        line: "Town unlocked. Pick TOWN on the menu. More humans. More snacks.",
    },
    zooUnlocked: {
        mode: "note",
        line: "Zoo unlocked. Pick ZOO on the menu. Earth already sorted the animals.",
    },
    scannerGlow: {
        mode: "note",
        line: "Gold glow means high value. Grab those first. The Council likes expensive.",
    },
    refit: {
        mode: "note",
        place: "mid",
        line: "Refit approved. New lights on the saucer. Decorative. Do not tell the Council.",
    },
    menuReveal: {
        mode: "note",
        anchor: "#menu-tools",
        place: "low",
        line: "New buttons: Index, Shop, Settings. We found them in a drawer.",
    },
};
