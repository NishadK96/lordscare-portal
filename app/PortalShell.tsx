"use client";

import { useMemo, useState } from "react";
import {
  Bell, CalendarDays, Check, ChevronDown, CircleUserRound, Clock3, Command,
  Copy, CreditCard, Gauge, Gamepad2, Headphones, LayoutDashboard, LogOut,
  Menu, MoreHorizontal, Plus, RefreshCw, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Users, WalletCards, X,
} from "lucide-react";
import { adminCustomers, commands, customer, gameAccounts, planPrices, settingsRequests } from "./data";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type Role = "customer" | "admin";
type NavItem = { id: string; label: string; icon: React.ComponentType<{ size?: number }> };

const customerNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "accounts", label: "My accounts", icon: Gamepad2 },
  { id: "commands", label: "Commands", icon: Command },
  { id: "settings", label: "Bot settings", icon: Settings2 },
  { id: "support", label: "Support", icon: Headphones },
];

const adminNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "customers", label: "Customers", icon: Users },
  { id: "renewals", label: "Renewals", icon: CalendarDays },
  { id: "requests", label: "Setting requests", icon: SlidersHorizontal },
  { id: "plans", label: "Plans", icon: WalletCards },
];

function Status({ children }: { children: React.ReactNode }) {
  const tone = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${tone}`}><i />{children}</span>;
}

function PortalFrame({ role, active, setActive, children }: { role: Role; active: string; setActive: (id: string) => void; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = role === "admin" ? adminNav : customerNav;
  const displayName = role === "admin" ? "Nishad" : customer.name;

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="portal-app">
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-head">
          <a href="/" className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>{role === "admin" ? "Admin console" : "Customer portal"}</span></div></a>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <nav>{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); setMobileOpen(false); }}><item.icon size={19} />{item.label}{item.id === "requests" && <b>2</b>}</button>)}</nav>
        <div className="sidebar-foot">
          {role === "customer" && <div className="help-card"><Sparkles size={20} /><strong>Need help?</strong><span>We usually reply within a few hours.</span><button onClick={() => setActive("support")}>Contact support</button></div>}
          <button className="profile-button"><span>{displayName[0]}</span><div><strong>{displayName}</strong><small>{role === "admin" ? "Owner · Admin" : customer.email}</small></div><ChevronDown size={16} /></button>
          <button className="signout-button" onClick={signOut}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      <section className="portal-main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <div><p className="eyebrow">{role === "admin" ? "Business control centre" : `Hello, ${displayName}`}</p><h1>{items.find((item) => item.id === active)?.label}</h1></div>
          <div className="topbar-actions"><button aria-label="Notifications"><Bell size={19} /><i /></button><div className="avatar">{displayName[0]}</div></div>
        </header>
        <div className="page-content">{children}</div>
      </section>
    </main>
  );
}

export function CustomerPortal() {
  const [active, setActive] = useState("overview");
  return <PortalFrame role="customer" active={active} setActive={setActive}>
    {active === "overview" && <CustomerOverview setActive={setActive} />}
    {active === "accounts" && <AccountsView setActive={setActive} />}
    {active === "commands" && <CommandsView />}
    {active === "settings" && <BotSettings />}
    {active === "support" && <SupportView />}
  </PortalFrame>;
}

function CustomerOverview({ setActive }: { setActive: (id: string) => void }) {
  return <>
    <section className="hero-card customer-hero">
      <div><div className="hero-label"><ShieldCheck size={18} />Subscription active</div><h2>{customer.plan}</h2><p>Your service is running normally across 2 of 3 configured accounts.</p><div className="hero-actions"><button className="light-button" onClick={() => setActive("accounts")}>View accounts</button><button className="ghost-button" onClick={() => setActive("settings")}>Request a change</button></div></div>
      <div className="renewal-dial"><div><strong>{customer.daysLeft}</strong><span>days left</span></div><p>Renews<br /><b>{customer.renewal}</b></p></div>
    </section>
    <section className="stat-grid three">
      <article><span className="metric-icon green"><Gamepad2 /></span><div><small>Connected accounts</small><strong>3 <em>/ 3</em></strong><p>2 online · 1 pending</p></div></article>
      <article><span className="metric-icon amber"><CalendarDays /></span><div><small>Next renewal</small><strong>18 Sep</strong><p>3-month plan · {customer.amount}</p></div></article>
      <article><span className="metric-icon blue"><Settings2 /></span><div><small>Open requests</small><strong>1</strong><p>Submitted today</p></div></article>
    </section>
    <div className="content-grid">
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Live status</p><h3>Your accounts</h3></div><button className="text-button" onClick={() => setActive("accounts")}>View all</button></div><div className="account-list">{gameAccounts.map((account) => <div key={account.id}><span className="game-avatar"><Gamepad2 /></span><div><strong>{account.name}</strong><small>{account.kingdom} · {account.sync}</small></div><Status>{account.status}</Status></div>)}</div></section>
      <section className="panel action-panel"><div className="panel-head"><div><p className="eyebrow">Quick actions</p><h3>What would you like to do?</h3></div></div><button onClick={() => setActive("settings")}><Settings2 /><span><strong>Change bot settings</strong><small>Send a controlled request</small></span></button><button onClick={() => setActive("commands")}><Command /><span><strong>Find a command</strong><small>Browse important t commands</small></span></button><button onClick={() => setActive("support")}><Headphones /><span><strong>Ask for support</strong><small>Get help with your service</small></span></button></section>
    </div>
  </>;
}

function AccountsView({ setActive }: { setActive: (id: string) => void }) {
  return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">3 of 3 slots used</p><h3>Connected game accounts</h3><p className="muted">Account passwords are never displayed or collected here.</p></div><button className="primary-button compact" onClick={() => setActive("settings")}><Settings2 size={17} />Bot settings</button></div><div className="account-card-grid">{gameAccounts.map((account, index) => <article key={account.id}><div className="account-card-top"><span className="game-avatar large"><Gamepad2 /></span><Status>{account.status}</Status></div><h3>{account.name}</h3><p>{account.kingdom}</p><dl><div><dt>Account reference</dt><dd>LC-A{2041 + index}</dd></div><div><dt>Last sync</dt><dd>{account.sync}</dd></div><div><dt>Configuration</dt><dd>{index === 2 ? "Awaiting setup" : "Standard farming"}</dd></div></dl><button className="secondary-button" onClick={() => setActive("settings")}>Manage settings</button></article>)}</div></section>;
}

function CommandsView() {
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState(false);
  const filtered = useMemo(() => commands.filter((item) => item.admin === admin && `${item.command} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [query, admin]);
  const [copied, setCopied] = useState("");
  function copy(value: string) { navigator.clipboard?.writeText(value); setCopied(value); setTimeout(() => setCopied(""), 1200); }
  return <section className="panel full-panel"><div className="panel-head commands-head"><div><p className="eyebrow">Guild Bank prefix: t</p><h3>Important commands</h3><p className="muted">Copy a command, then replace example values where needed.</p></div><div className="segmented"><button className={!admin ? "active" : ""} onClick={() => setAdmin(false)}>Member</button><button className={admin ? "active" : ""} onClick={() => setAdmin(true)}>Admin</button></div></div><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search commands…" /></div><div className="command-list">{filtered.map((item) => <article key={item.command}><div><code>{item.command}</code><span>{item.group}</span></div><p>{item.description}</p><button onClick={() => copy(item.command)} aria-label={`Copy ${item.command}`}>{copied === item.command ? <Check size={18} /> : <Copy size={18} />}</button></article>)}</div></section>;
}

