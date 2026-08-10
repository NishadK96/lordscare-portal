import type { Metadata } from "next";
import { Check, ChevronRight, MessageCircle, Settings2, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { generalWhatsAppUrl } from "../contact";
import { FeatureGrid } from "../FeatureGrid";
import { SupportHeader } from "../SupportHeader";

export const metadata: Metadata = {
  title: "Automation Features",
  description: "Explore the daily tasks, protection, growth, army, gathering, Monster Hunt, Familiar, and guild features available through LordsCare.",
};

const audiences = [
  { icon: Sparkles, title: "Daily account routines", text: "For players who want recurring collections and account tasks configured around their priorities." },
  { icon: Users, title: "Multiple accounts", text: "For players managing several accounts who want a clear plan and consistent setup." },
  { icon: ShieldCheck, title: "Protection-focused accounts", text: "For accounts that need carefully selected shield, shelter, and gathering reactions." },
  { icon: Settings2, title: "Custom development goals", text: "For players with specific building, research, troop, Familiar, or resource objectives." },
];

export default function FeaturesPage() {
  return <main className="features-page">
    <SupportHeader active="features" subtitle="Automation Features" />
    <section className="features-hero"><div className="support-shell features-hero-grid"><div><p className="eyebrow light">LordsCare feature guide</p><h1>Tell us what you need <em>handled.</em></h1><p>Choose the routines, protection rules, growth priorities, army targets, and guild tools that fit your account. LordsCare helps turn those choices into a clear configuration.</p><div className="features-hero-actions"><a href="#all-features">Explore all features<ChevronRight /></a><Link href="/plans">View subscription plans</Link></div></div><aside><span><Check />Eight configuration areas</span><strong>One setup built around your priorities.</strong><p>Feature availability can depend on account progress, unlocked game content, and the configuration you select.</p></aside></div></section>
    <section className="support-shell all-features-section" id="all-features"><header className="features-section-heading"><div><p className="eyebrow">Available automation areas</p><h2>What LordsCare can configure</h2></div><p>Select only what makes sense for your account. Settings can be reviewed as your priorities change.</p></header><FeatureGrid /></section>
    <section className="feature-audience-section"><div className="support-shell"><header className="features-section-heading light-heading"><div><p className="eyebrow light">Who it helps</p><h2>Designed for different account goals</h2></div></header><div className="feature-audience-grid">{audiences.map(({ icon: Icon, title, text }) => <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="support-shell public-how-section"><header><p className="eyebrow">How it works</p><h2>From plan to configuration in three steps</h2></header><div><article><span>01</span><h3>Choose your plan</h3><p>Select the number of accounts and the subscription period you prefer.</p></article><article><span>02</span><h3>Share your requirements</h3><p>Tell us which routines and priorities you want configured.</p></article><article><span>03</span><h3>Confirm your setup</h3><p>Review the plan and continue with direct LordsCare support.</p></article></div></section>
    <section className="support-shell features-final-cta"><div><p className="eyebrow light">Ready to choose?</p><h2>Build the service around your account.</h2><p>Compare the plans or send us your questions directly on WhatsApp.</p></div><div><Link href="/plans">Compare plans</Link><a href={generalWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle />Ask on WhatsApp</a></div></section>
    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Automation Features</span></div></div><p>Feature availability depends on the selected configuration and the account’s current progress.</p></div></footer>
  </main>;
}
