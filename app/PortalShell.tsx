"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import {
  Bell, CalendarDays, Check, ChevronDown, Clock3, Command,
  Copy, CreditCard, Gauge, Gamepad2, Headphones, LayoutDashboard, LogOut,
  LockKeyhole, Menu, Pencil, Plus, RefreshCw, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Trash2, Users, WalletCards, X,
} from "lucide-react";
import { planPrices } from "./data";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { CommandLibrary } from "./CommandLibrary";
import Link from "next/link";

type Role = "customer" | "admin";
type NavItem = { id: string; label: string; icon: React.ComponentType<{ size?: number }> };
type PortalAccount = { id: string; name: string; kingdom: string; status: string; sync: string; reference?: string };
type LiveSettingRequest = {
  id: string;
  userId: string;
  accountId: string;
  customer: string;
  customerCode?: string;
  account: string;
  accountReference?: string;
  submitted: string;
  createdAt: string;
  settings: Record<string, unknown>;
  status: string;
  adminNote?: string;
};
type CustomerSnapshot = { name: string; email: string; commandPrefix: string; plan: string; amount: string; renewal: string; renewalShort: string; daysLeft: number; status: string; accounts: PortalAccount[]; openRequests: number };
type AdminCustomerRow = { id: string; userId: string; subscriptionId?: string; planId?: string; accountLimit: number; commandPrefix: string; name: string; accounts: number; plan: string; renewal: string; status: string; amount: string; amountValue: number; startedAt?: string; renewsAt?: string };
type ManagedGameAccount = { id: string; display_name: string; account_reference: string; kingdom: string | null; bot_slot_reference: string | null; status: string };

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
  const [changingPassword, setChangingPassword] = useState(false);
  const [accessReady, setAccessReady] = useState(!isSupabaseConfigured);
  const [identity, setIdentity] = useState({ name: role === "admin" ? "Admin" : "Customer", email: "" });
  const items = role === "admin" ? adminNav : customerNav;
  const displayName = identity.name;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let activeCheck = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!activeCheck) return;
      if (!data.user) {
        window.location.replace(role === "admin" ? "/admin-login" : "/");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role, active, full_name").eq("id", data.user.id).single();
      if (!profile?.active) {
        await supabase.auth.signOut();
        window.location.replace("/");
        return;
      }
      if (role === "admin" && profile.role !== "admin") {
        window.location.replace("/customer");
        return;
      }
      if (role === "customer" && profile.role === "admin") {
        window.location.replace("/admin");
        return;
      }
      setIdentity({ name: profile.full_name || (role === "admin" ? "Admin" : "Customer"), email: data.user.email || "" });
      setAccessReady(true);
    });
    return () => { activeCheck = false; };
  }, [role]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [mobileOpen]);

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    window.location.href = "/";
  }

  if (!accessReady) return <main className="auth-loading"><div className="brand-mark">LC</div><p>Checking your secure session…</p></main>;

  return (
    <main className="portal-app">
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-head">
          <Link href="/" className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>{role === "admin" ? "Admin console" : "Customer portal"}</span></div></Link>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X /></button>
        </div>
        <nav>{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => { setActive(item.id); setMobileOpen(false); }}><item.icon size={19} />{item.label}</button>)}</nav>
        <div className="sidebar-foot">
          {role === "customer" && <div className="help-card"><Sparkles size={20} /><strong>Need help?</strong><span>We usually reply within a few hours.</span><button onClick={() => setActive("support")}>Contact support</button></div>}
          <button className="profile-button"><span>{displayName[0]}</span><div><strong>{displayName}</strong><small>{role === "admin" ? "Owner · Admin" : identity.email}</small></div><ChevronDown size={16} /></button>
          {role === "admin" && <button className="signout-button" onClick={() => setChangingPassword(true)}><LockKeyhole size={17} />Change password</button>}
          <button className="signout-button" onClick={signOut}><LogOut size={17} />Sign out</button>
        </div>
      </aside>
      {mobileOpen && <button className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" />}
      <section className="portal-main">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}><Menu /></button>
          <div><p className="eyebrow">{role === "admin" ? "Business control centre" : `Hello, ${displayName}`}</p><h1>{items.find((item) => item.id === active)?.label}</h1></div>
          <div className="topbar-actions"><button aria-label="Notifications"><Bell size={19} /><i /></button><div className="avatar">{displayName[0]}</div></div>
        </header>
        <div className="page-content">{children}</div>
      </section>
      {changingPassword && <ChangePasswordDialog email={identity.email} onClose={() => setChangingPassword(false)} />}
    </main>
  );
}

function ChangePasswordDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 12) { setMessage("Use at least 12 characters for the new password."); return; }
    if (newPassword !== confirmPassword) { setMessage("The new passwords do not match."); return; }
    if (newPassword === currentPassword) { setMessage("Choose a password different from the current one."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email) { setMessage("Your secure session is not ready. Sign in again and retry."); return; }
    setBusy(true); setMessage("");
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (verifyError) { setBusy(false); setMessage("The current password is incorrect."); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setBusy(false); setMessage(error.message); return; }
    setMessage("Password changed. Signing you out securely…");
    window.setTimeout(async () => {
      await supabase.auth.signOut();
      window.location.href = "/admin-login";
    }, 900);
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="change-password-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Admin security</p><h2 id="change-password-title">Change password</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close change password dialog"><X /></button></div><p className="muted">Confirm your current password, then choose a new password with at least 12 characters.</p><form className="support-form" onSubmit={changePassword}><label>Current password<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></label><label>New password<input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={12} required /></label><label>Confirm new password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={12} required /></label><p className="credential-warning"><ShieldCheck size={15} />You will be signed out after the password is changed.</p><button className="primary-button" disabled={busy}>{busy ? "Changing password…" : "Change password"}</button></form>{message && <p className="form-message" role="status">{message}</p>}</section></div>;
}

export function CustomerPortal() {
  const [active, setActive] = useState("overview");
  const [snapshot, setSnapshot] = useState<CustomerSnapshot | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setSnapshot({ name: "Customer", email: "", commandPrefix: "!", plan: "No active plan", amount: "—", renewal: "Not scheduled", renewalShort: "—", daysLeft: 0, status: "inactive", accounts: [], openRequests: 0 }); return; }
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || !mounted) return;
      const [{ data: profile }, { data: subscription }, { data: accountRows }, { count: requestCount }] = await Promise.all([
        supabase.from("profiles").select("full_name, command_prefix").eq("id", auth.user.id).single(),
        supabase.from("subscriptions").select("status, amount_paid_inr, renews_at, plan_id").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("game_accounts").select("id, display_name, account_reference, kingdom, status, last_sync_at").eq("user_id", auth.user.id).order("created_at"),
        supabase.from("bot_setting_requests").select("id", { count: "exact", head: true }).eq("user_id", auth.user.id).in("status", ["pending", "approved"]),
      ]);
      let plan: { account_limit: number; term_months: number } | null = null;
      if (subscription?.plan_id) {
        const { data } = await supabase.from("plans").select("account_limit, term_months").eq("id", subscription.plan_id).single();
        plan = data;
      }
      if (!mounted) return;
      const renewalDate = subscription?.renews_at ? new Date(subscription.renews_at) : null;
      const accounts: PortalAccount[] = (accountRows ?? []).map((row) => ({ id: row.id, name: row.display_name, reference: row.account_reference, kingdom: row.kingdom || "Kingdom not recorded", status: String(row.status).replaceAll("_", " "), sync: row.last_sync_at ? new Date(row.last_sync_at).toLocaleString("en-IN") : "Not synced yet" }));
      setSnapshot({
        name: profile?.full_name || "Customer",
        email: auth.user.email || "",
        commandPrefix: profile?.command_prefix || "!",
        plan: plan ? `${plan.account_limit} ${plan.account_limit === 1 ? "Account" : "Accounts"} · ${plan.term_months === 1 ? "Monthly" : plan.term_months === 3 ? "3 Months" : "Yearly"}` : "No active plan",
        amount: subscription ? `₹${Number(subscription.amount_paid_inr).toLocaleString("en-IN")}` : "—",
        renewal: renewalDate ? renewalDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Not scheduled",
        renewalShort: renewalDate ? renewalDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—",
        daysLeft: renewalDate ? Math.max(0, Math.ceil((renewalDate.getTime() - Date.now()) / 86400000)) : 0,
        status: subscription?.status || "inactive",
        accounts,
        openRequests: requestCount ?? 0,
      });
    })();
    return () => { mounted = false; };
  }, []);

  return <PortalFrame role="customer" active={active} setActive={setActive}>
    {active === "overview" && <CustomerOverview setActive={setActive} snapshot={snapshot} />}
    {active === "accounts" && <AccountsView setActive={setActive} snapshot={snapshot} />}
    {active === "commands" && <CommandLibrary prefix={snapshot?.commandPrefix || "!"} />}
    {active === "settings" && <BotSettings />}
    {active === "support" && <SupportView />}
  </PortalFrame>;
}