function BotSettings() {
  const [account, setAccount] = useState(gameAccounts[0].id);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget);
    const settings = Object.fromEntries(form.entries());
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data: session } = await supabase.auth.getUser();
      if (session.user) await supabase.from("bot_setting_requests").insert({ user_id: session.user.id, game_account_id: account, requested_settings: settings });
    }
    setTimeout(() => { setSaving(false); setSubmitted(true); }, 450);
  }
  if (submitted) return <section className="success-card"><span><Check /></span><p className="eyebrow">Request received</p><h2>Your configuration request is now pending review.</h2><p>We will review it before applying anything to your bot account. You can continue using the current settings meanwhile.</p><button className="primary-button compact" onClick={() => setSubmitted(false)}>Submit another request</button></section>;
  return <form className="settings-layout" onSubmit={submit}><section className="panel"><div className="panel-head"><div><p className="eyebrow">Step 1</p><h3>Select account</h3></div></div><div className="account-picker">{gameAccounts.map((item) => <label key={item.id} className={account === item.id ? "selected" : ""}><input type="radio" name="account" value={item.id} checked={account === item.id} onChange={() => setAccount(item.id)} /><span className="game-avatar"><Gamepad2 /></span><div><strong>{item.name}</strong><small>{item.kingdom}</small></div><i>{account === item.id && <Check size={14} />}</i></label>)}</div></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">Step 2</p><h3>Choose requested settings</h3><p className="muted">Changes are reviewed by LordsCare before they are applied.</p></div></div><div className="form-grid"><label>Hunting<select name="hunting" defaultValue="on"><option value="on">Enabled</option><option value="off">Disabled</option></select></label><label>Gathering<select name="gathering" defaultValue="on"><option value="on">Enabled</option><option value="off">Disabled</option></select></label><label>Monster level<select name="monster_level" defaultValue="2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label><label>Shield reminder<select name="shield_reminder" defaultValue="4 hours"><option>2 hours</option><option>4 hours</option><option>8 hours</option><option>12 hours</option></select></label></div><div className="toggle-list"><label><input type="checkbox" name="vergeway_collection" defaultChecked /><span /><div><strong>Vergeway daily collection</strong><small>Collect available daily Vergeway rewards.</small></div></label><label><input type="checkbox" name="guild_gifts" defaultChecked /><span /><div><strong>Guild gift collection</strong><small>Collect available guild gifts.</small></div></label><label><input type="checkbox" name="quest_board" /><span /><div><strong>Guild Festival quest board</strong><small>Enable supported quest-board actions.</small></div></label></div><label className="notes-field">Additional instructions<textarea name="notes" placeholder="Tell us what you want changed. Do not enter game passwords or security codes." rows={4} /></label><div className="security-note"><ShieldCheck size={19} /><span><strong>Keep credentials private.</strong> This form is only for configuration preferences.</span></div><button className="primary-button submit-settings" disabled={saving}>{saving ? "Submitting…" : "Submit for review"}</button></section></form>;
}

