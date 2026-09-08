const TRACKS = {
    menu: { src: "assets/audio/crop-circle-sprint.mp3", volume: 0.55 },
    play: { src: "assets/audio/orbital-loop.mp3", volume: 0.5 },
};

const players = Object.create(null);
let wanted = null;
let musicVolume = 1;

let ctx = null;
let master = null;
let sfxOn = true;
const loops = Object.create(null);

function mixVolume(id) {
    return TRACKS[id].volume * musicVolume;
}

function applyVolumes() {
    for (const id of Object.keys(players)) {
        players[id].volume = mixVolume(id);
    }
}

function getTrack(id) {
    if (players[id]) return players[id];
    const spec = TRACKS[id];
    const el = new Audio(spec.src);
    el.loop = true;
    el.preload = "auto";
    el.volume = mixVolume(id);
    players[id] = el;
    return el;
}

export function setMusicVolume(value) {
    const v = Number(value);
    musicVolume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
    applyVolumes();
}

function stopTrack(id, restart) {
    const el = players[id];
    if (!el) return;
    el.pause();
    if (restart) el.currentTime = 0;
}

export function setMusic(id, { restart = false } = {}) {
    wanted = id;
    for (const key of Object.keys(TRACKS)) {
        if (key !== id) stopTrack(key, restart);
    }
    if (!id) return;
    const el = getTrack(id);
    if (restart) el.currentTime = 0;
    const play = el.play();
    if (play) play.catch(() => {});
}

function ensureCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.72;
        master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
}

export function setSfxEnabled(on) {
    sfxOn = Boolean(on);
    if (!sfxOn) stopAllLoops();
}

function env(gain, t, vol, attack, hold, release) {
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
    gain.gain.setValueAtTime(Math.max(0.0002, vol), t + attack + hold);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
}

function tone({ freq, to, dur, type = "sine", vol = 0.12, attack = 0.01, release = 0.07 }) {
    const c = ensureCtx();
    if (!c || !sfxOn) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (to != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), c.currentTime + dur);
    osc.connect(g);
    g.connect(master);
    const hold = Math.max(0.005, dur - attack - release);
    env(g, c.currentTime, vol, attack, hold, release);
    osc.start();
    osc.stop(c.currentTime + dur + 0.03);
}

function noise({ dur = 0.14, vol = 0.06, freq = 900, q = 0.8 }) {
    const c = ensureCtx();
    if (!c || !sfxOn) return;
    const buf = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = c.createGain();
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    env(g, c.currentTime, vol, 0.008, dur * 0.25, dur * 0.7);
    src.start();
}

function later(ms, fn) {
    window.setTimeout(fn, ms);
}

