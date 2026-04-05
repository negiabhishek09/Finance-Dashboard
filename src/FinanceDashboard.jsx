import { useState, useMemo } from "react";

// Data & constants
import INITIAL_TRANSACTIONS from "./data/transactions";
import { CATEGORIES, CATEGORY_COLORS } from "./data/constants";

// Hooks
import { useLocalStorage } from "./hooks/useLocalStorage";

// Utilities
import { fmt } from "./utils/formatCurrency";

// Styles
import globalStyles from "./styles/globalStyles";

// Components
import Icon from "./components/Icon";
import Modal from "./components/Modal";
import TransactionForm from "./components/TransactionForm";
import { Sparkline, DonutChart, BarChart, LineChart } from "./components/Charts";

// ─── NAVIGATION ITEMS ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard",    icon: "grid",      label: "Dashboard"    },
  { id: "transactions", icon: "list",      label: "Transactions" },
  { id: "analytics",   icon: "bar_chart", label: "Analytics"    },
  { id: "insights",    icon: "lightbulb", label: "Insights"     },
];


export default function FinanceDashboard() {
  // ── Persisted state ──
  const [dark, setDark]   = useLocalStorage("fd-dark", true);
  const [role, setRole]   = useLocalStorage("fd-role", "admin");
  const [txs,  setTxs]   = useLocalStorage("fd-txs", INITIAL_TRANSACTIONS);

  // ── Ephemeral UI state ──
  const [tab,        setTab]        = useState("dashboard");
  const [search,     setSearch]     = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCat,  setFilterCat]  = useState("all");
  const [sortKey,    setSortKey]    = useState("date");
  const [sortDir,    setSortDir]    = useState("desc");
  const [showModal,  setShowModal]  = useState(false);
  const [editTx,     setEditTx]     = useState(null);
  const [toast,      setToast]      = useState(null);

  const isAdmin = role === "admin";

  // ── Toast helper ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── CRUD handlers ──
  const addTx = (form) => {
    setTxs((prev) => [{ ...form, id: Date.now() }, ...prev]);
    setShowModal(false);
    showToast("Transaction added successfully!");
  };

  const updateTx = (form) => {
    setTxs((prev) => prev.map((t) => (t.id === editTx.id ? { ...t, ...form } : t)));
    setEditTx(null);
    showToast("Transaction updated!");
  };

  const deleteTx = (id) => {
    setTxs((prev) => prev.filter((t) => t.id !== id));
    showToast("Transaction deleted.", "warn");
  };

  // ── Sort toggle ──
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  // ── Derived / memoised data ──
  const decTxs = useMemo(() => txs.filter((t) => t.date.startsWith("2025-12")), [txs]);
  const novTxs = useMemo(() => txs.filter((t) => t.date.startsWith("2025-11")), [txs]);

  const totalBalance = useMemo(
    () => txs.reduce((s, t) => (t.type === "income" ? s + t.amount : s - t.amount), 0),
    [txs]
  );
  const decIncome  = useMemo(() => decTxs.filter((t) => t.type === "income" ).reduce((s, t) => s + t.amount, 0), [decTxs]);
  const decExpense = useMemo(() => decTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [decTxs]);
  const novExpense = useMemo(() => novTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [novTxs]);

  const balanceTrend = useMemo(() => {
    const months = ["Oct", "Nov", "Dec"].map((label, i) => {
      const prefix = `2025-${["10", "11", "12"][i]}`;
      const mTxs   = txs.filter((t) => t.date.startsWith(prefix));
      const net    = mTxs.reduce((s, t) => (t.type === "income" ? s + t.amount : s - t.amount), 0);
      return { label, balance: net };
    });
    let cum = 50000;
    return months.map((m) => { cum += m.balance; return { label: m.label, balance: cum }; });
  }, [txs]);

  const spendByCategory = useMemo(() => {
    const map = {};
    decTxs
      .filter((t) => t.type === "expense")
      .forEach((t) => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, val]) => ({ label: cat, value: val, color: CATEGORY_COLORS[cat] || "#888" }));
  }, [decTxs]);

  const monthlyComparison = useMemo(() =>
    ["Oct", "Nov", "Dec"].map((label, i) => {
      const prefix = `2025-${["10", "11", "12"][i]}`;
      const mTxs   = txs.filter((t) => t.date.startsWith(prefix));
      return {
        label,
        income:  mTxs.filter((t) => t.type === "income" ).reduce((s, t) => s + t.amount, 0),
        expense: mTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    }),
    [txs]
  );

  const filteredTxs = useMemo(() => {
    let r = [...txs];
    if (search)            r = r.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== "all") r = r.filter((t) => t.type === filterType);
    if (filterCat  !== "all") r = r.filter((t) => t.category === filterCat);
    r.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === "date") { va = new Date(va); vb = new Date(vb); }
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return r;
  }, [txs, search, filterType, filterCat, sortKey, sortDir]);

  const topCategory  = spendByCategory[0];
  const expenseDiff  = decExpense - novExpense;
  const savingsRate  = decIncome > 0 ? Math.round(((decIncome - decExpense) / decIncome) * 100) : 0;

  // ── CSV export ──
  const exportCSV = () => {
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...filteredTxs.map((t) => [t.date, t.desc, t.category, t.type, t.amount]),
    ];
    const csv  = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "transactions.csv"; a.click();
    showToast("CSV exported!");
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      className={dark ? "dark-theme" : "light-theme"}
      style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-body)", position: "relative" }}
    >
      <style>{globalStyles}</style>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: "fixed", top: "24px", right: "24px", zIndex: 2000,
          background: toast.type === "warn" ? "var(--red)" : "var(--accent)",
          color: toast.type === "warn" ? "#fff" : "#000",
          padding: "12px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14px",
          animation: "slideIn 0.3s ease", boxShadow: "var(--shadow)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <Icon name="check" size={16}/> {toast.msg}
        </div>
      )}

      {/* ── Layout ── */}
      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── Sidebar ── */}
        <div
          className="sidebar"
          style={{ width: "220px", background: "var(--card-bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px", padding: "24px 12px", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}
        >
          {/* Logo */}
          <div className="logo" style={{ padding: "8px 12px 20px", marginBottom: "8px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: "700", color: "var(--accent)", letterSpacing: "-0.02em" }}>Finara</div>
            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Personal Finance</div>
          </div>

          {/* Nav links */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
              style={{ color: tab === item.id ? "var(--accent)" : "var(--muted)" }}
            >
              <Icon name={item.icon} size={17}/> <span>{item.label}</span>
            </button>
          ))}

          {/* Bottom controls */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Role switcher */}
            <div style={{ padding: "10px 12px", background: "var(--subtle)", borderRadius: "10px" }}>
              <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Role</div>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ background: "none", border: "none", color: "var(--text)", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "100%", outline: "none" }}>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            {/* Dark mode toggle */}
            <button onClick={() => setDark((d) => !d)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", border: "none", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-body)" }}>
              <Icon name={dark ? "sun" : "moon"} size={16}/>
              <span>{dark ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="main-content" style={{ marginLeft: "220px", flex: 1, padding: "32px 28px", maxWidth: "1200px" }}>

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "var(--text)" }}>
                {{ dashboard: "Overview", transactions: "Transactions", analytics: "Analytics", insights: "Insights" }[tab]}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "14px", marginTop: "4px" }}>
                { tab === "dashboard"    ? "December 2025 Summary"
                : tab === "transactions" ? `${filteredTxs.length} transactions`
                : tab === "analytics"   ? "Q4 2025 Overview"
                : "Data-driven observations" }
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {isAdmin
                ? <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", background: "var(--accent)", border: "none", borderRadius: "10px", color: "#000", fontWeight: "700", cursor: "pointer", fontSize: "14px", fontFamily: "var(--font-body)" }}>
                    <Icon name="plus" size={16}/> Add
                  </button>
                : <span className="pill" style={{ background: "rgba(107,107,117,0.15)", color: "var(--muted)", border: "1px solid var(--border)" }}>👁 View Only</span>
              }
            </div>
          </div>

          {/* ════════════════ DASHBOARD TAB ════════════════ */}
          {tab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Net Balance",   value: totalBalance, icon: "wallet",       color: "var(--accent)", spark: balanceTrend.map((b) => b.balance) },
                  { label: "Dec Income",    value: decIncome,    icon: "trending_up",   color: "var(--green)",  spark: [70000, 80000, 85000, 103000, 103500] },
                  { label: "Dec Expenses",  value: decExpense,   icon: "trending_down", color: "var(--red)",    spark: [42000, 38000, 40000, 37000, 41749] },
                  { label: "Savings Rate",  value: `${savingsRate}%`, icon: "trending_up", color: "#8B5CF6", isText: true },
                ].map((card, i) => (
                  <div className="summary-card" key={i} style={{ animationDelay: `${i * 80}ms` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</span>
                      <span style={{ color: card.color, opacity: 0.8 }}><Icon name={card.icon} size={18}/></span>
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text)", letterSpacing: "-0.02em" }}>
                      {card.isText ? card.value : fmt(card.value)}
                    </div>
                    {card.spark && <div style={{ marginTop: "12px", opacity: 0.7 }}><Sparkline data={card.spark} color={card.color}/></div>}
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="card">
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px", fontFamily: "var(--font-display)" }}>Balance Trend</div>
                  <LineChart points={balanceTrend}/>
                </div>
                <div className="card">
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px", fontFamily: "var(--font-display)" }}>Spending by Category</div>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                    <DonutChart data={spendByCategory.slice(0, 6)} size={180}/>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "120px" }}>
                      {spendByCategory.slice(0, 6).map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: d.color, flexShrink: 0 }}/>
                          <span style={{ fontSize: "12px", color: "var(--muted)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.label}</span>
                          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>{fmt(d.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent transactions */}
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "600", fontFamily: "var(--font-display)" }}>Recent Transactions</span>
                  <button onClick={() => setTab("transactions")} style={{ fontSize: "13px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}>View all →</button>
                </div>
                {decTxs.slice(0, 5).map((t, i) => (
                  <div key={t.id} className="tx-row" style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none", gap: "12px", borderRadius: "8px", transition: "background 0.15s" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${CATEGORY_COLORS[t.category]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                      {t.type === "income" ? "💰" : "💸"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: "500" }}>{t.desc}</div>
                      <div style={{ fontSize: "12px", color: "var(--muted)" }}>{t.category} · {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: "600", color: t.type === "income" ? "var(--green)" : "var(--red)" }}>
                      {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════ TRANSACTIONS TAB ════════════════ */}
          {tab === "transactions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Filter bar */}
              <div className="card" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--subtle)", borderRadius: "8px", padding: "8px 12px", flex: 1, minWidth: "180px" }}>
                    <Icon name="search" size={15}/>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..." style={{ background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: "14px", width: "100%" }}/>
                  </div>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ background: "var(--subtle)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ background: "var(--subtle)", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px 12px", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>
                    <option value="all">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "var(--accent-dim)", border: "1px solid var(--accent)", borderRadius: "8px", color: "var(--accent)", cursor: "pointer", fontSize: "13px", fontFamily: "var(--font-body)", fontWeight: "600" }}>
                    <Icon name="download" size={14}/> Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {[["date","Date"],["desc","Description"],["category","Category"],["type","Type"],["amount","Amount"]].map(([k, label]) => (
                          <th key={k} onClick={() => toggleSort(k)} style={{ padding: "14px 20px", textAlign: "left", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {label} {sortKey === k && <span style={{ color: "var(--accent)" }}>{sortDir === "asc" ? "↑" : "↓"}</span>}
                            </span>
                          </th>
                        ))}
                        {isAdmin && <th style={{ padding: "14px 20px", textAlign: "right", fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTxs.length === 0 ? (
                        <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: "48px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>No transactions found.</td></tr>
                      ) : filteredTxs.map((t, i) => (
                        <tr key={t.id} className="tx-row" style={{ borderBottom: i < filteredTxs.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}>
                          <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td style={{ padding: "14px 20px", fontSize: "14px", fontWeight: "500" }}>{t.desc}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text)", background: `${CATEGORY_COLORS[t.category]}18`, padding: "3px 10px", borderRadius: "20px" }}>
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: CATEGORY_COLORS[t.category], display: "inline-block" }}/>
                              {t.category}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span className={`pill ${t.type === "income" ? "badge-income" : "badge-expense"}`}>{t.type}</span>
                          </td>
                          <td style={{ padding: "14px 20px", fontFamily: "var(--font-mono)", fontWeight: "700", color: t.type === "income" ? "var(--green)" : "var(--red)", whiteSpace: "nowrap" }}>
                            {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                          </td>
                          {isAdmin && (
                            <td style={{ padding: "14px 20px", textAlign: "right" }}>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button onClick={() => setEditTx(t)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", padding: "4px", borderRadius: "6px" }} title="Edit"><Icon name="edit" size={15}/></button>
                                <button onClick={() => deleteTx(t.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", padding: "4px", borderRadius: "6px", opacity: 0.7 }} title="Delete"><Icon name="trash" size={15}/></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ ANALYTICS TAB ════════════════ */}
          {tab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="card">
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px", fontFamily: "var(--font-display)" }}>Monthly Comparison</div>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "20px" }}>Income vs Expenses — Oct to Dec</p>
                  <BarChart months={monthlyComparison}/>
                  <div style={{ display: "flex", gap: "20px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}><div style={{ width: "10px", height: "10px", background: "var(--accent)", borderRadius: "2px" }}/> Income</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}><div style={{ width: "10px", height: "10px", background: "#EF4444", borderRadius: "2px" }}/> Expenses</div>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "4px", fontFamily: "var(--font-display)" }}>Dec Spending Breakdown</div>
                  <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "20px" }}>Expenses by category</p>
                  <DonutChart data={spendByCategory} size={180}/>
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {spendByCategory.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ fontSize: "12px", color: "var(--muted)" }}>{d.label}</span>
                            <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>{fmt(d.value)}</span>
                          </div>
                          <div style={{ height: "4px", background: "var(--subtle)", borderRadius: "2px" }}>
                            <div style={{ height: "100%", width: `${(d.value / spendByCategory[0].value) * 100}%`, background: d.color, borderRadius: "2px", transition: "width 0.6s ease" }}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: "15px", fontWeight: "600", marginBottom: "20px", fontFamily: "var(--font-display)" }}>Cumulative Balance Trend</div>
                <LineChart points={balanceTrend}/>
              </div>
            </div>
          )}

          {/* ════════════════ INSIGHTS TAB ════════════════ */}
          {tab === "insights" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              {[
                {
                  emoji: "🏆", title: "Top Spending Category", color: "#F59E0B",
                  body: topCategory ? (
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--text)", margin: "12px 0 4px" }}>{topCategory.label}</div>
                      <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#F59E0B" }}>{fmt(topCategory.value)}</div>
                      <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>This category accounts for {Math.round((topCategory.value / decExpense) * 100)}% of your December spending.</p>
                    </div>
                  ) : <p style={{ color: "var(--muted)" }}>No data</p>,
                },
                {
                  emoji: expenseDiff > 0 ? "📈" : "📉",
                  title: "Month-over-Month Spending",
                  color: expenseDiff > 0 ? "#EF4444" : "#22C55E",
                  body: (
                    <div>
                      <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: expenseDiff > 0 ? "var(--red)" : "var(--green)", margin: "12px 0 4px" }}>
                        {expenseDiff > 0 ? "+" : "-"}{fmt(Math.abs(expenseDiff))}
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--muted)" }}>
                        You spent {Math.abs(Math.round((expenseDiff / novExpense) * 100))}% {expenseDiff > 0 ? "more" : "less"} in December compared to November ({fmt(novExpense)}).
                      </p>
                    </div>
                  ),
                },
                {
                  emoji: "💰", title: "Monthly Savings", color: "#8B5CF6",
                  body: (
                    <div>
                      <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#8B5CF6", margin: "12px 0 4px" }}>{fmt(decIncome - decExpense)}</div>
                      <p style={{ fontSize: "13px", color: "var(--muted)" }}>Savings rate of {savingsRate}% this month. {savingsRate >= 20 ? "Great job staying on track! 🎉" : "Try to aim for at least 20% savings."}</p>
                    </div>
                  ),
                },
                {
                  emoji: "📊", title: "Income Breakdown", color: "#22C55E",
                  body: (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                      {["Salary","Freelance","Investment"].map((cat) => {
                        const val = decTxs.filter((t) => t.category === cat && t.type === "income").reduce((s, t) => s + t.amount, 0);
                        return val > 0 ? (
                          <div key={cat}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "13px", color: "var(--muted)" }}>{cat}</span>
                              <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>{fmt(val)}</span>
                            </div>
                            <div style={{ height: "4px", background: "var(--subtle)", borderRadius: "2px" }}>
                              <div style={{ height: "100%", width: `${(val / decIncome) * 100}%`, background: CATEGORY_COLORS[cat], borderRadius: "2px" }}/>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ),
                },
                {
                  emoji: "🎯", title: "Budget Health", color: "#14B8A6",
                  body: (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
                        {[{ label: "Dec Income", value: decIncome, color: "var(--green)" }, { label: "Dec Expenses", value: decExpense, color: "var(--red)" }].map(({ label, value, color }) => (
                          <div key={label} style={{ background: "var(--subtle)", borderRadius: "10px", padding: "12px" }}>
                            <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>{label}</div>
                            <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-mono)", color }}>{fmt(value)}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "10px" }}>
                        {decExpense < decIncome * 0.7 ? "Excellent! Expenses are well within income." : decExpense < decIncome ? "Good. You're spending within your means." : "⚠️ Expenses exceed income this month."}
                      </p>
                    </div>
                  ),
                },
                {
                  emoji: "⚡", title: "Quick Stats", color: "#D4AF37",
                  body: (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                      {[
                        { label: "Total transactions (Dec)", value: decTxs.length },
                        { label: "Avg daily spend",          value: fmt(Math.round(decExpense / 31)) },
                        { label: "Largest expense",          value: fmt(Math.max(...decTxs.filter((t) => t.type === "expense").map((t) => t.amount))) },
                        { label: "Transactions this month",  value: `${decTxs.filter((t) => t.type === "expense").length} expenses, ${decTxs.filter((t) => t.type === "income").length} income` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ fontSize: "13px", color: "var(--muted)" }}>{label}</span>
                          <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", fontWeight: "600" }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ].map((card, i) => (
                <div key={i} className="card" style={{ animationDelay: `${i * 60}ms`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: card.color, borderRadius: "16px 16px 0 0" }}/>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "24px" }}>{card.emoji}</span>
                    <span style={{ fontSize: "15px", fontWeight: "600", fontFamily: "var(--font-display)" }}>{card.title}</span>
                  </div>
                  {card.body}
                </div>
              ))}
            </div>
          )}

        </div>{/* end main-content */}
      </div>{/* end layout flex */}

      {/* ── Modals ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Transaction">
        <TransactionForm onSave={addTx} onClose={() => setShowModal(false)}/>
      </Modal>

      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaction">
        {editTx && <TransactionForm initial={editTx} onSave={updateTx} onClose={() => setEditTx(null)}/>}
      </Modal>
    </div>
  );
}
