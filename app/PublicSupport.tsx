"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, ClipboardList, Command, Copy, ExternalLink, Settings2 } from "lucide-react";
import { CommandLibrary } from "./CommandLibrary";

export function PublicSupport() {
  const [prefix, setPrefix] = useState("!");
  const activePrefix = prefix || "!";

  return <main className="public-support">
    <header className="support-site-header"><div className="support-shell support-nav"><a href="/" className="site-brand" aria-label="LordsCare support home"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Subscriber Support</span></div></a><nav><a href="/setup-request"><ClipboardList size={14} />Setup request</a><a href="#commands">Commands</a><a href="https://help.lords-bot.com/faq/guild-bank-commands/" target="_blank" rel="noreferrer">Official guide<ExternalLink size={14} /></a></nav></div></header>
    <section className="support-hero" id="top"><div className="support-shell support-hero-grid"><div className="support-intro"><p className="eyebrow">LordsCare subscriber support</p><h1>Find the right bot command. <em>Fast.</em></h1><p>Browse the complete Guild Bank command library without creating an account or signing in. Search by purpose, switch between member and bank-control commands, and copy ready-to-use examples.</p><a className="primary-button support-cta" href="#commands"><Command size={18} />Browse commands</a></div><aside className="prefix-card"><span className="metric-icon green"><Command /></span><p className="eyebrow">Personalize examples</p><h2>What is your command prefix?</h2><p>Examples update instantly. The standard prefix is <code>!</code>.</p><label>Command prefix<input value={prefix} onChange={(event) => setPrefix(event.target.value.replace(/\s/g, "").slice(0, 3))} maxLength={3} aria-label="Command prefix" placeholder="!" /></label><div className="prefix-preview"><small>Preview</small><code>{activePrefix}bal</code></div></aside></div></section>
    <section className="support-highlights"><div className="support-shell"><div><BookOpen /><span><strong>67 documented commands</strong><small>Based on the official Lords Bot guide</small></span></div><div><CheckCircle2 /><span><strong>Clear command categories</strong><small>Member, search, balance, resources and bank control</small></span></div><div><Copy /><span><strong>Ready to copy</strong><small>Examples automatically use your chosen prefix</small></span></div></div></section>
    <section className="support-shell setup-promo"><div className="setup-promo-icon"><Settings2 /></div><div><p className="eyebrow">Complete guided request</p><h2>Configure every part of your bot</h2><p>Choose daily tasks, protection, gathering, monster hunts, rallies, growth, heroes, familiars, army training, events, and rewards. Get one complete summary—no login or password required.</p></div><a className="primary-button" href="/setup-request">Create full setup<ClipboardList size={17} /></a></section>
    <div className="support-shell support-command-section"><CommandLibrary prefix={activePrefix} /></div>
    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot subscriber support</span></div></div><p>Need account-specific assistance? Contact your LordsCare representative through your usual support channel.</p></div></footer>
  </main>;
}
