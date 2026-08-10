import type { Metadata } from "next";
import Image from "next/image";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, Flag, Gift, Info, Sparkles, Swords, Trophy, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Lords Mobile Event Guides",
  description: "Practical Lords Mobile event guides, beginning with Guild Duel daily themes, point sources, rewards, and preparation tips.",
};

const themes = [
  ["Day 1", "Familiar Growth", "Familiar EXP, skill EXP, Mana Crystals, Talent Orbs, gathering, and project speed-ups."],
  ["Day 2", "Research Racer", "Equipment materials, Holy Stars, gathering, and project speed-ups."],
  ["Day 3", "Hero Coach", "Hero levels, ranks, medals, STA, Energy, Colosseum wins, and speed-ups."],
  ["Day 4", "Artifact Resurgence", "Artifact Fair Chests, appraisals, and Artifact Records."],
  ["Day 5", "Comprehensive Development", "Troop training, research might, Mana Crystals, Hero Medals, artifacts, and speed-ups."],
];

const dayOneSources = [
  ["Spend 1 Mana Crystal", "+1,050"],
  ["Increase Familiar EXP by 10", "+30"],
  ["Increase Familiar Skill EXP by 10", "+1"],
  ["Use 1 Bright Talent Orb", "+6,000"],
  ["Use 1 Brilliant Talent Orb", "+12,000"],
  ["Gather 5,000 resources", "+1.1 shown"],
];

const rewardTiers = [
  ["Tier 1", "16K", "50K", "200K"],
  ["Tier 2", "240K", "540K", "1.2M"],
  ["Tier 3", "1.5M", "2.5M", "5M"],
];

export default function EventsPage() {
  return <main className="events-page">
    <header className="support-site-header"><div className="support-shell support-nav"><a href="/" className="site-brand" aria-label="LordsCare support home"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Event Guides</span></div></a><nav><a href="/"><ArrowLeft size={14} />Commands</a><a href="/setup-request">Bot setup</a></nav></div></header>

    <section className="events-hero"><div className="support-shell events-hero-grid"><div><p className="eyebrow light">Lords Mobile event desk</p><h1>Smarter preparation. <em>Better rewards.</em></h1><p>Use these practical guides to understand each event, save the right items, and complete the best point sources at the right time.</p></div><div className="events-hero-mark"><Trophy /><strong>01</strong><span>Event guide available</span></div></div></section>

    <section className="support-shell event-directory"><div className="section-heading"><div><p className="eyebrow">Events library</p><h2>Current guides</h2></div><span>More events will be added here</span></div><a className="event-library-card" href="#guild-duel"><div className="event-library-icon"><Swords /></div><div><small>5-day guild competition</small><strong>Guild Duel</strong><p>Daily themes, solo tiers, guild competition, and a focused Day 1 Familiar Growth checklist.</p></div><span>Open guide</span></a></section>

    <article className="support-shell guild-duel-guide" id="guild-duel">
      <header className="guild-duel-title"><div><p className="eyebrow">Event 01</p><h2>Guild Duel</h2><p>A five-day, one-versus-one guild competition where every day has a different scoring theme.</p></div><a href="https://lordsmobile.fandom.com/wiki/Guild_Duel" target="_blank" rel="noreferrer">Community reference<ExternalLink size={14} /></a></header>

      <section className="event-overview-grid"><div className="event-shot"><Image src="/events/guild-duel-day-1.jpg" alt="Guild Duel Day 1 Familiar Growth screen showing point sources and solo tier rewards" width={1600} height={787} priority /><span>Your in-game screenshot · Day 1</span></div><div className="event-facts"><p className="eyebrow">How it works</p><h3>Five days. Two guilds. One winner.</h3><div><CalendarDays /><span><strong>Different theme each day</strong><small>Score through the actions listed under Today&apos;s Theme.</small></span></div><div><Users /><span><strong>Guild versus guild</strong><small>Your guild is matched with another guild based on Cup count.</small></span></div><div><Trophy /><span><strong>Total points decide the result</strong><small>The guild with the higher combined score after Day 5 wins.</small></span></div><div><Gift /><span><strong>Several reward tracks</strong><small>Participation, victory or consolation, solo tiers, and solo ranking rewards.</small></span></div></div></section>

      <section className="event-requirements"><div><Flag /><span><strong>Participation requirements</strong><small>Guild with more than 25 members · Castle level 15 or above</small></span></div><p>Confirm the current rules inside the game before the event begins, because event details and point values may change.</p></section>

      <section className="event-section"><div className="section-heading"><div><p className="eyebrow">Event schedule</p><h2>Daily themes</h2></div><span>Prepare items before their scoring day</span></div><div className="theme-timeline">{themes.map(([day, title, text], index) => <article key={day}><span>{index + 1}</span><small>{day}</small><strong>{title}</strong><p>{text}</p></article>)}</div></section>

      <section className="event-section day-one-section"><div className="section-heading"><div><p className="eyebrow">Day 1 spotlight</p><h2>Familiar Growth</h2></div><span>Values recorded from your screenshot</span></div><div className="day-one-grid"><div className="point-table"><div className="point-row heading"><span>Point source</span><strong>Points</strong></div>{dayOneSources.map(([source, points]) => <div className="point-row" key={source}><span>{source}</span><strong>{points}</strong></div>)}</div><aside className="event-checklist"><Sparkles /><h3>Day 1 checklist</h3><ul><li><CheckCircle2 />Open <b>Today&apos;s Theme</b> before using any saved item.</li><li><CheckCircle2 />Use Talent Orbs and Mana Crystals only when they count for this theme.</li><li><CheckCircle2 />Add steady points through gathering while completing higher-value actions.</li><li><CheckCircle2 />Check the live point bonus shown on your account before committing items.</li></ul></aside></div></section>

      <section className="event-section"><div className="section-heading"><div><p className="eyebrow">Solo progress</p><h2>Tier milestones</h2></div><span>Community-reported thresholds</span></div><div className="reward-tier-grid">{rewardTiers.map(([tier, first, second, third]) => <article key={tier}><Trophy /><strong>{tier}</strong><div><span>{first}</span><span>{second}</span><span>{third}</span></div></article>)}</div><p className="event-source-note"><Info size={15} />Your screenshot confirms the Tier 2 milestones of 240K, 540K, and 1.2M. Other thresholds come from the linked community reference and should be checked against the current in-game event.</p></section>

      <section className="event-strategy"><div><p className="eyebrow light">Simple strategy</p><h2>Save first. Score on the correct day.</h2></div><ol><li><span>01</span><p><strong>Review all five themes</strong>Know which items and completed queues should be saved.</p></li><li><span>02</span><p><strong>Prepare long queues early</strong>Time research, troop training, or other projects to finish during the matching day.</p></li><li><span>03</span><p><strong>Claim only after checking</strong>Open Today&apos;s Theme and confirm the action appears before spending rare items.</p></li></ol></section>
    </article>

    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot subscriber support</span></div></div><p>Event values can change between releases. Always use the current in-game event screen as the final reference.</p></div></footer>
  </main>;
}