function CustomerOverview({ setActive, snapshot }: { setActive: (id: string) => void; snapshot: CustomerSnapshot | null }) {
  if (!snapshot) return <div className="empty-state"><RefreshCw /><h3>Loading your records…</h3></div>;
  const activeSubscription = snapshot.status === "active";
  return <>
    <section className="hero-card customer-hero">
      <div><div className="hero-label"><ShieldCheck size={18} />Subscription {snapshot.status.replaceAll("_", " ")}</div><h2>{snapshot.plan}</h2><p>{activeSubscription ? `${snapshot.accounts.length} connected game ${snapshot.accounts.length === 1 ? "account" : "accounts"}.` : "No active subscription details are currently recorded."}</p><div className="hero-actions"><button className="light-button" onClick={() => setActive("accounts")}>View accounts</button><button className="ghost-button" onClick={() => setActive("settings")}>Request a change</button></div></div>
      <div className="renewal-dial"><div><strong>{snapshot.daysLeft}</strong><span>days left</span></div><p>Renews<br /><b>{snapshot.renewal}</b></p></div>
    </section>
    <section className="stat-grid three">
      <article><span className="metric-icon green"><Gamepad2 /></span><div><small>Connected accounts</small><strong>{snapshot.accounts.length}</strong><p>Live Supabase records</p></div></article>
      <article><span className="metric-icon amber"><CalendarDays /></span><div><small>Next renewal</small><strong>{snapshot.renewalShort}</strong><p>{snapshot.plan} · {snapshot.amount}</p></div></article>
      <article><span className="metric-icon blue"><Settings2 /></span><div><small>Open requests</small><strong>{snapshot.openRequests}</strong><p>Pending or approved</p></div></article>
    </section>
    <div className="content-grid">
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Live status</p><h3>Your accounts</h3></div><button className="text-button" onClick={() => setActive("accounts")}>View all</button></div><div className="account-list">{snapshot.accounts.length ? snapshot.accounts.map((account) => <div key={account.id}><span className="game-avatar"><Gamepad2 /></span><div><strong>{account.name}</strong><small>{account.kingdom} · {account.sync}</small></div><Status>{account.status}</Status></div>) : <div className="empty-inline"><Gamepad2 /><span><strong>No connected accounts</strong><small>Your accounts will appear after the administrator adds them.</small></span></div>}</div></section>
      <section className="panel action-panel"><div className="panel-head"><div><p className="eyebrow">Quick actions</p><h3>What would you like to do?</h3></div></div><button onClick={() => setActive("settings")}><Settings2 /><span><strong>Change bot settings</strong><small>Send a controlled request</small></span></button><button onClick={() => setActive("commands")}><Command /><span><strong>Find a command</strong><small>Browse important {snapshot.commandPrefix} commands</small></span></button><button onClick={() => setActive("support")}><Headphones /><span><strong>Ask for support</strong><small>Get help with your service</small></span></button></section>
    </div>
  </>;
}

function AccountsView({ setActive, snapshot }: { setActive: (id: string) => void; snapshot: CustomerSnapshot | null }) {
  return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">{snapshot ? `${snapshot.accounts.length} connected` : "Loading"}</p><h3>Connected game accounts</h3><p className="muted">Account passwords are never displayed or collected here.</p></div><button className="primary-button compact" onClick={() => setActive("settings")}><Settings2 size={17} />Bot settings</button></div>{!snapshot ? <div className="empty-state"><RefreshCw /><h3>Loading accounts…</h3></div> : snapshot.accounts.length ? <div className="account-card-grid">{snapshot.accounts.map((account) => <article key={account.id}><div className="account-card-top"><span className="game-avatar large"><Gamepad2 /></span><Status>{account.status}</Status></div><h3>{account.name}</h3><p>{account.kingdom}</p><dl><div><dt>Account reference</dt><dd>{account.reference || "Not assigned"}</dd></div><div><dt>Last sync</dt><dd>{account.sync}</dd></div></dl><button className="secondary-button" onClick={() => setActive("settings")}>Manage settings</button></article>)}</div> : <div className="empty-state"><Gamepad2 /><h3>No connected game accounts</h3><p>The administrator has not added any account records to your profile.</p></div>}</section>;
}

function SettingToggle({ name, title, help, defaultChecked = false, warning }: { name: string; title: string; help: string; defaultChecked?: boolean; warning?: string }) {
  return <label className="setting-toggle"><input type="checkbox" name={name} defaultChecked={defaultChecked} /><span /><div><strong>{title}</strong><small>{help}</small>{warning && <em>{warning}</em>}</div></label>;
}

const settingCategories = [
  ["daily", "Daily & guild"], ["protection", "Protection"], ["gathering", "Gathering"],
  ["monsters", "Monster hunt"], ["rallies", "Darknest rallies"], ["growth", "Growth"],
  ["heroes", "Heroes & familiars"], ["events", "Events & rewards"],
] as const;

