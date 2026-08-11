"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";

export function LoginPanel({ adminOnly = false }: { adminOnly?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not connected yet. Use either preview button below.");
      return;
    }

    setBusy(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (adminOnly && profile?.role !== "admin") {
      await supabase.auth.signOut();
      setMessage("This account does not have administrator access.");
      setBusy(false);
      return;
    }
    window.location.href = profile?.role === "admin" ? "/admin" : "/customer";
  }

  async function resetPassword() {
    if (!email) {
      setMessage("Enter your email first, then choose Forgot password.");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Password reset becomes available after Supabase is connected.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });
    setMessage(error ? error.message : "Password reset link sent.");
  }

  return (
    <div className="login-card">
      <div className="login-card-head">
        <div className="brand-mark small">LC</div>
        <div>
          <p className="eyebrow">{adminOnly ? "Private business console" : "Secure customer portal"}</p>
          <h2>{adminOnly ? "Admin sign in" : "Welcome back"}</h2>
        </div>
      </div>
      <p className="muted">{adminOnly ? "Sign in with an administrator account to manage subscriptions and renewals." : "Sign in to view your accounts, plan and configuration requests."}</p>
      <form onSubmit={signIn} className="login-form">
        <label>
          Email address
          <span className="input-wrap"><Mail size={18} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></span>
        </label>
        <label>
          Password
          <span className="input-wrap"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required /><button type="button" className="icon-btn" onClick={() => setShowPassword((value) => !value)} aria-label="Show or hide password">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
        </label>
        <button type="button" className="text-button forgot" onClick={resetPassword}>Forgot password?</button>
        <button className="primary-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ArrowRight size={18} /></button>
      </form>
      {message && <p className="form-message">{message}</p>}
      {!isSupabaseConfigured && (
        <div className="preview-box">
          <span>Preview mode</span>
          <p>Explore both sides while your Supabase project is being connected.</p>
          <div className="preview-actions">
            <a href="/customer">Customer view</a>
            <a href="/admin">Admin view</a>
          </div>
        </div>
      )}
      <p className="login-help">{adminOnly ? "This page is not linked from the public website." : "Need access? Contact LordsCare support."}</p>
    </div>
  );
}
