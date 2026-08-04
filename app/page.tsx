import { ArrowUpRight, CalendarClock, Command, Settings2, ShieldCheck } from "lucide-react";
import { LoginPanel } from "./LoginPanel";

export default function Home() {
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Bot Services</span></div></div>
        <div className="story-copy">
          <p className="eyebrow light">Everything in one place</p>
          <h1>Your service.<br /><em>Clearly managed.</em></h1>
          <p>See your subscription, renewal date, connected game accounts and important commands—then request configuration changes without long chat threads.</p>
          <div className="feature-row">
            <div><CalendarClock /><span><strong>Never miss renewal</strong><small>Clear expiry date and status</small></span></div>
            <div><Settings2 /><span><strong>Simple setting requests</strong><small>Submit changes account by account</small></span></div>
            <div><Command /><span><strong>Commands at hand</strong><small>Search the important t commands</small></span></div>
          </div>
        </div>
        <div className="story-note"><ShieldCheck size={18} /><span>Your portal stores service records—not game passwords.</span><ArrowUpRight size={18} /></div>
      </section>
      <section className="login-panel-wrap"><LoginPanel /></section>
    </main>
  );
}
