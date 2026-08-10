import type { Metadata } from "next";
import Image from "next/image";
import { Crosshair, Sparkles } from "lucide-react";
import { SupportHeader } from "../SupportHeader";
import { monsterRepository } from "./repository";
import { MonstersExplorer } from "./MonstersExplorer";

export const metadata: Metadata = {
  title: "Lords Mobile Monster Hunt Guide",
  description: "Find Lords Mobile monster weaknesses, recommended attack types, verified hero lineups, materials, and gear sets in seconds.",
};

export default function MonstersPage() {
  const monsters = monsterRepository.getAllMonsters();
  return <main className="monsters-page">
    <SupportHeader active="monsters" subtitle="Monster Hunt Guide" />
    <section className="monsters-hero"><div className="support-shell monsters-hero-grid"><div><p className="eyebrow light">Monster Hunt</p><h1>Find the best lineup for <em>every monster.</em></h1><p>Search all {monsters.length} verified Lords Mobile monsters, understand their weakness, and open the right hero lineup before your next hunt.</p><a href="#monster-finder" className="monster-hero-action"><Crosshair />Find a monster</a></div><div className="monster-hero-art" aria-hidden="true"><span><Image src="/monsters/gargantua.webp" alt="" fill sizes="180px" priority /></span><span><Image src="/monsters/queen-bee.webp" alt="" fill sizes="155px" priority /></span><span><Image src="/monsters/jade-wyrm.webp" alt="" fill sizes="150px" priority /></span><div><Sparkles /><strong>{monsters.length}</strong><small>local guides</small></div></div></div></section>
    <div className="support-shell monster-module-shell" id="monster-finder"><MonstersExplorer monsters={monsters} /></div>
    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Monster Hunt Guide</span></div></div><p>Monster mechanics and lineups are stored locally from the cited community references. Confirm time-sensitive event details in-game.</p></div></footer>
  </main>;
}
