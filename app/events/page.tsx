import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, CheckCircle2, Crown, ExternalLink, Flag, Gift, Info, Shield, Sparkles, Swords, Target, Trophy, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Lords Mobile Event Guides",
  description: "Practical Lords Mobile guides for Guild Duel and Guild Showdown, including daily tasks, rank-based troop assignments, and preparation tips.",
};

type DuelDay = {
  day: number;
  theme: string;
  summary: string;
  accent: string;
  save: string[];
  tip: string;
  tasks: [string, string, string?][];
};

const duelDays: DuelDay[] = [
  {
    day: 1, theme: "Familiar Growth", accent: "familiar", summary: "Develop familiars, use Talent Orbs, gather resources, and finish timed projects.",
    save: ["Mana Crystals", "Bright and Brilliant Talent Orbs", "Familiar EXP and Skill EXP items"],
    tip: "Talent Orbs give the strongest listed single-action points. Confirm the current theme before using them.",
    tasks: [
      ["Spend 1 Mana Crystal", "+1,050"],
      ["Increase Familiar EXP by 10", "+30"],
      ["Increase Familiar Skill EXP by 10", "+1"],
      ["Use 1 Bright Talent Orb", "+6,000", "Counts for Army Talent upgrades or Talent awakenings"],
      ["Use 1 Brilliant Talent Orb", "+12,000", "Counts for Army Talent upgrades or Talent awakenings"],
      ["Gather 5,000 resources", "+1.1 shown", "Excludes resources gathered by Familiar skills"],
      ["Speed up any project by 1 minute", "+4.4 reported"],
      ["Obtain 1 Giftable Gem", "+4 reported"],
    ],
  },
  {
    day: 2, theme: "Research Racer", accent: "research", summary: "Score through equipment materials, Holy Stars, gathering, and project speed-ups.",
    save: ["Purple and Gold Blazing Embers", "Astralite and Specialized Astralite", "Holy Stars"],
    tip: "Blazing Embers count only when equipment tempering is completed. Do not spend them early on an unfinished temper.",
    tasks: [
      ["Use 1 Purple Blazing Ember", "+12,800", "Counts only when equipment tempering is completed"],
      ["Use 1 Gold Blazing Ember", "+51,200", "Counts only when equipment tempering is completed"],
      ["Use 1 Astralite", "+30,000"],
      ["Use 1 Specialized Astralite", "+1,500"],
      ["Use 100 Holy Stars", "+660"],
      ["Gather 5,000 resources", "+1.25 reported", "Excludes resources gathered by Familiar skills"],
      ["Speed up any project by 1 minute", "+4.4 reported"],
    ],
  },
  {
    day: 3, theme: "Hero Coach", accent: "hero", summary: "Advance heroes, spend stamina and energy, and win Hero Colosseum battles.",
    save: ["Hero EXP items", "Hero Medals", "STA and Energy items"],
    tip: "Hold Hero Medals and EXP items for this day. Complete your Colosseum attempts while wins award points.",
    tasks: [
      ["Obtain 1 new Hero", "+52,500"],
      ["Gain 1 Hero level", "+1,050"],
      ["Promote a Hero by 1 rank", "+5,250"],
      ["Spend 1 Hero Medal", "+1,575", "Counts for Hero Hiring or Hero enhancements"],
      ["Win 1 Hero Colosseum battle", "+2,000"],
      ["Spend 1 STA", "+66"],
      ["Spend 10 Energy", "+5.25"],
      ["Speed up any project by 1 minute", "+4.4 reported"],
    ],
  },
  {
    day: 4, theme: "Artifact Resurgence", accent: "artifact", summary: "Open Artifact Fair Chests, appraise artifacts, and spend Artifact Records.",
    save: ["Artifact Fair Chests", "Appraisal attempts", "Uncommon, Rare, Epic, and Legendary Records"],
    tip: "The listed rewards rise sharply with record rarity. Save your higher-grade Records until this theme is active.",
    tasks: [
      ["Open 1 Artifact Fair Chest", "+11,000"],
      ["Appraise Artifacts 1 time", "+27,500"],
      ["Use 1 Uncommon Record", "+110"],
      ["Use 1 Rare Record", "+660"],
      ["Use 1 Epic Record", "+3,960"],
      ["Use 1 Legendary Record", "+23,760"],
    ],
  },
  {
    day: 5, theme: "Comprehensive Development", accent: "development", summary: "Combine troop training, research, artifacts, Hero Medals, and project speed-ups.",
    save: ["Completed troop-training queues", "Castle and Army Star Scrolls", "Research, Mana Crystals, Hero Medals, and Artifact Fair Chests"],
    tip: "Troop tiers scale proportionally in the reported values. Start a long training queue early and finish it during Day 5.",
    tasks: [
      ["Train 1 T1 troop", "+1.05"],
      ["Train 1 T2 troop", "+2.1"],
      ["Train 1 T3 troop", "+4.2"],
      ["Train 1 T4 troop", "+8.4"],
      ["Craft 1 Luminous Gear", "+10"],
      ["Win 1 Army Colosseum battle", "+20,000"],
      ["Use 1 Castle Star Scroll", "+5,000"],
      ["Use 1 Army Star Scroll", "+30,000"],
      ["Spend 1 Mana Crystal", "+1,050"],
      ["Increase Research Might by 1", "+1.05", "Research completed with Technolabes is excluded"],
      ["Spend 1 Hero Medal", "+1,575", "Counts for Hero Hiring or Hero enhancements"],
      ["Open 1 Artifact Fair Chest", "+11,000"],
      ["Speed up any project by 1 minute", "+4.4 reported"],
    ],
  },
];

