import { SKIP_LABEL, TIPS, TRAINING_BEATS } from "./bridgeLines.js";

// Shared alien avatar. Also used on the result screens.
export const ALIEN_SVG = `
<svg viewBox="0 0 72 80" xmlns="http://www.w3.org/2000/svg">
  <g class="alien-body" fill="#7adf4a" stroke="#111" stroke-width="0.7" stroke-linejoin="round">
    <path d="M21 18 L12 8" fill="none" stroke-linecap="round"/>
    <circle cx="9" cy="6" r="5.4"/>
    <path d="M51 18 L60 8" fill="none" stroke-linecap="round"/>
    <circle cx="63" cy="6" r="5.4"/>
    <path d="M36 13 C18 13 10 24 11 41 C12 58 24 73 36 77 C48 73 60 58 61 41 C62 24 54 13 36 13 Z"/>
  </g>
  <ellipse cx="24" cy="42" rx="8.6" ry="11.2" transform="rotate(-32 24 42)" fill="#111"/>
  <ellipse cx="48" cy="42" rx="8.6" ry="11.2" transform="rotate(32 48 42)" fill="#111"/>
  <ellipse class="alien-mouth" cx="36" cy="64" rx="6.2" ry="4.4" fill="#111"/>
</svg>`.trim();

const TYPE_CPS = 30;
const PAUSE_AUTO_MS = 4500;
const NOTE_AUTO_MS = 3000;
const MOVE_HOLD_S = 0.8;

/**
 * Bridge-guided Onboarding: Training Expedition beats plus one-shot Tips.
 *
 * Modes:
 *  gate  - bubble stays until `waitFor` fires; world keeps running.
 *  pause - world held via holdWorld(true); tap after text or a timer dismisses.
 *  note  - non-blocking; auto-dismisses.
 */
