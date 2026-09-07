// Every line the Bridge says during Onboarding.
// Voice rule: confidently wrong about Earth, never wrong about the controls.
// One idea per bubble. Keep each line under ~14 words where possible.

// mode:    "gate"  -> bubble stays until `waitFor` fires; world keeps running.
//          "pause" -> world frozen; tap (after the text finishes) or timer dismisses.
//          "note"  -> non-blocking; fades on its own.
// showOn:  the beat is not shown until this event has fired.
// waitFor: (gate only) the event that dismisses the bubble.
// place:   "high" (under the HUD, default), "mid" (below the Pickup cards),
//          "mgmt" (under the Management status row), "card" (centred).
export const TRAINING_BEATS = [
    {
        id: "welcome",
        mode: "pause",
        place: "card",
        line: "Welcome aboard, pilot. Earth: mostly water, weirdly confident. We are here to take samples.",
    },
    {
        id: "move",
        mode: "gate",
        waitFor: "moved",
        anchor: "joyzone",
        line: "Hold down here and drag. The saucer follows your finger. It is needy.",
    },
    {
        id: "beam",
        mode: "gate",
        waitFor: "abducted",
        anchor: "chicken",
        line: "Holding keeps the beam on. Park it over the feathery egg engine.",
    },
    {
        id: "pickup",
        mode: "pause",
        place: "mid",
        anchor: "#pickups",
        line: "Sample acquired. It is screaming. Screaming means fresh.",
    },
    {
        id: "goal",
        mode: "pause",
        anchor: "#goal-row",
        line: "The Council wants five of those. We asked why. They cried.",
    },
    {
        id: "quota",
        mode: "pause",
        anchor: "#quota-chip",
        line: "Fill this bar and we go home. Humans call this feeling 'Friday'.",
    },
    {
        id: "tooHeavy",
        mode: "pause",
        showOn: "tooHeavy",
        line: "Did not budge. Turns out cows are mostly cow. Upgrade the Core later.",
    },
    {
        id: "suspicion",
        mode: "pause",
        showOn: "suspicion",
        anchor: "#sus-row",
        line: "The eye is filling. Humans are noticing. Stop grabbing. Look innocent. You are a saucer. Try.",
    },
    {
        id: "extract",
        mode: "note",
        showOn: "extractReady",
        anchor: "#extract-btn",
        line: "That button leaves early. Quota sends us home anyway. Eye angry? Press it.",
    },
    {
        id: "management",
        mode: "gate",
        showOn: "management",
        waitFor: "hotspot",
        anchor: "hotspots",
        place: "mgmt",
        line: "Your saucer. Poke a glowing bit, give it Research, it grows. That is engineering.",
    },
    {
        id: "upgrade",
        mode: "gate",
        waitFor: "upgraded",
        anchor: "#upgrade-btn",
        place: "mgmt",
        line: "Now feed it. Research goes in. Bigger bit comes out. Science.",
    },
    {
        id: "next",
        mode: "gate",
        waitFor: "next",
        anchor: "#next-expedition",
        place: "mgmt",
        line: "Systems upgraded. Earth remains unaware. Let's go ruin that.",
    },
];

export const TRAINING_RESULT_LINE =
    "Back aboard. Research banked. Spend it before the Council remembers we have it.";

export const FLOOR_LINE =
    "The Council fronted us the difference. Do not mention it. Ever.";

export const SKIP_LABEL = "SKIP";

// One-shot Tips. `mode` follows the same rules as beats.
export const TIPS = {
    police: {
        mode: "pause",
        line: "Stripe-cars. They flash lights to say hello. It is not hello. Avoid.",
    },
    bigfoot: {
        mode: "pause",
        line: "Unknown lifeform. Large, hairy, unemployed. Grab it before it files a complaint.",
    },
    // detected / failed are spoken through the result screen's own Bridge
    // bubble the first time (see main.js resultQuip), not as a floating note.
    detected: {
        mode: "note",
        line: "Surrounded. Humans love circles. Next time, fewer barns. Research still banked.",
    },
    failed: {
        mode: "note",
        line: "Left before Quota. The Council calls this 'strategic'. They are being kind.",
    },
    townUnlocked: {
        mode: "note",
        line: "A Town. Denser humans, taller boxes, more opinions. Pick it from the menu.",
    },
    zooUnlocked: {
        mode: "note",
        line: "A Zoo. Earth pre-sorted its animals for us. Very considerate. Pick it from the menu.",
    },
    scannerGlow: {
        mode: "note",
        line: "Gold outline means expensive. Expensive means the Council smiles. Grab the gold.",
    },
    menuReveal: {
        mode: "note",
        anchor: "#menu-tools",
        place: "low",
        line: "New buttons. We found them in a drawer.",
    },
};
