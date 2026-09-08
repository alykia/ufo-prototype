const TRACKS = {
    menu: { src: "assets/audio/crop-circle-sprint.mp3", volume: 0.55 },
    play: { src: "assets/audio/orbital-loop.mp3", volume: 0.5 },
};

const players = Object.create(null);
let wanted = null;
let musicVolume = 1;

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

export function bindMusicUnlock(root = document) {
    const retry = () => {
        if (!wanted) return;
        const el = getTrack(wanted);
        if (el.paused) el.play().catch(() => {});
    };
    root.addEventListener("pointerdown", retry);
    root.addEventListener("keydown", retry);
}
