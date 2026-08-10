"use client";

import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { AttackType, Monster, MonsterCategory } from "./types";
import { MonsterCard } from "./MonsterCard";
import { MonsterImage } from "./MonsterImage";
import { useMonsterLibrary } from "./useMonsterLibrary";

type CategoryFilter = "All" | MonsterCategory;
type AttackFilter = "Any weakness" | AttackType;

const categoryFilters: CategoryFilter[] = ["All", "Normal", "Event", "Special", "Multiple Hit"];
const attackFilters: AttackFilter[] = ["Any weakness", "Magic", "Physical"];

function MiniMonster({ monster }: { monster: Monster }) {
  return <a className="monster-mini-card" href={`/monsters/${monster.slug}`}><MonsterImage src={monster.thumbnail || monster.image} alt={`${monster.name} monster`} /><span><strong>{monster.name}</strong><small>{monster.recommendedAttackType ? `Use ${monster.recommendedAttackType}` : monster.monsterType}</small></span></a>;
}

export function MonstersExplorer({ monsters }: { monsters: Monster[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [attack, setAttack] = useState<AttackFilter>("Any weakness");
  const [searchFocused, setSearchFocused] = useState(false);
  const { favorites, recent, ready, toggleFavorite } = useMonsterLibrary();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return monsters.filter((monster) => {
      const matchesQuery = !normalized || [monster.name, monster.monsterType, monster.recommendedAttackType, ...monster.materials].some((value) => value?.toLowerCase().includes(normalized));
      const matchesCategory = category === "All" || monster.categories.includes(category);
      const matchesAttack = attack === "Any weakness" || monster.recommendedAttackType === attack;
      return matchesQuery && matchesCategory && matchesAttack;
    });
  }, [attack, category, monsters, query]);

  const quickResults = useMemo(() => query.trim() ? monsters.filter((monster) => monster.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6) : [], [monsters, query]);
  const favoriteMonsters = favorites.map((slug) => monsters.find((monster) => monster.slug === slug)).filter((monster): monster is Monster => Boolean(monster));
  const recentMonsters = recent.map((slug) => monsters.find((monster) => monster.slug === slug)).filter((monster): monster is Monster => Boolean(monster));

  const clearFilters = () => { setQuery(""); setCategory("All"); setAttack("Any weakness"); };

  return <>
    <section className="monster-finder" aria-labelledby="monster-finder-title"><div><p className="eyebrow light">Quick monster finder</p><h2 id="monster-finder-title">What monster are you hunting?</h2><p>Type a name and jump directly to its weakness and best verified lineup.</p></div><div className="monster-search-wrap"><div className="monster-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)} aria-label="Search monsters" placeholder="Search Gargantua, Queen Bee, Hootclaw…" autoComplete="off" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear monster search"><X /></button>}</div>{searchFocused && query && <div className="monster-autocomplete" role="listbox">{quickResults.length ? quickResults.map((monster) => <a href={`/monsters/${monster.slug}`} role="option" aria-selected="false" key={monster.slug}><MonsterImage src={monster.thumbnail || monster.image} alt="" /><span><strong>{monster.name}</strong><small>{monster.monsterType} · {monster.recommendedAttackType ? `Use ${monster.recommendedAttackType}` : "Open guide"}</small></span></a>) : <p>No monster names match “{query}”.</p>}</div>}</div></section>

    {ready && <section className="monster-personal-grid" aria-label="Your monster library"><div><header><p className="eyebrow">Favorite monsters</p><span>{favoriteMonsters.length}</span></header>{favoriteMonsters.length ? <div className="monster-mini-list">{favoriteMonsters.slice(0, 5).map((monster) => <MiniMonster monster={monster} key={monster.slug} />)}</div> : <p className="monster-personal-empty"><HeartIcon />Save monsters you hunt often for one-tap access.</p>}</div><div><header><p className="eyebrow">Recently viewed</p><span>{recentMonsters.length}</span></header>{recentMonsters.length ? <div className="monster-mini-list">{recentMonsters.map((monster) => <MiniMonster monster={monster} key={monster.slug} />)}</div> : <p className="monster-personal-empty"><HistoryIcon />Opened monster guides will appear here automatically.</p>}</div></section>}

    <section className="monster-catalog" aria-labelledby="monster-results-title"><header className="monster-catalog-head"><div><p className="eyebrow">Monster database</p><h2 id="monster-results-title">{results.length} {results.length === 1 ? "monster" : "monsters"}</h2></div><div className="monster-filter-summary"><SlidersHorizontal />Filters update instantly</div></header><div className="monster-filters"><div aria-label="Monster category filters">{categoryFilters.map((filter) => <button type="button" className={category === filter ? "active" : ""} aria-pressed={category === filter} onClick={() => setCategory(filter)} key={filter}>{filter}</button>)}</div><div aria-label="Recommended attack filters">{attackFilters.map((filter) => <button type="button" className={attack === filter ? "active" : ""} aria-pressed={attack === filter} onClick={() => setAttack(filter)} key={filter}>{filter === "Any weakness" ? filter : `Weak to ${filter}`}</button>)}</div></div>{results.length ? <div className="monster-grid">{results.map((monster) => <MonsterCard monster={monster} favorite={favorites.includes(monster.slug)} onToggleFavorite={toggleFavorite} key={monster.slug} />)}</div> : <div className="monster-empty"><Sparkles /><h3>No monsters found</h3><p>No monsters match “{query || category}”. Try another name or clear the filters.</p><button type="button" onClick={clearFilters}>Clear search and filters</button></div>}</section>
  </>;
}

function HeartIcon() { return <span aria-hidden="true">♡</span>; }
function HistoryIcon() { return <span aria-hidden="true">↺</span>; }
