"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Part = { part_number: string; description: string; category: string | null; sell_price: number | null; };

export default function PartsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Part[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows.slice(0, 50);
    return rows.filter(r =>
      r.part_number.toLowerCase().includes(s) ||
      (r.description || "").toLowerCase().includes(s)
    ).slice(0, 50);
  }, [q, rows]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("part_number,description,category,sell_price")
        .order("part_number", { ascending: true })
        .limit(5000);
      if (error) setErr(error.message);
      else setRows((data ?? []) as any);
    })();
  }, []);

  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Parts</h2>
      <p className="small">Import your master parts sheet into Supabase table <code>parts</code>. Then search here by part # or description.</p>
      <div className="row" style={{alignItems:"center"}}>
        <input className="input" style={{maxWidth:420}} value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search part # or description…" />
        {err && <span className="small">Error: {err}</span>}
      </div>
      <table className="table" style={{marginTop:12}}>
        <thead>
          <tr><th>Part #</th><th>Description</th><th>Category</th><th>Price</th></tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p.part_number}>
              <td style={{fontWeight:800}}>{p.part_number}</td>
              <td>{p.description}</td>
              <td className="small">{p.category || ""}</td>
              <td style={{whiteSpace:"nowrap"}}>{p.sell_price != null ? `$${p.sell_price.toFixed(2)}` : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
