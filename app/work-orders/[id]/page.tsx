"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";

export default function WorkOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [workOrder, setWorkOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) setWorkOrder(data);

    setLoading(false);
  }

  async function update(field: string, value: any) {
    const { error } = await supabase
      .from("work_orders")
      .update({ [field]: value })
      .eq("id", id);

    if (!error) load();
  }

  if (loading) return <div className="card">Loading...</div>;

  if (!workOrder) return <div className="card">Not found</div>;

  return (
    <div className="card">
      <h2>Work Order Detail</h2>

      <div style={{ marginTop: 10 }}>
        <b>Customer Name</b>
        <input
          className="input"
          value={workOrder.customer_name || ""}
          onChange={(e) => update("customer_name", e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Phone</b>
        <input
          className="input"
          value={workOrder.customer_phone || ""}
          onChange={(e) => update("customer_phone", e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Status</b>
        <select
          className="input"
          value={workOrder.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="NEW">NEW</option>
          <option value="IN_INSPECTION">IN INSPECTION</option>
          <option value="NEEDS_QUOTE">NEEDS QUOTE</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="btn" onClick={load}>
          Refresh
        </button>
      </div>
    </div>
  );
}
