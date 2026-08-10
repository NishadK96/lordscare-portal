"use client";

import { useEffect } from "react";
import { rememberMonster } from "./useMonsterLibrary";

export function MonsterHistoryTracker({ slug }: { slug: string }) {
  useEffect(() => rememberMonster(slug), [slug]);
  return null;
}
