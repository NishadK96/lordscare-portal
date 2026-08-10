"use client";

import { ArrowUpRight, Heart, Sparkles, Swords } from "lucide-react";
import type { Monster } from "./types";
import { MonsterImage } from "./MonsterImage";

export function MonsterCard({ monster, favorite, onToggleFavorite }: { monster: Monster; favorite: boolean; onToggleFavorite: (slug: string) => void }) {
  return <article className="monster-card">
    <a className="monster-card-link" href={`/monsters/${monster.slug}`} aria-label={`Open ${monster.name} monster guide`}>
      <div className="monster-card-art"><MonsterImage src={monster.thumbnail || monster.image} alt={`${monster.name} monster`} /><div className="monster-card-chips"><span>{monster.category}</span>{monster.categories.includes("Multiple Hit") && <span>Multi-hit</span>}</div></div>
      <div className="monster-card-content"><div><p>{monster.monsterType}</p><h2>{monster.name}</h2></div><div className="monster-card-strategy"><span><Swords /><small>Monster damage</small><strong>{monster.damageType || "Unavailable"}</strong></span><span><Sparkles /><small>Use against it</small><strong>{monster.recommendedAttackType ? `${monster.recommendedAttackType} heroes` : "Guide unavailable"}</strong></span></div><div className="monster-card-footer"><span>View guide</span><ArrowUpRight /></div></div>
    </a>
    <button className={`monster-card-favorite ${favorite ? "is-favorite" : ""}`} type="button" aria-label={`${favorite ? "Remove" : "Add"} ${monster.name} ${favorite ? "from" : "to"} favorites`} aria-pressed={favorite} onClick={() => onToggleFavorite(monster.slug)}><Heart fill={favorite ? "currentColor" : "none"} /></button>
  </article>;
}