const SFX = {
    tap: () => tone({ freq: 1320, to: 980, dur: 0.045, type: "square", vol: 0.035, release: 0.03 }),
    confirm: () => {
        tone({ freq: 523, dur: 0.07, type: "triangle", vol: 0.08 });
        later(55, () => tone({ freq: 784, dur: 0.1, type: "triangle", vol: 0.09 }));
    },
    deny: () => {
        tone({ freq: 220, to: 110, dur: 0.16, type: "square", vol: 0.06 });
        noise({ dur: 0.1, vol: 0.03, freq: 240, q: 0.6 });
    },
    play: () => {
        noise({ dur: 0.22, vol: 0.05, freq: 520, q: 0.5 });
        tone({ freq: 196, to: 523, dur: 0.28, type: "sawtooth", vol: 0.07, release: 0.12 });
        later(90, () => tone({ freq: 392, to: 784, dur: 0.2, type: "triangle", vol: 0.06 }));
    },
    beamLock: () => {
        noise({ dur: 0.16, vol: 0.05, freq: 700, q: 0.7 });
        tone({ freq: 180, to: 420, dur: 0.18, type: "sine", vol: 0.1 });
    },
    abduct: () => {
        tone({ freq: 262, to: 196, dur: 0.09, type: "sine", vol: 0.05, attack: 0.006, release: 0.07 });
        tone({ freq: 523, dur: 0.18, type: "sine", vol: 0.05, attack: 0.014, release: 0.14 });
        later(45, () => tone({ freq: 784, dur: 0.24, type: "triangle", vol: 0.065, attack: 0.018, release: 0.18 }));
        later(95, () => tone({ freq: 988, dur: 0.2, type: "sine", vol: 0.03, attack: 0.025, release: 0.16 }));
    },
    tooHeavy: () => {
        tone({ freq: 70, to: 48, dur: 0.22, type: "sine", vol: 0.16, attack: 0.005, release: 0.14 });
        tone({ freq: 160, to: 90, dur: 0.18, type: "square", vol: 0.045 });
        noise({ dur: 0.14, vol: 0.05, freq: 180, q: 0.5 });
    },
    inbound: () => {
        tone({ freq: 420, to: 760, dur: 0.16, type: "triangle", vol: 0.09 });
        later(140, () => tone({ freq: 760, to: 400, dur: 0.18, type: "triangle", vol: 0.09 }));
    },
    spotted: () => {
        tone({ freq: 880, dur: 0.07, type: "square", vol: 0.07 });
        later(80, () => tone({ freq: 660, dur: 0.1, type: "square", vol: 0.07 }));
    },
    surround: () => {
        tone({ freq: 300, to: 180, dur: 0.28, type: "sawtooth", vol: 0.1 });
        later(60, () => tone({ freq: 900, to: 420, dur: 0.22, type: "square", vol: 0.06 }));
        noise({ dur: 0.24, vol: 0.06, freq: 500, q: 0.4 });
    },
    warn: () => {
        tone({ freq: 740, dur: 0.09, type: "square", vol: 0.08 });
        later(110, () => tone({ freq: 740, dur: 0.12, type: "square", vol: 0.08 }));
    },
    redAlert: () => {
        tone({ freq: 980, to: 420, dur: 0.22, type: "sawtooth", vol: 0.1 });
        later(160, () => tone({ freq: 980, to: 420, dur: 0.22, type: "sawtooth", vol: 0.1 }));
    },
    upgrade: () => {
        [523, 659, 784, 1046].forEach((freq, i) => {
            later(i * 58, () => tone({ freq, dur: 0.1, type: "triangle", vol: 0.09 }));
        });
    },
    unlock: () => {
        [392, 523, 659, 784, 1174].forEach((freq, i) => {
            later(i * 48, () => tone({ freq, dur: 0.12, type: "sine", vol: 0.08 }));
        });
        later(80, () => noise({ dur: 0.18, vol: 0.04, freq: 1600, q: 1.4 }));
    },
    rare: () => {
        tone({ freq: 311, to: 622, dur: 0.35, type: "sine", vol: 0.09, release: 0.18 });
        later(90, () => tone({ freq: 466, to: 233, dur: 0.32, type: "triangle", vol: 0.07 }));
        noise({ dur: 0.28, vol: 0.04, freq: 2400, q: 2 });
    },
    goal: () => {
        tone({ freq: 659, dur: 0.1, type: "triangle", vol: 0.09 });
        later(70, () => tone({ freq: 830, dur: 0.1, type: "triangle", vol: 0.09 }));
        later(140, () => tone({ freq: 988, dur: 0.18, type: "triangle", vol: 0.1 }));
    },
    success: () => {
        [523, 659, 784].forEach((freq) => tone({ freq, dur: 0.28, type: "triangle", vol: 0.07, release: 0.2 }));
        later(160, () => tone({ freq: 1046, dur: 0.32, type: "sine", vol: 0.09, release: 0.22 }));
    },
    fail: () => {
        tone({ freq: 392, to: 196, dur: 0.28, type: "triangle", vol: 0.1, release: 0.16 });
        later(90, () => tone({ freq: 247, to: 147, dur: 0.3, type: "sine", vol: 0.08 }));
    },
    detected: () => {
        noise({ dur: 0.3, vol: 0.08, freq: 700, q: 0.4 });
        tone({ freq: 880, to: 220, dur: 0.4, type: "sawtooth", vol: 0.11, release: 0.18 });
        later(120, () => tone({ freq: 660, to: 140, dur: 0.32, type: "square", vol: 0.07 }));
    },
};