function BotSettings() {
  const [accounts, setAccounts] = useState<PortalAccount[]>([]);
  const [account, setAccount] = useState("");
  const [history, setHistory] = useState<LiveSettingRequest[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(isSupabaseConfigured);
  const [category, setCategory] = useState<(typeof settingCategories)[number][0]>("daily");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const appliedRequest = useMemo(() => history
    .filter((request) => request.accountId === account && request.status === "applied" && request.settings.settings_category === category)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0], [history, account, category]);
  const appliedSettings = appliedRequest?.settings;
  const appliedValue = (name: string, fallback: string) => appliedSettings && name in appliedSettings ? String(appliedSettings[name]) : fallback;
  const appliedChecked = (name: string, fallback = false) => {
    if (!appliedSettings) return fallback;
    if (!(name in appliedSettings)) return false;
    return ["on", "true", "1", "yes", "enabled"].includes(String(appliedSettings[name]).toLowerCase());
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    let mounted = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user || !mounted) return;
      const [{ data: accountRows }, { data: requestRows }] = await Promise.all([
        supabase.from("game_accounts").select("id, display_name, account_reference, kingdom, status, last_sync_at").eq("user_id", auth.user.id).order("created_at"),
        supabase.from("bot_setting_requests").select("id, game_account_id, requested_settings, status, admin_note, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      const liveAccounts: PortalAccount[] = (accountRows ?? []).map((row) => ({ id: row.id, name: row.display_name, reference: row.account_reference, kingdom: row.kingdom || "Kingdom not recorded", status: String(row.status).replaceAll("_", " "), sync: row.last_sync_at ? new Date(row.last_sync_at).toLocaleString("en-IN") : "Not synced yet" }));
      setAccounts(liveAccounts);
      setAccount(liveAccounts[0]?.id ?? "");
      const names = new Map(liveAccounts.map((item) => [item.id, item]));
      setHistory((requestRows ?? []).map((row) => ({ id: row.id, userId: auth.user!.id, accountId: row.game_account_id, customer: "You", account: names.get(row.game_account_id)?.name ?? "Account", accountReference: names.get(row.game_account_id)?.reference, submitted: new Date(row.created_at).toLocaleString("en-IN"), createdAt: row.created_at, settings: row.requested_settings ?? {}, status: row.status, adminNote: row.admin_note ?? undefined })));
      setLoadingRecords(false);
    })();
    return () => { mounted = false; };
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError("");
    if (!account) { setSaving(false); setError("No active game account is connected to your profile yet."); return; }
    const form = new FormData(event.currentTarget);
    const settings = Object.fromEntries(form.entries());
    for (const element of Array.from(event.currentTarget.elements)) {
      if (element instanceof HTMLInputElement && element.type === "checkbox" && element.name && !element.checked) settings[element.name] = "off";
    }
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data: session } = await supabase.auth.getUser();
      if (session.user) {
        const { error: requestError } = await supabase.from("bot_setting_requests").insert({ user_id: session.user.id, game_account_id: account, requested_settings: settings });
        if (requestError) { setSaving(false); setError("This account is not ready for setting requests yet. Please contact LordsCare support."); return; }
      }
    }
    setTimeout(() => { setSaving(false); setSubmitted(true); }, 450);
  }
  if (submitted) return <section className="success-card"><span><Check /></span><p className="eyebrow">Request received</p><h2>Your configuration request is now pending review.</h2><p>We will review it before applying anything to your bot account. You can continue using the current settings meanwhile.</p><button className="primary-button compact" onClick={() => setSubmitted(false)}>Submit another request</button></section>;
  return <form className="settings-layout settings-expanded" onSubmit={submit}>
    <section className="panel settings-sidebar"><div className="panel-head"><div><p className="eyebrow">Step 1</p><h3>Select account</h3></div></div><div className="account-picker">{loadingRecords ? <p className="empty-copy">Loading your accounts…</p> : accounts.length ? accounts.map((item) => <label key={item.id} className={account === item.id ? "selected" : ""}><input type="radio" name="account" value={item.id} checked={account === item.id} onChange={() => setAccount(item.id)} /><span className="game-avatar"><Gamepad2 /></span><div><strong>{item.name}</strong><small>{item.kingdom}</small></div><i>{account === item.id && <Check size={14} />}</i></label>) : <div className="empty-mini"><Gamepad2 /><strong>No connected accounts</strong><span>Ask LordsCare to add your game-account reference before submitting settings.</span></div>}</div><div className="specific-settings-note"><ShieldCheck size={17} /><p><strong>Specific settings only</strong><span>Only the category submitted in this request will be reviewed. Existing settings outside it stay unchanged.</span></p></div>{history.length > 0 && <div className="customer-history"><p className="eyebrow">Recent requests</p>{history.slice(0, 5).map((request) => <article key={request.id}><div><strong>{String(request.settings.settings_category ?? "Settings").replaceAll("_", " ")}</strong><small>{request.account} · {request.submitted}</small></div><Status>{request.status}</Status>{request.adminNote && <p>{request.adminNote}</p>}</article>)}</div>}</section>
    <section className="panel settings-main"><div className="panel-head"><div><p className="eyebrow">Step 2</p><h3>Choose requested settings</h3><p className="muted">Based on the official Lords Bot account-setting categories. Every request requires owner approval.</p></div><a className="docs-link" href="https://help.lords-bot.com/topic/account-settings/" target="_blank" rel="noreferrer">Official guide</a></div>
      <input type="hidden" name="settings_category" value={category} />
      <div className="settings-tabs" role="tablist">{settingCategories.map(([id, label]) => <button key={id} type="button" className={category === id ? "active" : ""} onClick={() => setCategory(id)}>{label}</button>)}</div>
      <div className="settings-category" key={`${account}:${category}:${appliedRequest?.id ?? "defaults"}`}>
        {appliedRequest && <div className="applied-settings-note"><Check size={16} /><span><strong>Current applied values loaded</strong><small>Last applied {appliedRequest.submitted}</small></span></div>}
        {category === "daily" && <><div className="category-intro"><h3>Daily tasks and guild activity</h3><p>Routine collections, quests and guild actions documented under General Settings.</p></div><div className="setting-grid"><SettingToggle name="vergeway_daily_collection" title="Vergeway daily collection" help="Collect available daily Vergeway rewards." defaultChecked /><SettingToggle name="mystery_box" title="Mystery Box" help="Collect mystery boxes when they appear." /><SettingToggle name="admin_guild_quests" title="Admin and Guild Quests" help="Complete available Admin and Guild quests." /><SettingToggle name="vip_quests_chests" title="VIP quests and chests" help="Collect available VIP quest rewards and chests." /><SettingToggle name="turf_quests" title="Turf Quests" help="Collect completed turf quests." /><SettingToggle name="daily_login_gift" title="Daily Login Gift" help="Collect the available daily login reward." /><SettingToggle name="adventure_log" title="Adventure Log" help="Complete available Adventure Log quests." /><SettingToggle name="send_guild_help" title="Send guild help" help="Automatically help guild members." /><SettingToggle name="request_guild_help" title="Request guild help" help="Request help for construction and research." /><SettingToggle name="collect_guild_gifts" title="Collect Guild Gifts" help="Open available guild gifts and clear opened entries." defaultChecked /><SettingToggle name="collect_fortune_packets" title="Collect Fortune Packets" help="Collect packets while the guild event is active." /><SettingToggle name="daily_missions" title="Daily Missions" help="Complete supported in-game daily missions." /></div></>}
        {category === "protection" && <>
          <div className="category-intro"><h3>Protection preferences</h3><p>Shield, anti-scout, shelter and gathering recall preferences mapped to Lords Bot’s individual controls.</p></div>
          <div className="setting-grid">
            <SettingToggle name="always_shielded" title="Always shielded" help="Keep an active shield on the account." defaultChecked={appliedChecked("always_shielded", true)} />
            <SettingToggle name="shield_when_attacked" title="Shield when attacked" help="Deploy a shield when an enemy attack is detected." defaultChecked={appliedChecked("shield_when_attacked")} />
            <SettingToggle name="shield_when_rallied" title="Shield when rallied" help="Deploy a shield when an enemy rally begins marching." defaultChecked={appliedChecked("shield_when_rallied")} />
            <SettingToggle name="shield_when_scouted" title="Shield when scouted" help="Deploy a shield when a scout march is detected." defaultChecked={appliedChecked("shield_when_scouted")} />
            <SettingToggle name="longer_shields_first" title="Use longer shields first" help="Prefer the longest available shield item." defaultChecked={appliedChecked("longer_shields_first")} />
          </div>
          <div className="form-grid three-fields">
            <label>Redeploy threshold<select name="shield_redeploy_minutes" defaultValue={appliedValue("shield_redeploy_minutes", "15")}><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option><option value="30">30 minutes</option></select></label>
            <label>Shelter behavior<select name="shelter_behavior" defaultValue={appliedValue("shelter_behavior", "always")}><option value="off">Do not shelter</option><option value="always">Always shelter</option><option value="under_attack">Shelter when under attack</option></select></label>
            <label>Shelter troops<select name="shelter_troops" defaultValue={appliedValue("shelter_troops", "best_troops")}><option value="hero_one">Hero and one troop</option><option value="best_troops">Hero and best troops</option></select></label>
          </div>
          <div className="setting-grid">
            <SettingToggle name="always_anti_scout" title="Always Anti-Scout" help="Maintain anti-scout while an item is available." defaultChecked={appliedChecked("always_anti_scout")} />
            <SettingToggle name="anti_scout_when_scouted" title="Anti-Scout when scouted" help="Deploy anti-scout after a scout march is detected." defaultChecked={appliedChecked("anti_scout_when_scouted")} />
            <SettingToggle name="recall_gatherers_attacked" title="Recall gatherers if attacked" help="Recall troops when their resource tile is attacked." defaultChecked={appliedChecked("recall_gatherers_attacked", true)} />
            <SettingToggle name="recall_gatherers_scouted" title="Recall gatherers if scouted" help="Recall troops when their resource tile is scouted." defaultChecked={appliedChecked("recall_gatherers_scouted")} />
            <SettingToggle name="recall_on_tile_conflict" title="Recall on tile conflict" help="Withdraw troops when another march conflicts with the target tile." defaultChecked={appliedChecked("recall_on_tile_conflict")} />
            <SettingToggle name="dont_shelter_siege" title="Do not shelter siege" help="Prioritize other troop types in the shelter." defaultChecked={appliedChecked("dont_shelter_siege")} />
          </div>
        </>}
        {category === "gathering" && <><div className="category-intro"><h3>Resource gathering</h3><p>Choose army limits, allowed tile levels and resource types.</p></div><div className="form-grid"><label>Gather resources<select name="gather_resources" defaultValue="enabled"><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label><label>Maximum gathering armies<select name="max_gathering_armies" defaultValue="0"><option value="0">Use all available</option><option value="1">1 army</option><option value="2">2 armies</option><option value="3">3 armies</option><option value="4">4 armies</option><option value="5">5 armies</option></select></label></div><fieldset className="choice-block"><legend>Allowed tile levels</legend><div>{[1,2,3,4,5].map((level) => <label key={level}><input type="checkbox" name={`gather_level_${level}`} defaultChecked={level >= 3} />Level {level}</label>)}</div></fieldset><fieldset className="choice-block"><legend>Resource types</legend><div>{["Food","Stone","Wood","Ore","Gold","Gems"].map((type) => <label key={type}><input type="checkbox" name={`gather_${type.toLowerCase()}`} defaultChecked={type !== "Gems"} />{type}</label>)}</div></fieldset><div className="setting-grid"><SettingToggle name="leave_one_spare_army" title="Leave one spare army" help="Keep one army free for hunting or other activity." /><SettingToggle name="gather_lowest_resource" title="Prioritize lowest resource" help="Prefer the selected resource type with the lowest castle amount." /><SettingToggle name="ignore_gem_level" title="Ignore level setting for gem lodes" help="Allow any available gem-lode level." /><SettingToggle name="only_clearable_tiles" title="Only gather clearable tiles" help="Prefer tiles the available army can fully clear." /></div></>}
        {category === "monsters" && <><div className="category-intro"><h3>Monster hunting</h3><p>Hunt range, energy use, priority and hero selection.</p></div><div className="form-grid three-fields"><label>Hunt monsters<select name="hunt_monsters" defaultValue="enabled"><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label><label>Hunt priority<select name="hunt_priority" defaultValue="any"><option value="any">Any</option><option value="full_health">Full health</option><option value="lowest_health">Lowest health</option><option value="steal">Steal</option></select></label><label>Start above energy<select name="hunt_energy_threshold" defaultValue="80"><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="80">80%</option><option value="100">100%</option></select></label></div><fieldset className="choice-block"><legend>Monster levels to hunt</legend><div>{[1,2,3,4,5].map((level) => <label key={level}><input type="checkbox" name={`hunt_level_${level}`} defaultChecked={level <= 2} />Level {level}</label>)}</div></fieldset><div className="setting-grid"><SettingToggle name="auto_select_hunt_heroes" title="Auto-select heroes" help="Use the bot's automatic hero selection for the monster." defaultChecked /><SettingToggle name="use_energy_items" title="Use energy items" help="Use bag items to refill hunting energy." warning="Uses inventory items" /><SettingToggle name="use_winged_boots" title="Use Winged Boots" help="Increase march speed during supported hunt situations." warning="Uses inventory items" /><SettingToggle name="send_unfinished_to_chat" title="Share unfinished monsters" help="Post the location in guild chat if the monster cannot be finished." /><SettingToggle name="combo_prediction" title="Use combo prediction" help="Estimate the required hunt multiplier before the finishing attack." /></div></>}
        {category === "rallies" && <><div className="category-intro"><h3>Darknest rallies</h3><p>These options apply to Darknest rallies—not player or wonder rallies.</p></div><div className="form-grid three-fields"><label>Join Darknest rallies<select name="join_darknest_rallies" defaultValue="enabled"><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></label><label>Maximum active rallies<select name="rally_limit" defaultValue="1"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label><label>Troops to send<select name="rally_troop_mode" defaultValue="highest"><option value="highest">Highest tier</option><option value="recommended">As recommended</option><option value="one">One troop</option></select></label></div><fieldset className="choice-block"><legend>Darknest levels to join</legend><div>{[1,2,3,4,5,6].map((level) => <label key={level}><input type="checkbox" name={`darknest_level_${level}`} defaultChecked={level <= 3} />Level {level}</label>)}</div></fieldset><div className="setting-grid"><SettingToggle name="dont_join_lab_full" title="Do not join if lab is full" help="Keep armies home when no Dark Essence space is available." defaultChecked /><SettingToggle name="dont_fill_rally" title="Do not fill rally" help="Avoid sending enough troops to fill rally capacity." /><SettingToggle name="dont_send_siege" title="Do not send siege" help="Exclude siege troops from Darknest rallies." defaultChecked /><SettingToggle name="dont_send_t5" title="Do not send T5" help="Exclude T5 troops from Darknest rallies." defaultChecked /><SettingToggle name="send_one_type" title="Send one troop type" help="Follow the rally leader's strongest troop ratio." /><SettingToggle name="transmute_dark_essences" title="Transmute Dark Essences" help="Automatically transmute essences in the lab." /></div></>}
        {category === "growth" && <><div className="category-intro"><h3>Buildings, research and army</h3><p>Progression controls. Item-spending choices are off by default.</p></div><div className="form-grid"><label>Maximum building level<select name="max_building_level" defaultValue="25">{Array.from({length: 25}, (_, i) => i + 1).map((level) => <option key={level}>{level}</option>)}</select></label><label>Building priority<select name="building_priority" defaultValue="no_priority"><option value="no_priority">No priority</option><option value="castle">Castle</option><option value="academy">Academy</option><option value="resource">Resource buildings</option><option value="barracks_infirmary">Barracks / Infirmary</option><option value="familiars">Familiars</option></select></label></div><div className="setting-grid"><SettingToggle name="auto_build" title="Auto Build" help="Automatically start available building upgrades." /><SettingToggle name="lowest_building_first" title="Lowest level first" help="Prefer lower-level buildings when building automatically." /><SettingToggle name="auto_research" title="Auto Research" help="Start research when no research is already active." /><SettingToggle name="research_target_system" title="Use research target system" help="Follow selected research targets and prerequisites." /><SettingToggle name="use_technolabes" title="Use Technolabes" help="Instantly finish eligible research." warning="Uses Technolabes; event points may not be gained" /><SettingToggle name="train_troops" title="Train troops" help="Enable configured automatic troop training." /><SettingToggle name="heal_troops" title="Heal infirmary troops" help="Automatically heal troops in the infirmary." /><SettingToggle name="heal_sanctuary" title="Heal Sanctuary" help="Heal supported Sanctuary batches." /><SettingToggle name="attack_trial_by_fire" title="Attack Trial by Fire" help="Complete supported Trial by Fire stages." /><SettingToggle name="use_speedups" title="Use Speed-Ups" help="Allow configured queues to use speed-up items." warning="Uses inventory items" /></div></>}
        {category === "heroes" && <><div className="category-intro"><h3>Heroes and familiars</h3><p>Hero progression, stages, Colosseum and familiar development.</p></div><div className="setting-grid"><SettingToggle name="hire_new_heroes" title="Hire new heroes" help="Hire heroes when enough medals are available." /><SettingToggle name="use_hero_exp" title="Use hero EXP items" help="Use available EXP items following hero priority." warning="Uses inventory items" /><SettingToggle name="upgrade_heroes" title="Upgrade heroes" help="Upgrade hero grade when medal requirements are met." /><SettingToggle name="enhance_heroes" title="Enhance heroes" help="Equip hero items and increase hero rank." /><SettingToggle name="auto_hero_stages" title="Auto-attack Hero Stages" help="Progress through configured Normal or Elite stages." /><SettingToggle name="limited_hero_challenges" title="Limited Hero Challenges" help="Attempt supported limited challenges." /><SettingToggle name="use_bravehearts" title="Use Braveheart items" help="Refill stamina for Hero Stages." warning="Uses inventory items" /><SettingToggle name="auto_colosseum" title="Auto-attack Colosseum" help="Use configured heroes for available attempts." /><SettingToggle name="collect_arena_gems" title="Collect Colosseum gems" help="Collect available rank rewards." /><SettingToggle name="open_pacts" title="Open Pacts" help="Open obtained familiar packs automatically." /><SettingToggle name="merge_pacts" title="Merge Pacts" help="Merge configured pact types when available." /><SettingToggle name="train_familiars" title="Train Familiars" help="Train selected familiars in priority order." /><SettingToggle name="use_familiar_skills" title="Use Familiar skills" help="Use supported non-attack familiar skills when available." /><SettingToggle name="enhance_familiars" title="Enhance Familiars" help="Use runes to improve selected familiar stages." /></div></>}
        {category === "events" && <><div className="category-intro"><h3>Events, Guild Fest and artifacts</h3><p>Event participation and reward collection settings.</p></div><div className="form-grid"><label>Guild Fest minimum points<input name="guild_fest_min_points" type="number" min="0" max="999" defaultValue="100" /></label><label>Guild Fest maximum points<input name="guild_fest_max_points" type="number" min="1" max="999" defaultValue="999" /></label></div><div className="setting-grid"><SettingToggle name="guild_fest_collect_rewards" title="Collect Guild Fest rewards" help="Collect earned rewards using the bot's documented priority." /><SettingToggle name="guild_fest_complete_missions" title="Complete Guild Fest missions" help="Take only the enabled supported mission types within the points range." /><SettingToggle name="guild_fest_buy_extra" title="Buy extra Guild Fest mission" help="Purchase another attempt after existing attempts are used." warning="Costs 1,000 gems" /><SettingToggle name="join_guild_showdown" title="Join Guild Showdown" help="Join the event with the bot's selected heroes, troops and familiars." /><SettingToggle name="appraise_artifacts" title="Appraise Artifacts" help="Appraise newly available artifacts." /><SettingToggle name="collect_free_artifact_chests" title="Collect free Artifact Chests" help="Open available chests that do not cost coins." /><SettingToggle name="buy_artifact_chests" title="Buy Artifact Chests" help="Spend Artifact Coins on configured chests." warning="Spends Artifact Coins" /><SettingToggle name="labyrinth_free_attempt" title="Labyrinth free attempt" help="Use only the available free daily attempt." /><SettingToggle name="tycoon_free_attempt" title="Kingdom Tycoon free attempt" help="Use only the available free daily roll." /></div></>}
      </div>
      <label className="notes-field">Additional instructions<textarea name="notes" placeholder="Tell us what you want changed. Do not enter game passwords, access keys or security codes." rows={4} /></label><div className="security-note"><ShieldCheck size={19} /><span><strong>Review before apply.</strong> LordsCare checks every request. Options that spend gems or inventory items are clearly marked and remain off unless selected.</span></div>{error && <p className="form-message">{error}</p>}<button className="primary-button submit-settings" disabled={saving}>{saving ? "Submitting…" : "Submit this category for review"}</button>
    </section>
  </form>;
}

