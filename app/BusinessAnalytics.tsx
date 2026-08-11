"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Gamepad2, IndianRupee, Plus, RefreshCw, Save, Settings2, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type BusinessSettings = {
  id: boolean;
  business_started_on: string;
  monthly_bot_cost_inr: number;
  included_slots: number;
  extra_slot_cost_inr: number;
  purchased_extra_slots: number;
  other_monthly_cost_inr: number;
};

type BusinessTransaction = {
  id: string;
  customer_name: string | null;
  transaction_type: "sale" | "renewal" | "refund" | "commission" | "other_expense";
  amount_inr: number;
  service_months: number;
  service_start: string | null;
  service_end: string | null;
  occurred_at: string;
  notes: string | null;
};

const defaultSettings: BusinessSettings = {
  id: true,
  business_started_on: new Date().toISOString().slice(0, 10),
  monthly_bot_cost_inr: 2000,
  included_slots: 7,
  extra_slot_cost_inr: 780,
  purchased_extra_slots: 0,
  other_monthly_cost_inr: 0,
};

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const monthLabel = (date: Date) => date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

function monthsInclusive(start: string, end = new Date()) {
  const date = new Date(`${start}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 1;
  return Math.max(1, (end.getFullYear() - date.getFullYear()) * 12 + end.getMonth() - date.getMonth() + 1);
}

function transactionTypeLabel(type: BusinessTransaction["transaction_type"]) {
  return type === "other_expense" ? "Other expense" : type[0].toUpperCase() + type.slice(1);
}

export function BusinessAnalytics() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [transactions, setTransactions] = useState<BusinessTransaction[]>([]);
  const [managedAccounts, setManagedAccounts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [entry, setEntry] = useState({ transaction_type: "other_expense", amount: "", occurred_at: new Date().toISOString().slice(0, 10), notes: "" });

  async function load() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setLoading(false); return; }
    const [{ data: settingsRow }, { data: transactionRows }, { data: internalRows }, { data: accountRows }] = await Promise.all([
      supabase.from("business_settings").select("*").eq("id", true).maybeSingle(),
      supabase.from("business_transactions").select("id, customer_name, transaction_type, amount_inr, service_months, service_start, service_end, occurred_at, notes").order("occurred_at", { ascending: false }),
      supabase.from("internal_customers").select("account_count, status").in("status", ["active", "past_due"]),
      supabase.from("game_accounts").select("id, status").neq("status", "disconnected"),
    ]);
    if (settingsRow) setSettings(settingsRow as BusinessSettings);
    setTransactions((transactionRows ?? []) as BusinessTransaction[]);
    setManagedAccounts((internalRows ?? []).reduce((sum, row) => sum + Number(row.account_count), 0) + (accountRows ?? []).length);
    setLoading(false);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(initialLoad);
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = monthKey(now);
    const grossSales = transactions.filter((item) => item.transaction_type === "sale" || item.transaction_type === "renewal").reduce((sum, item) => sum + Number(item.amount_inr), 0);
    const refunds = transactions.filter((item) => item.transaction_type === "refund").reduce((sum, item) => sum + Number(item.amount_inr), 0);
    const variableExpenses = transactions.filter((item) => item.transaction_type === "commission" || item.transaction_type === "other_expense").reduce((sum, item) => sum + Number(item.amount_inr), 0);
    const monthsRunning = monthsInclusive(settings.business_started_on, now);
    const botExpense = monthsRunning * settings.monthly_bot_cost_inr;
    const recurringExpense = monthsRunning * settings.other_monthly_cost_inr;
    const slotInvestment = settings.purchased_extra_slots * settings.extra_slot_cost_inr;
    const totalExpenses = botExpense + recurringExpense + slotInvestment + variableExpenses + refunds;
    const overallProfit = grossSales - totalExpenses;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const recognizedRevenue = transactions.filter((item) => {
      if (!(["sale", "renewal"] as string[]).includes(item.transaction_type) || !item.service_start || !item.service_end || item.service_months <= 0) return false;
      return new Date(`${item.service_start}T00:00:00`) <= monthEnd && new Date(`${item.service_end}T23:59:59`) >= monthStart;
    }).reduce((sum, item) => sum + Number(item.amount_inr) / item.service_months, 0);
    const monthOutflows = transactions.filter((item) => monthKey(new Date(item.occurred_at)) === currentMonth && ["refund", "commission", "other_expense"].includes(item.transaction_type)).reduce((sum, item) => sum + Number(item.amount_inr), 0);
    const monthlyExpenses = settings.monthly_bot_cost_inr + settings.other_monthly_cost_inr + monthOutflows;
    const monthlyProfit = recognizedRevenue - monthlyExpenses;
    const margin = recognizedRevenue > 0 ? monthlyProfit / recognizedRevenue * 100 : 0;
    const capacity = settings.included_slots + settings.purchased_extra_slots;
    const slotsNeeded = Math.max(0, managedAccounts - capacity);
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = monthKey(date);
      const revenue = transactions.filter((item) => monthKey(new Date(item.occurred_at)) === key && (item.transaction_type === "sale" || item.transaction_type === "renewal")).reduce((sum, item) => sum + Number(item.amount_inr), 0);
      const outflows = transactions.filter((item) => monthKey(new Date(item.occurred_at)) === key && ["refund", "commission", "other_expense"].includes(item.transaction_type)).reduce((sum, item) => sum + Number(item.amount_inr), 0);
      return { label: monthLabel(date), revenue, cost: settings.monthly_bot_cost_inr + settings.other_monthly_cost_inr + outflows };
    });
    return { grossSales, refunds, variableExpenses, monthsRunning, botExpense, recurringExpense, slotInvestment, totalExpenses, overallProfit, recognizedRevenue, monthlyExpenses, monthlyProfit, margin, capacity, slotsNeeded, months };
  }, [managedAccounts, settings, transactions]);

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true); setMessage("");
    const { error } = await supabase.from("business_settings").upsert({ ...settings, updated_at: new Date().toISOString() });
    setSaving(false); setMessage(error ? error.message : "Business cost settings saved.");
  }

  async function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(entry.amount);
    if (!Number.isFinite(amount) || amount <= 0) { setMessage("Enter an amount greater than zero."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSaving(true); setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("business_transactions").insert({ customer_source: "manual", transaction_type: entry.transaction_type, amount_inr: amount, occurred_at: `${entry.occurred_at}T12:00:00.000Z`, notes: entry.notes.trim() || null, created_by: auth.user?.id ?? null });
    if (error) { setSaving(false); setMessage(error.message); return; }
    setEntry({ transaction_type: "other_expense", amount: "", occurred_at: new Date().toISOString().slice(0, 10), notes: "" });
    setSaving(false); setMessage("Business entry recorded."); await load();
  }

  const chartMax = Math.max(1, ...analytics.months.flatMap((item) => [item.revenue, item.cost]));

  return <div className="analytics-page">
    <section className="analytics-hero"><div><p className="eyebrow light">Private financial overview</p><h2>Business analytics</h2><p>Sales, monthly earnings, recurring costs, slot investment and profit/loss from your recorded subscriptions.</p></div><div className={`profit-callout ${analytics.monthlyProfit < 0 ? "negative" : ""}`}>{analytics.monthlyProfit < 0 ? <TrendingDown /> : <TrendingUp />}<span><small>Current month operating P/L</small><strong>{loading ? "—" : money(analytics.monthlyProfit)}</strong></span></div></section>

    <section className="stat-grid four analytics-stats">
      <article><span className="metric-icon green"><IndianRupee /></span><div><small>Total sales collected</small><strong>{loading ? "—" : money(analytics.grossSales)}</strong><p>Sales and renewal payments</p></div></article>
      <article><span className="metric-icon blue"><BarChart3 /></span><div><small>Bot earning this month</small><strong>{loading ? "—" : money(analytics.recognizedRevenue)}</strong><p>Prepaid plans allocated monthly</p></div></article>
      <article><span className="metric-icon amber"><WalletCards /></span><div><small>Total business expenses</small><strong>{loading ? "—" : money(analytics.totalExpenses)}</strong><p>Bot, slots, recurring and manual costs</p></div></article>
      <article><span className={`metric-icon ${analytics.overallProfit < 0 ? "red" : "violet"}`}>{analytics.overallProfit < 0 ? <TrendingDown /> : <TrendingUp />}</span><div><small>Overall profit / loss</small><strong className={analytics.overallProfit < 0 ? "negative-number" : "positive-number"}>{loading ? "—" : money(analytics.overallProfit)}</strong><p>From recorded business start date</p></div></article>
    </section>

    <section className="analytics-health-grid">
      <article><span><CalendarDays /><small>Months in calculation</small></span><strong>{analytics.monthsRunning}</strong><p>Bot subscription expense: {money(analytics.botExpense)}</p></article>
      <article><span><Gamepad2 /><small>Slot capacity</small></span><strong>{managedAccounts} / {analytics.capacity}</strong><p>{analytics.slotsNeeded ? `${analytics.slotsNeeded} more slot${analytics.slotsNeeded === 1 ? "" : "s"} needed · ${money(analytics.slotsNeeded * settings.extra_slot_cost_inr)}` : "Current managed accounts are covered"}</p></article>
      <article><span><RefreshCw /><small>Monthly fixed expense</small></span><strong>{money(settings.monthly_bot_cost_inr + settings.other_monthly_cost_inr)}</strong><p>₹{settings.monthly_bot_cost_inr.toLocaleString("en-IN")} bot + other recurring costs</p></article>
      <article><span>{analytics.margin < 0 ? <TrendingDown /> : <TrendingUp />}<small>Current month margin</small></span><strong className={analytics.margin < 0 ? "negative-number" : "positive-number"}>{analytics.margin.toFixed(1)}%</strong><p>{analytics.monthlyProfit >= 0 ? "Monthly operation is above break-even" : `${money(Math.abs(analytics.monthlyProfit))} below monthly break-even`}</p></article>
    </section>

    <div className="analytics-grid">
      <section className="panel analytics-chart-panel"><div className="panel-head"><div><p className="eyebrow">Six-month cash view</p><h3>Collected revenue vs monthly costs</h3></div><div className="chart-legend"><span><i className="revenue" />Revenue</span><span><i className="cost" />Cost</span></div></div><div className="cash-chart">{analytics.months.map((month) => <div className="cash-month" key={month.label}><div className="cash-bars"><i className="revenue" style={{ height: `${Math.max(3, month.revenue / chartMax * 100)}%` }} title={`${month.label} revenue ${money(month.revenue)}`} /><i className="cost" style={{ height: `${Math.max(3, month.cost / chartMax * 100)}%` }} title={`${month.label} cost ${money(month.cost)}`} /></div><strong>{month.label}</strong><small>{money(month.revenue)}</small></div>)}</div></section>

      <section className="panel cost-summary"><div className="panel-head"><div><p className="eyebrow">Cost breakdown</p><h3>Where the money goes</h3></div></div><div className="cost-lines"><div><span>Bot subscriptions ({analytics.monthsRunning} months)</span><strong>{money(analytics.botExpense)}</strong></div><div><span>Additional slot investment</span><strong>{money(analytics.slotInvestment)}</strong></div><div><span>Other monthly expenses</span><strong>{money(analytics.recurringExpense)}</strong></div><div><span>Commissions and manual expenses</span><strong>{money(analytics.variableExpenses)}</strong></div><div><span>Refunds</span><strong>{money(analytics.refunds)}</strong></div><div className="total"><span>Total expenses</span><strong>{money(analytics.totalExpenses)}</strong></div></div></section>
    </div>

    <div className="analytics-grid forms">
      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Calculation settings</p><h3>Business costs and slots</h3></div><Settings2 /></div><form className="support-form" onSubmit={saveSettings}><div className="modal-form-grid"><label>Business start date<input type="date" value={settings.business_started_on} onChange={(event) => setSettings({ ...settings, business_started_on: event.currentTarget.value })} /></label><label>Monthly bot expense (₹)<input type="number" min="0" value={settings.monthly_bot_cost_inr} onChange={(event) => setSettings({ ...settings, monthly_bot_cost_inr: Number(event.currentTarget.value) })} /></label></div><div className="modal-form-grid"><label>Included slots<input type="number" min="0" value={settings.included_slots} onChange={(event) => setSettings({ ...settings, included_slots: Number(event.currentTarget.value) })} /></label><label>Purchased extra slots<input type="number" min="0" value={settings.purchased_extra_slots} onChange={(event) => setSettings({ ...settings, purchased_extra_slots: Number(event.currentTarget.value) })} /></label></div><div className="modal-form-grid"><label>One-time cost per extra slot (₹)<input type="number" min="0" value={settings.extra_slot_cost_inr} onChange={(event) => setSettings({ ...settings, extra_slot_cost_inr: Number(event.currentTarget.value) })} /></label><label>Other monthly expense (₹)<input type="number" min="0" value={settings.other_monthly_cost_inr} onChange={(event) => setSettings({ ...settings, other_monthly_cost_inr: Number(event.currentTarget.value) })} /></label></div><button className="primary-button" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save calculation settings"}</button></form></section>

      <section className="panel"><div className="panel-head"><div><p className="eyebrow">Manual outflow</p><h3>Record a business entry</h3></div><Plus /></div><p className="muted analytics-form-copy">Use this for sales commissions, refunds or expenses that are not already part of the monthly cost settings.</p><form className="support-form" onSubmit={addEntry}><div className="modal-form-grid"><label>Entry type<select value={entry.transaction_type} onChange={(event) => setEntry({ ...entry, transaction_type: event.currentTarget.value })}><option value="other_expense">Other expense</option><option value="commission">Sales commission</option><option value="refund">Customer refund</option></select></label><label>Amount (₹)<input type="number" min="1" value={entry.amount} onChange={(event) => setEntry({ ...entry, amount: event.currentTarget.value })} placeholder="0" /></label></div><label>Date<input type="date" value={entry.occurred_at} onChange={(event) => setEntry({ ...entry, occurred_at: event.currentTarget.value })} /></label><label>Notes<input value={entry.notes} onChange={(event) => setEntry({ ...entry, notes: event.currentTarget.value })} placeholder="What was this payment for?" /></label><button className="secondary-button" disabled={saving}><Plus size={16} />Record business entry</button></form></section>
    </div>

    <section className="panel full-panel analytics-transactions"><div className="panel-head"><div><p className="eyebrow">Financial ledger</p><h3>Recent sales and expenses</h3></div></div>{transactions.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Customer / note</th><th>Service allocation</th><th>Amount</th></tr></thead><tbody>{transactions.slice(0, 20).map((item) => <tr key={item.id}><td>{new Date(item.occurred_at).toLocaleDateString("en-IN")}</td><td><span className={`ledger-type ${item.transaction_type}`}>{transactionTypeLabel(item.transaction_type)}</span></td><td><strong>{item.customer_name || item.notes || "Business entry"}</strong>{item.customer_name && item.notes && <small>{item.notes}</small>}</td><td>{item.service_months ? `${item.service_months} month${item.service_months === 1 ? "" : "s"}` : "Immediate"}</td><td><strong className={["refund", "commission", "other_expense"].includes(item.transaction_type) ? "negative-number" : "positive-number"}>{["refund", "commission", "other_expense"].includes(item.transaction_type) ? "−" : "+"}{money(item.amount_inr)}</strong></td></tr>)}</tbody></table></div> : <div className="empty-state compact-empty"><BarChart3 /><h3>No financial entries yet</h3><p>Paid subscriptions and renewals will appear automatically.</p></div>}</section>
    {message && <p className="analytics-message" role="status">{message}</p>}
  </div>;
}