export function playSfx(id) {
    if (!sfxOn) return;
    const fn = SFX[id];
    if (fn) fn();
}

function noiseLoopSource(c) {
    const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    return src;
}

function startBeamLoop() {
    const c = ensureCtx();
    if (!c) return null;
    const g = c.createGain();
    g.gain.value = 0.0001;
    g.connect(master);
    g.gain.linearRampToValueAtTime(0.05, c.currentTime + 0.1);

    const low = c.createOscillator();
    low.type = "sine";
    low.frequency.value = 76;
    const hi = c.createOscillator();
    hi.type = "sine";
    hi.frequency.value = 153;
    low.connect(g);
    hi.connect(g);

    const lfo = c.createOscillator();
    lfo.frequency.value = 5.5;
    const lfoG = c.createGain();
    lfoG.gain.value = 0.012;
    lfo.connect(lfoG);
    lfoG.connect(g.gain);

    const hiss = noiseLoopSource(c);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 380;
    const hg = c.createGain();
    hg.gain.value = 0.018;
    hiss.connect(lp);
    lp.connect(hg);
    hg.connect(g);

    low.start();
    hi.start();
    lfo.start();
    hiss.start();
    return {
        stop() {
            const t = c.currentTime + 0.08;
            g.gain.cancelScheduledValues(c.currentTime);
            g.gain.linearRampToValueAtTime(0.0001, t);
            low.stop(t);
            hi.stop(t);
            lfo.stop(t);
            hiss.stop(t);
        },
    };
}

function startSirenLoop() {
    const c = ensureCtx();
    if (!c) return null;
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 720;
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 1.7;
    const depth = c.createGain();
    depth.gain.value = 150;
    lfo.connect(depth);
    depth.connect(osc.frequency);
    const g = c.createGain();
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(master);
    g.gain.linearRampToValueAtTime(0.055, c.currentTime + 0.12);
    osc.start();
    lfo.start();
    return {
        stop() {
            const t = c.currentTime + 0.1;
            g.gain.linearRampToValueAtTime(0.0001, t);
            osc.stop(t);
            lfo.stop(t);
        },
    };
}

function startAlertLoop() {
    const c = ensureCtx();
    if (!c) return null;
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = 640;
    const lfo = c.createOscillator();
    lfo.type = "square";
    lfo.frequency.value = 3.2;
    const depth = c.createGain();
    depth.gain.value = 220;
    lfo.connect(depth);
    depth.connect(osc.frequency);
    const g = c.createGain();
    g.gain.value = 0.0001;
    osc.connect(g);
    g.connect(master);
    g.gain.linearRampToValueAtTime(0.06, c.currentTime + 0.08);
    osc.start();
    lfo.start();
    return {
        stop() {
            const t = c.currentTime + 0.1;
            g.gain.linearRampToValueAtTime(0.0001, t);
            osc.stop(t);
            lfo.stop(t);
        },
    };
}

const LOOP_START = {
    beam: startBeamLoop,
    siren: startSirenLoop,
    alert: startAlertLoop,
};

function stopAllLoops() {
    for (const id of Object.keys(loops)) {
        loops[id].stop();
        delete loops[id];
    }
}

export function syncSfxLoops({ beam = false, siren = false, alert = false } = {}) {
    const want = { beam, siren, alert };
    for (const id of Object.keys(LOOP_START)) {
        const on = Boolean(want[id]) && sfxOn;
        if (on && !loops[id]) {
            const node = LOOP_START[id]();
            if (node) loops[id] = node;
        } else if (!on && loops[id]) {
            loops[id].stop();
            delete loops[id];
        }
    }
}

export function bindMusicUnlock(root = document) {
    const retry = () => {
        ensureCtx();
        if (!wanted) return;
        const el = getTrack(wanted);
        if (el.paused) el.play().catch(() => {});
    };
    root.addEventListener("pointerdown", retry);
    root.addEventListener("keydown", retry);
}
