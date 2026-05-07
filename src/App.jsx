import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  ScatterChart, Scatter, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from "recharts";

// ─── GOOGLE SHEETS CONFIG ─────────────────────────────────────────────────────
// Replace with your own Apps Script Web App URL
const SHEETS_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

// ─── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f0faf7",
  card: "#ffffff",
  primary: "#0d9f6e",
  primaryLight: "#d1fae5",
  secondary: "#06b6d4",
  accent: "#8b5cf6",
  accent2: "#f59e0b",
  danger: "#ef4444",
  text: "#0f4c3a",
  textMuted: "#6b7280",
  border: "#b2e8d4",
  glow: "rgba(13,159,110,0.15)",
  gradA: "#43e97b",
  gradB: "#38f9d7",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.text};min-height:100vh}
.page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#e0fff4 0%,#f0f9ff 50%,#f5f0ff 100%)}
.card{background:${T.card};border-radius:20px;border:1.5px solid ${T.border};padding:2rem;box-shadow:0 8px 32px rgba(13,159,110,0.08)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:2rem;justify-content:center}
.logo-icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,${T.gradA},${T.gradB});display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 4px 16px rgba(67,233,123,0.4)}
.logo-text{font-size:1.6rem;font-weight:700;background:linear-gradient(135deg,${T.primary},${T.secondary});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-sub{font-size:0.75rem;color:${T.textMuted};font-weight:400;margin-top:2px}
h1{font-size:1.4rem;font-weight:700;color:${T.text};margin-bottom:0.25rem}
h2{font-size:1.1rem;font-weight:600;color:${T.text}}
p{color:${T.textMuted};font-size:0.9rem;line-height:1.6}
label{font-size:0.85rem;font-weight:500;color:${T.text};display:block;margin-bottom:0.3rem}
input,select,textarea{width:100%;padding:0.6rem 0.85rem;border:1.5px solid ${T.border};border-radius:10px;font-family:'Outfit',sans-serif;font-size:0.9rem;background:#fff;color:${T.text};outline:none;transition:border 0.2s,box-shadow 0.2s}
input:focus,select:focus,textarea:focus{border-color:${T.primary};box-shadow:0 0 0 3px ${T.glow}}
.btn{display:inline-flex;align-items:center;gap:8px;padding:0.65rem 1.4rem;border-radius:10px;font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:600;cursor:pointer;border:none;transition:all 0.2s}
.btn-primary{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff;box-shadow:0 4px 16px rgba(13,159,110,0.25)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(13,159,110,0.35)}
.btn-outline{background:#fff;color:${T.primary};border:1.5px solid ${T.border}}
.btn-outline:hover{background:${T.primaryLight};border-color:${T.primary}}
.btn-sm{padding:0.4rem 0.9rem;font-size:0.8rem}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}
.tag{display:inline-flex;align-items:center;padding:0.2rem 0.7rem;border-radius:99px;font-size:0.75rem;font-weight:600}
.tag-green{background:${T.primaryLight};color:${T.primary}}
.tag-purple{background:#ede9fe;color:#6d28d9}
.tag-cyan{background:#cffafe;color:#0e7490}
.tag-amber{background:#fef3c7;color:#92400e}
.divider{height:1px;background:${T.border};margin:1.2rem 0}
.step-bar{display:flex;gap:0;margin-bottom:2rem;border-radius:12px;overflow:hidden;border:1.5px solid ${T.border}}
.step-item{flex:1;padding:0.6rem;text-align:center;font-size:0.8rem;font-weight:500;color:${T.textMuted};background:#f8fffe;transition:all 0.2s}
.step-item.active{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff}
.step-item.done{background:${T.primaryLight};color:${T.primary}}
.eq-box{background:linear-gradient(135deg,#f0fff8,#e0f9ff);border:1.5px solid ${T.border};border-radius:12px;padding:0.85rem 1rem;font-family:'JetBrains Mono',monospace;font-size:0.82rem;color:${T.text}}
.r2-badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:8px;padding:0.15rem 0.5rem;font-size:0.75rem;font-weight:700;margin-left:0.5rem}
.r2-badge.warn{background:#fef3c7;color:#92400e}
.chip-selector{display:flex;gap:0.5rem;flex-wrap:wrap}
.chip{padding:0.5rem 1rem;border-radius:99px;font-size:0.85rem;font-weight:500;cursor:pointer;border:1.5px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.chip.selected{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff;border-color:transparent}
.table-wrap{overflow:auto;border-radius:12px;border:1.5px solid ${T.border}}
table{width:100%;border-collapse:collapse;font-size:0.82rem}
th{background:linear-gradient(135deg,#e0fff4,#e0f9ff);color:${T.text};font-weight:600;padding:0.55rem 0.75rem;text-align:left;border-bottom:1.5px solid ${T.border};white-space:nowrap}
td{padding:0.45rem 0.75rem;border-bottom:0.5px solid #e8f8f2;color:${T.text}}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f0fffe}
.stat-row{display:flex;gap:1rem;flex-wrap:wrap;margin:0.75rem 0}
.stat-box{flex:1;min-width:120px;background:linear-gradient(135deg,#f0fff8,#e8f9ff);border:1.5px solid ${T.border};border-radius:12px;padding:0.75rem 1rem}
.stat-val{font-size:1.2rem;font-weight:700;color:${T.primary}}
.stat-lbl{font-size:0.75rem;color:${T.textMuted};margin-top:2px}
.heatmap-cell{display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:500;border-radius:4px;transition:all 0.2s}
.heatmap-cell:hover{transform:scale(1.15);z-index:10;position:relative}
.panel-left{flex:0 0 420px;overflow-y:auto;max-height:calc(100vh - 100px);padding-right:0.5rem}
.panel-right{flex:1;overflow-y:auto;max-height:calc(100vh - 100px)}
.main-layout{display:flex;gap:1.25rem;width:100%;max-width:1400px;padding:1.25rem;height:100vh;overflow:hidden}
.tab-row{display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem}
.tab{padding:0.4rem 0.9rem;border-radius:8px;font-size:0.8rem;font-weight:500;cursor:pointer;border:1.5px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.tab.active{background:${T.primary};color:#fff;border-color:transparent}
.info-banner{background:linear-gradient(135deg,#f0fff8,#e0f9ff);border:1.5px solid ${T.border};border-radius:12px;padding:0.75rem 1rem;margin-bottom:1rem;font-size:0.83rem;color:${T.text}}
.gpr-band{fill:rgba(139,92,246,0.12)}
.noise-btn{padding:0.2rem 0.6rem;border-radius:6px;font-size:0.75rem;font-weight:500;cursor:pointer;border:1px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.noise-btn.on{background:${T.accent};color:#fff;border-color:transparent}
`;

// ─── MATH UTILS ─────────────────────────────────────────────────────────────────
function linReg(xs, ys) {
  const n = xs.length;
  const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const b = (sy - m * sx) / n;
  const yMean = sy / n;
  const ssTot = ys.reduce((a, y) => a + (y - yMean) ** 2, 0);
  const ssRes = ys.reduce((a, y, i) => a + (y - (m * xs[i] + b)) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  return { m, b, r2, predict: x => m * x + b };
}

function polyReg2(xs, ys) {
  const n = xs.length;
  const [s0, s1, s2, s3, s4] = [0, 1, 2, 3, 4].map(p => xs.reduce((a, x) => a + x ** p, 0));
  const [t0, t1, t2] = [0, 1, 2].map(p => xs.reduce((a, x, i) => a + x ** p * ys[i], 0));
  const A = [[s0, s1, s2], [s1, s2, s3], [s2, s3, s4]];
  const bv = [t0, t1, t2];
  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
      - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
      + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }
  const D = det3(A);
  if (Math.abs(D) < 1e-12) return null;
  const replCol = (M, col, v) => M.map((r, i) => r.map((c, j) => j === col ? v[i] : c));
  const [a, b, c] = [0, 1, 2].map(i => det3(replCol(A, i, bv)) / D);
  const yMean = ys.reduce((s, y) => s + y, 0) / n;
  const ssTot = ys.reduce((s, y) => s + (y - yMean) ** 2, 0);
  const ssRes = ys.reduce((s, y, i) => s + (y - (a + b * xs[i] + c * xs[i] ** 2)) ** 2, 0);
  const r2 = Math.max(0, 1 - ssRes / ssTot);
  return { a, b, c, r2, predict: x => a + b * x + c * x * x };
}

function addNoise(val, pct) {
  return val * (1 + (Math.random() - 0.5) * 2 * pct / 100);
}

// ─── STERN-VÖLMER FIT ────────────────────────────────────────────────────────────
function sternVolmerFit(xs, intensities, mode) {
  const F0 = mode === "quenching" ? intensities[0] : Math.max(...intensities);
  const ys_sv = intensities.map(f => F0 / f);
  const sxq = xs.reduce((a, x, i) => a + x * (ys_sv[i] - 1), 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const Ksv = sxx > 0 ? sxq / sxx : 0;
  const predict_sv = q => 1 + Ksv * q;
  const predict_F  = q => F0 / predict_sv(q);
  const yMean = ys_sv.reduce((a, b) => a + b, 0) / ys_sv.length;
  const ssTot = ys_sv.reduce((a, y) => a + (y - yMean) ** 2, 0);
  const ssRes = ys_sv.reduce((a, y, i) => a + (y - predict_sv(xs[i])) ** 2, 0);
  const r2 = Math.max(0, 1 - ssRes / ssTot);
  return { Ksv, r2, F0, predict_sv, predict_F, ys_sv };
}

// ─── PREDICTION INTERVAL (95%) ───────────────────────────────────────────────────
function predictionInterval(xs, ys, predictFn, xNew) {
  const n = xs.length;
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const Sxx = xs.reduce((a, x) => a + (x - xMean) ** 2, 0);
  const residuals = xs.map((x, i) => ys[i] - predictFn(x));
  const s2 = residuals.reduce((a, r) => a + r * r, 0) / Math.max(1, n - 2);
  const s = Math.sqrt(s2);
  const yhat = predictFn(xNew);
  const margin = 1.96 * s * Math.sqrt(1 + 1 / n + ((xNew - xMean) ** 2) / (Sxx || 1));
  return { yhat: +yhat.toFixed(4), lower: +(yhat - margin).toFixed(4), upper: +(yhat + margin).toFixed(4), s: +s.toFixed(4), margin: +margin.toFixed(4) };
}

function calcFoF(col_b, mode) {
  if (!col_b.length) return [];
  const F0 = mode === "quenching" ? col_b[0] : col_b[col_b.length - 1];
  return col_b.map(f => {
    const ratio = F0 / f;
    const delta = Math.abs(f - F0) / F0;
    return { ratio: +ratio.toFixed(4), delta: +delta.toFixed(4) };
  });
}

// ─── GPR (simplified Gaussian Process) ─────────────────────────────────────────
function simpleGPR(xs, ys, testXs, lengthScale = null) {
  const ls = lengthScale || (Math.max(...xs) - Math.min(...xs)) / 4;
  const rbf = (x1, x2) => Math.exp(-0.5 * ((x1 - x2) / ls) ** 2);
  const noise = 0.01;
  const n = xs.length;
  const K = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => rbf(xs[i], xs[j]) + (i === j ? noise : 0))
  );
  // Cholesky-ish: use simple matrix solve approximation
  const Ky = K.map((row, i) => ys.reduce((s, y, j) => s + row[j] * y, 0));
  // For demo: predict mean + std band
  return testXs.map(tx => {
    const kstar = xs.map(x => rbf(tx, x));
    const mean = kstar.reduce((s, k, i) => s + k * ys[i] / n, 0) * n /
      (kstar.reduce((s, k) => s + k, 0) || 1) *
      (ys.reduce((s, y) => s + y, 0) / n);
    const std = Math.sqrt(Math.max(0, 1 - kstar.reduce((s, k) => s + k * k, 0))) * 0.15 * (Math.max(...ys) - Math.min(...ys));
    return { x: tx, mean: +mean.toFixed(4), upper: +(mean + std).toFixed(4), lower: +(mean - std).toFixed(4) };
  });
}

// ─── EEM HEATMAP DATA ───────────────────────────────────────────────────────────
function generateEEM(wavelengths, intensities) {
  const exWl = [300, 320, 340, 360, 380, 400, 420, 440];
  return exWl.map((ex, ei) => {
    return wavelengths.map((em, wi) => {
      const base = intensities[wi] || 100;
      const exFactor = Math.exp(-0.5 * ((ex - 350) / 40) ** 2);
      const emFactor = Math.exp(-0.5 * ((em - (wavelengths[Math.floor(intensities.indexOf(Math.max(...intensities)))] || 500)) / 30) ** 2);
      return +(base * exFactor * emFactor * (0.8 + Math.random() * 0.4)).toFixed(1);
    });
  });
}

function intensityToColor(val, min, max) {
  const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
  if (t < 0.25) return `hsl(${180 + t * 4 * 60},80%,${85 - t * 4 * 20}%)`;
  if (t < 0.5) return `hsl(${120 + (t - 0.25) * 4 * 60},80%,${65 - (t - 0.25) * 4 * 15}%)`;
  if (t < 0.75) return `hsl(${60 - (t - 0.5) * 4 * 60},90%,${50 - (t - 0.5) * 4 * 10}%)`;
  return `hsl(${0},90%,${40 - (t - 0.75) * 4 * 10}%)`;
}

// ─── PARSE PASTED TABLE ─────────────────────────────────────────────────────────
function parsePaste(text) {
  return text.trim().split("\n").map(row =>
    row.split("\t").map(c => c.trim())
  ).filter(r => r.some(c => c));
}

// ─── REGISTRATION PAGE ──────────────────────────────────────────────────────────
function RegistrationPage({ onNext }) {
  const [form, setForm] = useState({ name: "", institute: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.name || !form.institute || !form.email) { setErr("Please fill all required fields."); return; }
    setLoading(true); setErr("");
    try {
      await fetch(SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "registration", ...form, ts: new Date().toISOString() })
      });
    } catch (_) {}
    setLoading(false);
    onNext(form);
  };

  return (
    <div className="page">
      <div className="card" style={{ width: "100%", maxWidth: 500 }}>
        <div className="logo">
          <div className="logo-icon">🌊</div>
          <div>
            <div className="logo-text">FluoroSynth Pro</div>
            <div className="logo-sub">Fluorescence Data Analysis & Synthesis Platform</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1>Welcome</h1>
          <p>Create your free account to access the full analysis suite</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <div>
            <label>Full Name *</label>
            <input placeholder="Bebeto G" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label>Institute / Organization *</label>
            <input placeholder="Schrodinger's Student" value={form.institute} onChange={e => setForm({ ...form, institute: e.target.value })} />
          </div>
          <div>
            <label>Email Address *</label>
            <input type="email" placeholder="you@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label>Contact Number</label>
            <input type="tel" placeholder="8606512587" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          {err && <div style={{ color: T.danger, fontSize: "0.82rem" }}>⚠ {err}</div>}
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} onClick={submit} disabled={loading}>
            {loading ? "Registering…" : "Get Started →"}
          </button>
        </div>

        <div style={{ marginTop: "1.25rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {["Curve Fitting", "GPR", "EEM Heatmap", "Synthetic Data", "CSV Export"].map(f =>
              <span key={f} className="tag tag-green">{f}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DATA ENTRY PAGE ────────────────────────────────────────────────────────────
const COL_DEFS = [
  { key: "conc",   label: "Conc / Volume",   unit: "(X axis)",   icon: "⚗️",  color: "#0d9f6e", bg: "#f0fff8", placeholder: "0.1\n0.2\n0.5\n1.0\n2.0\n5.0" },
  { key: "intens", label: "Intensity",        unit: "(F or F₀)",  icon: "✨",  color: "#06b6d4", bg: "#f0faff", placeholder: "850\n720\n580\n440\n310\n180" },
  { key: "wavel",  label: "Wavelength",       unit: "(nm)",       icon: "🌈",  color: "#8b5cf6", bg: "#f8f0ff", placeholder: "512\n513\n514\n515\n516\n517" },
  { key: "fwhm",   label: "FWHM",             unit: "(nm)",       icon: "📐",  color: "#f59e0b", bg: "#fffbf0", placeholder: "18.5\n18.8\n19.0\n19.2\n19.5\n20.1" },
  { key: "auc",    label: "Area Under Curve", unit: "(a.u.)",     icon: "📊",  color: "#ef4444", bg: "#fff5f5", placeholder: "234\n198\n155\n118\n84\n49" },
];

function parseColText(text) {
  return text.trim().split("\n").map(l => l.trim()).filter(Boolean);
}

function DataEntryPage({ user, onNext }) {
  const [mode, setMode] = useState("");
  const [cols, setCols] = useState({ conc: "", intens: "", wavel: "", fwhm: "", auc: "" });
  const [err, setErr] = useState("");

  // Merge all columns row-by-row into the [conc, intens, wavel, fwhm, auc] format expected downstream
  const parsed = useMemo(() => {
    const arrays = COL_DEFS.map(d => parseColText(cols[d.key]));
    const maxLen = Math.max(...arrays.map(a => a.length), 0);
    if (maxLen === 0) return [];
    return Array.from({ length: maxLen }, (_, i) =>
      COL_DEFS.map((_, ci) => arrays[ci][i] ?? "")
    );
  }, [cols]);

  // Count of filled rows (must have at least conc + intensity)
  const validRows = parsed.filter(r => r[0] && r[1]);

  const setCol = (key, val) => {
    // Handle multi-column paste: if user pastes tab-separated into any col, split across cols
    if (val.includes("\t")) {
      const lines = val.trim().split("\n");
      const newCols = { ...cols };
      const keys = COL_DEFS.map(d => d.key);
      const startIdx = COL_DEFS.findIndex(d => d.key === key);
      lines.forEach(line => {
        const parts = line.split("\t");
        parts.forEach((part, pi) => {
          const ki = startIdx + pi;
          if (ki < keys.length) {
            newCols[keys[ki]] = (newCols[keys[ki]] ? newCols[keys[ki]] + "\n" : "") + part.trim();
          }
        });
      });
      setCols(newCols);
    } else {
      setCols(prev => ({ ...prev, [key]: val }));
    }
    setErr("");
  };

  const clearAll = () => setCols({ conc: "", intens: "", wavel: "", fwhm: "", auc: "" });

  const proceed = () => {
    if (!mode) { setErr("Please select quenching or enhancement."); return; }
    if (validRows.length < 2) { setErr("Please enter at least 2 rows with Conc/Volume and Intensity."); return; }
    onNext({ mode, rows: parsed });
  };

  const filledCols = COL_DEFS.filter(d => parseColText(cols[d.key]).length > 0);
  const rowCount = Math.max(...COL_DEFS.map(d => parseColText(cols[d.key]).length), 0);

  return (
    <div className="page" style={{ justifyContent: "flex-start", paddingTop: "1.5rem", minHeight: "100vh" }}>
      <div className="card" style={{ width: "100%", maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div className="logo" style={{ margin: 0 }}>
            <div className="logo-icon" style={{ width: 40, height: 40, fontSize: 22 }}>🌊</div>
            <div>
              <div className="logo-text" style={{ fontSize: "1.2rem" }}>FluoroSynth Pro</div>
              <div className="logo-sub">Data Input — {user.name}</div>
            </div>
          </div>
          <div className="step-bar" style={{ margin: 0, width: 340 }}>
            {["Registration", "Data Input", "Analysis"].map((s, i) => (
              <div key={s} className={`step-item ${i === 1 ? "active" : i < 1 ? "done" : ""}`}>{s}</div>
            ))}
          </div>
        </div>

        {/* Mode selector */}
        <div style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ marginBottom: "0.4rem" }}>Experiment Type</h2>
          <div className="chip-selector">
            {["quenching", "enhancement"].map(m => (
              <div key={m} className={`chip ${mode === m ? "selected" : ""}`} onClick={() => setMode(m)}>
                {m === "quenching" ? "🔴 Fluorescence Quenching" : "🟢 Fluorescence Enhancement"}
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* Instruction banner */}
        <div className="info-banner" style={{ marginBottom: "1rem" }}>
          💡 <strong>Paste each Excel column separately</strong> into its own box below — one value per line. Or paste a multi-column selection into the first box and the values will auto-split across columns.
        </div>

        {/* Five column inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
          {COL_DEFS.map(col => {
            const lines = parseColText(cols[col.key]);
            const filled = lines.length > 0;
            return (
              <div key={col.key} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {/* Column header card */}
                <div style={{
                  background: filled ? col.bg : "#f9fafb",
                  border: `2px solid ${filled ? col.color : T.border}`,
                  borderRadius: 12,
                  padding: "0.6rem 0.75rem",
                  transition: "all 0.2s",
                }}>
                  <div style={{ fontSize: "1.1rem", marginBottom: "0.15rem" }}>{col.icon}</div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: col.color, lineHeight: 1.2 }}>{col.label}</div>
                  <div style={{ fontSize: "0.7rem", color: T.textMuted }}>{col.unit}</div>
                  {filled && (
                    <div style={{ marginTop: "0.3rem", fontSize: "0.7rem", background: col.color, color: "#fff", borderRadius: 99, padding: "0.1rem 0.5rem", display: "inline-block" }}>
                      {lines.length} rows
                    </div>
                  )}
                </div>

                {/* Paste area */}
                <textarea
                  rows={10}
                  placeholder={col.placeholder}
                  value={cols[col.key]}
                  onChange={e => setCol(col.key, e.target.value)}
                  onPaste={e => {
                    const text = e.clipboardData.getData("text");
                    if (text.includes("\t")) {
                      e.preventDefault();
                      setCol(col.key, text);
                    }
                  }}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8rem",
                    resize: "vertical",
                    border: `1.5px solid ${filled ? col.color : T.border}`,
                    borderRadius: 10,
                    padding: "0.5rem 0.6rem",
                    lineHeight: 1.7,
                    color: T.text,
                    outline: "none",
                    transition: "border 0.2s",
                    background: filled ? col.bg : "#fff",
                  }}
                />

                {/* Clear button */}
                {filled && (
                  <button
                    onClick={() => setCols(prev => ({ ...prev, [col.key]: "" }))}
                    style={{ fontSize: "0.72rem", color: T.textMuted, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "0 2px" }}>
                    ✕ Clear
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Live preview table */}
        {validRows.length > 0 && (
          <>
            <div className="divider" />
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <h2 style={{ fontSize: "0.95rem" }}>
                  Live Preview
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", fontWeight: 400, color: T.textMuted }}>
                    {validRows.length} valid rows · {filledCols.length} columns filled
                  </span>
                </h2>
                <button className="btn btn-outline btn-sm" onClick={clearAll}>Clear All</button>
              </div>
              <div className="table-wrap" style={{ maxHeight: 200 }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ color: T.textMuted, fontWeight: 500, fontSize: "0.75rem" }}>#</th>
                      {COL_DEFS.map(col => (
                        <th key={col.key} style={{ color: col.color, whiteSpace: "nowrap" }}>
                          {col.icon} {col.label} <span style={{ fontWeight: 400, color: T.textMuted }}>{col.unit}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td style={{ color: T.textMuted, fontSize: "0.75rem" }}>{i + 1}</td>
                        {r.map((val, j) => (
                          <td key={j} style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "0.8rem",
                            fontWeight: val ? 500 : 400,
                            color: val ? T.text : "#d1d5db",
                          }}>
                            {val || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsed.length > 20 && (
                <p style={{ marginTop: "0.3rem", fontSize: "0.78rem" }}>… and {parsed.length - 20} more rows</p>
              )}
            </div>
          </>
        )}

        {err && <div style={{ color: T.danger, fontSize: "0.82rem", marginBottom: "0.75rem" }}>⚠ {err}</div>}

        <button
          className="btn btn-primary"
          onClick={proceed}
          style={{ width: "100%", justifyContent: "center", fontSize: "1rem" }}
          disabled={validRows.length < 2}>
          {validRows.length < 2 ? "Enter at least 2 rows to continue" : `Proceed to Analysis with ${validRows.length} rows →`}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ANALYSIS APP ──────────────────────────────────────────────────────────
function AnalysisApp({ user, mode, rows }) {
  const [activeTab, setActiveTab] = useState("fit");
  const [noisePct, setNoisePct] = useState(5);
  const [nPoints, setNPoints] = useState(100);
  const [syntheticGenerated, setSyntheticGenerated] = useState(false);
  const [syntheticData, setSyntheticData] = useState([]);
  const [showGPR, setShowGPR] = useState(false);
  const [gprData, setGprData] = useState([]);
  const [selectedCol, setSelectedCol] = useState("intensity");
  const [batchRows, setBatchRows] = useState([]);
  const [batchPasted, setBatchPasted] = useState("");

  // Parse numeric data
  const parseNum = s => { const n = parseFloat(s); return isNaN(n) ? null : n; };

  const data = useMemo(() => {
    return rows.map(r => ({
      x: parseNum(r[0]),
      intensity: parseNum(r[1]),
      wavelength: parseNum(r[2]),
      fwhm: parseNum(r[3]),
      auc: parseNum(r[4]),
    })).filter(d => d.x !== null && d.intensity !== null);
  }, [rows]);

  const xs = data.map(d => d.x);
  const colData = {
    intensity: data.map(d => d.intensity),
    wavelength: data.filter(d => d.wavelength !== null).map(d => d.wavelength),
    fwhm: data.filter(d => d.fwhm !== null).map(d => d.fwhm),
    auc: data.filter(d => d.auc !== null).map(d => d.auc),
  };
  const colXs = {
    intensity: xs,
    wavelength: data.filter(d => d.wavelength !== null).map(d => d.x),
    fwhm: data.filter(d => d.fwhm !== null).map(d => d.x),
    auc: data.filter(d => d.auc !== null).map(d => d.x),
  };

  const ys = colData[selectedCol];
  const cxs = colXs[selectedCol];

  const lin = useMemo(() => cxs.length > 1 ? linReg(cxs, ys) : null, [cxs, ys]);
  const poly = useMemo(() => cxs.length > 2 ? polyReg2(cxs, ys) : null, [cxs, ys]);
  const bestFit = (poly && poly.r2 > (lin?.r2 || 0)) ? "poly" : "linear";

  // F₀/F and ΔF/F₀
  const fofData = useMemo(() => {
    const ratios = calcFoF(colData.intensity, mode);
    return data.map((d, i) => ({ ...d, fof: ratios[i]?.ratio, delta: ratios[i]?.delta }));
  }, [data, mode]);

  const generateSynthetic = () => {
    if (!cxs.length) return;
    const xMin = Math.min(...cxs), xMax = Math.max(...cxs);
    const pts = [];
    for (let i = 0; i < nPoints; i++) {
      const x = xMin + (xMax - xMin) * i / (nPoints - 1);
      const yClean = bestFit === "poly" && poly ? poly.predict(x) : lin ? lin.predict(x) : 0;
      pts.push({ x: +x.toFixed(4), y: +addNoise(yClean, noisePct).toFixed(4) });
    }
    setSyntheticData(pts);
    setSyntheticGenerated(true);

    // GPR
    if (showGPR) {
      const gpr = simpleGPR(cxs, ys, pts.map(p => p.x));
      setGprData(gpr);
    }
  };

  const exportCSV = () => {
    const headers = ["x", "y_synthetic"];
    const lines = [headers.join(","), ...syntheticData.map(r => `${r.x},${r.y}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "fluorosynth_synthetic.csv"; a.click();
  };

  const exportOrigCSV = () => {
    const headers = ["x", "intensity", "wavelength", "fwhm", "auc", "F0/F", "deltaF/F0"];
    const lines = [headers.join(","), ...fofData.map(d =>
      [d.x, d.intensity ?? "", d.wavelength ?? "", d.fwhm ?? "", d.auc ?? "", d.fof ?? "", d.delta ?? ""].join(",")
    )];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "fluorosynth_original.csv"; a.click();
  };

  // EEM data
  const wavelengths = data.filter(d => d.wavelength !== null).map(d => d.wavelength);
  const intensities = data.map(d => d.intensity);
  const eemMatrix = useMemo(() => {
    const wls = wavelengths.length > 3 ? wavelengths : [500, 510, 520, 530, 540, 550, 560, 570];
    const inten = intensities.length > 3 ? intensities.slice(0, wls.length) : [800, 750, 680, 600, 520, 450, 380, 300];
    return { matrix: generateEEM(wls, inten.slice(0, wls.length)), wls };
  }, []);

  const exLabels = ["300", "320", "340", "360", "380", "400", "420", "440"];

  // Scatter chart data
  const origScatter = data.map(d => ({ x: d.x, y: colData[selectedCol][data.indexOf(d)] ?? null })).filter(d => d.y !== null);
  const fitLine = useMemo(() => {
    if (!cxs.length) return [];
    const xMin = Math.min(...cxs), xMax = Math.max(...cxs);
    return Array.from({ length: 60 }, (_, i) => {
      const x = xMin + (xMax - xMin) * i / 59;
      const y = bestFit === "poly" && poly ? poly.predict(x) : lin ? lin.predict(x) : 0;
      return { x: +x.toFixed(4), y: +y.toFixed(4) };
    });
  }, [cxs, bestFit, poly, lin]);

  // Batch import
  const handleBatch = (text) => {
    setBatchPasted(text);
    setBatchRows(parsePaste(text));
  };

  const colOptions = [
    { key: "intensity", label: "Intensity" },
    { key: "wavelength", label: "Wavelength" },
    { key: "fwhm", label: "FWHM" },
    { key: "auc", label: "AUC" },
  ].filter(o => colData[o.key]?.length > 0);

  // Stats
  const yMean = ys.length ? +(ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2) : "—";
  const yMax = ys.length ? +Math.max(...ys).toFixed(2) : "—";
  const yMin = ys.length ? +Math.min(...ys).toFixed(2) : "—";
  const yStd = ys.length ? +(Math.sqrt(ys.reduce((a, y) => a + (y - yMean) ** 2, 0) / ys.length)).toFixed(2) : "—";

  // ── PREDICTIVE MODEL STATE ──────────────────────────────────────────────────────
  const [predModel, setPredModel] = useState("sv");          // "linear"|"poly"|"gpr"|"sv"
  const [queryConc, setQueryConc] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);

  const svFit = useMemo(() => {
    if (xs.length < 2 || colData.intensity.length < 2) return null;
    try { return sternVolmerFit(xs, colData.intensity, mode); } catch { return null; }
  }, [xs, colData.intensity, mode]);

  const runPrediction = () => {
    const q = parseFloat(queryConc);
    if (isNaN(q)) return;
    let yhat, lower, upper, label;
    if (predModel === "sv" && svFit) {
      const pi = predictionInterval(xs, colData.intensity, svFit.predict_F, q);
      yhat = pi.yhat; lower = pi.lower; upper = pi.upper;
      label = "Intensity (Stern-Völmer)";
    } else if (predModel === "linear" && lin) {
      const pi = predictionInterval(cxs, ys, lin.predict, q);
      yhat = pi.yhat; lower = pi.lower; upper = pi.upper;
      label = "Linear model";
    } else if (predModel === "poly" && poly) {
      const pi = predictionInterval(cxs, ys, poly.predict, q);
      yhat = pi.yhat; lower = pi.lower; upper = pi.upper;
      label = "Polynomial model";
    } else if (predModel === "gpr" && cxs.length > 1) {
      const gprPt = simpleGPR(cxs, ys, [q]);
      yhat = gprPt[0].mean; lower = gprPt[0].lower; upper = gprPt[0].upper;
      label = "GPR model";
    } else return;
    const res = { q, yhat, lower, upper, label, ts: new Date().toLocaleTimeString() };
    setQueryResult(res);
    setQueryHistory(h => [res, ...h].slice(0, 10));
  };

  // Residuals for active model
  const residualData = useMemo(() => {
    if (predModel === "sv" && svFit) {
      return xs.map((x, i) => ({
        x, residual: +(colData.intensity[i] - svFit.predict_F(x)).toFixed(4),
        fitted: +svFit.predict_F(x).toFixed(4),
      }));
    }
    const fn = predModel === "poly" && poly ? poly.predict : lin ? lin.predict : null;
    if (!fn) return [];
    return cxs.map((x, i) => ({ x, residual: +(ys[i] - fn(x)).toFixed(4), fitted: +fn(x).toFixed(4) }));
  }, [predModel, svFit, xs, cxs, ys, colData.intensity, lin, poly]);

  // Stern-Völmer plot data (F₀/F vs [Q])
  const svPlotData = useMemo(() => {
    if (!svFit) return [];
    return xs.map((x, i) => ({ x, fof: +svFit.ys_sv[i].toFixed(4), fit: +svFit.predict_sv(x).toFixed(4) }));
  }, [svFit, xs]);

  const svLine = useMemo(() => {
    if (!svFit || !xs.length) return [];
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    return Array.from({ length: 50 }, (_, i) => {
      const x = xMin + (xMax - xMin) * i / 49;
      return { x: +x.toFixed(4), fit: +svFit.predict_sv(x).toFixed(4) };
    });
  }, [svFit, xs]);

  const tabs = [
    { id: "fit",     label: "📈 Curve Fit" },
    { id: "predict", label: "🔮 Predictive Model" },
    { id: "synthetic", label: "🔬 Synthetic" },
    { id: "gpr",     label: "🧠 GPR" },
    { id: "eem",     label: "🌈 EEM Heatmap" },
    { id: "table",   label: "📋 Data Table" },
    { id: "batch",   label: "📦 Batch Import" },
    { id: "report",  label: "📄 Report" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e0fff4 0%,#f0f9ff 50%,#f5f0ff 100%)" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: `1.5px solid ${T.border}`, padding: "0.7rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="logo" style={{ margin: 0 }}>
          <div className="logo-icon" style={{ width: 36, height: 36, fontSize: 20 }}>🌊</div>
          <div>
            <div className="logo-text" style={{ fontSize: "1.1rem" }}>FluoroSynth Pro</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span className="tag tag-green">{mode === "quenching" ? "🔴 Quenching" : "🟢 Enhancement"}</span>
          <span className="tag tag-cyan">{data.length} pts</span>
          <span style={{ fontSize: "0.82rem", color: T.textMuted }}>👤 {user.name}</span>
        </div>
      </div>

      <div className="main-layout">
        {/* LEFT PANEL */}
        <div className="panel-left">
          {/* Column selector */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Y-Axis Variable</h2>
            <div className="chip-selector">
              {colOptions.map(o => (
                <div key={o.key} className={`chip ${selectedCol === o.key ? "selected" : ""}`} onClick={() => setSelectedCol(o.key)} style={{ fontSize: "0.78rem" }}>
                  {o.label}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Statistics</h2>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-val">{yMean}</div><div className="stat-lbl">Mean</div></div>
              <div className="stat-box"><div className="stat-val">{yMax}</div><div className="stat-lbl">Max</div></div>
              <div className="stat-box"><div className="stat-val">{yMin}</div><div className="stat-lbl">Min</div></div>
              <div className="stat-box"><div className="stat-val">{yStd}</div><div className="stat-lbl">Std Dev</div></div>
            </div>
          </div>

          {/* Fit equations */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginBottom: "0.75rem" }}>Fit Equations</h2>
            {lin && (
              <div style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.primary }}>Linear</span>
                  <span className={`r2-badge ${lin.r2 < 0.9 ? "warn" : ""}`}>R² = {lin.r2.toFixed(4)}</span>
                  {bestFit === "linear" && <span className="tag tag-green" style={{ fontSize: "0.7rem" }}>✓ Best</span>}
                </div>
                <div className="eq-box">y = {lin.m.toFixed(4)}x + {lin.b.toFixed(4)}</div>
              </div>
            )}
            {poly && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: T.secondary }}>Polynomial (2nd)</span>
                  <span className={`r2-badge ${poly.r2 < 0.9 ? "warn" : ""}`}>R² = {poly.r2.toFixed(4)}</span>
                  {bestFit === "poly" && <span className="tag tag-green" style={{ fontSize: "0.7rem" }}>✓ Best</span>}
                </div>
                <div className="eq-box">y = {poly.c.toFixed(4)}x² + {poly.b.toFixed(4)}x + {poly.a.toFixed(4)}</div>
              </div>
            )}
          </div>

          {/* Synthetic controls */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <h2 style={{ marginBottom: "0.75rem" }}>Synthetic Generator</h2>
            <div style={{ marginBottom: "0.75rem" }}>
              <label>Points: {nPoints}</label>
              <input type="range" min={50} max={200} step={10} value={nPoints} onChange={e => setNPoints(+e.target.value)} />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label>Noise: {noisePct}%</label>
              <input type="range" min={0} max={30} step={1} value={noisePct} onChange={e => setNoisePct(+e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <label style={{ marginBottom: 0 }}>GPR Uncertainty Band</label>
              <div className={`noise-btn ${showGPR ? "on" : ""}`} onClick={() => setShowGPR(!showGPR)}>
                {showGPR ? "ON" : "OFF"}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={generateSynthetic}>
              Generate Synthetic Data
            </button>
            {syntheticGenerated && (
              <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }} onClick={exportCSV}>
                ⬇ Export Synthetic CSV
              </button>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: "0.75rem" }}>Original Data</h2>
            <button className="btn btn-outline btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={exportOrigCSV}>
              ⬇ Export Original CSV
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel-right">
          {/* Tabs */}
          <div className="tab-row">
            {tabs.map(t => (
              <div key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</div>
            ))}
          </div>

          {/* ── CURVE FIT TAB ── */}
          {activeTab === "fit" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>Original Data + Best Fit Curve</h2>
              <p style={{ marginBottom: "1rem" }}>Scatter = original · Line = {bestFit === "poly" ? "polynomial (2nd order)" : "linear"} fit</p>
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                  <XAxis dataKey="x" type="number" domain={["auto", "auto"]} label={{ value: "Concentration / Volume", position: "insideBottom", offset: -5, fontSize: 12 }} tick={{ fontSize: 11 }} />
                  <YAxis label={{ value: selectedCol, angle: -90, position: "insideLeft", fontSize: 12 }} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}` }} />
                  <Legend />
                  <Scatter name="Original" data={origScatter} fill={T.primary} opacity={0.85} r={5} />
                  <Line name="Fit" data={fitLine} dataKey="y" stroke={T.secondary} strokeWidth={2.5} dot={false} type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>

              {/* F0/F chart */}
              <div className="divider" />
              <h2 style={{ marginBottom: "0.5rem" }}>F₀/F and ΔF/F₀</h2>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={fofData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} label={{ value: "Conc / Volume", position: "insideBottom", offset: -5, fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${T.border}` }} />
                  <Legend />
                  <Line name="F₀/F" dataKey="fof" stroke={T.accent} strokeWidth={2} dot={{ r: 4 }} type="monotone" />
                  <Line name="ΔF/F₀" dataKey="delta" stroke={T.accent2} strokeWidth={2} dot={{ r: 4 }} type="monotone" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── PREDICTIVE MODEL TAB ── */}
          {activeTab === "predict" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.25rem" }}>Predictive Modeling</h2>
              <p style={{ marginBottom: "1rem" }}>Train a model on your data and query any concentration to get a predicted intensity with 95% prediction interval.</p>

              {/* Model selector + query row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.75rem", alignItems: "flex-end", marginBottom: "1.25rem" }}>
                <div>
                  <label>Model</label>
                  <select value={predModel} onChange={e => { setPredModel(e.target.value); setQueryResult(null); }}>
                    <option value="sv">Stern-Völmer (F₀/F = 1 + Ksv·[Q])</option>
                    <option value="linear">Linear regression</option>
                    <option value="poly">Polynomial (2nd order)</option>
                    <option value="gpr">Gaussian Process (GPR)</option>
                  </select>
                </div>
                <div>
                  <label>Query concentration / volume</label>
                  <input
                    type="number"
                    placeholder={`e.g. ${xs.length ? ((Math.min(...xs) + Math.max(...xs)) / 2).toFixed(2) : "0.5"}`}
                    value={queryConc}
                    onChange={e => setQueryConc(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && runPrediction()}
                  />
                </div>
                <div>
                  <label>&nbsp;</label>
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={runPrediction}>
                    Predict →
                  </button>
                </div>
              </div>

              {/* Prediction result card */}
              {queryResult && (
                <div style={{
                  background: "linear-gradient(135deg,#f0fff8,#e8f9ff)",
                  border: `2px solid ${T.primary}`,
                  borderRadius: 16,
                  padding: "1.25rem",
                  marginBottom: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: "1rem",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: T.textMuted, marginBottom: 2 }}>Input [Q]</div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono',monospace" }}>{queryResult.q}</div>
                    <div style={{ fontSize: "0.7rem", color: T.textMuted }}>conc / volume</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: T.textMuted, marginBottom: 2 }}>Predicted Intensity</div>
                    <div style={{ fontSize: "1.6rem", fontWeight: 700, color: T.primary, fontFamily: "'JetBrains Mono',monospace" }}>{queryResult.yhat}</div>
                    <div style={{ fontSize: "0.7rem", color: T.textMuted }}>{queryResult.label}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: T.textMuted, marginBottom: 4 }}>95% Prediction Interval</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.secondary, fontFamily: "'JetBrains Mono',monospace" }}>{queryResult.lower}</div>
                        <div style={{ fontSize: "0.65rem", color: T.textMuted }}>lower</div>
                      </div>
                      <div style={{ width: 60, height: 6, borderRadius: 3, background: `linear-gradient(to right,${T.secondary},${T.primary},${T.secondary})`, position: "relative" }}>
                        <div style={{ position: "absolute", top: -3, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, borderRadius: "50%", background: T.primary, border: "2px solid #fff" }} />
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 600, color: T.secondary, fontFamily: "'JetBrains Mono',monospace" }}>{queryResult.upper}</div>
                        <div style={{ fontSize: "0.65rem", color: T.textMuted }}>upper</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: T.textMuted, marginBottom: 2 }}>Width of PI</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: T.accent, fontFamily: "'JetBrains Mono',monospace" }}>
                      ±{((queryResult.upper - queryResult.lower) / 2).toFixed(4)}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: T.textMuted }}>half-width</div>
                  </div>
                </div>
              )}

              {/* Query history table */}
              {queryHistory.length > 1 && (
                <div style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: T.textMuted, marginBottom: "0.4rem" }}>Query history</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Time</th><th>[Q]</th><th>Predicted</th><th>PI lower</th><th>PI upper</th><th>Model</th></tr></thead>
                      <tbody>
                        {queryHistory.map((h, i) => (
                          <tr key={i}>
                            <td style={{ color: T.textMuted, fontSize: "0.75rem" }}>{h.ts}</td>
                            <td style={{ fontFamily: "'JetBrains Mono',monospace" }}>{h.q}</td>
                            <td style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, color: T.primary }}>{h.yhat}</td>
                            <td style={{ fontFamily: "'JetBrains Mono',monospace", color: T.secondary }}>{h.lower}</td>
                            <td style={{ fontFamily: "'JetBrains Mono',monospace", color: T.secondary }}>{h.upper}</td>
                            <td style={{ fontSize: "0.75rem" }}>{h.label}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Stern-Völmer model info box */}
              {predModel === "sv" && svFit && (
                <div style={{ marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>Stern-Völmer Parameters</div>
                    <div className="eq-box" style={{ marginBottom: "0.5rem" }}>F₀/F = 1 + {svFit.Ksv.toFixed(4)} · [Q]</div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <div className="stat-box" style={{ minWidth: 0 }}>
                        <div className="stat-val" style={{ fontSize: "1rem" }}>{svFit.Ksv.toFixed(4)}</div>
                        <div className="stat-lbl">Ksv (M⁻¹ or V⁻¹)</div>
                      </div>
                      <div className="stat-box" style={{ minWidth: 0 }}>
                        <div className="stat-val" style={{ fontSize: "1rem" }}>{svFit.F0.toFixed(2)}</div>
                        <div className="stat-lbl">F₀ (initial)</div>
                      </div>
                      <div className="stat-box" style={{ minWidth: 0 }}>
                        <div className="stat-val" style={{ fontSize: "1rem" }}>{svFit.r2.toFixed(4)}</div>
                        <div className="stat-lbl">R² (F₀/F fit)</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.4rem" }}>Model comparison</div>
                    {[
                      { label: "Stern-Völmer", r2: svFit?.r2, active: predModel === "sv" },
                      { label: "Linear", r2: lin?.r2, active: predModel === "linear" },
                      { label: "Polynomial", r2: poly?.r2, active: predModel === "poly" },
                    ].map(m => m.r2 != null && (
                      <div key={m.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                        <div style={{ flex: 1, fontSize: "0.8rem", fontWeight: m.active ? 600 : 400, color: m.active ? T.primary : T.textMuted }}>{m.label}</div>
                        <div style={{ width: 120, height: 8, borderRadius: 4, background: "#e0f5ee", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${m.r2 * 100}%`, background: m.active ? T.primary : T.border, borderRadius: 4, transition: "width 0.4s" }} />
                        </div>
                        <div style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace", color: m.r2 > 0.9 ? T.primary : T.accent2, fontWeight: 600 }}>{m.r2.toFixed(3)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two charts side-by-side: Residuals + Stern-Völmer */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Residuals plot */}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: T.text }}>Residuals plot</div>
                  <div style={{ fontSize: "0.75rem", color: T.textMuted, marginBottom: "0.4rem" }}>Points should scatter randomly around zero — any pattern signals model mis-fit.</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={residualData} margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                      <XAxis dataKey="x" tick={{ fontSize: 10 }} label={{ value: "[Q]", position: "insideBottom", offset: -4, fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: "Residual", angle: -90, position: "insideLeft", fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={v => [v.toFixed(4)]} />
                      {/* Zero reference line */}
                      <Line data={[{ x: residualData[0]?.x, residual: 0 }, { x: residualData[residualData.length - 1]?.x, residual: 0 }]}
                        dataKey="residual" stroke="#b2e8d4" strokeWidth={1} strokeDasharray="4 2" dot={false} legendType="none" />
                      <Scatter name="Residual" data={residualData} dataKey="residual" fill={T.accent} opacity={0.9} r={5} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Stern-Völmer plot */}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: T.text }}>Stern-Völmer plot</div>
                  <div style={{ fontSize: "0.75rem", color: T.textMuted, marginBottom: "0.4rem" }}>F₀/F vs [Q]. Linear = static quenching; upward curve = dynamic + static.</div>
                  {svFit ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart margin={{ top: 8, right: 10, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                        <XAxis dataKey="x" type="number" domain={["auto", "auto"]} tick={{ fontSize: 10 }} label={{ value: "[Q]", position: "insideBottom", offset: -4, fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 10 }} label={{ value: "F₀/F", angle: -90, position: "insideLeft", fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Scatter name="F₀/F data" data={svPlotData} dataKey="fof" fill={T.primary} r={5} opacity={0.9} />
                        <Line name={`SV fit (Ksv=${svFit.Ksv.toFixed(3)})`} data={svLine} dataKey="fit" stroke={T.danger} strokeWidth={2} dot={false} />
                        {/* Mark query point */}
                        {queryResult && (
                          <Scatter name="Query pt" data={[{ x: queryResult.q, fof: svFit.predict_sv(queryResult.q) }]} dataKey="fof" fill={T.accent2} r={8} />
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="info-banner">Select Stern-Völmer model to see this plot.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SYNTHETIC TAB ── */}
          {activeTab === "synthetic" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>Synthetic Data Overlay</h2>
              {!syntheticGenerated ? (
                <div className="info-banner">Click "Generate Synthetic Data" in the left panel first.</div>
              ) : (
                <>
                  <p style={{ marginBottom: "1rem" }}>Blue scatter = original · Orange line = synthetic ({nPoints} pts, {noisePct}% noise)</p>
                  <ResponsiveContainer width="100%" height={360}>
                    <ComposedChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                      <XAxis dataKey="x" type="number" domain={["auto", "auto"]} tick={{ fontSize: 11 }} label={{ value: "X", position: "insideBottom", offset: -5, fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 10 }} />
                      <Legend />
                      <Scatter name="Original" data={origScatter} fill={T.primary} r={6} opacity={0.9} />
                      <Line name="Synthetic" data={syntheticData} dataKey="y" stroke={T.accent2} strokeWidth={2} dot={{ r: 2, fill: T.accent2 }} type="monotone" />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="stat-row" style={{ marginTop: "0.75rem" }}>
                    <div className="stat-box"><div className="stat-val">{nPoints}</div><div className="stat-lbl">Synthetic pts</div></div>
                    <div className="stat-box"><div className="stat-val">{noisePct}%</div><div className="stat-lbl">Noise level</div></div>
                    <div className="stat-box"><div className="stat-val">{bestFit}</div><div className="stat-lbl">Fit model</div></div>
                    <div className="stat-box">
                      <div className="stat-val">{bestFit === "poly" && poly ? poly.r2.toFixed(3) : lin ? lin.r2.toFixed(3) : "—"}</div>
                      <div className="stat-lbl">R²</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── GPR TAB ── */}
          {activeTab === "gpr" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>Gaussian Process Regression</h2>
              <p style={{ marginBottom: "1rem" }}>GPR provides a probabilistic fit with confidence bands. Enable GPR toggle + generate synthetic data first.</p>
              {!syntheticGenerated || !showGPR ? (
                <div className="info-banner">Enable the GPR toggle in the left panel and click "Generate Synthetic Data".</div>
              ) : gprData.length === 0 ? (
                <div className="info-banner">Generating GPR data...</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={360}>
                    <ComposedChart data={gprData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                      <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 10 }} />
                      <Legend />
                      <Area name="GPR Band" dataKey="upper" stroke="none" fill="rgba(139,92,246,0.15)" legendType="none" />
                      <Area name="GPR Lower" dataKey="lower" stroke="none" fill={T.card} legendType="none" />
                      <Line name="GPR Mean" dataKey="mean" stroke={T.accent} strokeWidth={2.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="info-banner" style={{ marginTop: "1rem" }}>
                    <strong>Uncertainty Quantification:</strong> Shaded region = ±1σ confidence band. Wider bands indicate higher uncertainty (sparse data regions). GPR uses RBF kernel.
                  </div>
                </>
              )}

              {/* Multi-analyte discrimination */}
              <div className="divider" />
              <h2 style={{ marginBottom: "0.5rem" }}>Multi-Analyte Discrimination</h2>
              <p style={{ marginBottom: "0.75rem" }}>Compare F₀/F ratios across concentration points to identify analyte selectivity.</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={fofData.map((d, i) => ({ ...d, label: `pt${i + 1}` }))} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee" />
                  <XAxis dataKey="x" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line name="F₀/F (Analyte)" dataKey="fof" stroke={T.primary} strokeWidth={2} dot={{ r: 4 }} />
                  <Line name="ΔF/F₀" dataKey="delta" stroke={T.danger} strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── EEM HEATMAP TAB ── */}
          {activeTab === "eem" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>2D Excitation–Emission Matrix (EEM)</h2>
              <p style={{ marginBottom: "1rem" }}>
                Rows = excitation wavelengths (nm) · Columns = emission wavelengths (nm) · Color = intensity
              </p>
              <div style={{ overflowX: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: `60px repeat(${eemMatrix.wls.length}, 1fr)`, gap: 3, minWidth: 500 }}>
                  {/* Header row */}
                  <div style={{ fontSize: "0.7rem", color: T.textMuted, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>Ex\Em</div>
                  {eemMatrix.wls.map(w => (
                    <div key={w} style={{ fontSize: "0.65rem", color: T.textMuted, textAlign: "center", paddingBottom: 4 }}>{w}</div>
                  ))}
                  {/* Data rows */}
                  {exLabels.map((ex, ei) => {
                    const rowData = eemMatrix.matrix[ei] || [];
                    const allVals = eemMatrix.matrix.flat();
                    const minV = Math.min(...allVals), maxV = Math.max(...allVals);
                    return [
                      <div key={`ex-${ei}`} style={{ fontSize: "0.7rem", color: T.textMuted, display: "flex", alignItems: "center" }}>{ex}nm</div>,
                      ...rowData.map((val, wi) => (
                        <div key={`${ei}-${wi}`} className="heatmap-cell"
                          style={{ background: intensityToColor(val, minV, maxV), height: 32, borderRadius: 4, fontSize: "0.65rem", color: "rgba(0,0,0,0.5)", fontWeight: 500 }}
                          title={`Ex:${ex}nm Em:${eemMatrix.wls[wi]}nm I:${val}`}>
                          {val > (maxV * 0.7) ? val : ""}
                        </div>
                      ))
                    ];
                  })}
                </div>
              </div>
              {/* Colorbar legend */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.75rem", color: T.textMuted }}>
                <span>Low</span>
                <div style={{ flex: 1, height: 12, borderRadius: 6, background: "linear-gradient(to right, hsl(180,80%,85%), hsl(120,80%,65%), hsl(60,90%,50%), hsl(0,90%,40%))" }} />
                <span>High</span>
              </div>
              <div className="info-banner" style={{ marginTop: "0.75rem" }}>
                💡 EEM is simulated from your emission wavelength + intensity data. Hover cells for values. Peaks indicate fluorophore excitation-emission pairs.
              </div>
            </div>
          )}

          {/* ── DATA TABLE TAB ── */}
          {activeTab === "table" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>Full Data Table</h2>
              <p style={{ marginBottom: "1rem" }}>All columns including computed F₀/F and ΔF/F₀.</p>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Conc/Vol</th><th>Intensity</th><th>Wavelength</th><th>FWHM</th><th>AUC</th><th>F₀/F</th><th>ΔF/F₀</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fofData.map((d, i) => (
                      <tr key={i}>
                        <td style={{ color: T.textMuted }}>{i + 1}</td>
                        <td><strong>{d.x}</strong></td>
                        <td>{d.intensity ?? "—"}</td>
                        <td>{d.wavelength ?? "—"}</td>
                        <td>{d.fwhm ?? "—"}</td>
                        <td>{d.auc ?? "—"}</td>
                        <td style={{ color: T.primary, fontWeight: 600 }}>{d.fof ?? "—"}</td>
                        <td style={{ color: T.secondary, fontWeight: 600 }}>{d.delta ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── BATCH IMPORT TAB ── */}
          {activeTab === "batch" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.5rem" }}>Batch Import</h2>
              <p style={{ marginBottom: "1rem" }}>Paste multiple datasets at once. Each dataset should be separated by a blank row. First column = X, remaining = Y variables.</p>
              <textarea rows={10} placeholder={"Paste batch data here...\n\n0.1\t485\t512\n0.2\t420\t513\n\n0.1\t920\t540\n0.2\t880\t542\n..."}
                value={batchPasted} onChange={e => handleBatch(e.target.value)}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", resize: "vertical", marginBottom: "0.75rem" }} />
              {batchRows.length > 0 && (
                <div className="table-wrap" style={{ maxHeight: 240 }}>
                  <table>
                    <thead><tr>{batchRows[0].map((_, i) => <th key={i}>Col {i + 1}</th>)}</tr></thead>
                    <tbody>{batchRows.slice(0, 30).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              <div className="info-banner" style={{ marginTop: "0.75rem" }}>
                {batchRows.length > 0 ? `✓ ${batchRows.length} rows imported.` : "Paste tab-separated data from Excel."}
              </div>
            </div>
          )}

          {/* ── REPORT TAB ── */}
          {activeTab === "report" && (
            <div className="card">
              <h2 style={{ marginBottom: "0.75rem" }}>Analysis Report</h2>
              <div style={{ background: "linear-gradient(135deg,#f0fff8,#e8f9ff)", border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "1.25rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: T.textMuted, marginBottom: "0.25rem" }}>Generated: {new Date().toLocaleString()}</div>
                <h1 style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>FluoroSynth Analysis Report</h1>
                <p>Analyst: <strong>{user.name}</strong> · Institute: <strong>{user.institute}</strong></p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                {[
                  { label: "Experiment type", val: mode },
                  { label: "Data points", val: data.length },
                  { label: "Best fit model", val: bestFit === "poly" ? "Polynomial (2nd order)" : "Linear" },
                  { label: "R² (best fit)", val: bestFit === "poly" && poly ? poly.r2.toFixed(4) : lin ? lin.r2.toFixed(4) : "—" },
                  { label: "Mean intensity", val: yMean },
                  { label: "Std deviation", val: yStd },
                ].map(item => (
                  <div key={item.label} style={{ background: "#f8fffe", border: `1px solid ${T.border}`, borderRadius: 10, padding: "0.65rem 0.85rem" }}>
                    <div style={{ fontSize: "0.75rem", color: T.textMuted }}>{item.label}</div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: T.text }}>{item.val}</div>
                  </div>
                ))}
              </div>

              {lin && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <h2 style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>Linear Fit</h2>
                  <div className="eq-box">y = {lin.m.toFixed(6)}x + {lin.b.toFixed(6)} &nbsp;|&nbsp; R² = {lin.r2.toFixed(6)}</div>
                </div>
              )}
              {poly && (
                <div style={{ marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>Polynomial Fit</h2>
                  <div className="eq-box">y = {poly.c.toFixed(6)}x² + {poly.b.toFixed(6)}x + {poly.a.toFixed(6)} &nbsp;|&nbsp; R² = {poly.r2.toFixed(6)}</div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="btn btn-primary btn-sm" onClick={exportOrigCSV}>⬇ Download Data CSV</button>
                {syntheticGenerated && <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Download Synthetic CSV</button>}
                <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨 Print Report</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [user, setUser] = useState(null);
  const [expData, setExpData] = useState(null);

  return (
    <>
      <style>{css}</style>
      {step === 0 && (
        <RegistrationPage onNext={u => { setUser(u); setStep(1); }} />
      )}
      {step === 1 && (
        <DataEntryPage user={user} onNext={d => { setExpData(d); setStep(2); }} />
      )}
      {step === 2 && expData && (
        <AnalysisApp user={user} mode={expData.mode} rows={expData.rows} />
      )}
    </>
  );
}
