"use client";

import Image from "next/image";
import { ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { MonsterHeroLineup } from "./types";

function HeroToken({ name, image }: { name: string; image?: string }) {
  return <div className="monster-hero-token"><div>{image ? <Image src={image} alt={`${name} hero`} fill sizes="86px" /> : <span>{name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2)}</span>}</div><strong>{name}</strong></div>;
}

export function MonsterHeroLineup({ lineups, heroImages }: { lineups: MonsterHeroLineup[]; heroImages: Record<string, string> }) {
  const modes = useMemo(() => [...new Set(lineups.map((lineup) => lineup.mode))], [lineups]);
  const defaultMode = modes.includes("Normal") ? "Normal" : modes[0] || "Standard";
  const [mode, setMode] = useState(defaultMode);
  const modeLineups = lineups.filter((lineup) => lineup.mode === mode);
  const [level, setLevel] = useState(modeLineups.at(-1)?.level ?? "");
  const selected = modeLineups.find((lineup) => lineup.level === level) ?? modeLineups.at(-1);

  function chooseMode(nextMode: string) {
    setMode(nextMode);
    setLevel(lineups.filter((lineup) => lineup.mode === nextMode).at(-1)?.level ?? "");
  }

  if (!lineups.length) return <section className="monster-lineup monster-lineup-empty"><Users /><div><p className="eyebrow">Best hero lineup</p><h2>No verified lineup published</h2><p>This monster’s source does not provide a reliable hero lineup. The guide leaves it unavailable instead of guessing.</p></div></section>;

  return <section className="monster-lineup"><header><div><p className="eyebrow">Best hero lineup</p><h2>Choose your monster level</h2></div><ShieldCheck /></header>{modes.length > 1 && <div className="monster-lineup-modes" aria-label="Monster mode">{modes.map((entry) => <button type="button" aria-pressed={mode === entry} className={mode === entry ? "active" : ""} onClick={() => chooseMode(entry)} key={entry}>{entry}</button>)}</div>}<div className="monster-level-tabs" aria-label="Monster level lineup">{modeLineups.map((lineup) => <button type="button" aria-pressed={selected?.level === lineup.level} className={selected?.level === lineup.level ? "active" : ""} onClick={() => setLevel(lineup.level)} key={lineup.level}>Level {lineup.level}</button>)}</div>{selected && <div className="monster-lineup-groups">{selected.free.length > 0 && <div><span>Recommended · F2P</span><div>{selected.free.map((hero) => <HeroToken name={hero} image={heroImages[hero]} key={hero} />)}</div></div>}{selected.paid.length > 0 && <div><span>Alternative · P2P</span><div>{selected.paid.map((hero) => <HeroToken name={hero} image={heroImages[hero]} key={hero} />)}</div></div>}</div>}</section>;
}
