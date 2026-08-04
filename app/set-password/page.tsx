"use client";

import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Checking your secure link…");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setMessage("Password setup is not configured."); return; }
    let active = true;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active || !session) return;
      setReady(true); setMessage("");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) { setReady(true); setMessage(""); }
      else setTimeout(() => { if (active) setMessage("This password link is invalid or has expired. Request a new link from the sign-in page."); }, 1200);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  async function savePassword(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    if (password.length < 8) { setMessage("Use at least 8 characters."); return; }
    if (password !== confirmPassword) { setMessage("The passwords do not match."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setBusy(false); setMessage(error.message); return; }
    setMessage("Password saved. Opening your portal…");
    window.setTimeout(() => { window.location.href = "/customer"; }, 700);
  }

  return <main className="password-page"><section className="password-card"><div className="login-card-head"><div className="brand-mark small">LC</div><div><p className="eyebrow">Secure account setup</p><h2>Choose your password</h2></div></div><p className="muted">Create a private password for your LordsCare account. Administrators cannot view it.</p>{ready ? <form className="login-form" onSubmit={savePassword}><label>New password<span className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /><button type="button" className="icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label><label>Confirm password<span className="input-wrap"><Check size={18} /><input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></span></label><button className="primary-button" disabled={busy}>{busy ? "Saving…" : "Save password"}<KeyRound size={18} /></button></form> : <div className="password-wait"><ShieldCheck /><span>{message}</span></div>}{ready && message && <p className="form-message">{message}</p>}<a className="password-back" href="/">Return to sign in</a></section></main>;
}