const rewardTiers = [
  ["Tier 1", "16K", "50K", "200K"],
  ["Tier 2", "240K", "540K", "1.2M"],
  ["Tier 3", "1.5M", "2.5M", "5M"],
];

const showdownRanks = {
  cavalry: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64],
  ranged: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65],
  infantry: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63],
};

export default function EventsPage() {
  return <main className="events-page">
    <header className="support-site-header"><div className="support-shell support-nav"><a href="/" className="site-brand" aria-label="LordsCare support home"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Event Guides</span></div></a><nav aria-label="Support sections"><a className="mobile-primary-link" href="/"><ArrowLeft size={14} />Commands</a><a className="mobile-primary-link" href="#guild-duel">Duel</a><a className="mobile-primary-link" href="#guild-showdown">Showdown</a></nav></div></header>

    <section className="events-hero"><div className="support-shell events-hero-grid"><div><p className="eyebrow light">Lords Mobile event desk</p><h1>Smarter preparation. <em>Better rewards.</em></h1><p>Use these practical guides to understand each event, save the right items, and complete the best point sources at the right time.</p></div><div className="events-hero-mark"><Trophy /><strong>02</strong><span>Event guides available</span></div></div></section>

    <section className="support-shell event-directory"><div className="section-heading"><div><p className="eyebrow">Events library</p><h2>Current guides</h2></div><span>More events will be added here</span></div><div className="event-library-grid"><a className="event-library-card" href="#guild-duel"><div className="event-library-icon"><Swords /></div><div><small>5-day guild competition</small><strong>Guild Duel</strong><p>Complete task screens for all five themes, point values, reward tiers, and preparation tips.</p></div><span>Open guide</span></a><a className="event-library-card showdown-library-card" href="#guild-showdown"><div className="event-library-icon"><Shield /></div><div><small>Rank-based battle lineup</small><strong>Guild Showdown</strong><p>Find your assigned troop type from your guild might rank and register with the correct battle setup.</p></div><span>Open guide</span></a></div></section>

    <article className="support-shell guild-duel-guide" id="guild-duel">
      <header className="guild-duel-title"><div><p className="eyebrow">Event 01</p><h2>Guild Duel</h2><p>A five-day, one-versus-one guild competition where every day has a different scoring theme.</p></div><a href="https://lordsmobile.fandom.com/wiki/Guild_Duel" target="_blank" rel="noreferrer">Community reference<ExternalLink size={14} /></a></header>

      <section className="event-facts-wide"><div><p className="eyebrow">How it works</p><h3>Five days. Two guilds. One winner.</h3></div><div><CalendarDays /><span><strong>Different theme each day</strong><small>Score through the actions listed under Today&apos;s Theme.</small></span></div><div><Users /><span><strong>Guild versus guild</strong><small>Guilds are matched based on Cup count.</small></span></div><div><Trophy /><span><strong>Total points decide the result</strong><small>The higher combined score after Day 5 wins.</small></span></div><div><Gift /><span><strong>Several reward tracks</strong><small>Participation, match result, solo tiers, and solo ranking.</small></span></div></section>

      <section className="event-requirements"><div><Flag /><span><strong>Participation requirements</strong><small>Guild with more than 25 members · Castle level 15 or above</small></span></div><p>Confirm the current rules and point values in-game before spending items, because bonuses and event details may change.</p></section>

      <nav className="duel-day-nav" aria-label="Guild Duel daily themes">{duelDays.map((item) => <a key={item.day} href={`#guild-duel-day-${item.day}`}><span>Day {item.day}</span><strong>{item.theme}</strong></a>)}</nav>

      <section className="duel-day-stack">{duelDays.map((item) => <article className={`duel-day-screen ${item.accent}`} id={`guild-duel-day-${item.day}`} key={item.day}>
        <header className="duel-screen-header"><div><span>Day {item.day}</span><p>Today&apos;s Theme</p></div><div><small>Guild Duel</small><h2>{item.theme}</h2><p>{item.summary}</p></div><div className="duel-task-count"><strong>{item.tasks.length}</strong><span>point sources</span></div></header>
        <div className="duel-screen-body"><section className="duel-task-list"><div className="duel-task-heading"><span>Source</span><strong>Points</strong></div>{item.tasks.map(([task, points, note]) => <div className="duel-task-row" key={task}><span><strong>{task}</strong>{note && <small>{note}</small>}</span><b>{points}</b></div>)}</section><aside className="duel-day-plan"><Sparkles /><p className="eyebrow">Prepare for Day {item.day}</p><h3>What to save</h3><ul>{item.save.map((entry) => <li key={entry}><CheckCircle2 />{entry}</li>)}</ul><div><Info /><p>{item.tip}</p></div></aside></div>
      </article>)}</section>

      <section className="event-section"><div className="section-heading"><div><p className="eyebrow">Solo progress</p><h2>Tier milestones</h2></div><span>Community-reported thresholds</span></div><div className="reward-tier-grid">{rewardTiers.map(([tier, first, second, third]) => <article key={tier}><Trophy /><strong>{tier}</strong><div><span>{first}</span><span>{second}</span><span>{third}</span></div></article>)}</div><p className="event-source-note"><Info size={15} />The Day 1 screenshot supplied for reference showed Tier 2 milestones of 240K, 540K, and 1.2M. Check every threshold against the current in-game event.</p></section>

      <section className="event-strategy"><div><p className="eyebrow light">Simple strategy</p><h2>Save first. Score on the correct day.</h2></div><ol><li><span>01</span><p><strong>Review all five screens</strong>Know which items and completed queues should be saved.</p></li><li><span>02</span><p><strong>Prepare long queues early</strong>Time research, troop training, or other projects for the matching day.</p></li><li><span>03</span><p><strong>Claim only after checking</strong>Confirm the live task and point bonus before spending rare items.</p></li></ol></section>
    </article>

    <article className="support-shell guild-showdown-guide" id="guild-showdown">
      <header className="guild-duel-title guild-showdown-title"><div><p className="eyebrow">Event 02</p><h2>Guild Showdown</h2><p>Register one coordinated army lineup, then face rival guild members in might order without losing troops.</p></div><a href="https://lordsmobile.fandom.com/wiki/Guild_Showdown" target="_blank" rel="noreferrer">Community reference<ExternalLink size={14} /></a></header>

      <section className="event-facts-wide showdown-facts"><div><p className="eyebrow">How it works</p><h3>Register once. Fight as a guild.</h3></div><div><Target /><span><strong>Registration locks your setup</strong><small>Active talents, equipment, army lineup, turf boosts, and might are recorded.</small></span></div><div><Users /><span><strong>Might decides battle order</strong><small>Members fight from the weakest registered contestant to the strongest.</small></span></div><div><Shield /><span><strong>No troop losses</strong><small>Heroes and troops are not wounded, killed, or captured during Showdown.</small></span></div><div><Trophy /><span><strong>Every win matters</strong><small>Each battle victory adds one event point to the guild result.</small></span></div></section>

      <section className="showdown-assignment"><header><div><p className="eyebrow light">Member registration tactic</p><h2>Use your Guild Board might rank</h2><p>Open <strong>Guild Board → Might Ranking → Your Rank</strong>, then register the single troop type assigned to your number. The repeating lineup helps the guild alternate formations against consecutive opponents.</p></div><div className="showdown-cycle"><span>Repeat every 3 ranks</span><strong>1 Cavalry · 2 Ranged · 3 Infantry</strong></div></header><div className="showdown-rank-grid"><article className="cavalry"><div><span>01</span><div><small>Ranks starting at 1</small><h3>Cavalry</h3></div></div><p>{showdownRanks.cavalry.join(", ")}</p></article><article className="ranged"><div><span>02</span><div><small>Ranks starting at 2</small><h3>Ranged</h3></div></div><p>{showdownRanks.ranged.join(", ")}</p></article><article className="infantry"><div><span>03</span><div><small>Ranks divisible by 3</small><h3>Infantry</h3></div></div><p>{showdownRanks.infantry.join(", ")}</p></article></div></section>

      <section className="showdown-checklist"><div><p className="eyebrow light">Before you register</p><h2>Make the recorded setup count.</h2><p>These choices should be active when you register or update your lineup.</p></div><div className="showdown-tip-grid"><article><Swords /><span><strong>Use one troop type</strong><small>Do not send mixed troops unless you are the rally lead.</small></span></article><article><Zap /><span><strong>Activate combat boosts</strong><small>Prepare Fury, Prison, and Altar boosts before registration.</small></span></article><article><Target /><span><strong>Switch to war setup</strong><small>Equip war gear, select army talents, and activate the 50% Army ATK boost.</small></span></article><article><Crown /><span><strong>Send your leader</strong><small>Include your leader so the registered army receives the intended battle benefits.</small></span></article></div><p className="showdown-warning"><Info />Guild Showdown actions do not activate Battle Fury by themselves. If Fury is part of your plan, activate it before registering and confirm every boost on the live registration screen.</p></section>
    </article>

    <footer className="support-footer"><div className="support-shell"><div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot subscriber support</span></div></div><p>Community-reported values may include research boosts and can change between event runs. The current in-game screen is the final reference.</p></div></footer>
  </main>;
}
