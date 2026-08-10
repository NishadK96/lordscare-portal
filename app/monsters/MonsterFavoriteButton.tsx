"use client";

import { Heart } from "lucide-react";
import { useMonsterLibrary } from "./useMonsterLibrary";

export function MonsterFavoriteButton({ slug, name, compact = false }: { slug: string; name: string; compact?: boolean }) {
  const { favorites, toggleFavorite } = useMonsterLibrary();
  const favorite = favorites.includes(slug);
  return <button className={`monster-favorite-button ${compact ? "compact" : ""} ${favorite ? "is-favorite" : ""}`} type="button" aria-label={`${favorite ? "Remove" : "Add"} ${name} ${favorite ? "from" : "to"} favorites`} aria-pressed={favorite} onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(slug); }}><Heart fill={favorite ? "currentColor" : "none"} /><span>{favorite ? "Saved" : "Favorite"}</span></button>;
}
