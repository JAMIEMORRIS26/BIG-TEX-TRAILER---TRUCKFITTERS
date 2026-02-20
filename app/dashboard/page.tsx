"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Stats = { new_count: number; in_inspection: number; needs_quote: number; sent: number; approved: number; };

export default function Dashboard() {
  const [email, setEmail] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? "");
      const { data: s, error } = await supabase.rpc("dashboard_stats");
      if (error) setErr(error.message);
      else setStats(s?.[0] ?? null);
    })();
  }, []);

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 340px"}}>
        <h2 style={{marginTop:0}}>Dashboard</h2>
        <p className="small">Signed in as: {email || "Not signed in"}</p>
        {err && <p className="small">Error: {err}</p>}
        {!stats ? (
          <p className="small">Connect Supabase + run schema.sql to see live stats.</p>
        ) : (
          <div className="row">
            <div className="card" style={{flex:"1 1 150px"}}><div className="small">New</div><div style={{fontSize:28,fontWeight:900}}>{stats.new_count}</div></div>
            <div className="card" style={{flex:"1 1 150px"}}><div className="small">In Inspection</div><div style={{fontSize:28,fontWeight:900}}>{stats.in_inspection}</div></div>
            <div className="card" style={{flex:"1 1 150px"}}><div className="small">Needs Quote</div><div style={{fontSize:28,fontWeight:900}}>{stats.needs_quote}</div></div>
            <div className="card" style={{flex:"1 1 150px"}}><div className="small">Sent</div><div style={{fontSize:28,fontWeight:900}}>{stats.sent}</div></div>
            <div className="card" style={{flex:"1 1 150px"}}><div className="small">Approved</div><div style={{fontSize:28,fontWeight:900}}>{stats.approved}</div></div>
          </div>
        )}
      </div>
      <div className="card" style={{flex:"1 1 340px"}}>
        <h3 style={{marginTop:0}}>Next steps</h3>
        <ol className="small">
          <li>Create Supabase project</li>
          <li>Paste <code>supabase/schema.sql</code> into SQL Editor and Run</li>
          <li>Add env vars in Vercel: <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          <li>Create users (GM, Admin, Trailer Sales, Supervisor, 4 Techs)</li>
          <li>Import parts CSV into table <code>parts</code></li>
        </ol>
      </div>
    </div>
  );
}
