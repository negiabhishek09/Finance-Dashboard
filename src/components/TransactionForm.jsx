import { useState } from "react";
import { CATEGORIES } from "../data/constants";


export default function TransactionForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(
    initial || {
      date: new Date().toISOString().split("T")[0],
      desc: "",
      amount: "",
      category: "Food & Dining",
      type: "expense",
    }
  );


  const field = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "var(--text)",
    fontSize: "14px",
    fontFamily: "var(--font-body)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--muted)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const handleSave = () => {
    if (!form.desc || !form.amount) return;
    onSave({ ...form, amount: parseFloat(form.amount) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Date + Amount row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input type="date" value={form.date} onChange={field("date")} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Amount (₹)</label>
          <input
            type="number"
            value={form.amount}
            onChange={field("amount")}
            placeholder="0"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>Description</label>
        <input
          type="text"
          value={form.desc}
          onChange={field("desc")}
          placeholder="Transaction description"
          style={inputStyle}
        />
      </div>

      {/* Category + Type row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={field("category")} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Type</label>
          <select value={form.type} onChange={field("type")} style={inputStyle}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            color: "var(--muted)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 24px",
            background: "var(--accent)",
            border: "none",
            borderRadius: "8px",
            color: "#000",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {initial ? "Update" : "Add Transaction"}
        </button>
      </div>
    </div>
  );
}
