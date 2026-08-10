import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, Gem, Info, Layers3, MapPin, Shield, Sparkles, Swords } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SupportHeader } from "../../SupportHeader";
import { MonsterFavoriteButton } from "../MonsterFavoriteButton";
import { MonsterHeroLineup } from "../MonsterHeroLineup";
import { MonsterHistoryTracker } from "../MonsterHistoryTracker";
import { MonsterImage } from "../MonsterImage";
import { MonsterMobileActions } from "../MonsterMobileActions";
import { monsterRepository } from "../repository";

export function generateStaticParams() {
  return monsterRepository.getAllMonsters().map((monster) => ({ slug: monster.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const monster = monsterRepository.getMonsterBySlug(slug);
  if (!monster) return { title: "Monster Guide Not Found" };
  return {
    title: `${monster.name} Monster Hunt Guide`,
    description: `Best verified heroes, ${monster.recommendedAttackType ? `${monster.recommendedAttackType.toLowerCase()} weakness, ` : ""}materials, and hunting strategy for ${monster.name} in Lords Mobile.`,
  };
}

export default async function MonsterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const monster = monsterRepository.getMonsterBySlug(slug);
  if (!monster) notFound();

  const related = monsterRepository.getRelatedMonsters(monster);
  const heroNames = [...new Set(monster.heroLineups.flatMap((lineup) => [...lineup.free, ...lineup.paid]))];
  const heroImages = Object.fromEntries(heroNames.flatMap((name) => {
    const image = monsterRepository.getHeroAsset(name)?.image;
    return image ? [[name, image]] : [];
  }));

  return <main className="monster-detail-page">
    <MonsterHistoryTracker slug={monster.slug} />
    <SupportHeader active="monsters" subtitle="Monster Hunt Guide" />
    <div className="support-shell monster-detail-shell">
      <nav className="monster-breadcrumb" aria-label="Breadcrumb"><Link href="/monsters"><ArrowLeft />All monsters</Link><span>/</span><span>{monster.name}</span></nav>

      <section className="monster-detail-hero">
        <div className="monster-detail-art"><MonsterImage src={monster.image} alt={`${monster.name} monster`} priority /><div className="monster-detail-art-label"><span>{monster.monsterType}</span><strong>{monster.name}</strong></div></div>
        <div className="monster-detail-summary"><div className="monster-detail-title"><div><div className="monster-title-chips"><span>{monster.category}</span>{monster.categories.filter((category) => category !== monster.category).map((category) => <span key={category}>{category}</span>)}</div><h1>{monster.name}</h1><p>{monster.description}</p></div><MonsterFavoriteButton slug={monster.slug} name={monster.name} /></div><div className="monster-weakness-panel"><div><Sparkles /><span><small>Weakness</small><strong>{monster.recommendedAttackType ? `${monster.recommendedAttackType} damage` : "Not published"}</strong></span></div><div><Swords /><span><small>Use</small><strong>{monster.recommendedAttackType ? `${monster.recommendedAttackType} heroes` : "No verified recommendation"}</strong></span></div><div><Shield /><span><small>Strong against</small><strong>{monster.defensiveType || "Not published"}</strong></span></div></div><MonsterHeroLineup lineups={monster.heroLineups} heroImages={heroImages} /></div>
      </section>

      <section className="monster-detail-content">
        <div className="monster-quick-info"><header><p className="eyebrow">Quick monster info</p><h2>Hunt briefing</h2></header><div className="monster-info-grid">{monster.damageType && <article><Swords /><span><small>Damage type</small><strong>{monster.damageType}</strong></span></article>}{monster.defensiveType && <article><Shield /><span><small>Defense profile</small><strong>{monster.defensiveType}</strong></span></article>}{monster.levels.length > 0 && <article><Layers3 /><span><small>Supported levels</small><strong>{monster.levels.join(" · ")}</strong></span></article>}{(monster.spawnInformation || monster.eventInformation) && <article><MapPin /><span><small>Availability</small><strong>{monster.spawnInformation || monster.eventInformation}</strong></span></article>}</div></div>

        {monster.materials.length > 0 && <section className="monster-materials"><header><div><p className="eyebrow">Drops and materials</p><h2>What this monster provides</h2></div><Gem /></header><div>{monster.materials.map((material, index) => <article key={material}><span>{String(index + 1).padStart(2, "0")}</span><strong>{material}</strong></article>)}</div></section>}

        {monster.gearRelated.length > 0 && <section className="monster-gear"><div><p className="eyebrow light">Used for gear</p><h2>{monster.gearRelated[0].name}</h2><p>The verified materials above are used to craft this monster equipment set.</p></div><div><Layers3 /><span><small>{monster.gearRelated[0].slot || "Equipment"}</small><strong>{monster.gearRelated[0].name}</strong></span></div></section>}

        {monster.tips.length > 0 && <section className="monster-tips"><header><Info /><div><p className="eyebrow">Monster hunt tips</p><h2>Fight plan</h2></div></header><div>{monster.tips.map((tip) => <p key={tip}>{tip}</p>)}</div></section>}

        <p className="monster-source-note">Source data preserved for auditing: <a href={monster.sourceUrl} target="_blank" rel="noreferrer">Lords Mobile Wiki community reference<ExternalLink /></a>. Verify time-sensitive event information in-game.</p>

        <section className="related-monsters"><header><div><p className="eyebrow">Keep hunting</p><h2>Related monsters</h2></div><Link href="/monsters">Browse all monsters</Link></header><div>{related.map((candidate) => <Link className="related-monster-card" href={`/monsters/${candidate.slug}`} key={candidate.slug}><MonsterImage src={candidate.thumbnail || candidate.image} alt={`${candidate.name} monster`} /><span><small>{candidate.monsterType}</small><strong>{candidate.name}</strong><b>{candidate.recommendedAttackType ? `Use ${candidate.recommendedAttackType}` : "Open guide"}</b></span></Link>)}</div></section>
      </section>
    </div>
    <MonsterMobileActions slug={monster.slug} name={monster.name} />
    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Monster Hunt Guide</span></div></div><p>Lineups and mechanics are based on the preserved community source for this monster. Missing information is intentionally left unavailable.</p></div></footer>
  </main>;
}