function SupportView() {
  return <div className="content-grid support-grid"><section className="panel"><p className="eyebrow">Contact support</p><h2>How can we help?</h2><p className="muted">Send a service question or describe an issue. Never include a game password or verification code.</p><form className="support-form" onSubmit={(e) => e.preventDefault()}><label>Topic<select><option>Account setup</option><option>Bot settings</option><option>Renewal or payment</option><option>Commands</option><option>Other</option></select></label><label>Message<textarea rows={6} placeholder="Describe what you need help with…" /></label><button className="primary-button">Send support request</button></form></section><section className="panel contact-card"><span className="metric-icon blue"><Headphones /></span><h3>Direct support</h3><p>For urgent account or renewal help, contact your LordsCare representative through your usual support channel.</p><div><Clock3 /><span><strong>Support hours</strong><small>Responses are handled as soon as possible</small></span></div><div><ShieldCheck /><span><strong>Private by design</strong><small>We never ask for credentials in support messages</small></span></div></section></div>;
}

export function AdminPortal() {
  const [active, setActive] = useState("overview");
  const [adding, setAdding] = useState(false);
  return <PortalFrame role="admin" active={active} setActive={setActive}>
    {active === "overview" && <AdminOverview setActive={setActive} onAdd={() => setAdding(true)} />}
    {active === "customers" && <CustomersView onAdd={() => setAdding(true)} />}
    {active === "renewals" && <RenewalsView />}
    {active === "requests" && <RequestsView />}
    {active === "plans" && <PlansView />}
    {adding && <AddCustomerDialog onClose={() => setAdding(false)} />}
  </PortalFrame>;
}

