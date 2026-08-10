"use client";

import { Check, ChevronRight, Copy, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createWhatsAppUrl } from "./contact";
import { planPrices } from "./data";

type BillingPeriod = "monthly" | "quarterly" | "yearly";

const billingOptions: { id: BillingPeriod; label: string; suffix: string }[] = [
  { id: "monthly", label: "Monthly", suffix: "month" },
  { id: "quarterly", label: "3 months", suffix: "3 months" },
  { id: "yearly", label: "Yearly", suffix: "year" },
];

const included = [
  "Subscription for your selected number of accounts",
  "Guild Bank command library and ready-to-copy examples",
  "Event and Monster Hunt support guides",
  "Direct onboarding conversation on WhatsApp",
];

export function PlanConversion() {
  const [billing, setBilling] = useState<BillingPeriod>("quarterly");
  const [accounts, setAccounts] = useState(1);
  const [name, setName] = useState("");
  const [guild, setGuild] = useState("");
  const [needs, setNeeds] = useState("General bot subscription");
  const [message, setMessage] = useState("");

  const selected = planPrices.find((plan) => plan.accounts === accounts) ?? planPrices[0];
  const billingLabel = billingOptions.find((option) => option.id === billing)!;
  const price = selected[billing];
  const saving = billing === "quarterly" ? selected.monthly * 3 - selected.quarterly : billing === "yearly" ? selected.monthly * 12 - selected.yearly : 0;

  const enquiry = useMemo(() => [
    "Hello LordsCare, I would like to enquire about a subscription.",
    "",
    `Name: ${name.trim() || "Not entered"}`,
    `Guild: ${guild.trim() || "Not entered"}`,
    `Plan: ${accounts} ${accounts === 1 ? "account" : "accounts"} · ${billingLabel.label} · ₹${price.toLocaleString("en-IN")}`,
    `Requirement: ${needs}`,
    "",
    "Please share the next steps. I will not send passwords, OTPs, login tokens, or access keys in WhatsApp.",
  ].join("\n"), [accounts, billingLabel.label, guild, name, needs, price]);

  const copyEnquiry = async () => {
    await navigator.clipboard.writeText(enquiry);
    setMessage("Enquiry copied. You can paste it into WhatsApp.");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.open(createWhatsAppUrl(enquiry), "_blank", "noopener,noreferrer");
  };

  return <>
    <section className="plans-selector support-shell" aria-labelledby="plans-heading">
      <header className="plans-section-head"><div><p className="eyebrow">Choose your plan</p><h2 id="plans-heading">Simple pricing for every setup</h2><p>Select the number of accounts and the subscription period that suits you.</p></div><div className="billing-switch" aria-label="Subscription period">{billingOptions.map((option) => <button type="button" className={billing === option.id ? "active" : ""} aria-pressed={billing === option.id} onClick={() => setBilling(option.id)} key={option.id}>{option.label}{option.id === "quarterly" && <small>Popular</small>}</button>)}</div></header>
      <div className="public-plan-grid">{planPrices.map((plan) => {
        const active = accounts === plan.accounts;
        const planPrice = plan[billing];
        const planSaving = billing === "quarterly" ? plan.monthly * 3 - plan.quarterly : billing === "yearly" ? plan.monthly * 12 - plan.yearly : 0;
        return <article className={`public-plan-card ${active ? "selected" : ""}`} key={plan.accounts}><div className="plan-account-mark"><Users /><strong>{plan.accounts}</strong></div><p>{plan.accounts} managed {plan.accounts === 1 ? "account" : "accounts"}</p><div className="plan-price"><span>₹</span><strong>{planPrice.toLocaleString("en-IN")}</strong><small>/ {billingLabel.suffix}</small></div>{planSaving > 0 && <div className="plan-saving">Save ₹{planSaving.toLocaleString("en-IN")}</div>}<button type="button" onClick={() => setAccounts(plan.accounts)} aria-pressed={active}>{active ? <><Check />Selected</> : <>Choose plan<ChevronRight /></>}</button></article>;
      })}</div>
      <div className="plan-included"><header><ShieldCheck /><div><p className="eyebrow">Included with every plan</p><h3>A clear start with direct support</h3></div></header><div>{included.map((item) => <span key={item}><Check />{item}</span>)}</div></div>
    </section>

    <section className="plan-enquiry-section" id="plan-enquiry"><div className="support-shell plan-enquiry-grid"><div className="plan-enquiry-copy"><p className="eyebrow light">Start on WhatsApp</p><h2>Your enquiry is prepared for you.</h2><p>Choose your plan, add a few details, and WhatsApp will open with a complete message ready to send.</p><div className="selected-plan-receipt"><span><small>Selected plan</small><strong>{accounts} {accounts === 1 ? "account" : "accounts"} · {billingLabel.label}</strong></span><strong>₹{price.toLocaleString("en-IN")}</strong>{saving > 0 && <small>You save ₹{saving.toLocaleString("en-IN")}</small>}</div><div className="enquiry-steps"><span><strong>01</strong>Choose a plan</span><span><strong>02</strong>Send the prepared enquiry</span><span><strong>03</strong>Confirm setup and payment privately</span></div></div><form className="plan-enquiry-form" onSubmit={submit}><div><p className="eyebrow">Subscription enquiry</p><h3>Tell us what you need</h3></div><label>Your name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" required /></label><label>Guild name <small>Optional</small><input value={guild} onChange={(event) => setGuild(event.target.value)} placeholder="Your guild" /></label><label>Primary requirement<select value={needs} onChange={(event) => setNeeds(event.target.value)}><option>General bot subscription</option><option>Guild Bank setup</option><option>Multiple account setup</option><option>Migration or account change</option><option>Renewal enquiry</option></select></label><div className="enquiry-safety"><ShieldCheck /><span><strong>Keep credentials private</strong><small>Never send a password, OTP, login token, or access key in WhatsApp.</small></span></div><button className="whatsapp-submit" type="submit"><MessageCircle />Send enquiry on WhatsApp</button><button className="copy-enquiry" type="button" onClick={copyEnquiry}><Copy />Copy enquiry instead</button>{message && <p className="enquiry-message" role="status">{message}</p>}</form></div></section>
  </>;
}
