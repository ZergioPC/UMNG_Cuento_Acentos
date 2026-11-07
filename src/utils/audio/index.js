import { useSyncExternalStore } from "react";

// Los audios están en src/assets/audio/<audioFolder>/<region>_<n>.mp3, donde
// n = frase.id + 1. El glob es eager para que Vite los empaquete como assets.
const AUDIO_MAP = import.meta.glob("../../assets/audio/**/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

// En los archivos, la región Orinoquia se llama "llanos".
const AUDIO_REGION = {
  andina: "andina",
  caribe: "caribe",
  orinoquia: "llanos",
};

const audio = new Audio();

const EMPTY_STATE = {
  current: null,
  playing: false,
  error: null,
};

// El estado se reemplaza en cada cambio (nunca se muta): useSyncExternalStore
// compara por identidad y con el objeto mutado no volvería a renderizar.
let state = EMPTY_STATE;
const listeners = new Set();

let queue = [];
let queueIndex = 0;
let token = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch) {
  state = { ...state, ...patch };
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useAudioState() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function resolveClip(cuento, fraseId, region) {
  const audioFolder = cuento?.audioFolder;
  const audioRegion = AUDIO_REGION[region];
  if (!audioFolder || !audioRegion) return null;

  const file = `${audioRegion}_${Number(fraseId) + 1}.mp3`;
  return AUDIO_MAP[`../../assets/audio/${audioFolder}/${file}`] ?? null;
}

function reset() {
  token += 1;
  audio.onended = null;
  audio.onerror = null;
  audio.pause();
  audio.removeAttribute("src");
  audio.load();
  queue = [];
  queueIndex = 0;
}

export function stop() {
  reset();
  setState({ current: null, playing: false, error: null });
}

function advance() {
  queueIndex += 1;
  if (queueIndex >= queue.length) {
    stop();
    return;
  }
  playTrack(queue[queueIndex]);
}

function playTrack(track) {
  const trackToken = (token += 1);

  audio.onended = () => {
    if (trackToken !== token) return;
    advance();
  };

  // Sin fallback: si un clip falla se salta al siguiente (o se detiene si era
  // el último), pero nunca se reproduce un sonido genérico.
  audio.onerror = () => {
    if (trackToken !== token) return;
    setState({ error: "No se pudo reproducir el audio." });
    advance();
  };

  audio.pause();
  audio.src = track.url;
  audio.load();

  setState({ current: track, playing: true, error: null });

  const promise = audio.play();
  if (promise && typeof promise.catch === "function") {
    promise.catch((error) => {
      if (trackToken !== token) return;
      // Si el navegador bloquea la reproducción, insistir con el siguiente
      // clip no sirve: se detiene la cola completa.
      if (error?.name === "NotAllowedError") {
        stop();
        return;
      }
      advance();
    });
  }
}

function playList(tracks) {
  reset();

  if (tracks.length === 0) {
    setState({ current: null, playing: false, error: null });
    return false;
  }

  queue = tracks;
  queueIndex = 0;
  playTrack(queue[0]);
  return true;
}

function trackFor(cuento, frase, region, url) {
  return {
    url,
    fraseId: frase.id,
    region,
    cuentoFolder: cuento.folder,
  };
}

export function playFrase(cuento, frase, region) {
  const url = resolveClip(cuento, frase.id, region);
  if (!url) return false;

  const sameTrack =
    state.playing &&
    state.current?.url === url &&
    state.current?.fraseId === frase.id &&
    state.current?.region === region;

  if (sameTrack) {
    stop();
    return true;
  }

  return playList([trackFor(cuento, frase, region, url)]);
}

export function playSequence(cuento, region) {
  const tracks = [];

  for (const frase of cuento.frases) {
    // Si la frase no tiene texto para la región tampoco debe sonar, aunque
    // exista un mp3 huérfano en la carpeta.
    if (!frase.content?.[region]) continue;

    const url = resolveClip(cuento, frase.id, region);
    if (url) tracks.push(trackFor(cuento, frase, region, url));
  }

  return playList(tracks);
}