function AdminOverview({ setActive, onAdd }: { setActive: (id: string) => void; onAdd: () => void }) {
  return <><section className="admin-welcome"><div><p className="eyebrow">Tuesday, 4 August 2026</p><h2>Good morning, Nishad.</h2><p>Two configuration requests and one renewal need your attention.</p></div><button className="primary-button compact" onClick={onAdd}><Plus size={17} />Add customer</button></section><section className="stat-grid four"><article><span className="metric-icon blue"><Users /></span><div><small>Active customers</small><strong>18</strong><p><b>+3</b> this month</p></div></article><article><span className="metric-icon green"><Gamepad2 /></span><div><small>Managed accounts</small><strong>47</strong><p>7 free + 11 paid slots</p></div></article><article><span className="metric-icon amber"><CreditCard /></span><div><small>Monthly revenue</small><strong>₹8,460</strong><p><b>+12.4%</b> vs last month</p></div></article><article><span className="metric-icon violet"><RefreshCw /></span><div><small>Renewals due</small><strong>4</strong><p>Within the next 7 days</p></div></article></section><div className="content-grid admin-grid"><section className="panel"><div className="panel-head"><div><p className="eyebrow">Action queue</p><h3>Setting requests</h3></div><button className="text-button" onClick={() => setActive("requests")}>View all</button></div><div className="request-list">{settingsRequests.slice(0, 2).map((request) => <article key={request.id}><span className="request-icon"><Settings2 /></span><div><strong>{request.customer} · {request.account}</strong><p>{request.change}</p><small>{request.submitted}</small></div><Status>{request.status}</Status></article>)}</div></section><section className="panel"><div className="panel-head"><div><p className="eyebrow">Next 7 days</p><h3>Renewals</h3></div><button className="text-button" onClick={() => setActive("renewals")}>View all</button></div><div className="renewal-list">{adminCustomers.filter((item) => item.status !== "Active").map((item) => <div key={item.id}><div className="date-box"><strong>{item.renewal.slice(0,2)}</strong><span>AUG</span></div><div><strong>{item.name}</strong><small>{item.accounts} account plan · {item.amount}</small></div><Status>{item.status}</Status></div>)}</div></section></div><section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Recently updated</p><h3>Customers</h3></div><button className="text-button" onClick={() => setActive("customers")}>Manage customers</button></div><CustomerTable rows={adminCustomers.slice(0, 3)} /></section></>;
}

function CustomerTable({ rows = adminCustomers }: { rows?: typeof adminCustomers }) {
  return <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Plan</th><th>Accounts</th><th>Renewal</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.id}</small></td><td>{item.plan}</td><td>{item.accounts}</td><td>{item.renewal}</td><td><strong>{item.amount}</strong></td><td><Status>{item.status}</Status></td><td><button className="icon-btn"><MoreHorizontal size={19} /></button></td></tr>)}</tbody></table></div>;
}

function CustomersView({ onAdd }: { onAdd: () => void }) { const [query, setQuery] = useState(""); const rows = adminCustomers.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())); return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">18 active customers</p><h3>Customer management</h3></div><button className="primary-button compact" onClick={onAdd}><Plus size={17} />Add customer</button></div><div className="table-tools"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers…" /></div><button className="secondary-button"><SlidersHorizontal size={16} />Filter</button></div><CustomerTable rows={rows} /></section>; }

