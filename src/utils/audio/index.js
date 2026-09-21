import { useSyncExternalStore } from "react";
import fallbackUrl from "../../assets/audio/default_sfx.mp3";

const AUDIO_MAP = import.meta.glob("../../db/**/audio/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

const audio = new Audio();

const state = { url: null, playing: false };
const listeners = new Set();
let queue = [];

function emit() {
  listeners.forEach((listener) => listener());
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

export function resolveClip(cuentoFolder, fraseId, region) {
  return (
    AUDIO_MAP[`../../db/${cuentoFolder}/audio/${fraseId}_${region}.mp3`] ??
    null
  );
}

export function stop() {
  audio.pause();
  audio.removeAttribute("src");
  audio.onended = null;
  audio.onerror = null;
  queue = [];
  state.url = null;
  state.playing = false;
  emit();
}

function next() {
  if (queue.length === 0) {
    stop();
    return;
  }

  const url = queue.shift();
  const isFallback = url === fallbackUrl;

  audio.pause();
  audio.src = url;
  audio.onended = () => next();
  audio.onerror = () => {
    if (!isFallback) {
      queue.unshift(fallbackUrl);
      next();
    } else {
      stop();
    }
  };

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      if (!isFallback) {
        queue.unshift(fallbackUrl);
        next();
      } else {
        stop();
      }
    });
  }

  state.url = url;
  state.playing = true;
  emit();
}

export function playClip(url) {
  const target = url ?? fallbackUrl;
  if (state.url === target && state.playing) {
    stop();
    return;
  }
  playList([target]);
}

export function playSequence(cuentoFolder, region, fraseIds) {
  playList(
    fraseIds.map((id) => resolveClip(cuentoFolder, id, region) ?? fallbackUrl)
  );
}

function playList(urls) {
  stop();
  queue = urls.filter(Boolean);
  if (queue.length === 0) return;
  next();
}