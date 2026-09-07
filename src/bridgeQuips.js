// The Bridge's one-line report on every result screen.
// Same seeded pick as before so the same run shows the same line;
// pools branch on ex.result: "success" | "failed" | "detected".

function policeLines(calls) {
    if (calls === 0) {
        return [
            "Zero sirens. Earth police were asleep or on lunch. Same thing.",
            "No law-cars. We abducted in peace. Accidental professionalism.",
            "The alarm species never woke up. We are stealthy or boring. Both work.",
        ];
    }
    if (calls === 1) {
        return [
            "One police call. They flashed lights at us. We flashed a barn back.",
            "One stripe-car. Cute. They think blinking is a negotiation.",
            "A single official vehicle came to discuss our hobbies. We declined.",
        ];
    }
    return [
        `${calls} police calls. Earth is very committed to interrupting science.`,
        `Backup phoned ${calls} times. We are a community event now.`,
        `${calls} police invitations. We never RSVP.`,
    ];
}

function newsLines(news) {
    if (news === 1) return ["One new lifeform catalogued. The clipboard is humming."];
    if (news >= 2) return [`${news} new specimens. The archive intern needs a bigger drawer.`];
    return ["No new species. Just reruns. Science is mostly reruns."];
}

function mapLines(mapId) {
    if (mapId === "zoo") return ["The zoo labelled everything. Helpful. We relabelled it 'ours'."];
    if (mapId === "town") return ["Town specimens come with opinions and traffic. We kept the traffic."];
    return ["Farm air smells like homework. We took the homework."];
}

const SUCCESS_GENERIC = [
    "Another grocery run. The ship smells like science and regret.",
    "Earth: poorly guarded, excellently stocked. Recommend repeat visit.",
    "The specimens are screaming in several frequencies. It is working.",
    "Do not tell the Council we named one. We named three.",
    "If asked, we were a weather balloon with hobbies.",
    "Research complete. Dignity optional. Samples mandatory.",
    "We learned nothing useful and everything delightful.",
    "The beam is sticky. The data is stickier. Do not lick the data.",
    "Chickens are not a currency. We checked. Twice.",
    "The fridge compartment has unionised.",
    "Earth: one planet, too many legs, not enough consent forms.",
    "We came for knowledge. We left with livestock. Compromise.",
    "The Council asked for nuance. We brought a cow.",
    "Eight out of ten sirens. Would abduct again.",
    "All specimens promoted to 'in the ceiling now'.",
    "If it ran, we studied it. If it did not, we studied it harder.",
    "Locals waved lights at us. We waved back with a barn.",
    "Earth is a buffet that learned to file a complaint.",
    "Fences remain theoretical. We remain undefeated.",
    "Pack it up. The universe is slightly louder now.",
];

const FAILED_GENERIC = [
    "Left before Quota. The Council calls this 'strategic'. The Council is kind.",
    "Quota missed. The fridge is judging us. The fridge is right.",
    "A short trip. Humans call this 'popping out'. We call it 'popping out'.",
    "We left early. Earth will assume we were shy. Earth is half right.",
    "Not enough samples. The Council will make the disappointed noise.",
    "Under Quota. Still banked. Still counts. Do not tell the intern.",
];

const DETECTED_GENERIC = [
    "Surrounded. The stripe-cars formed a circle. Humans love circles.",
    "We were spotted. Next time, fewer barns.",
    "Detected. The saucer is not subtle. Neither are we. Lesson noted.",
    "Earth noticed us. Rude of them. Research still banked.",
    "Five stripe-cars. A parade, technically. We did not wave.",
    "The eye filled up. We filled up. Everyone is full. Nobody is happy.",
];

function situational(ex, mapId) {
    const calls = ex.policeCalls || 0;
    const news = (ex.sessionNew || []).length;
    const over = Math.max(0, (ex.sessionResearch || 0) - (ex.quota || 0));
    const sit = [...policeLines(calls), ...newsLines(news), ...mapLines(mapId)];

    if (ex.result === "success") {
        sit.push(ex.goalReached
            ? "Shopping list complete. The Council will pretend they were not hungry."
            : "Quota first, shopping list later. Priorities: shiny rocks, then chickens.");
        if (ex.maxSuspicion >= 90) sit.push("Suspicion nearly cooked us. Next time: quieter chickens.");
        else if (ex.maxSuspicion < 40) sit.push("Suspicion stayed polite. Earth still thinks we are weather.");
        if (over >= 40) sit.push(`Overshot Quota by ${over}. Greed is a valid research method.`);
    } else if (ex.result === "detected") {
        if ((ex.abducted || 0) === 0) sit.push("Caught with nothing. Humans call this 'loitering'.");
        if (ex.goalReached) sit.push("Shopping list done, then arrested. Balanced.");
    } else {
        const pct = ex.quota ? Math.round(((ex.sessionResearch || 0) / ex.quota) * 100) : 0;
        if (pct >= 75) sit.push(`${pct} percent of Quota. So close the Council could smell it.`);
        if (ex.maxSuspicion >= 75) sit.push("We left because the eye got angry. Correct. Cowardly, but correct.");
    }
    return sit;
}

export function bridgeQuip(ex, mapId = "farm") {
    const generic = ex.result === "detected"
        ? DETECTED_GENERIC
        : ex.result === "failed"
            ? FAILED_GENERIC
            : SUCCESS_GENERIC;
    const pool = situational(ex, mapId).concat(generic);
    const seed = (ex.abducted || 0) * 17
        + (ex.sessionResearch || 0) * 3
        + (ex.policeCalls || 0) * 41
        + (ex.sessionNew || []).length * 13
        + Math.floor((ex.elapsed || 0) * 10)
        + (ex.maxSuspicion || 0);
    return pool[Math.abs(Math.floor(seed)) % pool.length] || generic[0];
}
