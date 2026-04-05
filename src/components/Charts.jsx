import { fmt } from "../utils/formatCurrency";


export function Sparkline({ data, color = "#D4AF37", height = 40 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 120, H = height;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * H}`)
    .join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}


export function DonutChart({ data, size = 200 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total)
    return (
      <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px" }}>
        No data
      </div>
    );

  const cx = size / 2, cy = size / 2;
  const r = size * 0.38;
  const inner = size * 0.24;
  let angle = -Math.PI / 2;

  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const ix1 = cx + inner * Math.cos(angle - sweep),
      iy1 = cy + inner * Math.sin(angle - sweep);
    const ix2 = cx + inner * Math.cos(angle),
      iy2 = cy + inner * Math.sin(angle);
    return {
      ...d,
      path: `M${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${ix2},${iy2} A${inner},${inner},0,${large},0,${ix1},${iy1} Z`,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity="0.9" style={{ transition: "opacity 0.2s" }} />
      ))}
      <circle cx={cx} cy={cy} r={inner - 4} fill="var(--card-bg)" />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
        {fmt(total)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--font-body)">
        Total Spent
      </text>
    </svg>
  );
}


export function BarChart({ months }) {
  const maxVal = Math.max(...months.flatMap((m) => [m.income, m.expense])) || 1;
  const H = 140;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "6px",
        height: `${H + 30}px`,
        padding: "0 4px",
        overflowX: "auto",
      }}
    >
      {months.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            minWidth: "52px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: `${H}px` }}>
            {/* Income bar */}
            <div
              style={{
                width: "14px",
                background: "var(--accent)",
                borderRadius: "3px 3px 0 0",
                height: `${(m.income / maxVal) * H}px`,
                transition: "height 0.6s cubic-bezier(.34,1.56,.64,1)",
                opacity: 0.85,
              }}
              title={`Income: ${fmt(m.income)}`}
            />
            {/* Expense bar */}
            <div
              style={{
                width: "14px",
                background: "#EF4444",
                borderRadius: "3px 3px 0 0",
                height: `${(m.expense / maxVal) * H}px`,
                transition: "height 0.6s cubic-bezier(.34,1.56,.64,1)",
                opacity: 0.75,
              }}
              title={`Expense: ${fmt(m.expense)}`}
            />
          </div>
          <span style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}


export function LineChart({ points, color = "#D4AF37" }) {
  const vals = points.map((p) => p.balance);
  const min = Math.min(...vals) * 0.95;
  const max = Math.max(...vals) * 1.05;
  const range = max - min || 1;
  const W = 600, H = 150;

  const toX = (i) => (i / (points.length - 1)) * W;
  const toY = (v) => H - ((v - min) / range) * H;

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(p.balance)}`).join(" ");
  const areaD = pathD + ` L${W},${H} L0,${H} Z`;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 30}`} style={{ minWidth: "300px" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#lineGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(p.balance)} r="4" fill={color} stroke="var(--card-bg)" strokeWidth="2" />
            {i % Math.ceil(points.length / 6) === 0 && (
              <text x={toX(i)} y={H + 20} textAnchor="middle" fill="var(--muted)" fontSize="9" fontFamily="var(--font-body)">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