function AddCustomerDialog({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setTimeout(() => { setBusy(false); setMessage("Preview complete. Connect Supabase to send a real invitation."); }, 400); return; }
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/admin/invite", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: JSON.stringify(body) });
    const result = await response.json() as { error?: string };
    setBusy(false); setMessage(response.ok ? "Invitation sent and pending subscription created." : result.error ?? "Could not add customer.");
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-customer-title" onMouseDown={(e) => e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Admin action</p><h2 id="add-customer-title">Add a customer</h2></div><button className="icon-btn" onClick={onClose}><X /></button></div><p className="muted">The customer receives a secure email invitation. You can activate service after verifying payment.</p><form onSubmit={submit} className="support-form"><label>Full name<input name="fullName" placeholder="Customer name" required /></label><label>Email address<input name="email" type="email" placeholder="customer@example.com" required /></label><label>Plan<select name="planCode" defaultValue="1A-M">{planPrices.flatMap((plan) => [<option key={`${plan.accounts}A-M`} value={`${plan.accounts}A-M`}>{plan.accounts} account · Monthly · ₹{plan.monthly}</option>,<option key={`${plan.accounts}A-Q`} value={`${plan.accounts}A-Q`}>{plan.accounts} account · 3 months · ₹{plan.quarterly}</option>,<option key={`${plan.accounts}A-Y`} value={`${plan.accounts}A-Y`}>{plan.accounts} account · Yearly · ₹{plan.yearly}</option>])}</select></label><button className="primary-button" disabled={busy}>{busy ? "Sending invitation…" : "Invite customer"}</button></form>{message && <p className="form-message">{message}</p>}</section></div>;
}

function RenewalsView() { return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Renewal workflow</p><h3>Upcoming and overdue renewals</h3><p className="muted">Reminder points: 7 days, 3 days, 1 day and expiry day.</p></div></div><div className="timeline">{adminCustomers.map((item) => <article key={item.id}><div className="timeline-dot"><CalendarDays /></div><div><span>{item.renewal}</span><h3>{item.name}</h3><p>{item.accounts} accounts · {item.plan} · {item.amount}</p></div><Status>{item.status}</Status><button className="secondary-button">Record renewal</button></article>)}</div></section>; }

function RequestsView() { const [requests, setRequests] = useState(settingsRequests); function update(id: string, status: string) { setRequests((rows) => rows.map((row) => row.id === id ? { ...row, status } : row)); } return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Owner approval required</p><h3>Bot setting requests</h3><p className="muted">Review every requested change before applying it to the bot.</p></div></div><div className="review-list">{requests.map((request) => <article key={request.id}><div className="review-top"><div><span>{request.id} · {request.submitted}</span><h3>{request.customer}</h3><p>{request.account}</p></div><Status>{request.status}</Status></div><div className="change-box"><Settings2 /><span><small>Requested change</small><strong>{request.change}</strong></span></div><label>Admin note<input placeholder="Optional note for the customer" /></label><div className="review-actions"><button className="secondary-button" onClick={() => update(request.id, "Rejected")}>Reject</button><button className="primary-button compact" onClick={() => update(request.id, "Approved")}><Check size={16} />Approve</button></div></article>)}</div></section>; }

function PlansView() { return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Published customer pricing</p><h3>Plans and prices</h3><p className="muted">Amounts are kept exactly as approved.</p></div><button className="secondary-button">Edit plans</button></div><div className="plan-table"><div className="plan-row plan-head"><span>Accounts</span><span>Monthly</span><span>3 months</span><span>Yearly</span></div>{planPrices.map((plan) => <div className="plan-row" key={plan.accounts}><strong>{plan.accounts} {plan.accounts === 1 ? "account" : "accounts"}</strong><span>₹{plan.monthly.toLocaleString("en-IN")}</span><span>₹{plan.quarterly.toLocaleString("en-IN")}</span><span>₹{plan.yearly.toLocaleString("en-IN")}</span></div>)}</div><div className="plan-note"><ShieldCheck /><span><strong>Plan control</strong><p>Existing subscriptions keep their recorded amount and dates when published prices change.</p></span></div></section>; }
