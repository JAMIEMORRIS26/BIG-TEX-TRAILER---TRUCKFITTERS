"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signInWithPassword() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    setMsg(error ? error.message : "Signed in. Go to Dashboard.");
  }

  async function sendMagicLink() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setBusy(false);
    setMsg(error ? error.message : "Magic link sent. Check your email.");
  }

  return (
    <div className="card" style={{maxWidth:520}}>
      <h2 style={{marginTop:0}}>Login</h2>
      <div style={{marginBottom:12}}>
        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" />
      </div>
      <div style={{marginBottom:12}}>
        <label className="label">Password (optional)</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password if using password auth" />
      </div>
      <div className="row">
        <button className="btn primary" onClick={signInWithPassword} disabled={busy || !email || !password}>Sign in</button>
        <button className="btn" onClick={sendMagicLink} disabled={busy || !email}>Send magic link</button>
      </div>
      {msg && <p className="small" style={{marginTop:12}}>{msg}</p>}
      <p className="small" style={{marginTop:12}}>
        In Supabase: enable Email auth. Create your 8 users, then assign roles in table <code>app_users</code>.
      </p>
    </div>
  );
}
