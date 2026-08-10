"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarDays, CheckCircle2, Command, Copy, Crosshair, MessageCircle, Swords } from "lucide-react";
import { CommandLibrary } from "./CommandLibrary";
import { generalWhatsAppUrl } from "./contact";
import { SupportHeader } from "./SupportHeader";

export function PublicSupport() {
  const [prefix, setPrefix] = useState("!");
  const activePrefix = prefix || "!";

  return <main className="public-support">
    <SupportHeader active="commands" subtitle="Subscriber Support" />
    <section className="support-hero" id="top"><div className="support-shell support-hero-grid"><div className="support-intro"><p className="eyebrow">LordsCare subscriber support</p><h1>Find the right bot command. <em>Fast.</em></h1><p>Browse the complete Guild Bank command library without creating an account or signing in. Search by purpose, switch between member and bank-control commands, and copy ready-to-use examples.</p><div className="support-hero-actions"><a className="primary-button support-cta" href="#commands"><Command size={18} />Browse commands</a><Link className="support-plan-cta" href="/plans">Plans from ₹150<CheckCircle2 /></Link></div></div><aside className="prefix-card"><span className="metric-icon green"><Command /></span><p className="eyebrow">Personalize examples</p><h2>What is your command prefix?</h2><p>Examples update instantly. The standard prefix is <code>!</code>.</p><label>Command prefix<input value={prefix} onChange={(event) => setPrefix(event.target.value.replace(/\s/g, "").slice(0, 3))} maxLength={3} aria-label="Command prefix" placeholder="!" /></label><div className="prefix-preview"><small>Preview</small><code>{activePrefix}bal</code></div></aside></div></section>
    <section className="support-highlights"><div className="support-shell"><div><BookOpen /><span><strong>67 documented commands</strong><small>Based on the official Lords Bot guide</small></span></div><div><CheckCircle2 /><span><strong>Clear command categories</strong><small>Member, search, balance, resources and bank control</small></span></div><div><Copy /><span><strong>Ready to copy</strong><small>Examples automatically use your chosen prefix</small></span></div></div></section>
    <section className="support-shell home-conversion-card"><div><p className="eyebrow light">Ready to get started?</p><h2>Plans from ₹150 per month.</h2><p>Choose one to five managed accounts, compare monthly, three-month, and yearly prices, then send a prepared enquiry.</p></div><div><Link className="conversion-plans-link" href="/plans">Compare plans</Link><a className="conversion-whatsapp-link" href={generalWhatsAppUrl} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp us</a></div></section>
    <section className="support-shell monster-home-promo"><div><p className="eyebrow light">Monster Hunt Guide</p><h2>Know the weakness. Send the right heroes.</h2><p>Search 43 verified monsters, compare attack recommendations, and open level-specific F2P and P2P lineups in seconds.</p><Link className="primary-button" href="/monsters"><Crosshair />Find a monster</Link></div><div className="monster-home-art" aria-hidden="true"><span /><span /><span /><strong>43 guides</strong></div></section>
    <section className="support-shell events-promo"><div><p className="eyebrow">Event guides</p><h2>Plan before you spend.</h2><p>Simple daily checklists, point sources, reward milestones, and preparation tips for major Lords Mobile events.</p><a className="secondary-button" href="/events">Explore event guides<CalendarDays size={17} /></a></div><a className="featured-event-card" href="/events#guild-duel"><span><Swords size={19} />First guide</span><strong>Guild Duel</strong><small>5 days · Daily themes · Solo and guild rewards</small></a></section>
    <div className="support-shell support-command-section" id="commands"><CommandLibrary prefix={activePrefix} /></div>
    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot subscriber support</span></div></div><p>Ready to enquire? <Link href="/plans">Compare plans</Link> or <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer">chat with LordsCare on WhatsApp</a>.</p></div></footer>
  </main>;
}
