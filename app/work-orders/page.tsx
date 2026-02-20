"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type WorkOrder = {
  id: string;
  status: string;
  customer_name: string;
  customer_phone: string | null;
  trailer_type: string | null;
  axle_count: number | null;
  axle_rating: string | null;
  created_at: string;
};

const STATUSES = ["NEW","IN_INSPECTION","NEEDS_QUOTE","SENT","APPROVED","IN_PROGRESS","COMPLETED"];

export default function WorkOrdersPage() {
  const [rows, setRows] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [trailerType, setTrailerType] = useState("Utility");
  const [axleCount, setAxleCount] = useState(2);
  const [axleRating, setAxleRating] = useState("7K");

  async function load() {
    setLoading(true); setErr(null);
    const { data, error } = await supabase
      .from("work_orders")
      .select("id,status,customer_name,customer_phone,trailer_type,axle_count,axle_rating,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (error) setErr(error.message);
    else setRows((data ?? []) as any);
  }

  useEffect(() => { load(); }, []);

  async function createWO() {
    setErr(null);
    const { error } = await supabase.from("work_orders").insert({
      status: "NEW",
      customer_name: customerName,
      customer_phone: customerPhone || null,
      trailer_type: trailerType,
      axle_count: axleCount,
      axle_rating: axleRating
    });
    if (error) setErr(error.message);
    else {
      setCustomerName(""); setCustomerPhone("");
      await load();
    }
  }

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("work_orders").update({ status }).eq("id", id);
    if (error) setErr(error.message);
    else await load();
  }

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 360px"}}>
        <h2 style={{marginTop:0}}>Create Work Order</h2>
        <div style={{marginBottom:10}}>
          <label className="label">Customer name</label>
          <input className="input" value={customerName} onChange={(e)=>setCustomerName(e.target.value)} />
        </div>
        <div style={{marginBottom:10}}>
          <label className="label">Phone</label>
          <input className="input" value={customerPhone} onChange={(e)=>setCustomerPhone(e.target.value)} />
        </div>
        <div className="row">
          <div style={{flex:"1 1 140px"}}>
            <label className="label">Trailer type</label>
            <input className="input" value={trailerType} onChange={(e)=>setTrailerType(e.target.value)} />
          </div>
          <div style={{flex:"1 1 140px"}}>
            <label className="label">Axle count</label>
            <input className="input" type="number" value={axleCount} onChange={(e)=>setAxleCount(parseInt(e.target.value || "0",10))} />
          </div>
          <div style={{flex:"1 1 140px"}}>
            <label className="label">Axle rating</label>
            <input className="input" value={axleRating} onChange={(e)=>setAxleRating(e.target.value)} />
          </div>
        </div>
        <div style={{marginTop:12}}>
          <button className="btn primary" onClick={createWO} disabled={!customerName}>Create</button>
        </div>
        {err && <p className="small" style={{marginTop:10}}>Error: {err}</p>}
        <p className="small" style={{marginTop:10}}>Tip: After inspection, move status to <b>NEEDS_QUOTE</b>.</p>
      </div>

      <div className="card" style={{flex:"3 1 520px"}}>
        <h2 style={{marginTop:0}}>Recent Work Orders</h2>
        {loading ? <p className="small">Loading…</p> : (
          <table className="table">
            <thead>
              <tr>
                <th>Created</th>
                <th>Customer</th>
                <th>Trailer</th>
                <th>Status</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="small">{new Date(r.created_at).toLocaleString()}</td>
                  <td>
                    <div style={{fontWeight:700}}>{r.customer_name}</div>
                    <div className="small">{r.customer_phone || ""}</div>
                  </td>
                  <td className="small">{[r.trailer_type, r.axle_count ? `${r.axle_count} axles`:"", r.axle_rating].filter(Boolean).join(" • ")}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td>
                    <select className="input" style={{maxWidth:220}} value={r.status} onChange={(e)=>setStatus(r.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
