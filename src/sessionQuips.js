export function sessionQuip(ex, mapId = "farm") {
    const calls = ex.policeCalls || 0;
    const news = (ex.sessionNew || []).length;
    const over = Math.max(0, (ex.sessionResearch || 0) - (ex.quota || 0));
    const sit = [];

    if (calls === 0) {
        sit.push(
            "Zero sirens. Either we are invisible or Earth police are on lunch. Delightful.",
            "No law-cars. We abducted in peace. File this under 'professionalism, accidental'.",
            "The local alarm species never woke up. We are either stealthy or extremely boring.",
        );
    } else if (calls === 1) {
        sit.push(
            "They called the stripe-cars once. We left before the lecture about 'property'.",
            "One police summon. Cute. They think flashing lights are a negotiation.",
            "A single official vehicle arrived to discuss our hobbies. We declined.",
        );
    } else {
        sit.push(
            `${calls} calls to the shout-cars. Earth is very committed to interrupting science.`,
            `They phoned backup ${calls} times. At this point we are a community event.`,
            `${calls} police invitations. We did not RSVP. We never RSVP.`,
        );
    }

    if (news === 1) {
        sit.push("One brand-new lifeform catalogued. The clipboard is humming.");
    } else if (news >= 2) {
        sit.push(`${news} first-time specimens. The archive intern will need a bigger drawer.`);
    } else {
        sit.push("No new species, just familiar snacks. Science is 80 percent reruns.");
    }

    if (ex.goalReached) {
        sit.push("Shopping list complete. The High Council will pretend they were not hungry.");
    } else {
        sit.push("Quota first, grocery list later. Priorities: shiny rocks, then chickens.");
    }

    if (ex.maxSuspicion >= 90) {
        sit.push("Suspicion nearly cooked us. Next time we abduct quieter things. Like... quieter chickens.");
    } else if (ex.maxSuspicion < 40) {
        sit.push("Suspicion stayed polite. Earth still thinks we are weather.");
    }

    if (over >= 40) {
        sit.push(`We overshot Quota by ${over}. Greed is a valid research method.`);
    }

    if (mapId === "zoo") {
        sit.push("The zoo labeled everything. Very helpful. We labeled it 'ours'.");
    } else if (mapId === "town") {
        sit.push("Town specimens come with opinions and traffic. We kept the traffic.");
    } else {
        sit.push("Farm air smells like homework. We took the homework.");
    }

    const generic = [
        "Another successful grocery run. The ship smells like science and regret.",
        "Earth remains poorly guarded and excellently stocked. Recommend repeat visit.",
        "The specimens are screaming in several frequencies. That means it is working.",
        "Please do not tell the Council we named one. We named three.",
        "If the humans ask, we were a weather balloon with hobbies.",
        "Research complete. Dignity: optional. Samples: mandatory.",
        "We have learned nothing useful and everything delightful.",
        "The beam is sticky. The data is stickier. Do not lick the data.",
        "Note to self: chickens are not a currency. We checked. Twice.",
        "A fine haul. The fridge compartment has unionized.",
        "Earth: 1 planet, too many legs, not enough consent forms.",
        "We came for knowledge. We left with livestock. This is called a compromise.",
        "The High Council asked for 'nuance'. We brought a cow.",
        "Session rating: eight out of ten sirens. Would abduct again.",
        "All specimens have been promoted to 'in the ceiling now'.",
        "If it ran, we studied it. If it did not run, we studied it harder.",
        "The locals waved lights at us. We waved back with a barn.",
        "Conclusion: Earth is a buffet that learned to file a complaint.",
        "We remain undefeated by fences. Fences remain very theoretical.",
        "Pack it up. The universe is slightly more crowded and much louder.",
    ];

    const pool = sit.concat(generic);
    const seed = (ex.abducted || 0) * 17
        + (ex.sessionResearch || 0) * 3
        + calls * 41
        + news * 13
        + Math.floor((ex.elapsed || 0) * 10)
        + (ex.maxSuspicion || 0);
    return pool[Math.abs(Math.floor(seed)) % pool.length]
        || generic[0];
}