function SupportView() {
  return <div className="content-grid support-grid"><section className="panel"><p className="eyebrow">Contact support</p><h2>How can we help?</h2><p className="muted">Send a service question or describe an issue. Never include a game password or verification code.</p><form className="support-form" onSubmit={(e) => e.preventDefault()}><label>Topic<select><option>Account setup</option><option>Bot settings</option><option>Renewal or payment</option><option>Commands</option><option>Other</option></select></label><label>Message<textarea rows={6} placeholder="Describe what you need help with…" /></label><button className="primary-button">Send support request</button></form></section><section className="panel contact-card"><span className="metric-icon blue"><Headphones /></span><h3>Direct support</h3><p>For urgent account or renewal help, contact your LordsCare representative through your usual support channel.</p><div><Clock3 /><span><strong>Support hours</strong><small>Responses are handled as soon as possible</small></span></div><div><ShieldCheck /><span><strong>Private by design</strong><small>We never ask for credentials in support messages</small></span></div></section></div>;
}

export function AdminPortal() {
  const [active, setActive] = useState("overview");
  const [adding, setAdding] = useState(false);
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [managedAccounts, setManagedAccounts] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [managingPlan, setManagingPlan] = useState<AdminCustomerRow | null>(null);
  const [managingAccounts, setManagingAccounts] = useState<AdminCustomerRow | null>(null);
  const [managingPrefix, setManagingPrefix] = useState<AdminCustomerRow | null>(null);

  async function loadAdminData() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setCustomers([]); setManagedAccounts(0); setPendingRequests(0); setLoading(false); return; }
    const [{ data: profiles }, { data: subscriptions }, { data: plans }, { data: accounts }, { count: requestCount }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, customer_code, command_prefix").eq("role", "customer").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("id, user_id, plan_id, status, amount_paid_inr, started_at, renews_at, created_at").order("created_at", { ascending: false }),
      supabase.from("plans").select("id, account_limit, term_months"),
      supabase.from("game_accounts").select("id, user_id"),
      supabase.from("bot_setting_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    const planMap = new Map((plans ?? []).map((plan) => [plan.id, plan]));
    const accountCounts = new Map<string, number>();
    for (const account of accounts ?? []) accountCounts.set(account.user_id, (accountCounts.get(account.user_id) ?? 0) + 1);
    const latestSubscriptions = new Map<string, (typeof subscriptions extends (infer T)[] | null ? T : never)>();
    for (const subscription of subscriptions ?? []) if (!latestSubscriptions.has(subscription.user_id)) latestSubscriptions.set(subscription.user_id, subscription);
    const rows: AdminCustomerRow[] = (profiles ?? []).map((profile) => {
      const subscription = latestSubscriptions.get(profile.id);
      const plan = subscription ? planMap.get(subscription.plan_id) : undefined;
      const renewalDate = subscription?.renews_at ? new Date(subscription.renews_at) : null;
      const days = renewalDate ? Math.ceil((renewalDate.getTime() - Date.now()) / 86400000) : null;
      const status = subscription ? (subscription.status === "active" && days !== null && days <= 7 ? "due soon" : subscription.status.replaceAll("_", " ")) : "no subscription";
      return { id: profile.customer_code || profile.id.slice(0, 8), userId: profile.id, subscriptionId: subscription?.id, planId: subscription?.plan_id, accountLimit: plan?.account_limit ?? 0, commandPrefix: profile.command_prefix || "!", name: profile.full_name, accounts: accountCounts.get(profile.id) ?? 0, plan: plan ? `${plan.account_limit} ${plan.account_limit === 1 ? "account" : "accounts"} · ${plan.term_months === 1 ? "Monthly" : plan.term_months === 3 ? "3 months" : "Yearly"}` : "Not assigned", renewal: renewalDate ? renewalDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Not scheduled", status, amount: subscription ? `₹${Number(subscription.amount_paid_inr).toLocaleString("en-IN")}` : "—", amountValue: subscription ? Number(subscription.amount_paid_inr) : 0, startedAt: subscription?.started_at, renewsAt: subscription?.renews_at };
    });
    setCustomers(rows); setManagedAccounts((accounts ?? []).length); setPendingRequests(requestCount ?? 0); setLoading(false);
  }

  useEffect(() => { loadAdminData(); }, []);
  const renewalsDue = customers.filter((row) => row.status === "due soon" || row.status === "past due" || row.status === "expired");
  const activeCustomers = customers.filter((row) => row.status === "active" || row.status === "due soon");
  const activeValue = activeCustomers.reduce((sum, row) => sum + row.amountValue, 0);
  return <PortalFrame role="admin" active={active} setActive={setActive}>
    {active === "overview" && <AdminOverview setActive={setActive} onAdd={() => setAdding(true)} customers={customers} managedAccounts={managedAccounts} pendingRequests={pendingRequests} renewalsDue={renewalsDue} activeValue={activeValue} loading={loading} />}
    {active === "customers" && <CustomersView onAdd={() => setAdding(true)} onManagePlan={setManagingPlan} onManageAccounts={setManagingAccounts} onManagePrefix={setManagingPrefix} rows={customers} loading={loading} />}
    {active === "renewals" && <RenewalsView rows={customers} loading={loading} onManagePlan={setManagingPlan} />}
    {active === "requests" && <RequestsView />}
    {active === "plans" && <PlansView />}
    {adding && <AddCustomerDialog onClose={() => setAdding(false)} />}
    {managingPlan && <ManagePlanDialog customer={managingPlan} onClose={() => setManagingPlan(null)} onSaved={() => { setManagingPlan(null); setLoading(true); loadAdminData(); }} />}
    {managingAccounts && <ManageAccountsDialog customer={managingAccounts} onClose={() => setManagingAccounts(null)} onChanged={loadAdminData} />}
    {managingPrefix && <ManageCommandPrefixDialog customer={managingPrefix} onClose={() => setManagingPrefix(null)} onSaved={() => { setManagingPrefix(null); setLoading(true); loadAdminData(); }} />}
  </PortalFrame>;
}

function AdminOverview({ setActive, onAdd, customers, managedAccounts, pendingRequests, renewalsDue, activeValue, loading }: { setActive: (id: string) => void; onAdd: () => void; customers: AdminCustomerRow[]; managedAccounts: number; pendingRequests: number; renewalsDue: AdminCustomerRow[]; activeValue: number; loading: boolean }) {
  const activeCount = customers.filter((row) => row.status === "active" || row.status === "due soon").length;
  const subscribedCount = customers.filter((row) => Boolean(row.subscriptionId)).length;
  return <><section className="admin-welcome"><div><p className="eyebrow">Live subscription register</p><h2>Admin overview</h2><p>Track customers, plans, account usage and renewals from one private dashboard.</p></div><div className="admin-welcome-actions"><div className="active-value"><small>Active plan value</small><strong>{loading ? "—" : `₹${activeValue.toLocaleString("en-IN")}`}</strong></div><button className="primary-button compact" onClick={onAdd}><Plus size={17} />Add customer</button></div></section><section className="stat-grid four"><article><span className="metric-icon blue"><Users /></span><div><small>Total subscribers</small><strong>{loading ? "—" : subscribedCount}</strong><p>Customers with a recorded plan</p></div></article><article><span className="metric-icon amber"><CreditCard /></span><div><small>Active subscriptions</small><strong>{loading ? "—" : activeCount}</strong><p>Active or due within 7 days</p></div></article><article><span className="metric-icon green"><Gamepad2 /></span><div><small>Managed accounts</small><strong>{loading ? "—" : managedAccounts}</strong><p>Connected account records</p></div></article><article><span className="metric-icon violet"><RefreshCw /></span><div><small>Renewals due</small><strong>{loading ? "—" : renewalsDue.length}</strong><p>Due soon, past due or expired</p></div></article></section><div className="content-grid admin-grid"><section className="panel"><div className="panel-head"><div><p className="eyebrow">Action queue</p><h3>Setting requests</h3></div><button className="text-button" onClick={() => setActive("requests")}>View all</button></div>{loading ? <p className="empty-copy">Loading requests…</p> : pendingRequests ? <div className="empty-inline"><Settings2 /><span><strong>{pendingRequests} pending {pendingRequests === 1 ? "request" : "requests"}</strong><small>Open the request queue to review the submitted settings.</small></span></div> : <div className="empty-inline"><Settings2 /><span><strong>No pending requests</strong><small>New customer submissions will appear here.</small></span></div>}</section><section className="panel"><div className="panel-head"><div><p className="eyebrow">Renewal queue</p><h3>Renewals</h3></div><button className="text-button" onClick={() => setActive("renewals")}>View all</button></div><div className="renewal-list">{loading ? <p className="empty-copy">Loading renewals…</p> : renewalsDue.length ? renewalsDue.slice(0, 3).map((item) => <div key={item.id}><div className="date-box"><CalendarDays size={18} /></div><div><strong>{item.name}</strong><small>{item.renewal} · {item.amount}</small></div><Status>{item.status}</Status></div>) : <div className="empty-inline"><CalendarDays /><span><strong>No renewals due</strong><small>Upcoming and overdue subscriptions will appear here.</small></span></div>}</div></section></div><section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Live customers</p><h3>Subscription register</h3></div><button className="text-button" onClick={() => setActive("customers")}>Manage customers</button></div><CustomerTable rows={customers.slice(0, 5)} loading={loading} /></section></>;
}

function CustomerTable({ rows, loading = false, onManagePlan, onManageAccounts, onManagePrefix }: { rows: AdminCustomerRow[]; loading?: boolean; onManagePlan?: (customer: AdminCustomerRow) => void; onManageAccounts?: (customer: AdminCustomerRow) => void; onManagePrefix?: (customer: AdminCustomerRow) => void }) {
  if (loading) return <div className="empty-state compact-empty"><RefreshCw /><h3>Loading customers…</h3></div>;
  if (!rows.length) return <div className="empty-state compact-empty"><Users /><h3>No customers yet</h3><p>Real customer records will appear after they are created.</p></div>;
  const hasActions = onManagePlan || onManageAccounts || onManagePrefix;
  return <div className="table-wrap customer-table"><table><thead><tr><th>Customer</th><th>Plan</th><th>Accounts</th><th>Prefix</th><th>Renewal</th><th>Amount</th><th>Status</th>{hasActions && <th />}</tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td data-label="Customer"><strong>{item.name}</strong><small>{item.id}</small></td><td data-label="Plan">{item.plan}</td><td data-label="Accounts">{item.accounts}{item.accountLimit ? ` / ${item.accountLimit}` : ""}</td><td data-label="Prefix"><code>{item.commandPrefix}</code></td><td data-label="Renewal">{item.renewal}</td><td data-label="Amount"><strong>{item.amount}</strong></td><td data-label="Status"><Status>{item.status}</Status></td>{hasActions && <td data-label="Actions"><div className="table-actions">{onManageAccounts && <button className="secondary-button table-action" onClick={() => onManageAccounts(item)}>Accounts</button>}{onManagePlan && <button className="secondary-button table-action" onClick={() => onManagePlan(item)}>Plan</button>}{onManagePrefix && <button className="secondary-button table-action" onClick={() => onManagePrefix(item)}>Prefix</button>}</div></td>}</tr>)}</tbody></table></div>;
}

