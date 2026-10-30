"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { heroAudioSrc } from "@/lib/assets";
import { STORAGE_KEYS } from "@/lib/constants";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Hero } from "@/types";

/** How a play() call ended. "blocked" = browser autoplay policy; "stopped" = interrupted by another play/stop. */
export type PlayResult = "audio" | "speech" | "blocked" | "unavailable" | "stopped";

interface AudioApi {
  playingSlug: string | null;
  /** true when the current/last clip used speech synthesis because the mp3 was missing */
  usedFallback: boolean;
  volume: number;
  muted: boolean;
  setVolume: (v: number) => void;
  toggleMuted: () => void;
  play: (hero: Hero) => Promise<PlayResult>;
  stop: () => void;
}

const Ctx = createContext<AudioApi | null>(null);

export function useAudio() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
  return ctx;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [playingSlug, setPlayingSlug] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [volume, setVolumeState] = useState(0.9);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const token = useRef(0);
  const settle = useRef<((r: PlayResult) => void) | null>(null);
  const volRef = useRef({ volume: 0.9, muted: false });

  // Load persisted prefs after mount (keeps SSR markup identical).
  useEffect(() => {
    const v = readJSON<number>(STORAGE_KEYS.volume, 0.9);
    const m = readJSON<boolean>(STORAGE_KEYS.muted, false);
    setVolumeState(Math.min(1, Math.max(0, v)));
    setMuted(m);
  }, []);

  useEffect(() => {
    volRef.current = { volume, muted };
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const teardown = useCallback(() => {
    token.current++;
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.pause();
      a.removeAttribute("src");
      a.load();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    const s = settle.current;
    settle.current = null;
    s?.("stopped");
  }, []);

  const stop = useCallback(() => {
    teardown();
    setPlayingSlug(null);
  }, [teardown]);

  const play = useCallback(
    (hero: Hero) =>
      new Promise<PlayResult>((resolve) => {
        teardown();
        const mine = token.current;
        const alive = () => token.current === mine;
        const finish = (r: PlayResult) => {
          if (!alive()) return;
          settle.current = null;
          audioRef.current = null;
          setPlayingSlug(null);
          resolve(r);
        };
        settle.current = resolve;
        setPlayingSlug(hero.slug);
        setUsedFallback(false);

        const speak = () => {
          if (!alive()) return;
          if (typeof window === "undefined" || !("speechSynthesis" in window)) return finish("unavailable");
          setUsedFallback(true);
          const u = new SpeechSynthesisUtterance(hero.quote);
          u.lang = "en-US";
          u.rate = 1;
          u.pitch = 1;
          u.volume = volRef.current.muted ? 0 : volRef.current.volume;
          u.onend = () => finish("speech");
          u.onerror = () => finish("unavailable");
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        };

        const src = heroAudioSrc(hero);
        if (!src) return speak();

        const a = new Audio(src);
        a.preload = "auto";
        a.volume = volRef.current.muted ? 0 : volRef.current.volume;
        audioRef.current = a;
        a.onended = () => finish("audio");
        a.onerror = () => {
          if (!alive()) return;
          audioRef.current = null;
          speak();
        };
        a.play().catch((err: unknown) => {
          if (!alive()) return;
          const name = (err as { name?: string })?.name;
          if (name === "NotAllowedError") finish("blocked");
          else if (name !== "AbortError") speak();
        });
      }),
    [teardown],
  );

  useEffect(() => () => teardown(), [teardown]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
    writeJSON(STORAGE_KEYS.volume, clamped);
    writeJSON(STORAGE_KEYS.muted, false);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((m) => {
      writeJSON(STORAGE_KEYS.muted, !m);
      return !m;
    });
  }, []);

  const value = useMemo<AudioApi>(
    () => ({ playingSlug, usedFallback, volume, muted, setVolume, toggleMuted, play, stop }),
    [playingSlug, usedFallback, volume, muted, setVolume, toggleMuted, play, stop],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
