

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font-display: 'Playfair Display', serif;
    --font-body:    'DM Sans', sans-serif;
    --font-mono:    'DM Mono', monospace;
  }

  /* ── Dark theme tokens ── */
  .dark-theme {
    --bg:          #0E0E10;
    --bg2:         #141416;
    --card-bg:     #18181C;
    --border:      rgba(255,255,255,0.08);
    --text:        #F5F3EE;
    --muted:       #6B6B75;
    --subtle:      #2A2A30;
    --accent:      #D4AF37;
    --accent-dim:  rgba(212,175,55,0.12);
    --green:       #22C55E;
    --red:         #EF4444;
    --shadow:      0 8px 32px rgba(0,0,0,0.5);
  }

  /* ── Light theme tokens ── */
  .light-theme {
    --bg:          #F8F7F4;
    --bg2:         #F0EEE8;
    --card-bg:     #FFFFFF;
    --border:      rgba(0,0,0,0.08);
    --text:        #1A1A1E;
    --muted:       #8A8A96;
    --subtle:      #EDECE8;
    --accent:      #B8960C;
    --accent-dim:  rgba(184,150,12,0.1);
    --green:       #16A34A;
    --red:         #DC2626;
    --shadow:      0 4px 20px rgba(0,0,0,0.08);
  }

  body { font-family: var(--font-body); }
  input, select { font-family: var(--font-body) !important; color-scheme: dark; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar       { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* ── Animations ── */
  @keyframes modalIn  { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(20px); }             to { opacity:1; transform:translateX(0); } }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); }             to { opacity:1; transform:translateY(0); } }

  /* ── Reusable class utilities ── */
  .card         { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 24px; animation: fadeUp 0.4s ease; }
  .tx-row:hover { background: var(--subtle) !important; }
  .nav-btn      { display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; border:none; background:none; cursor:pointer; font-family:var(--font-body); font-size:14px; font-weight:500; transition:all 0.15s; width:100%; }
  .nav-btn:hover  { background:var(--subtle); }
  .nav-btn.active { background:var(--accent-dim); color:var(--accent) !important; }
  .summary-card         { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 20px 24px; position:relative; overflow:hidden; animation: fadeUp 0.4s ease both; }
  .summary-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg, var(--accent-dim) 0%, transparent 60%); pointer-events:none; }
  .pill          { display:inline-flex; align-items:center; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; font-family:var(--font-mono); letter-spacing:0.04em; }
  .badge-income  { background:rgba(34,197,94,0.12);  color:var(--green); }
  .badge-expense { background:rgba(239,68,68,0.12);  color:var(--red); }

  /* ── Responsive: mobile bottom navigation ── */
  @media (max-width: 768px) {
    .sidebar                { position:fixed; bottom:0; left:0; right:0; height:auto !important; width:100% !important; flex-direction:row !important; border-top:1px solid var(--border) !important; border-right:none !important; z-index:100; padding:8px !important; }
    .sidebar .logo          { display:none !important; }
    .sidebar .nav-btn span  { display:none; }
    .sidebar .nav-btn       { padding:10px !important; justify-content:center; }
    .main-content           { margin-left:0 !important; padding-bottom:80px !important; }
  }
`;

export default globalStyles;