function CustomersView({ onAdd, onManagePlan, onManageAccounts, onManagePrefix, rows, loading }: { onAdd: () => void; onManagePlan: (customer: AdminCustomerRow) => void; onManageAccounts: (customer: AdminCustomerRow) => void; onManagePrefix: (customer: AdminCustomerRow) => void; rows: AdminCustomerRow[]; loading: boolean }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = rows.filter((item) => {
    const matchesQuery = !normalizedQuery || [item.name, item.id, item.plan, item.renewal].some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">{loading ? "Loading" : `${rows.length} customer records`}</p><h3>Subscription register</h3><p className="muted">Search every subscriber and update their plan, due date, amount or account slots.</p></div><button className="primary-button compact" onClick={onAdd}><Plus size={17} />Add customer</button></div><div className="table-tools"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, customer ID, plan or date…" /></div><label className="status-filter"><SlidersHorizontal size={16} /><span className="sr-only">Filter by subscription status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="due soon">Due soon</option><option value="past due">Past due</option><option value="expired">Expired</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option><option value="no subscription">No subscription</option></select></label></div><CustomerTable rows={filtered} loading={loading} onManagePlan={onManagePlan} onManageAccounts={onManageAccounts} onManagePrefix={onManagePrefix} /></section>;
}

function ManageCommandPrefixDialog({ customer, onClose, onSaved }: { customer: AdminCustomerRow; onClose: () => void; onSaved: () => void }) {
  const [prefix, setPrefix] = useState(customer.commandPrefix || "!");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = prefix.trim();
    if (!value || /\s/.test(value) || [...value].length > 3) { setMessage("Use 1 to 3 characters with no spaces."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("profiles").update({ command_prefix: value, updated_at: new Date().toISOString() }).eq("id", customer.userId);
    if (error) { setBusy(false); setMessage(error.message); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) await supabase.from("audit_log").insert({ actor_id: auth.user.id, action: "customer_command_prefix_updated", entity_type: "profile", entity_id: customer.userId, details: { command_prefix: value } });
    setBusy(false); onSaved();
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="manage-prefix-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Guild Bank commands</p><h2 id="manage-prefix-title">Set prefix for {customer.name}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X /></button></div><p className="muted">The customer’s Commands page will display and copy every bank command with this prefix.</p><form className="support-form" onSubmit={save}><label>Command prefix<input value={prefix} onChange={(event) => setPrefix(event.target.value)} maxLength={3} placeholder="!" autoFocus required /></label><p className="credential-warning"><Command size={15} />Example: {prefix || "!"}bal</p><button className="primary-button" disabled={busy}>{busy ? "Saving…" : "Save command prefix"}</button></form>{message && <p className="form-message">{message}</p>}</section></div>;
}

const emptyAccountForm = { display_name: "", account_reference: "", kingdom: "", bot_slot_reference: "", status: "setup_pending" };

function ManageAccountsDialog({ customer, onClose, onChanged }: { customer: AdminCustomerRow; onClose: () => void; onChanged: () => void }) {
  const [accounts, setAccounts] = useState<ManagedGameAccount[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAccountForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAccounts() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data, error } = await supabase.from("game_accounts").select("id, display_name, account_reference, kingdom, bot_slot_reference, status").eq("user_id", customer.userId).order("created_at");
    setLoading(false);
    if (error) { setMessage(error.message); return; }
    setAccounts((data ?? []) as ManagedGameAccount[]);
  }

  // Account ownership is the only trigger; loadAccounts intentionally reads the latest dialog state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadAccounts(); }, [customer.userId]);

  function edit(account: ManagedGameAccount) {
    setEditingId(account.id);
    setForm({ display_name: account.display_name, account_reference: account.account_reference, kingdom: account.kingdom ?? "", bot_slot_reference: account.bot_slot_reference ?? "", status: account.status });
    setMessage("");
  }

  function resetForm() { setEditingId(null); setForm(emptyAccountForm); setMessage(""); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customer.subscriptionId) { setMessage("Assign a plan before adding an account."); return; }
    if (!editingId && accounts.length >= customer.accountLimit) { setMessage(`This plan allows ${customer.accountLimit} ${customer.accountLimit === 1 ? "account" : "accounts"}. Upgrade the plan to add more.`); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const payload = { user_id: customer.userId, subscription_id: customer.subscriptionId, display_name: form.display_name.trim(), account_reference: form.account_reference.trim(), kingdom: form.kingdom.trim() || null, bot_slot_reference: form.bot_slot_reference.trim() || null, status: form.status, updated_at: new Date().toISOString() };
    const result = editingId ? await supabase.from("game_accounts").update(payload).eq("id", editingId) : await supabase.from("game_accounts").insert(payload);
    if (result.error) { setBusy(false); setMessage(result.error.code === "23505" ? "That account reference is already in use." : result.error.message); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) await supabase.from("audit_log").insert({ actor_id: auth.user.id, action: editingId ? "game_account_updated" : "game_account_added", entity_type: "game_account", entity_id: editingId || customer.userId, details: { customer_id: customer.userId, account_reference: payload.account_reference, status: payload.status } });
    setBusy(false); resetForm(); await loadAccounts(); onChanged();
  }

  async function remove(account: ManagedGameAccount) {
    if (!window.confirm(`Remove ${account.display_name}? Its saved setting-request history will also be deleted.`)) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.from("game_accounts").delete().eq("id", account.id);
    if (error) { setBusy(false); setMessage(error.message); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) await supabase.from("audit_log").insert({ actor_id: auth.user.id, action: "game_account_removed", entity_type: "game_account", entity_id: account.id, details: { customer_id: customer.userId, account_reference: account.account_reference } });
    if (editingId === account.id) resetForm();
    setBusy(false); await loadAccounts(); onChanged();
  }

  const atLimit = !editingId && customer.accountLimit > 0 && accounts.length >= customer.accountLimit;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card accounts-modal" role="dialog" aria-modal="true" aria-labelledby="manage-accounts-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Customer accounts</p><h2 id="manage-accounts-title">Manage {customer.name}</h2></div><button className="icon-btn" onClick={onClose}><X /></button></div><div className="account-capacity"><span><strong>{accounts.length}</strong> of <strong>{customer.accountLimit}</strong> plan slots used</span><Status>{customer.status}</Status></div>{loading ? <p className="empty-copy">Loading accounts…</p> : accounts.length ? <div className="managed-account-list">{accounts.map((account) => <article key={account.id}><span className="game-avatar"><Gamepad2 /></span><div><strong>{account.display_name}</strong><small>{account.account_reference}{account.kingdom ? ` · ${account.kingdom}` : ""}</small></div><Status>{account.status.replaceAll("_", " ")}</Status><button className="icon-btn" onClick={() => edit(account)} aria-label={`Edit ${account.display_name}`}><Pencil size={15} /></button><button className="icon-btn danger-icon" onClick={() => remove(account)} disabled={busy} aria-label={`Remove ${account.display_name}`}><Trash2 size={15} /></button></article>)}</div> : <div className="empty-inline account-empty"><Gamepad2 /><span><strong>No accounts added</strong><small>Add the customer’s first managed game account below.</small></span></div>}<form className="support-form account-form" onSubmit={save}><div className="account-form-head"><div><p className="eyebrow">{editingId ? "Edit account" : "Add account"}</p><h3>{editingId ? "Update account details" : "Connect a game account"}</h3></div>{editingId && <button type="button" className="text-button" onClick={resetForm}>Cancel editing</button>}</div><div className="modal-form-grid"><label>Account name<input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} placeholder="Castle or account name" required /></label><label>Account reference<input value={form.account_reference} onChange={(event) => setForm({ ...form, account_reference: event.target.value })} placeholder="Unique ID or reference" required /></label></div><div className="modal-form-grid"><label>Kingdom<input value={form.kingdom} onChange={(event) => setForm({ ...form, kingdom: event.target.value })} placeholder="Optional" /></label><label>Bot slot reference<input value={form.bot_slot_reference} onChange={(event) => setForm({ ...form, bot_slot_reference: event.target.value })} placeholder="Optional internal slot" /></label></div><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="setup_pending">Setup pending</option><option value="active">Active</option><option value="paused">Paused</option><option value="disconnected">Disconnected</option></select></label><p className="credential-warning"><ShieldCheck size={15} />Never enter a game password, verification code or access key here.</p><button className="primary-button" disabled={busy || atLimit || !customer.subscriptionId}>{busy ? "Saving…" : editingId ? "Save account changes" : atLimit ? "Plan account limit reached" : "Add account"}</button></form>{!customer.subscriptionId && <p className="form-message">Assign a customer plan before adding accounts.</p>}{message && <p className="form-message">{message}</p>}</section></div>;
}

type DatabasePlan = { id: string; code: string; account_limit: number; term_months: number; price_inr: number };

function ManagePlanDialog({ customer, onClose, onSaved }: { customer: AdminCustomerRow; onClose: () => void; onSaved: () => void }) {
  const [plans, setPlans] = useState<DatabasePlan[]>([]);
  const [planId, setPlanId] = useState(customer.planId ?? "");
  const [status, setStatus] = useState(customer.status === "due soon" ? "active" : customer.status.replaceAll(" ", "_"));
  const [amount, setAmount] = useState(customer.amountValue || 0);
  const [startedAt, setStartedAt] = useState(customer.startedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [renewsAt, setRenewsAt] = useState(customer.renewsAt?.slice(0, 10) ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.from("plans").select("id, code, account_limit, term_months, price_inr").eq("active", true).order("account_limit").order("term_months").then(({ data }) => {
      const rows = (data ?? []) as DatabasePlan[];
      setPlans(rows);
      const selected = rows.find((plan) => plan.id === (customer.planId ?? rows[0]?.id));
      if (!planId && selected) setPlanId(selected.id);
      if (!customer.amountValue && selected) setAmount(selected.price_inr);
    });
  }, [customer.amountValue, customer.planId, planId]);

  function selectPlan(id: string) {
    setPlanId(id);
    const selected = plans.find((plan) => plan.id === id);
    if (selected) setAmount(selected.price_inr);
  }

  function setRenewalFromStart(start: string, selectedPlanId = planId) {
    const selected = plans.find((plan) => plan.id === selectedPlanId);
    if (!selected || !start) return;
    const date = new Date(`${start}T00:00:00`);
    date.setMonth(date.getMonth() + selected.term_months);
    setRenewsAt(date.toISOString().slice(0, 10));
  }

  async function save(renewNow = false) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !planId) { setMessage("Select a plan before saving."); return; }
    setBusy(true); setMessage("");
    let start = startedAt;
    let renewal = renewsAt;
    if (renewNow) {
      start = new Date().toISOString().slice(0, 10);
      const selected = plans.find((plan) => plan.id === planId)!;
      const date = new Date(`${start}T00:00:00`);
      date.setMonth(date.getMonth() + selected.term_months);
      renewal = date.toISOString().slice(0, 10);
      setStartedAt(start); setRenewsAt(renewal); setStatus("active");
    }
    const payload = { user_id: customer.userId, plan_id: planId, status: renewNow ? "active" : status, amount_paid_inr: Number(amount), started_at: start ? `${start}T00:00:00.000Z` : null, renews_at: renewal ? `${renewal}T00:00:00.000Z` : null, updated_at: new Date().toISOString() };
    const result = customer.subscriptionId ? await supabase.from("subscriptions").update(payload).eq("id", customer.subscriptionId) : await supabase.from("subscriptions").insert(payload);
    if (result.error) { setMessage(result.error.message); setBusy(false); return; }
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) await supabase.from("audit_log").insert({ actor_id: auth.user.id, action: customer.subscriptionId ? (renewNow ? "subscription_renewed" : "subscription_updated") : "subscription_assigned", entity_type: "subscription", entity_id: customer.subscriptionId || customer.userId, details: { customer_id: customer.userId, plan_id: planId, status: renewNow ? "active" : status, amount_paid_inr: Number(amount), renews_at: renewal } });
    setBusy(false); onSaved();
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal-card plan-modal" role="dialog" aria-modal="true" aria-labelledby="manage-plan-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">Customer subscription</p><h2 id="manage-plan-title">Manage {customer.name}</h2></div><button className="icon-btn" onClick={onClose}><X /></button></div><p className="muted">Assign a plan, change its status and dates, or start a fresh renewal period.</p><div className="support-form"><label>Plan<select value={planId} onChange={(event) => selectPlan(event.target.value)}><option value="">Select a plan</option>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.account_limit} {plan.account_limit === 1 ? "account" : "accounts"} · {plan.term_months === 1 ? "Monthly" : plan.term_months === 3 ? "3 months" : "Yearly"} · ₹{plan.price_inr.toLocaleString("en-IN")}</option>)}</select></label><div className="modal-form-grid"><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="pending">Pending</option><option value="active">Active</option><option value="past_due">Past due</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option></select></label><label>Amount paid (₹)<input type="number" min="0" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label></div><div className="modal-form-grid"><label>Start date<input type="date" value={startedAt} onChange={(event) => { setStartedAt(event.target.value); setRenewalFromStart(event.target.value); }} /></label><label>Renewal date<input type="date" value={renewsAt} onChange={(event) => setRenewsAt(event.target.value)} /></label></div><div className="plan-dialog-actions"><button className="secondary-button" disabled={busy} onClick={() => save(false)}>{customer.subscriptionId ? "Save changes" : "Assign plan"}</button><button className="primary-button" disabled={busy || !planId} onClick={() => save(true)}><RefreshCw size={16} />Renew from today</button></div></div>{message && <p className="form-message">{message}</p>}</section></div>;
}

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

