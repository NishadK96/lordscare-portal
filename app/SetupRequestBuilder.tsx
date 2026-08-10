"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Clipboard, Download, Home, RotateCcw, Share2, ShieldCheck } from "lucide-react";
import { defaultSetupValues, setupCategories, type SetupField } from "./setupSettings";

const steps = ["Account", ...setupCategories.map((category) => category.shortLabel), "Review"];
type Value = boolean | string | string[];

export function SetupRequestBuilder() {
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountReference, setAccountReference] = useState("");
  const [notes, setNotes] = useState("");
  const [values, setValues] = useState<Record<string, Value>>(() => defaultSetupValues());
  const [message, setMessage] = useState("");
  const currentCategory = step > 0 && step <= setupCategories.length ? setupCategories[step - 1] : undefined;

  const summary = useMemo(() => {
    const lines = ["LORDSCARE COMPLETE BOT SETUP REQUEST", "", `Customer: ${customerName || "Not provided"}`, `Bot account: ${accountName || "Not provided"}`, `Account reference / IGG ID: ${accountReference || "Not provided"}`];
    for (const category of setupCategories) {
      lines.push("", category.title.toUpperCase());
      for (const field of category.fields) {
        const value = values[field.key];
        lines.push(`${field.label}: ${Array.isArray(value) ? value.join(", ") || "None" : typeof value === "boolean" ? value ? "Yes" : "No" : value || "Not specified"}`);
      }
    }
    lines.push("", `OTHER INSTRUCTIONS: ${notes || "None"}`, "", "Security: No password, OTP, login token, or access key included.");
    return lines.join("\n");
  }, [accountName, accountReference, customerName, notes, values]);

  const update = (key: string, value: Value) => setValues((current) => ({ ...current, [key]: value }));
  const toggleMultiple = (field: SetupField, option: string) => {
    const selected = Array.isArray(values[field.key]) ? values[field.key] as string[] : [];
    update(field.key, selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option]);
  };
  const goNext = () => {
    if (step === 0 && (!customerName.trim() || !accountName.trim())) { setMessage("Please enter your name and bot account name to continue."); return; }
    setMessage(""); setStep((current) => Math.min(current + 1, steps.length - 1)); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const restart = () => { setCustomerName(""); setAccountName(""); setAccountReference(""); setNotes(""); setValues(defaultSetupValues()); setStep(0); setMessage(""); };
  const copySummary = async () => { await navigator.clipboard.writeText(summary); setMessage("Complete setup copied. Paste it into WhatsApp or your support chat."); };
  const shareSummary = async () => { if (navigator.share) { await navigator.share({ title: "LordsCare Complete Bot Setup", text: summary }); setMessage("Complete setup shared."); } else await copySummary(); };
  const downloadSummary = () => {
    const url = URL.createObjectURL(new Blob([summary], { type: "text/plain;charset=utf-8" })); const link = document.createElement("a");
    link.href = url; link.download = `${accountName.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "bot"}-complete-setup.txt`; link.click(); URL.revokeObjectURL(url); setMessage("Complete setup downloaded.");
  };

  return <main className="setup-page">
    <header className="support-site-header"><div className="support-shell support-nav"><Link href="/" className="site-brand"><div className="brand-mark">LC</div><div><strong>LordsCare</strong><span>Complete bot setup</span></div></Link><nav><Link href="/"><Home size={14} />Commands</Link></nav></div></header>
    <section className="setup-hero"><div className="setup-shell"><p className="eyebrow light">Complete bot setup</p><h1>Configure the entire bot in one guided request.</h1><p>Work through every available settings category. Your choices are turned into one clear setup summary to send to your LordsCare representative.</p><div className="security-note"><ShieldCheck size={18} /><span><strong>Keep your account safe.</strong> Never enter a game password, OTP, login token, or access key here.</span></div></div></section>
    <div className="setup-shell setup-workspace">
      <ol className="setup-progress full" aria-label="Setup progress">{steps.map((label, index) => <li key={label} className={index === step ? "active" : index < step ? "done" : ""}><button type="button" onClick={() => index <= step && setStep(index)}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</button></li>)}</ol>
      <section className="setup-card">
        {step === 0 && <><StepHeading number="01" title="Your bot account" text="Tell us who the complete configuration belongs to." /><div className="setup-form-grid"><Field label="Your name *"><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name" /></Field><Field label="Bot account name *"><input value={accountName} onChange={(event) => setAccountName(event.target.value)} placeholder="Example: NishadV6" /></Field><Field label="Account reference / IGG ID (optional)" wide><input value={accountReference} onChange={(event) => setAccountReference(event.target.value)} placeholder="Use an ID only — never enter a password" /></Field></div></>}
        {currentCategory && <><StepHeading number={String(step + 1).padStart(2, "0")} title={currentCategory.title} text={currentCategory.description} /><div className="setup-form-grid">{currentCategory.fields.map((field) => <SetupControl key={field.key} field={field} value={values[field.key]} update={update} toggleMultiple={toggleMultiple} />)}</div></>}
        {step === steps.length - 1 && <><StepHeading number={String(steps.length).padStart(2, "0")} title="Review your complete setup" text="Check every category, add final instructions, and send the complete request to us." /><Field label="Other instructions"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Anything else we should know?" /></Field><pre className="setup-summary">{summary}</pre><div className="setup-share-actions"><button type="button" className="primary-button" onClick={copySummary}><Clipboard size={17} />Copy complete setup</button><button type="button" className="secondary-button" onClick={shareSummary}><Share2 size={17} />Share</button><button type="button" className="secondary-button" onClick={downloadSummary}><Download size={17} />Download .txt</button></div></>}
        {message && <p className="setup-message" role="status">{message}</p>}
        <footer className="setup-card-footer"><button type="button" className="secondary-button" onClick={() => step === 0 ? restart() : setStep(step - 1)}>{step === 0 ? <RotateCcw size={16} /> : <ArrowLeft size={16} />}{step === 0 ? "Clear form" : "Previous"}</button>{step < steps.length - 1 && <button type="button" className="primary-button" onClick={goNext}>{step === steps.length - 2 ? "Review complete setup" : "Continue"}<ArrowRight size={16} /></button>}</footer>
      </section>
    </div>
  </main>;
}

function SetupControl({ field, value, update, toggleMultiple }: { field: SetupField; value: Value; update: (key: string, value: Value) => void; toggleMultiple: (field: SetupField, option: string) => void }) {
  if (field.type === "toggle") return <label className="setup-switch"><span><strong>{field.label}</strong><small>{field.help}</small>{field.warning && <em>{field.warning}</em>}</span><input type="checkbox" checked={Boolean(value)} onChange={(event) => update(field.key, event.target.checked)} /><i aria-hidden="true" /></label>;
  if (field.type === "multiple") return <fieldset className="setup-checkbox-group"><legend>{field.label}</legend>{field.options?.map((option) => <label key={option}><input type="checkbox" checked={Array.isArray(value) && value.includes(option)} onChange={() => toggleMultiple(field, option)} /><span>{option}</span></label>)}</fieldset>;
  return <Field label={field.label}><>{field.type === "select" ? <select value={String(value)} onChange={(event) => update(field.key, event.target.value)}>{field.options?.map((option) => <option key={option}>{option}</option>)}</select> : field.type === "textarea" ? <textarea value={String(value)} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} /> : <input type={field.type === "number" ? "number" : "text"} min={field.type === "number" ? "0" : undefined} value={String(value)} onChange={(event) => update(field.key, event.target.value)} placeholder={field.placeholder} />}{field.warning && <small className="setup-field-warning">{field.warning}</small>}</></Field>;
}

function StepHeading({ number, title, text }: { number: string; title: string; text: string }) { return <div className="setup-step-heading"><span>{number}</span><div><h2>{title}</h2><p>{text}</p></div></div>; }
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <label className={`setup-field${wide ? " wide" : ""}`}><span>{label}</span>{children}</label>; }