export function bindOnboarding({ stage, root, ring, dim, getPersist, save, holdWorld, anchorRect, confirmSkip }) {
    const alienEl = root.querySelector(".bb-alien");
    const textEl = root.querySelector("#bridge-text");
    const tapEl = root.querySelector("#bridge-tap");
    const skipBtn = root.querySelector("#bridge-skip");
    alienEl.innerHTML = ALIEN_SVG;
    skipBtn.textContent = SKIP_LABEL;

    let training = false;
    let silenced = false;
    let beatIndex = -1;
    let pending = null;
    let current = null;
    let fired = new Set();
    let typed = false;
    let holding = false;
    let typeTimer = 0;
    let autoTimer = 0;
    let ringRaf = 0;
    let moveHeld = 0;

    function onb() {
        return getPersist().onboarding;
    }

    // ---- bubble -------------------------------------------------------------

    function clearTimers() {
        clearInterval(typeTimer);
        clearTimeout(autoTimer);
        typeTimer = 0;
        autoTimer = 0;
    }

    function setHold(on) {
        if (on === holding) return;
        holding = on;
        holdWorld(on);
        dim.classList.toggle("hidden", !on);
    }

    function show(item) {
        clearTimers();
        current = item;
        typed = false;
        root.dataset.place = item.place || "high";
        root.dataset.beat = item.id || "";
        root.classList.remove("hidden", "typing", "ready");
        void root.offsetWidth;
        root.classList.add("show", "typing");
        tapEl.classList.add("hidden");
        skipBtn.classList.toggle("hidden", !(training && !silenced && beatIndex >= 1 && !item.isTip));
        if (item.mode === "pause") setHold(true);
        startRing(item.anchor);

        const line = item.line;
        let i = 0;
        textEl.textContent = "";
        typeTimer = setInterval(() => {
            i += 1;
            textEl.textContent = line.slice(0, i);
            if (i >= line.length) finishTyping();
        }, 1000 / TYPE_CPS);
    }

    function finishTyping() {
        if (!current || typed) return;
        clearInterval(typeTimer);
        typeTimer = 0;
        typed = true;
        textEl.textContent = current.line;
        root.classList.remove("typing");
        root.classList.add("ready");
        if (current.mode === "pause") {
            tapEl.classList.remove("hidden");
            autoTimer = setTimeout(dismiss, PAUSE_AUTO_MS);
        } else if (current.mode === "note") {
            autoTimer = setTimeout(dismiss, NOTE_AUTO_MS);
        }
    }

    function hideBubble() {
        clearTimers();
        root.classList.remove("show", "typing", "ready");
        root.classList.add("hidden");
        tapEl.classList.add("hidden");
        skipBtn.classList.add("hidden");
        stopRing();
    }

    function dismiss() {
        if (!current) return;
        const item = current;
        current = null;
        hideBubble();
        if (item.mode === "pause") setHold(false);
        if (item.isTip) return;
        advance();
    }

    // ---- highlight ring -----------------------------------------------------

    function rectFor(anchor) {
        if (!anchor) return null;
        if (anchor.startsWith("#") || anchor.startsWith(".")) {
            const el = stage.querySelector(anchor);
            if (!el || el.classList.contains("hidden") || el.offsetParent === null) return null;
            const s = stage.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            if (r.width < 2 || r.height < 2) return null;
            return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
        }
        return anchorRect ? anchorRect(anchor) : null;
    }

    function paintRing() {
        if (!current) return;
        const r = rectFor(current.anchor);
        if (!r) {
            ring.classList.add("hidden");
        } else {
            const pad = 8;
            ring.classList.remove("hidden");
            ring.style.left = `${r.left - pad}px`;
            ring.style.top = `${r.top - pad}px`;
            ring.style.width = `${r.width + pad * 2}px`;
            ring.style.height = `${r.height + pad * 2}px`;
            ring.classList.toggle("round", Math.abs(r.width - r.height) < 6);
        }
        ringRaf = requestAnimationFrame(paintRing);
    }

    function startRing(anchor) {
        stopRing();
        if (!anchor) return;
        ringRaf = requestAnimationFrame(paintRing);
    }

    function stopRing() {
        cancelAnimationFrame(ringRaf);
        ringRaf = 0;
        ring.classList.add("hidden");
    }

    // ---- beats --------------------------------------------------------------

    function advance() {
        if (!training || silenced) return;
        beatIndex += 1;
        const beat = TRAINING_BEATS[beatIndex];
        if (!beat) {
            finishTraining();
            return;
        }
        if (beat.showOn && !fired.has(beat.showOn)) {
            pending = beat;
            return;
        }
        pending = null;
        show(beat);
    }

    function startTraining() {
        training = true;
        silenced = false;
        beatIndex = -1;
        pending = null;
        fired = new Set();
        moveHeld = 0;
        hideBubble();
        setHold(false);
        advance();
    }

    function finishTraining() {
        const p = onb();
        p.done = true;
        save();
        training = false;
        silenced = false;
        pending = null;
        hideBubble();
        setHold(false);
    }

    function abort() {
        training = false;
        silenced = false;
        pending = null;
        current = null;
        hideBubble();
        setHold(false);
    }

    function skip() {
        if (!training || silenced) return;
        silenced = true;
        onb().skipped = true;
        save();
        current = null;
        pending = null;
        hideBubble();
        setHold(false);
    }

    function skipTo(id) {
        const idx = TRAINING_BEATS.findIndex((b) => b.id === id);
        if (idx < 0) return;
        if (current && !current.isTip) {
            const wasPause = current.mode === "pause";
            current = null;
            hideBubble();
            if (wasPause) setHold(false);
        }
        beatIndex = idx - 1;
        advance();
    }

    function event(name) {
        fired.add(name);
        if (!training) return;
        if (silenced) {
            if (name === "next") finishTraining();
            return;
        }
        if (name === "expeditionEnd") {
            if (beatIndex < TRAINING_BEATS.findIndex((b) => b.id === "management")) skipTo("management");
            return;
        }
        if (current && !current.isTip && current.mode === "gate" && current.waitFor === name) {
            dismiss();
            return;
        }
        if (pending && pending.showOn === name && !current) {
            const beat = pending;
            pending = null;
            show(beat);
        }
    }

    // Called every frame from the sim while the Joystick is held.
    function joystickHeld(dt, strength) {
        if (!training || silenced) return;
        if (strength < 0.2) return;
        moveHeld += dt;
        if (moveHeld >= MOVE_HOLD_S) event("moved");
    }

    function waitingFor() {
        if (!training || silenced) return null;
        if (pending) return pending.showOn;
        if (current && current.mode === "gate") return current.waitFor;
        return null;
    }

    // ---- tips ---------------------------------------------------------------

    function tip(id) {
        const def = TIPS[id];
        if (!def) return false;
        const p = onb();
        if (p.seenTips.includes(id)) return false;
        if (current) return false;
        p.seenTips.push(id);
        save();
        show({ ...def, id, isTip: true });
        return true;
    }

    // Consume a Tip without showing a bubble: returns its line the first time,
    // null afterwards. Used when another Bridge bubble (result screen) speaks.
    function claimTip(id) {
        const def = TIPS[id];
        if (!def) return null;
        const p = onb();
        if (p.seenTips.includes(id)) return null;
        p.seenTips.push(id);
        save();
        return def.line;
    }

    // ---- input --------------------------------------------------------------

    function onTap(ev) {
        if (!current) return;
        if (ev.target.closest("#bridge-skip")) return;
        if (!typed) {
            finishTyping();
            return;
        }
        if (current.mode === "pause") dismiss();
    }

    root.addEventListener("pointerup", (ev) => {
        if (!current) return;
        if (ev.target.closest("#bridge-skip")) return;
        ev.stopPropagation();
        onTap(ev);
    });
    stage.addEventListener("pointerup", (ev) => {
        if (!current || current.mode !== "pause") return;
        if (ev.target.closest("#bridge-bubble, #modal, #confirm")) return;
        onTap(ev);
    });
    skipBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (confirmSkip) confirmSkip();
        else skip();
    });

    root.classList.add("hidden");
    ring.classList.add("hidden");
    dim.classList.add("hidden");

    return {
        startTraining,
        finishTraining,
        abort,
        skip,
        event,
        joystickHeld,
        waitingFor,
        tip,
        claimTip,
        isTraining: () => training,
        gatesActive: () => training && !silenced,
        isHolding: () => holding,
        hasBubble: () => Boolean(current),
    };
}
