"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function WorkOrderDetail() {
  const { id } = useParams();

  const [workOrder, setWorkOrder] = useState<any>(null);
  const [inspection, setInspection] = useState<any>({
    brakes: false,
    bearings: false,
    wiring: false,
    tires: false,
    frame: false,
    notes: ""
  });

  const [quote, setQuote] = useState<any>(null);
  const [lines, setLines] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newLine, setNewLine] = useState({
    description: "",
    qty: 1,
    price: 0
  });

  // -------------------------
  // LOAD EVERYTHING
  // -------------------------
  async function load() {
    if (!id) return;

    setLoading(true);

    const { data: wo } = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", id)
      .single();

    setWorkOrder(wo);

    const { data: insp } = await supabase
      .from("inspections")
      .select("*")
      .eq("work_order_id", id)
      .single();

    if (insp) setInspection(insp);

    const { data: q } = await supabase
      .from("quotes")
      .select("*")
      .eq("work_order_id", id)
      .single();

    if (q) {
      setQuote(q);

      const { data: l } = await supabase
        .from("quote_lines")
        .select("*")
        .eq("quote_id", q.id);

      setLines(l || []);
    }

    const { data: p } = await supabase
      .from("photos")
      .select("*")
      .eq("work_order_id", id);

    setPhotos(p || []);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  // -------------------------
  // SAVE INSPECTION
  // -------------------------
  async function saveInspection() {
    await supabase.from("inspections").upsert({
      work_order_id: id,
      brakes: inspection.brakes,
      bearings: inspection.bearings,
      wiring: inspection.wiring,
      tires: inspection.tires,
      frame: inspection.frame,
      notes: inspection.notes
    });

    alert("Inspection Saved");
  }

  // -------------------------
  // CREATE QUOTE
  // -------------------------
  async function createQuote() {
    const { data } = await supabase
      .from("quotes")
      .insert({ work_order_id: id })
      .select()
      .single();

    setQuote(data);
  }

  // -------------------------
  // ADD LINE ITEM
  // -------------------------
  async function addLine() {
    if (!quote) return;

    const total = newLine.qty * newLine.price;

    await supabase.from("quote_lines").insert({
      quote_id: quote.id,
      description: newLine.description,
      qty: newLine.qty,
      price: newLine.price,
      total
    });

    setNewLine({ description: "", qty: 1, price: 0 });
    load();
  }

  // -------------------------
  // PHOTO UPLOAD (TS SAFE)
  // -------------------------
  async function uploadPhoto(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data, error } = await supabase.storage
      .from("photos")
      .upload(`${id}/${file.name}`, file);

    if (error || !data) {
      console.error(error);
      return;
    }

    const { data: publicData } = supabase.storage
      .from("photos")
      .getPublicUrl(data.path);

    await supabase.from("photos").insert({
      work_order_id: id,
      url: publicData.publicUrl
    });

    load();
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!workOrder) return <div style={{ padding: 20 }}>Not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Work Order: {workOrder.customer_name}</h2>

      {/* ---------------- INSPECTION ---------------- */}
      <h3>Inspection</h3>

      {["brakes", "bearings", "wiring", "tires", "frame"].map((field) => (
        <label key={field} style={{ marginRight: 15 }}>
          <input
            type="checkbox"
            checked={inspection[field]}
            onChange={(e) =>
              setInspection({
                ...inspection,
                [field]: e.target.checked
              })
            }
          />
          {field}
        </label>
      ))}

      <div>
        <textarea
          placeholder="Inspection notes"
          value={inspection.notes}
          onChange={(e) =>
            setInspection({ ...inspection, notes: e.target.value })
          }
        />
      </div>

      <button onClick={saveInspection}>Save Inspection</button>

      {/* ---------------- PHOTOS ---------------- */}
      <h3>Photos</h3>
      <input type="file" onChange={uploadPhoto} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {photos.map((p) => (
          <img key={p.id} src={p.url} width={150} />
        ))}
      </div>

      {/* ---------------- QUOTE ---------------- */}
      <h3>Quote</h3>

      {!quote ? (
        <button onClick={createQuote}>Create Quote</button>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            <input
              placeholder="Description"
              value={newLine.description}
              onChange={(e) =>
                setNewLine({ ...newLine, description: e.target.value })
              }
            />
            <input
              type="number"
              value={newLine.qty}
              onChange={(e) =>
                setNewLine({ ...newLine, qty: Number(e.target.value) })
              }
            />
            <input
              type="number"
              value={newLine.price}
              onChange={(e) =>
                setNewLine({ ...newLine, price: Number(e.target.value) })
              }
            />
            <button onClick={addLine}>Add Line</button>
          </div>

          <table border={1} cellPadding={5}>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id}>
                  <td>{l.description}</td>
                  <td>{l.qty}</td>
                  <td>${l.price}</td>
                  <td>${l.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
