const MENU_TRACK = "assets/audio/crop-circle-sprint.mp3";

let track = null;
let wantPlay = false;

function getTrack() {
    if (track) return track;
    track = new Audio(MENU_TRACK);
    track.loop = true;
    track.preload = "auto";
    track.volume = 0.55;
    return track;
}

export function setMenuMusic(on, { restart = false } = {}) {
    wantPlay = on;
    const el = getTrack();
    if (!on) {
        el.pause();
        if (restart) el.currentTime = 0;
        return;
    }
    const play = el.play();
    if (play) play.catch(() => {});
}

export function bindMenuMusicUnlock(root = document) {
    const retry = () => {
        if (!wantPlay) return;
        const el = getTrack();
        if (el.paused) el.play().catch(() => {});
    };
    root.addEventListener("pointerdown", retry);
    root.addEventListener("keydown", retry);
}