function RenewalsView({ rows, loading, onManagePlan }: { rows: AdminCustomerRow[]; loading: boolean; onManagePlan: (customer: AdminCustomerRow) => void }) {
  const renewalRows = rows.filter((item) => item.renewsAt).sort((a, b) => new Date(a.renewsAt!).getTime() - new Date(b.renewsAt!).getTime());
  return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Renewal workflow</p><h3>Upcoming and overdue renewals</h3><p className="muted">Sorted by due date. Open a record to change the date, amount, status or renew from today.</p></div></div>{loading ? <div className="empty-state"><RefreshCw /><h3>Loading renewals…</h3></div> : renewalRows.length ? <div className="timeline">{renewalRows.map((item) => <article key={item.id}><div className="timeline-dot"><CalendarDays /></div><div><span>Due {item.renewal}</span><h3>{item.name}</h3><p>{item.accounts} / {item.accountLimit} accounts · {item.plan} · {item.amount}</p></div><Status>{item.status}</Status><button className="secondary-button" onClick={() => onManagePlan(item)}>Manage renewal</button></article>)}</div> : <div className="empty-state"><CalendarDays /><h3>No renewal records yet</h3><p>Subscriptions with renewal dates will appear here.</p></div>}</section>;
}

function readableSetting(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readableValue(value: unknown) {
  if (value === "on" || value === true) return "Enabled";
  if (value === false) return "Disabled";
  return String(value ?? "Not set").replaceAll("_", " ");
}

function RequestsView() {
  const [requests, setRequests] = useState<LiveSettingRequest[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState("pending");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setRequests([]); setSelectedId(""); setLoading(false); return;
    }
    const { data: rows, error: rowsError } = await supabase.from("bot_setting_requests").select("id, user_id, game_account_id, requested_settings, status, admin_note, created_at").order("created_at", { ascending: false });
    if (rowsError) { setMessage(rowsError.message); setLoading(false); return; }
    const userIds = [...new Set((rows ?? []).map((row) => row.user_id))];
    const accountIds = [...new Set((rows ?? []).map((row) => row.game_account_id))];
    const [{ data: profiles }, { data: accounts }] = await Promise.all([
      userIds.length ? supabase.from("profiles").select("id, full_name, customer_code").in("id", userIds) : Promise.resolve({ data: [] }),
      accountIds.length ? supabase.from("game_accounts").select("id, display_name, account_reference").in("id", accountIds) : Promise.resolve({ data: [] }),
    ]);
    const profileMap = new Map((profiles ?? []).map((row) => [row.id, row]));
    const accountMap = new Map((accounts ?? []).map((row) => [row.id, row]));
    const mapped: LiveSettingRequest[] = (rows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      accountId: row.game_account_id,
      customer: profileMap.get(row.user_id)?.full_name ?? "Customer",
      customerCode: profileMap.get(row.user_id)?.customer_code ?? undefined,
      account: accountMap.get(row.game_account_id)?.display_name ?? "Game account",
      accountReference: accountMap.get(row.game_account_id)?.account_reference ?? undefined,
      submitted: new Date(row.created_at).toLocaleString("en-IN"),
      createdAt: row.created_at,
      settings: row.requested_settings ?? {},
      status: row.status,
      adminNote: row.admin_note ?? undefined,
    }));
    setRequests(mapped);
    setNotes(Object.fromEntries(mapped.map((row) => [row.id, row.adminNote ?? ""])));
    setSelectedId((current) => current || mapped[0]?.id || "");
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, []);

  async function updateRequest(request: LiveSettingRequest, status: "pending" | "approved" | "rejected" | "applied", customMessage?: string) {
    const supabase = getSupabaseBrowserClient();
    setSaving(request.id); setMessage("");
    if (!supabase) { setRequests((rows) => rows.map((row) => row.id === request.id ? { ...row, status, adminNote: notes[request.id] } : row)); setSaving(""); return; }
    const { data: auth } = await supabase.auth.getUser();
    const adminNote = customMessage ?? notes[request.id] ?? "";
    const payload = { status, admin_note: adminNote || null, reviewed_by: auth.user?.id ?? null, reviewed_at: new Date().toISOString(), applied_at: status === "applied" ? new Date().toISOString() : null };
    const { error: updateError } = await supabase.from("bot_setting_requests").update(payload).eq("id", request.id);
    if (updateError) { setMessage(updateError.message); setSaving(""); return; }
    if (auth.user) await supabase.from("audit_log").insert({ actor_id: auth.user.id, action: `settings_request_${status}`, entity_type: "bot_setting_request", entity_id: request.id, details: { account_id: request.accountId, category: request.settings.settings_category } });
    setRequests((rows) => rows.map((row) => row.id === request.id ? { ...row, status, adminNote } : row));
    setSaving("");
  }

  const filtered = filter === "all" ? requests : requests.filter((row) => row.status === filter);
  const selected = filtered.find((row) => row.id === selectedId) ?? filtered[0];
  const previousApplied = selected ? requests.filter((row) => row.accountId === selected.accountId && row.status === "applied" && row.createdAt < selected.createdAt && row.settings.settings_category === selected.settings.settings_category).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] : undefined;
  const settingEntries = selected ? Object.entries(selected.settings).filter(([key]) => key !== "account") : [];

  function copySummary() {
    if (!selected) return;
    const lines = [`LordsCare settings request`, `Customer: ${selected.customer}`, `Account: ${selected.account}${selected.accountReference ? ` (${selected.accountReference})` : ""}`, `Category: ${readableValue(selected.settings.settings_category)}`, "", ...settingEntries.filter(([key]) => key !== "settings_category").map(([key, value]) => `${readableSetting(key)}: ${readableValue(value)}`), "", `Admin note: ${notes[selected.id] || "None"}`];
    navigator.clipboard?.writeText(lines.join("\n"));
    setMessage("Settings summary copied.");
  }

  return <section className="panel full-panel request-console">
    <div className="panel-head"><div><p className="eyebrow">Live Supabase queue</p><h3>Bot setting requests</h3><p className="muted">Approved requests stay queued until the Windows bridge confirms the local settings file was updated.</p></div><button className="secondary-button" onClick={loadRequests}><RefreshCw size={16} />Refresh</button></div>
    <div className="request-filters">{["pending", "approved", "applied", "rejected", "all"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{readableSetting(value)}<span>{value === "all" ? requests.length : requests.filter((row) => row.status === value).length}</span></button>)}</div>
    {message && <p className="form-message request-message">{message}</p>}
    {loading ? <div className="empty-state"><RefreshCw /><h3>Loading requests…</h3></div> : requests.length === 0 ? <div className="empty-state"><Settings2 /><h3>No setting requests yet</h3><p>Customer submissions will appear here automatically.</p></div> : <div className="request-workspace">
      <div className="request-queue">{filtered.length === 0 ? <p className="empty-copy">No requests in this status.</p> : filtered.map((request) => <button key={request.id} className={selected?.id === request.id ? "selected" : ""} onClick={() => setSelectedId(request.id)}><div><strong>{request.customer}</strong><small>{request.account} · {readableValue(request.settings.settings_category)}</small><span>{request.submitted}</span></div><Status>{request.status}</Status></button>)}</div>
      {selected && <div className="request-detail"><div className="review-top"><div><span>{selected.id} · {selected.submitted}</span><h2>{selected.customer}</h2><p>{selected.account}{selected.accountReference ? ` · ${selected.accountReference}` : ""}</p></div><Status>{selected.status}</Status></div>
        <div className="request-meta"><div><small>Category</small><strong>{readableValue(selected.settings.settings_category)}</strong></div><div><small>Customer ID</small><strong>{selected.customerCode || "Not assigned"}</strong></div><div><small>Previous applied request</small><strong>{previousApplied ? previousApplied.submitted : "None recorded"}</strong></div></div>
        <div className="comparison-head"><div><p className="eyebrow">Settings comparison</p><h3>Requested changes</h3></div><button className="secondary-button" onClick={copySummary}><Copy size={15} />Copy summary</button></div>
        <div className="comparison-table"><div className="comparison-row heading"><span>Setting</span><span>Previously applied</span><span>Requested</span></div>{settingEntries.filter(([key]) => key !== "settings_category").map(([key, value]) => <div className="comparison-row" key={key}><strong>{readableSetting(key)}</strong><span>{previousApplied && key in previousApplied.settings ? readableValue(previousApplied.settings[key]) : "Not recorded"}</span><b>{readableValue(value)}</b></div>)}</div>
        <label className="admin-note-field">Admin note visible to customer<textarea rows={3} value={notes[selected.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [selected.id]: event.target.value }))} placeholder="Explain approval, rejection, clarification needed or what was applied." /></label>
        <div className="review-actions workflow-actions"><button className="secondary-button danger" disabled={saving === selected.id} onClick={() => updateRequest(selected, "rejected")}>Reject</button><button className="secondary-button" disabled={saving === selected.id} onClick={() => updateRequest(selected, "pending", notes[selected.id] || "Please provide more information about this request.")}>Ask clarification</button>{selected.status !== "approved" && selected.status !== "applied" && <button className="primary-button compact" disabled={saving === selected.id} onClick={() => updateRequest(selected, "approved")}><Check size={16} />Approve for bridge</button>}{selected.status === "approved" && <button className="secondary-button" disabled={saving === selected.id} onClick={() => updateRequest(selected, "applied")}><Check size={16} />Mark applied manually</button>}{selected.status === "applied" && <button className="secondary-button" disabled={saving === selected.id} onClick={() => updateRequest(selected, "approved")}>Reopen</button>}</div>
      </div>}
    </div>}
  </section>;
}

function PlansView() { return <section className="panel full-panel"><div className="panel-head"><div><p className="eyebrow">Published customer pricing</p><h3>Plans and prices</h3><p className="muted">Amounts are kept exactly as approved.</p></div><button className="secondary-button">Edit plans</button></div><div className="plan-table"><div className="plan-row plan-head"><span>Accounts</span><span>Monthly</span><span>3 months</span><span>Yearly</span></div>{planPrices.map((plan) => <div className="plan-row" key={plan.accounts}><strong>{plan.accounts} {plan.accounts === 1 ? "account" : "accounts"}</strong><span>₹{plan.monthly.toLocaleString("en-IN")}</span><span>₹{plan.quarterly.toLocaleString("en-IN")}</span><span>₹{plan.yearly.toLocaleString("en-IN")}</span></div>)}</div><div className="plan-note"><ShieldCheck /><span><strong>Plan control</strong><p>Existing subscriptions keep their recorded amount and dates when published prices change.</p></span></div></section>; }
