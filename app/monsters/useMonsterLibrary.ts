"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const FAVORITES_KEY = "lordscare.monsters.favorites";
const RECENT_KEY = "lordscare.monsters.recent";
const CHANGE_EVENT = "lordscare-monster-library-change";

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getFavoritesSnapshot() { return window.localStorage.getItem(FAVORITES_KEY) ?? "[]"; }
function getRecentSnapshot() { return window.localStorage.getItem(RECENT_KEY) ?? "[]"; }
function getServerSnapshot() { return "[]"; }

export function useMonsterLibrary() {
  const favoriteSnapshot = useSyncExternalStore(subscribe, getFavoritesSnapshot, getServerSnapshot);
  const recentSnapshot = useSyncExternalStore(subscribe, getRecentSnapshot, getServerSnapshot);
  const favorites = useMemo(() => { try { return JSON.parse(favoriteSnapshot) as string[]; } catch { return []; } }, [favoriteSnapshot]);
  const recent = useMemo(() => { try { return JSON.parse(recentSnapshot) as string[]; } catch { return []; } }, [recentSnapshot]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = readList(FAVORITES_KEY);
    writeList(FAVORITES_KEY, current.includes(slug) ? current.filter((entry) => entry !== slug) : [slug, ...current].slice(0, 100));
  }, []);

  return { favorites, recent, ready: true, toggleFavorite };
}

export function rememberMonster(slug: string) {
  if (typeof window === "undefined") return;
  const current = readList(RECENT_KEY).filter((entry) => entry !== slug);
  writeList(RECENT_KEY, [slug, ...current].slice(0, 5));
}
