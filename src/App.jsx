import { useState, useMemo } from "react";
import {
  Scatter, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell,
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────────
const SHEETS_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
const SITE_URL   = "https://sites.google.com/view/schrodingersstudent/initiatives";
const EMAIL      = "theeasyresearcher@gmail.com";

const T = {
  bg:"#f0faf7", card:"#ffffff", primary:"#0d9f6e", primaryLight:"#d1fae5",
  secondary:"#06b6d4", accent:"#8b5cf6", accent2:"#f59e0b", danger:"#ef4444",
  text:"#0f4c3a", textMuted:"#6b7280", border:"#b2e8d4",
  glow:"rgba(13,159,110,0.15)", gradA:"#43e97b", gradB:"#38f9d7",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',sans-serif;background:${T.bg};color:${T.text};min-height:100vh}
.page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;background:linear-gradient(135deg,#e0fff4 0%,#f0f9ff 50%,#f5f0ff 100%)}
.card{background:${T.card};border-radius:20px;border:1.5px solid ${T.border};padding:1.5rem;box-shadow:0 8px 32px rgba(13,159,110,0.08);margin-bottom:1rem}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;justify-content:center}
.logo-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,${T.gradA},${T.gradB});display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 16px rgba(67,233,123,0.4);flex-shrink:0}
.logo-text{font-size:1.4rem;font-weight:700;background:linear-gradient(135deg,${T.primary},${T.secondary});-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.logo-sub{font-size:0.72rem;color:${T.textMuted};margin-top:1px}
h1{font-size:1.3rem;font-weight:700;color:${T.text};margin-bottom:0.2rem}
h2{font-size:1rem;font-weight:600;color:${T.text}}
p{color:${T.textMuted};font-size:0.88rem;line-height:1.6}
label{font-size:0.83rem;font-weight:500;color:${T.text};display:block;margin-bottom:0.3rem}
input,select,textarea{width:100%;padding:0.55rem 0.8rem;border:1.5px solid ${T.border};border-radius:10px;font-family:'Outfit',sans-serif;font-size:0.88rem;background:#fff;color:${T.text};outline:none;transition:border 0.2s,box-shadow 0.2s}
input:focus,select:focus,textarea:focus{border-color:${T.primary};box-shadow:0 0 0 3px ${T.glow}}
.btn{display:inline-flex;align-items:center;gap:6px;padding:0.6rem 1.2rem;border-radius:10px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:600;cursor:pointer;border:none;transition:all 0.2s;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff;box-shadow:0 4px 14px rgba(13,159,110,0.25)}
.btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(13,159,110,0.35)}
.btn-outline{background:#fff;color:${T.primary};border:1.5px solid ${T.border}}
.btn-outline:hover{background:${T.primaryLight};border-color:${T.primary}}
.btn-danger{background:#fff5f5;color:${T.danger};border:1.5px solid #fecaca}
.btn-danger:hover{background:#fee2e2}
.btn-sm{padding:0.35rem 0.8rem;font-size:0.78rem}
.tag{display:inline-flex;align-items:center;padding:0.18rem 0.65rem;border-radius:99px;font-size:0.73rem;font-weight:600}
.tag-green{background:${T.primaryLight};color:${T.primary}}
.tag-cyan{background:#cffafe;color:#0e7490}
.tag-amber{background:#fef3c7;color:#92400e}
.tag-purple{background:#ede9fe;color:#6d28d9}
.tag-red{background:#fee2e2;color:#991b1b}
.divider{height:1px;background:${T.border};margin:1rem 0}
.step-bar{display:flex;margin-bottom:1.5rem;border-radius:10px;overflow:hidden;border:1.5px solid ${T.border}}
.step-item{flex:1;padding:0.55rem;text-align:center;font-size:0.78rem;font-weight:500;color:${T.textMuted};background:#f8fffe;transition:all 0.2s}
.step-item.active{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff}
.step-item.done{background:${T.primaryLight};color:${T.primary}}
.eq-box{background:linear-gradient(135deg,#f0fff8,#e0f9ff);border:1.5px solid ${T.border};border-radius:10px;padding:0.75rem 1rem;font-family:'JetBrains Mono',monospace;font-size:0.8rem;color:${T.text};word-break:break-all}
.r2-badge{display:inline-block;background:#dcfce7;color:#166534;border-radius:6px;padding:0.12rem 0.45rem;font-size:0.73rem;font-weight:700;margin-left:0.4rem}
.r2-badge.warn{background:#fef3c7;color:#92400e}
.chip-selector{display:flex;gap:0.4rem;flex-wrap:wrap}
.chip{padding:0.4rem 0.85rem;border-radius:99px;font-size:0.82rem;font-weight:500;cursor:pointer;border:1.5px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.chip.selected{background:linear-gradient(135deg,${T.primary},${T.secondary});color:#fff;border-color:transparent}
.table-wrap{overflow:auto;border-radius:12px;border:1.5px solid ${T.border}}
table{width:100%;border-collapse:collapse;font-size:0.8rem}
th{background:linear-gradient(135deg,#e0fff4,#e0f9ff);color:${T.text};font-weight:600;padding:0.5rem 0.7rem;text-align:left;border-bottom:1.5px solid ${T.border};white-space:nowrap}
td{padding:0.4rem 0.7rem;border-bottom:0.5px solid #e8f8f2;color:${T.text}}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f0fffe}
.stat-row{display:flex;gap:0.75rem;flex-wrap:wrap;margin:0.6rem 0}
.stat-box{flex:1;min-width:100px;background:linear-gradient(135deg,#f0fff8,#e8f9ff);border:1.5px solid ${T.border};border-radius:10px;padding:0.65rem 0.85rem}
.stat-val{font-size:1.1rem;font-weight:700;color:${T.primary}}
.stat-lbl{font-size:0.7rem;color:${T.textMuted};margin-top:2px}
.heatmap-cell{display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:500;border-radius:3px;transition:transform 0.15s;cursor:default}
.heatmap-cell:hover{transform:scale(1.2);z-index:10;position:relative}
.panel-left{flex:0 0 370px;overflow-y:auto;max-height:calc(100vh - 86px);padding-right:0.4rem}
.panel-right{flex:1;overflow-y:auto;max-height:calc(100vh - 86px)}
.main-layout{display:flex;gap:1rem;width:100%;max-width:1400px;padding:1rem;height:100vh;overflow:hidden}
.tab-row{display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:1rem}
.tab{padding:0.32rem 0.75rem;border-radius:8px;font-size:0.76rem;font-weight:500;cursor:pointer;border:1.5px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.tab.active{background:${T.primary};color:#fff;border-color:transparent}
.info-banner{background:linear-gradient(135deg,#f0fff8,#e0f9ff);border:1.5px solid ${T.border};border-radius:10px;padding:0.65rem 0.9rem;margin-bottom:0.75rem;font-size:0.82rem;color:${T.text}}
.noise-btn{padding:0.18rem 0.55rem;border-radius:6px;font-size:0.73rem;font-weight:500;cursor:pointer;border:1px solid ${T.border};background:#fff;color:${T.textMuted};transition:all 0.2s}
.noise-btn.on{background:${T.accent};color:#fff;border-color:transparent}
.topbar-link{font-size:0.76rem;color:${T.primary};text-decoration:none;font-weight:500}
.topbar-link:hover{text-decoration:underline}
`;

// ─── MATH ────────────────────────────────────────────────────────────────────────
function linReg(xs, ys) {
  const n = xs.length;
  if (n < 2) return null;
  const sx = xs.reduce((a,b)=>a+b,0), sy = ys.reduce((a,b)=>a+b,0);
  const sxy = xs.reduce((a,x,i)=>a+x*ys[i],0);
  const sxx = xs.reduce((a,x)=>a+x*x,0);
  const d = n*sxx - sx*sx;
  if (Math.abs(d) < 1e-12) return null;
  const m = (n*sxy - sx*sy)/d;
  const b = (sy - m*sx)/n;
  const yM = sy/n;
  const ssTot = ys.reduce((a,y)=>a+(y-yM)**2,0);
  const ssRes = ys.reduce((a,y,i)=>a+(y-(m*xs[i]+b))**2,0);
  return { m, b, r2: ssTot>0?Math.max(0,1-ssRes/ssTot):0, predict: x=>m*x+b };
}

function polyReg2(xs, ys) {
  const n = xs.length;
  if (n < 3) return null;
  const pw = p => xs.reduce((a,x)=>a+x**p,0);
  const [s0,s1,s2,s3,s4] = [0,1,2,3,4].map(pw);
  const tw = p => xs.reduce((a,x,i)=>a+x**p*ys[i],0);
  const [t0,t1,t2] = [0,1,2].map(tw);
  const A = [[s0,s1,s2],[s1,s2,s3],[s2,s3,s4]];
  const bv = [t0,t1,t2];
  const det3 = m => m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  const D = det3(A);
  if (Math.abs(D) < 1e-12) return null;
  const rep = (M,c,v) => M.map((r,i)=>r.map((x,j)=>j===c?v[i]:x));
  const [a,b,c] = [0,1,2].map(i=>det3(rep(A,i,bv))/D);
  const yM = ys.reduce((s,y)=>s+y,0)/n;
  const ssTot = ys.reduce((s,y)=>s+(y-yM)**2,0);
  const ssRes = ys.reduce((s,y,i)=>s+(y-(a+b*xs[i]+c*xs[i]**2))**2,0);
  return { a, b, c, r2: ssTot>0?Math.max(0,1-ssRes/ssTot):0, predict: x=>a+b*x+c*x*x };
}

function addNoise(val, pct) {
  return val*(1+(Math.random()-0.5)*2*pct/100);
}

function sternVolmerFit(xs, intensities, mode) {
  if (xs.length<2||intensities.length<2) return null;
  const F0 = mode==="quenching"?intensities[0]:Math.max(...intensities);
  const ys_sv = intensities.map(f=>F0/f);
  const sxq = xs.reduce((a,x,i)=>a+x*(ys_sv[i]-1),0);
  const sxx = xs.reduce((a,x)=>a+x*x,0);
  const Ksv = sxx>0?sxq/sxx:0;
  const predict_sv = q=>1+Ksv*q;
  const predict_F  = q=>F0/predict_sv(q);
  const yM = ys_sv.reduce((a,b)=>a+b,0)/ys_sv.length;
  const ssTot = ys_sv.reduce((a,y)=>a+(y-yM)**2,0);
  const ssRes = ys_sv.reduce((a,y,i)=>a+(y-predict_sv(xs[i]))**2,0);
  return { Ksv, r2:ssTot>0?Math.max(0,1-ssRes/ssTot):0, F0, predict_sv, predict_F, ys_sv };
}

function predictionInterval(xs, ys, fn, xNew) {
  const n = xs.length;
  if (n<2) return {yhat:fn(xNew),lower:0,upper:0};
  const xM = xs.reduce((a,b)=>a+b,0)/n;
  const Sxx = xs.reduce((a,x)=>a+(x-xM)**2,0);
  const s2 = xs.reduce((a,x,i)=>a+(ys[i]-fn(x))**2,0)/Math.max(1,n-2);
  const s = Math.sqrt(s2);
  const yh = fn(xNew);
  const mg = 1.96*s*Math.sqrt(1+1/n+((xNew-xM)**2)/(Sxx||1));
  return {yhat:+yh.toFixed(4),lower:+(yh-mg).toFixed(4),upper:+(yh+mg).toFixed(4)};
}

function simpleGPR(xs, ys, testXs) {
  const ls = (Math.max(...xs)-Math.min(...xs))/4||1;
  const rbf = (a,b)=>Math.exp(-0.5*((a-b)/ls)**2);
  return testXs.map(tx=>{
    const ks = xs.map(x=>rbf(tx,x));
    const ksum = ks.reduce((s,k)=>s+k,0)||1;
    const mean = ks.reduce((s,k,i)=>s+k*ys[i],0)/ksum;
    const std = Math.sqrt(Math.max(0,1-ks.reduce((s,k)=>s+k*k,0)))*0.12*(Math.max(...ys)-Math.min(...ys));
    return {x:tx, mean:+mean.toFixed(4), upper:+(mean+std).toFixed(4), lower:+(mean-std).toFixed(4)};
  });
}

function calcFoF(col_b, mode) {
  if (!col_b.length) return [];
  const F0 = mode==="quenching"?col_b[0]:col_b[col_b.length-1];
  return col_b.map(f=>({ratio:+(F0/f).toFixed(4),delta:+(Math.abs(f-F0)/F0).toFixed(4)}));
}

function generateEEM(wavelengths, intensities) {
  const exWl=[300,320,340,360,380,400,420,440];
  const peakEm = wavelengths[intensities.indexOf(Math.max(...intensities))]||520;
  return exWl.map(ex=>wavelengths.map((em,wi)=>{
    const base=intensities[wi]||100;
    const exF=Math.exp(-0.5*((ex-350)/40)**2);
    const emF=Math.exp(-0.5*((em-peakEm)/30)**2);
    return +(base*exF*emF*(0.8+Math.random()*0.4)).toFixed(1);
  }));
}

function iColor(val,min,max){
  const t=Math.max(0,Math.min(1,(val-min)/(max-min)));
  if(t<0.25) return `hsl(${180+t*4*60},80%,${85-t*4*20}%)`;
  if(t<0.5)  return `hsl(${120+(t-0.25)*4*60},80%,${65-(t-0.25)*4*15}%)`;
  if(t<0.75) return `hsl(${60-(t-0.5)*4*60},90%,${50-(t-0.5)*4*10}%)`;
  return `hsl(0,90%,${40-(t-0.75)*4*10}%)`;
}

function parsePaste(text){
  return text.trim().split("\n").map(r=>r.split("\t").map(c=>c.trim())).filter(r=>r.some(c=>c));
}

const COL_DEFS=[
  {key:"conc",  label:"Conc / Volume",   unit:"(X axis)",icon:"⚗️",color:"#0d9f6e",bg:"#f0fff8",placeholder:"0.1\n0.2\n0.5\n1.0\n2.0"},
  {key:"intens",label:"Intensity",        unit:"(F/F₀)",  icon:"✨",color:"#06b6d4",bg:"#f0faff",placeholder:"850\n720\n580\n440\n310"},
  {key:"wavel", label:"Wavelength",       unit:"(nm)",    icon:"🌈",color:"#8b5cf6",bg:"#f8f0ff",placeholder:"512\n513\n514\n515\n516"},
  {key:"fwhm",  label:"FWHM",             unit:"(nm)",    icon:"📐",color:"#f59e0b",bg:"#fffbf0",placeholder:"18.5\n18.8\n19.0\n19.2\n19.5"},
  {key:"auc",   label:"Area Under Curve", unit:"(a.u.)",  icon:"📊",color:"#ef4444",bg:"#fff5f5",placeholder:"234\n198\n155\n118\n84"},
];
const parseColText = t=>t.trim().split("\n").map(l=>l.trim()).filter(Boolean);

// ═══════════════════════════════════════════════════════════════════════════════════
// REGISTRATION PAGE
// ═══════════════════════════════════════════════════════════════════════════════════
function RegistrationPage({onNext}){
  const [form,setForm]=useState({name:"",institute:"",email:"",phone:""});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");

  const submit=async()=>{
    if(!form.name||!form.institute||!form.email){setErr("Please fill all required fields.");return;}
    setLoading(true);setErr("");
    try{await fetch(SHEETS_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"registration",...form,ts:new Date().toISOString()})});}catch(_){}
    setLoading(false);onNext(form);
  };

  return(
    <div className="page">
      <div className="card" style={{width:"100%",maxWidth:480}}>
        <div className="logo">
          <div className="logo-icon">🌊</div>
          <div><div className="logo-text">FluoroSynth Pro</div><div className="logo-sub">Fluorescence Analysis &amp; Synthesis Platform</div></div>
        </div>

        {/* Centre links banner */}
        <div style={{textAlign:"center",padding:"0.6rem",background:"linear-gradient(135deg,#f0fff8,#e8f9ff)",borderRadius:10,border:`1px solid ${T.border}`,marginBottom:"1.25rem"}}>
          <div style={{fontSize:"0.75rem",color:T.textMuted,marginBottom:"0.2rem"}}>Developed by Bebeto G</div>
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="topbar-link">🔗 schrodingersstudent/initiatives</a>
          <span style={{margin:"0 0.4rem",color:T.border}}>|</span>
          <a href={`mailto:${EMAIL}`} className="topbar-link">✉ {EMAIL}</a>
        </div>

        <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
          <h1>Create Your Account</h1>
          <p>Register to access the full fluorescence analysis suite</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          <div><label>Full Name *</label><input placeholder="Bebeto G" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div><label>Institute / Organization *</label><input placeholder="Schrodinger's Student" value={form.institute} onChange={e=>setForm({...form,institute:e.target.value})}/></div>
          <div><label>Email Address *</label><input type="email" placeholder="you@university.in" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
          <div><label>Contact Number</label><input type="tel" placeholder="8606512587" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
          {err&&<div style={{color:T.danger,fontSize:"0.82rem"}}>⚠ {err}</div>}
          <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",marginTop:"0.2rem"}} onClick={submit} disabled={loading}>
            {loading?"Registering…":"Get Started →"}
          </button>
        </div>

        <div style={{marginTop:"1rem",display:"flex",justifyContent:"center",gap:"0.35rem",flexWrap:"wrap"}}>
          {["Curve Fitting","GPR","EEM Heatmap","Synthetic Data","Selectivity","Multi-Analyte"].map(f=>(
            <span key={f} className="tag tag-green">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// DATA ENTRY PAGE
// ═══════════════════════════════════════════════════════════════════════════════════
function DataEntryPage({user,onNext,onLogout}){
  const [mode,setMode]=useState("");
  const [cols,setCols]=useState({conc:"",intens:"",wavel:"",fwhm:"",auc:""});
  const [err,setErr]=useState("");

  const parsed=useMemo(()=>{
    const arrays=COL_DEFS.map(d=>parseColText(cols[d.key]));
    const maxLen=Math.max(...arrays.map(a=>a.length),0);
    if(!maxLen) return [];
    return Array.from({length:maxLen},(_,i)=>COL_DEFS.map((_,ci)=>arrays[ci][i]??""));
  },[cols]);

  const validRows=parsed.filter(r=>r[0]&&r[1]);

  const setCol=(key,val)=>{
    if(val.includes("\t")){
      const lines=val.trim().split("\n");
      const newCols={...cols};
      const keys=COL_DEFS.map(d=>d.key);
      const si=COL_DEFS.findIndex(d=>d.key===key);
      lines.forEach(line=>line.split("\t").forEach((part,pi)=>{
        const ki=si+pi;
        if(ki<keys.length) newCols[keys[ki]]=(newCols[keys[ki]]?newCols[keys[ki]]+"\n":"")+part.trim();
      }));
      setCols(newCols);
    } else {
      setCols(prev=>({...prev,[key]:val}));
    }
    setErr("");
  };

  const proceed=()=>{
    if(!mode){setErr("Please select quenching or enhancement.");return;}
    if(validRows.length<2){setErr("Enter at least 2 rows with Conc/Volume and Intensity.");return;}
    onNext({mode,rows:parsed});
  };

  return(
    <div className="page" style={{justifyContent:"flex-start",paddingTop:"1.25rem"}}>
      <div className="card" style={{width:"100%",maxWidth:1100,marginBottom:0}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem",flexWrap:"wrap",gap:"0.5rem"}}>
          <div className="logo" style={{margin:0}}>
            <div className="logo-icon" style={{width:38,height:38,fontSize:20}}>🌊</div>
            <div><div className="logo-text" style={{fontSize:"1.05rem"}}>FluoroSynth Pro</div><div className="logo-sub">Data Input</div></div>
          </div>

          {/* Centre links */}
          <div style={{textAlign:"center"}}>
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="topbar-link">🔗 schrodingersstudent/initiatives</a>
            <span style={{margin:"0 0.4rem",color:T.border}}>|</span>
            <a href={`mailto:${EMAIL}`} className="topbar-link">✉ {EMAIL}</a>
          </div>

          <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
            <span style={{fontSize:"0.78rem",color:T.textMuted}}>👤 {user?.name}</span>
            <button className="btn btn-danger btn-sm" onClick={onLogout}>⏻ Logout</button>
          </div>
        </div>

        <div className="step-bar">
          {["Registration","Data Input","Analysis"].map((s,i)=>(
            <div key={s} className={`step-item ${i===1?"active":i<1?"done":""}`}>{s}</div>
          ))}
        </div>

        <div style={{marginBottom:"1rem"}}>
          <h2 style={{marginBottom:"0.4rem"}}>Experiment Type</h2>
          <div className="chip-selector">
            {["quenching","enhancement"].map(m=>(
              <div key={m} className={`chip ${mode===m?"selected":""}`} onClick={()=>setMode(m)}>
                {m==="quenching"?"🔴 Fluorescence Quenching":"🟢 Fluorescence Enhancement"}
              </div>
            ))}
          </div>
        </div>

        <div className="divider"/>
        <div className="info-banner">
          💡 <strong>Paste each Excel column separately</strong> — one value per line. Or paste a multi-column selection into the first box and values will auto-split across columns.
        </div>

        {/* Five column inputs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.6rem",marginBottom:"1rem"}}>
          {COL_DEFS.map(col=>{
            const lines=parseColText(cols[col.key]);
            const filled=lines.length>0;
            return(
              <div key={col.key} style={{display:"flex",flexDirection:"column",gap:"0.3rem"}}>
                <div style={{background:filled?col.bg:"#f9fafb",border:`2px solid ${filled?col.color:T.border}`,borderRadius:10,padding:"0.5rem 0.65rem",transition:"all 0.2s"}}>
                  <div style={{fontSize:"1rem",marginBottom:"0.1rem"}}>{col.icon}</div>
                  <div style={{fontSize:"0.77rem",fontWeight:700,color:col.color,lineHeight:1.2}}>{col.label}</div>
                  <div style={{fontSize:"0.66rem",color:T.textMuted}}>{col.unit}</div>
                  {filled&&<div style={{marginTop:"0.2rem",fontSize:"0.66rem",background:col.color,color:"#fff",borderRadius:99,padding:"0.07rem 0.42rem",display:"inline-block"}}>{lines.length} rows</div>}
                </div>
                <textarea rows={9} placeholder={col.placeholder} value={cols[col.key]}
                  onChange={e=>setCol(col.key,e.target.value)}
                  onPaste={e=>{const t=e.clipboardData.getData("text");if(t.includes("\t")){e.preventDefault();setCol(col.key,t);}}}
                  style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.77rem",resize:"vertical",border:`1.5px solid ${filled?col.color:T.border}`,borderRadius:8,padding:"0.42rem 0.52rem",lineHeight:1.65,color:T.text,outline:"none",background:filled?col.bg:"#fff"}}
                />
                {filled&&<button onClick={()=>setCols(p=>({...p,[col.key]:""}))} style={{fontSize:"0.68rem",color:T.textMuted,background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:"0 2px"}}>✕ Clear</button>}
              </div>
            );
          })}
        </div>

        {/* Live preview */}
        {validRows.length>0&&(
          <>
            <div className="divider"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
              <h2 style={{fontSize:"0.88rem"}}>Live Preview — {validRows.length} valid rows</h2>
              <button className="btn btn-outline btn-sm" onClick={()=>setCols({conc:"",intens:"",wavel:"",fwhm:"",auc:""})}>Clear All</button>
            </div>
            <div className="table-wrap" style={{maxHeight:170,marginBottom:"0.75rem"}}>
              <table>
                <thead><tr><th>#</th>{COL_DEFS.map(col=><th key={col.key} style={{color:col.color}}>{col.icon} {col.label}</th>)}</tr></thead>
                <tbody>{parsed.slice(0,15).map((r,i)=>(
                  <tr key={i}><td style={{color:T.textMuted,fontSize:"0.72rem"}}>{i+1}</td>
                    {r.map((val,j)=><td key={j} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.77rem",color:val?T.text:"#d1d5db"}}>{val||"—"}</td>)}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>
        )}

        {err&&<div style={{color:T.danger,fontSize:"0.82rem",marginBottom:"0.6rem"}}>⚠ {err}</div>}
        <button className="btn btn-primary" onClick={proceed} style={{width:"100%",justifyContent:"center",fontSize:"0.95rem"}} disabled={validRows.length<2}>
          {validRows.length<2?"Enter at least 2 rows to continue":`Proceed to Analysis with ${validRows.length} rows →`}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ANALYSIS APP
// ═══════════════════════════════════════════════════════════════════════════════════
function AnalysisApp({user,mode,rows,onBack,onLogout}){
  const [activeTab,setActiveTab]=useState("fit");
  const [noisePct,setNoisePct]=useState(5);
  const [nPoints,setNPoints]=useState(100);
  const [syntheticGenerated,setSyntheticGenerated]=useState(false);
  const [syntheticData,setSyntheticData]=useState([]);
  const [showGPR,setShowGPR]=useState(false);
  const [gprData,setGprData]=useState([]);
  const [selectedCol,setSelectedCol]=useState("intensity");
  const [batchRows,setBatchRows]=useState([]);
  const [batchPasted,setBatchPasted]=useState("");
  const [predModel,setPredModel]=useState("sv");
  const [queryConc,setQueryConc]=useState("");
  const [queryResult,setQueryResult]=useState(null);
  const [queryHistory,setQueryHistory]=useState([]);
  const [analytes,setAnalytes]=useState([
    {name:"Target",intensity:100,color:"#0d9f6e"},
    {name:"Interferent A",intensity:0,color:"#ef4444"},
    {name:"Interferent B",intensity:0,color:"#f59e0b"},
  ]);
  const [newName,setNewName]=useState("");
  const [newInt,setNewInt]=useState("");
  const [newConc,setNewConc]=useState("");

  const pN=s=>{const n=parseFloat(s);return isNaN(n)?null:n;};

  const data=useMemo(()=>rows.map(r=>({
    x:pN(r[0]),intensity:pN(r[1]),wavelength:pN(r[2]),fwhm:pN(r[3]),auc:pN(r[4])
  })).filter(d=>d.x!==null&&d.intensity!==null),[rows]);

  const xs=data.map(d=>d.x);
  const colData={
    intensity:data.map(d=>d.intensity),
    wavelength:data.filter(d=>d.wavelength!==null).map(d=>d.wavelength),
    fwhm:data.filter(d=>d.fwhm!==null).map(d=>d.fwhm),
    auc:data.filter(d=>d.auc!==null).map(d=>d.auc),
  };
  const colXs={
    intensity:xs,
    wavelength:data.filter(d=>d.wavelength!==null).map(d=>d.x),
    fwhm:data.filter(d=>d.fwhm!==null).map(d=>d.x),
    auc:data.filter(d=>d.auc!==null).map(d=>d.x),
  };
  const ys=colData[selectedCol];
  const cxs=colXs[selectedCol];

  const lin=useMemo(()=>linReg(cxs,ys),[cxs,ys]);
  const poly=useMemo(()=>polyReg2(cxs,ys),[cxs,ys]);
  const bestFit=(poly&&poly.r2>(lin?.r2||0))?"poly":"linear";

  const fofData=useMemo(()=>{
    const r=calcFoF(colData.intensity,mode);
    return data.map((d,i)=>({...d,fof:r[i]?.ratio,delta:r[i]?.delta}));
  },[data,mode,colData.intensity]);

  const svFit=useMemo(()=>{
    if(xs.length<2||colData.intensity.length<2) return null;
    try{return sternVolmerFit(xs,colData.intensity,mode);}catch{return null;}
  },[xs,colData.intensity,mode]);

  const runPrediction=()=>{
    const q=parseFloat(queryConc);
    if(isNaN(q)) return;
    let yhat,lower,upper,label;
    if(predModel==="sv"&&svFit){const pi=predictionInterval(xs,colData.intensity,svFit.predict_F,q);yhat=pi.yhat;lower=pi.lower;upper=pi.upper;label="Stern-Völmer";}
    else if(predModel==="linear"&&lin){const pi=predictionInterval(cxs,ys,lin.predict,q);yhat=pi.yhat;lower=pi.lower;upper=pi.upper;label="Linear";}
    else if(predModel==="poly"&&poly){const pi=predictionInterval(cxs,ys,poly.predict,q);yhat=pi.yhat;lower=pi.lower;upper=pi.upper;label="Polynomial";}
    else if(predModel==="gpr"&&cxs.length>1){const g=simpleGPR(cxs,ys,[q]);yhat=g[0].mean;lower=g[0].lower;upper=g[0].upper;label="GPR";}
    else return;
    const res={q,yhat,lower,upper,label,ts:new Date().toLocaleTimeString()};
    setQueryResult(res);setQueryHistory(h=>[res,...h].slice(0,10));
  };

  const residualData=useMemo(()=>{
    if(predModel==="sv"&&svFit) return xs.map((x,i)=>({x,residual:+(colData.intensity[i]-svFit.predict_F(x)).toFixed(4)}));
    const fn=predModel==="poly"&&poly?poly.predict:lin?lin.predict:null;
    if(!fn) return [];
    return cxs.map((x,i)=>({x,residual:+(ys[i]-fn(x)).toFixed(4)}));
  },[predModel,svFit,xs,cxs,ys,colData.intensity,lin,poly]);

  const svPlotData=useMemo(()=>!svFit?[]:xs.map((x,i)=>({x,fof:+svFit.ys_sv[i].toFixed(4),fit:+svFit.predict_sv(x).toFixed(4)})),[svFit,xs]);
  const svLine=useMemo(()=>{
    if(!svFit||!xs.length) return [];
    const xMin=Math.min(...xs),xMax=Math.max(...xs);
    return Array.from({length:50},(_,i)=>{const x=xMin+(xMax-xMin)*i/49;return{x:+x.toFixed(4),fit:+svFit.predict_sv(x).toFixed(4)};});
  },[svFit,xs]);

  const generateSynthetic=()=>{
    if(!cxs.length) return;
    const xMin=Math.min(...cxs),xMax=Math.max(...cxs);
    const pts=Array.from({length:nPoints},(_,i)=>{
      const x=xMin+(xMax-xMin)*i/(nPoints-1);
      const yC=bestFit==="poly"&&poly?poly.predict(x):lin?lin.predict(x):0;
      return{x:+x.toFixed(4),y:+addNoise(yC,noisePct).toFixed(4)};
    });
    setSyntheticData(pts);setSyntheticGenerated(true);
    if(showGPR) setGprData(simpleGPR(cxs,ys,pts.map(p=>p.x)));
  };

  const exportCSV=(arr,name)=>{
    const keys=Object.keys(arr[0]);
    const lines=[keys.join(","),...arr.map(r=>keys.map(k=>r[k]).join(","))];
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv"}));
    a.download=name;a.click();
  };

  const wls=data.filter(d=>d.wavelength!==null).map(d=>d.wavelength);
  const ints=data.map(d=>d.intensity);
  const eem=useMemo(()=>{
    const w=wls.length>3?wls:[500,510,520,530,540,550,560,570];
    const iv=ints.length>3?ints.slice(0,w.length):[800,750,680,600,520,450,380,300];
    return{matrix:generateEEM(w,iv.slice(0,w.length)),wls:w};
  },[]);

  const origScatter=data.map((d,i)=>({x:d.x,y:colData[selectedCol][i]??null})).filter(d=>d.y!==null);
  const fitLine=useMemo(()=>{
    if(!cxs.length) return [];
    const xMin=Math.min(...cxs),xMax=Math.max(...cxs);
    return Array.from({length:60},(_,i)=>{const x=xMin+(xMax-xMin)*i/59;const y=bestFit==="poly"&&poly?poly.predict(x):lin?lin.predict(x):0;return{x:+x.toFixed(4),y:+y.toFixed(4)};});
  },[cxs,bestFit,poly,lin]);

  const colOpts=[
    {key:"intensity",label:"Intensity"},{key:"wavelength",label:"Wavelength"},
    {key:"fwhm",label:"FWHM"},{key:"auc",label:"AUC"},
  ].filter(o=>colData[o.key]?.length>0);

  const yMean=ys.length?+(ys.reduce((a,b)=>a+b,0)/ys.length).toFixed(2):"—";
  const yMax=ys.length?+Math.max(...ys).toFixed(2):"—";
  const yMin=ys.length?+Math.min(...ys).toFixed(2):"—";
  const yStd=ys.length?+(Math.sqrt(ys.reduce((a,y)=>a+(y-yMean)**2,0)/ys.length)).toFixed(2):"—";

  // Selectivity
  const targetInt=analytes[0]?.intensity||1;
  const addAnalyte=()=>{
    const iv=parseFloat(newInt);
    if(isNaN(iv)||!newName) return;
    const colors=["#0d9f6e","#ef4444","#f59e0b","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];
    setAnalytes(prev=>{
      const ei=prev.findIndex(a=>a.name===newName);
      if(ei>=0){const n=[...prev];n[ei]={...n[ei],intensity:iv};return n;}
      return [...prev,{name:newName,intensity:iv,color:colors[prev.length%colors.length]}];
    });
    setNewName("");setNewInt("");setNewConc("");
  };

  const exLabels=["300","320","340","360","380","400","420","440"];
  const tabs=[
    {id:"fit",      label:"📈 Curve Fit"},
    {id:"predict",  label:"🔮 Predictive"},
    {id:"synthetic",label:"🔬 Synthetic"},
    {id:"gpr",      label:"🧠 GPR"},
    {id:"select",   label:"🎯 Selectivity"},
    {id:"multi",    label:"🧪 Multi-Analyte"},
    {id:"eem",      label:"🌈 EEM Heatmap"},
    {id:"table",    label:"📋 Data Table"},
    {id:"batch",    label:"📦 Batch Import"},
    {id:"report",   label:"📄 Report"},
  ];

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#e0fff4 0%,#f0f9ff 50%,#f5f0ff 100%)"}}>

      {/* ── TOP BAR ── */}
      <div style={{background:"#fff",borderBottom:`1.5px solid ${T.border}`,padding:"0.55rem 1.25rem",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.4rem"}}>

        {/* Left */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="logo-icon" style={{width:32,height:32,fontSize:17}}>🌊</div>
          <div className="logo-text" style={{fontSize:"0.95rem"}}>FluoroSynth Pro</div>
        </div>

        {/* Centre — links + status */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.4rem",flexWrap:"wrap",justifyContent:"center"}}>
            <a href={SITE_URL} target="_blank" rel="noreferrer" className="topbar-link">🔗 schrodingersstudent/initiatives</a>
            <span style={{color:T.border}}>|</span>
            <a href={`mailto:${EMAIL}`} className="topbar-link">✉ {EMAIL}</a>
          </div>
          <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap",justifyContent:"center"}}>
            <span className="tag tag-green">{mode==="quenching"?"🔴 Quenching":"🟢 Enhancement"}</span>
            <span className="tag tag-cyan">{data.length} pts</span>
            <span style={{fontSize:"0.75rem",color:T.textMuted}}>👤 {user.name} · {user.institute}</span>
          </div>
        </div>

        {/* Right — nav buttons */}
        <div style={{display:"flex",gap:"0.45rem",alignItems:"center"}}>
          <button className="btn btn-outline btn-sm" onClick={onBack}>← Edit Data</button>
          <button className="btn btn-danger btn-sm" onClick={onLogout}>⏻ Logout</button>
        </div>
      </div>

      <div className="main-layout">

        {/* ── LEFT PANEL ── */}
        <div className="panel-left">

          <div className="card">
            <h2 style={{marginBottom:"0.4rem"}}>Y-Axis Variable</h2>
            <div className="chip-selector">
              {colOpts.map(o=>(
                <div key={o.key} className={`chip ${selectedCol===o.key?"selected":""}`} onClick={()=>setSelectedCol(o.key)} style={{fontSize:"0.74rem"}}>{o.label}</div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 style={{marginBottom:"0.4rem"}}>Statistics</h2>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-val">{yMean}</div><div className="stat-lbl">Mean</div></div>
              <div className="stat-box"><div className="stat-val">{yMax}</div><div className="stat-lbl">Max</div></div>
              <div className="stat-box"><div className="stat-val">{yMin}</div><div className="stat-lbl">Min</div></div>
              <div className="stat-box"><div className="stat-val">{yStd}</div><div className="stat-lbl">Std Dev</div></div>
            </div>
          </div>

          <div className="card">
            <h2 style={{marginBottom:"0.55rem"}}>Fit Equations</h2>
            {lin&&(
              <div style={{marginBottom:"0.6rem"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.28rem"}}>
                  <span style={{fontSize:"0.77rem",fontWeight:600,color:T.primary}}>Linear</span>
                  <span className={`r2-badge ${lin.r2<0.9?"warn":""}`}>R² = {lin.r2.toFixed(4)}</span>
                  {bestFit==="linear"&&<span className="tag tag-green" style={{fontSize:"0.66rem"}}>✓ Best</span>}
                </div>
                <div className="eq-box">y = {lin.m.toFixed(4)}x + {lin.b.toFixed(4)}</div>
              </div>
            )}
            {poly&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.28rem"}}>
                  <span style={{fontSize:"0.77rem",fontWeight:600,color:T.secondary}}>Polynomial (2nd)</span>
                  <span className={`r2-badge ${poly.r2<0.9?"warn":""}`}>R² = {poly.r2.toFixed(4)}</span>
                  {bestFit==="poly"&&<span className="tag tag-green" style={{fontSize:"0.66rem"}}>✓ Best</span>}
                </div>
                <div className="eq-box">y = {poly.c.toFixed(4)}x² + {poly.b.toFixed(4)}x + {poly.a.toFixed(4)}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{marginBottom:"0.55rem"}}>Synthetic Generator</h2>
            <div style={{marginBottom:"0.55rem"}}><label>Points: {nPoints}</label><input type="range" min={50} max={200} step={10} value={nPoints} onChange={e=>setNPoints(+e.target.value)}/></div>
            <div style={{marginBottom:"0.55rem"}}><label>Noise: {noisePct}%</label><input type="range" min={0} max={30} step={1} value={noisePct} onChange={e=>setNoisePct(+e.target.value)}/></div>
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.55rem"}}>
              <label style={{marginBottom:0,fontSize:"0.78rem"}}>GPR Band</label>
              <div className={`noise-btn ${showGPR?"on":""}`} onClick={()=>setShowGPR(!showGPR)}>{showGPR?"ON":"OFF"}</div>
            </div>
            <button className="btn btn-primary btn-sm" style={{width:"100%",justifyContent:"center"}} onClick={generateSynthetic}>⚙ Generate Synthetic Data</button>
            {syntheticGenerated&&<button className="btn btn-outline btn-sm" style={{width:"100%",justifyContent:"center",marginTop:"0.4rem"}} onClick={()=>exportCSV(syntheticData,"synthetic.csv")}>⬇ Synthetic CSV</button>}
            <button className="btn btn-outline btn-sm" style={{width:"100%",justifyContent:"center",marginTop:"0.4rem"}} onClick={()=>exportCSV(fofData.map(d=>({x:d.x,intensity:d.intensity??"",wavelength:d.wavelength??"",fwhm:d.fwhm??"",auc:d.auc??"",FoF:d.fof??"",deltaF:d.delta??""})),"original.csv")}>⬇ Original CSV</button>
          </div>

        </div>{/* end left panel */}

        {/* ── RIGHT PANEL ── */}
        <div className="panel-right">
          <div className="tab-row">
            {tabs.map(t=><div key={t.id} className={`tab ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>{t.label}</div>)}
          </div>

          {/* ══ CURVE FIT ══ */}
          {activeTab==="fit"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>Original Data + Best Fit Curve</h2>
              <p style={{marginBottom:"0.75rem"}}>Scatter = original · Line = {bestFit==="poly"?"polynomial (2nd order)":"linear"} fit</p>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart margin={{top:8,right:16,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                  <XAxis dataKey="x" type="number" domain={["auto","auto"]} label={{value:"Concentration / Volume",position:"insideBottom",offset:-12,fontSize:11}} tick={{fontSize:10}}/>
                  <YAxis label={{value:selectedCol,angle:-90,position:"insideLeft",fontSize:11}} tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{borderRadius:8,border:`1px solid ${T.border}`,fontSize:12}}/>
                  <Legend/>
                  <Scatter name="Original" data={origScatter} fill={T.primary} opacity={0.85} r={5}/>
                  <Line name="Fit" data={fitLine} dataKey="y" stroke={T.secondary} strokeWidth={2.5} dot={false} type="monotone"/>
                </ComposedChart>
              </ResponsiveContainer>
              <div className="divider"/>
              <h2 style={{marginBottom:"0.25rem"}}>F₀/F and ΔF/F₀</h2>
              <ResponsiveContainer width="100%" height={210}>
                <ComposedChart data={fofData} margin={{top:5,right:16,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                  <XAxis dataKey="x" tick={{fontSize:10}} label={{value:"Conc / Volume",position:"insideBottom",offset:-12,fontSize:11}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                  <Legend/>
                  <Line name="F₀/F" dataKey="fof" stroke={T.accent} strokeWidth={2} dot={{r:3}} type="monotone"/>
                  <Line name="ΔF/F₀" dataKey="delta" stroke={T.accent2} strokeWidth={2} dot={{r:3}} type="monotone"/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ══ PREDICTIVE MODEL ══ */}
          {activeTab==="predict"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.2rem"}}>Predictive Modeling</h2>
              <p style={{marginBottom:"0.85rem"}}>Train a model on your data and query any concentration for a predicted intensity with 95% prediction interval.</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:"0.6rem",alignItems:"flex-end",marginBottom:"1rem"}}>
                <div>
                  <label>Model</label>
                  <select value={predModel} onChange={e=>{setPredModel(e.target.value);setQueryResult(null);}}>
                    <option value="sv">Stern-Völmer (F₀/F = 1 + Ksv·[Q])</option>
                    <option value="linear">Linear Regression</option>
                    <option value="poly">Polynomial (2nd order)</option>
                    <option value="gpr">Gaussian Process (GPR)</option>
                  </select>
                </div>
                <div>
                  <label>Query concentration / volume</label>
                  <input type="number" placeholder="e.g. 0.5" value={queryConc} onChange={e=>setQueryConc(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runPrediction()}/>
                </div>
                <div><label>&nbsp;</label><button className="btn btn-primary" style={{width:"100%"}} onClick={runPrediction}>Predict →</button></div>
              </div>

              {queryResult&&(
                <div style={{background:"linear-gradient(135deg,#f0fff8,#e8f9ff)",border:`2px solid ${T.primary}`,borderRadius:14,padding:"1rem",marginBottom:"1rem",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"0.7rem"}}>
                  <div><div style={{fontSize:"0.68rem",color:T.textMuted}}>Input [Q]</div><div style={{fontSize:"1.3rem",fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{queryResult.q}</div></div>
                  <div><div style={{fontSize:"0.68rem",color:T.textMuted}}>Predicted Intensity</div><div style={{fontSize:"1.4rem",fontWeight:700,color:T.primary,fontFamily:"'JetBrains Mono',monospace"}}>{queryResult.yhat}</div><div style={{fontSize:"0.67rem",color:T.textMuted}}>{queryResult.label}</div></div>
                  <div><div style={{fontSize:"0.68rem",color:T.textMuted,marginBottom:3}}>95% Prediction Interval</div><div style={{fontSize:"0.88rem",fontWeight:600,color:T.secondary,fontFamily:"'JetBrains Mono',monospace"}}>[{queryResult.lower}, {queryResult.upper}]</div></div>
                  <div><div style={{fontSize:"0.68rem",color:T.textMuted}}>Half-width (±)</div><div style={{fontSize:"1rem",fontWeight:700,color:T.accent,fontFamily:"'JetBrains Mono',monospace"}}>±{((queryResult.upper-queryResult.lower)/2).toFixed(4)}</div></div>
                </div>
              )}

              {svFit&&predModel==="sv"&&(
                <div style={{marginBottom:"1rem"}}>
                  <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Stern-Völmer Parameters</div>
                  <div className="eq-box">F₀/F = 1 + {svFit.Ksv.toFixed(4)} · [Q] &nbsp;|&nbsp; R² = {svFit.r2.toFixed(4)} &nbsp;|&nbsp; F₀ = {svFit.F0.toFixed(2)}</div>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.9rem"}}>
                <div>
                  <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Residuals Plot</div>
                  <p style={{fontSize:"0.72rem",color:T.textMuted,marginBottom:"0.4rem"}}>Random scatter around zero = good fit</p>
                  <ResponsiveContainer width="100%" height={190}>
                    <ComposedChart data={residualData} margin={{top:5,right:8,left:0,bottom:5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                      <XAxis dataKey="x" tick={{fontSize:9}} label={{value:"[Q]",position:"insideBottom",offset:-3,fontSize:10}}/>
                      <YAxis tick={{fontSize:9}} label={{value:"Residual",angle:-90,position:"insideLeft",fontSize:10}}/>
                      <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                      <Scatter name="Residual" data={residualData} dataKey="residual" fill={T.accent} r={4} opacity={0.85}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Stern-Völmer Plot</div>
                  <p style={{fontSize:"0.72rem",color:T.textMuted,marginBottom:"0.4rem"}}>Linear = dynamic · Curved = mixed quenching</p>
                  {svFit?(
                    <ResponsiveContainer width="100%" height={190}>
                      <ComposedChart margin={{top:5,right:8,left:0,bottom:5}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                        <XAxis dataKey="x" type="number" domain={["auto","auto"]} tick={{fontSize:9}} label={{value:"[Q]",position:"insideBottom",offset:-3,fontSize:10}}/>
                        <YAxis tick={{fontSize:9}} label={{value:"F₀/F",angle:-90,position:"insideLeft",fontSize:10}}/>
                        <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                        <Legend wrapperStyle={{fontSize:10}}/>
                        <Scatter name="F₀/F data" data={svPlotData} dataKey="fof" fill={T.primary} r={4} opacity={0.9}/>
                        <Line name={`SV fit Ksv=${svFit.Ksv.toFixed(3)}`} data={svLine} dataKey="fit" stroke={T.danger} strokeWidth={2} dot={false}/>
                        {queryResult&&<Scatter name="Query" data={[{x:queryResult.q,fof:svFit.predict_sv(queryResult.q)}]} dataKey="fof" fill={T.accent2} r={7}/>}
                      </ComposedChart>
                    </ResponsiveContainer>
                  ):<div className="info-banner">Select Stern-Völmer model to see this plot.</div>}
                </div>
              </div>

              {queryHistory.length>1&&(
                <div style={{marginTop:"0.9rem"}}>
                  <div style={{fontSize:"0.78rem",fontWeight:600,color:T.textMuted,marginBottom:"0.28rem"}}>Query History</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Time</th><th>[Q]</th><th>Predicted</th><th>PI lower</th><th>PI upper</th><th>Model</th></tr></thead>
                      <tbody>{queryHistory.map((h,i)=>(
                        <tr key={i}>
                          <td style={{color:T.textMuted,fontSize:"0.7rem"}}>{h.ts}</td>
                          <td style={{fontFamily:"'JetBrains Mono',monospace"}}>{h.q}</td>
                          <td style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:T.primary}}>{h.yhat}</td>
                          <td style={{fontFamily:"'JetBrains Mono',monospace",color:T.secondary}}>{h.lower}</td>
                          <td style={{fontFamily:"'JetBrains Mono',monospace",color:T.secondary}}>{h.upper}</td>
                          <td style={{fontSize:"0.7rem"}}>{h.label}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ SYNTHETIC ══ */}
          {activeTab==="synthetic"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>Synthetic Data Overlay</h2>
              {!syntheticGenerated?(
                <div className="info-banner">Click "⚙ Generate Synthetic Data" in the left panel first.</div>
              ):(
                <>
                  <p style={{marginBottom:"0.7rem"}}>Blue = original · Orange = synthetic ({nPoints} pts, {noisePct}% noise)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart margin={{top:8,right:16,left:0,bottom:20}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                      <XAxis dataKey="x" type="number" domain={["auto","auto"]} tick={{fontSize:10}} label={{value:"X",position:"insideBottom",offset:-12,fontSize:11}}/>
                      <YAxis tick={{fontSize:10}}/>
                      <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                      <Legend/>
                      <Scatter name="Original" data={origScatter} fill={T.primary} r={5} opacity={0.9}/>
                      <Line name="Synthetic" data={syntheticData} dataKey="y" stroke={T.accent2} strokeWidth={2} dot={{r:1,fill:T.accent2}} type="monotone"/>
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="stat-row" style={{marginTop:"0.6rem"}}>
                    <div className="stat-box"><div className="stat-val">{nPoints}</div><div className="stat-lbl">Synthetic pts</div></div>
                    <div className="stat-box"><div className="stat-val">{noisePct}%</div><div className="stat-lbl">Noise</div></div>
                    <div className="stat-box"><div className="stat-val">{bestFit}</div><div className="stat-lbl">Model</div></div>
                    <div className="stat-box"><div className="stat-val">{bestFit==="poly"&&poly?poly.r2.toFixed(3):lin?lin.r2.toFixed(3):"—"}</div><div className="stat-lbl">R²</div></div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ GPR ══ */}
          {activeTab==="gpr"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>Gaussian Process Regression</h2>
              <p style={{marginBottom:"0.7rem"}}>Probabilistic fit with uncertainty bands. Enable GPR toggle + Generate first.</p>
              {!syntheticGenerated||!showGPR?(
                <div className="info-banner">Enable the GPR toggle in the left panel and click ⚙ Generate.</div>
              ):(
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={gprData} margin={{top:8,right:16,left:0,bottom:20}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                    <XAxis dataKey="x" tick={{fontSize:10}}/>
                    <YAxis tick={{fontSize:10}}/>
                    <Tooltip contentStyle={{borderRadius:8,fontSize:12}}/>
                    <Legend/>
                    <Area name="Confidence Band" dataKey="upper" stroke="none" fill="rgba(139,92,246,0.15)" legendType="none"/>
                    <Area name="Lower" dataKey="lower" stroke="none" fill="#fff" legendType="none"/>
                    <Line name="GPR Mean" dataKey="mean" stroke={T.accent} strokeWidth={2.5} dot={false}/>
                  </ComposedChart>
                </ResponsiveContainer>
              )}
              <div className="info-banner" style={{marginTop:"0.6rem"}}>
                <strong>Uncertainty:</strong> Shaded = ±1σ confidence band. Wider regions = higher uncertainty (sparse data). RBF kernel.
              </div>
            </div>
          )}

          {/* ══ SELECTIVITY ══ */}
          {activeTab==="select"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.2rem"}}>Selectivity &amp; Interference Analysis</h2>
              <p style={{marginBottom:"0.85rem"}}>Compare fluorescence response of your target against interferents. Selectivity Factor (SF) = Interferent intensity ÷ Target intensity × 100%.</p>

              {/* Add interferent form */}
              <div style={{background:"linear-gradient(135deg,#f0fff8,#e8f9ff)",border:`1.5px solid ${T.border}`,borderRadius:12,padding:"0.85rem",marginBottom:"1rem"}}>
                <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.55rem"}}>Add Interferent / Species</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:"0.55rem",alignItems:"flex-end"}}>
                  <div><label>Species Name</label><input placeholder="Na⁺, Pb²⁺, glucose…" value={newName} onChange={e=>setNewName(e.target.value)}/></div>
                  <div><label>Concentration</label><input type="number" placeholder="0.5" value={newConc} onChange={e=>setNewConc(e.target.value)}/></div>
                  <div><label>Fluorescence Intensity</label><input type="number" placeholder="820" value={newInt} onChange={e=>setNewInt(e.target.value)}/></div>
                  <div><label>&nbsp;</label><button className="btn btn-primary btn-sm" onClick={addAnalyte}>+ Add</button></div>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.9rem",marginBottom:"0.9rem"}}>
                {/* Bar chart */}
                <div>
                  <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Fluorescence Response</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={analytes} margin={{top:5,right:8,left:0,bottom:35}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                      <XAxis dataKey="name" tick={{fontSize:9}} angle={-25} textAnchor="end"/>
                      <YAxis tick={{fontSize:9}} label={{value:"Intensity",angle:-90,position:"insideLeft",fontSize:10}}/>
                      <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                      <Bar dataKey="intensity" radius={[5,5,0,0]}>
                        {analytes.map((a,i)=><Cell key={i} fill={a.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Radar */}
                <div>
                  <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Selectivity Radar</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <RadarChart data={analytes.map(a=>({subject:a.name,value:a.intensity}))}>
                      <PolarGrid stroke={T.border}/>
                      <PolarAngleAxis dataKey="subject" tick={{fontSize:9}}/>
                      <PolarRadiusAxis tick={{fontSize:8}}/>
                      <Radar name="Intensity" dataKey="value" stroke={T.primary} fill={T.primary} fillOpacity={0.25}/>
                      <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Selectivity table */}
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Species</th><th>Intensity</th><th>SF (%)</th><th>Interference Level</th><th>Remove</th></tr></thead>
                  <tbody>{analytes.map((a,i)=>{
                    const sf=+(a.intensity/targetInt*100).toFixed(1);
                    return(
                      <tr key={i}>
                        <td><span style={{display:"inline-block",width:9,height:9,borderRadius:"50%",background:a.color,marginRight:6}}></span>{a.name}</td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace"}}>{a.intensity}</td>
                        <td style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:600,color:sf>20?T.danger:sf>10?T.accent2:T.primary}}>{sf}%</td>
                        <td><span className={`tag ${sf>20?"tag-red":sf>10?"tag-amber":"tag-green"}`}>{sf>20?"High ⚠":sf>10?"Moderate":"Low ✓"}</span></td>
                        <td>{i>0&&<button className="btn btn-sm btn-danger" onClick={()=>setAnalytes(p=>p.filter((_,j)=>j!==i))}>✕</button>}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              </div>
              <div className="info-banner" style={{marginTop:"0.7rem"}}>
                💡 SF &lt;10% = negligible ✓ · 10–20% = moderate ⚠ · &gt;20% = significant interference ✗. Update the Target intensity by adding "Target" to the form above.
              </div>
            </div>
          )}

          {/* ══ MULTI-ANALYTE ══ */}
          {activeTab==="multi"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.2rem"}}>Multi-Analyte Discrimination</h2>
              <p style={{marginBottom:"0.85rem"}}>How well does F₀/F and ΔF/F₀ discriminate your target across concentration? A steep linear Stern-Völmer with high Ksv = strong analyte-specific response.</p>

              <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>F₀/F vs Concentration</div>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={fofData} margin={{top:5,right:16,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                  <XAxis dataKey="x" tick={{fontSize:10}} label={{value:"Conc / Volume",position:"insideBottom",offset:-12,fontSize:11}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                  <Legend/>
                  <Line name="F₀/F (Target)" dataKey="fof" stroke={T.primary} strokeWidth={2.5} dot={{r:4}}/>
                  <Line name="ΔF/F₀" dataKey="delta" stroke={T.danger} strokeWidth={2} dot={{r:3}}/>
                </ComposedChart>
              </ResponsiveContainer>

              <div className="divider"/>

              <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.28rem"}}>Normalised Spectral Parameters</div>
              <p style={{fontSize:"0.77rem",marginBottom:"0.5rem"}}>All parameters scaled 0–1 for shape comparison across concentration.</p>
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart margin={{top:5,right:16,left:0,bottom:20}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f5ee"/>
                  <XAxis dataKey="x" type="number" domain={["auto","auto"]} tick={{fontSize:10}} label={{value:"Conc / Volume",position:"insideBottom",offset:-12,fontSize:11}}/>
                  <YAxis tick={{fontSize:10}} label={{value:"Normalised",angle:-90,position:"insideLeft",fontSize:10}} domain={[0,1.1]}/>
                  <Tooltip contentStyle={{borderRadius:8,fontSize:11}}/>
                  <Legend/>
                  {colData.intensity.length>0&&<Line name="Intensity" data={data.map(d=>({x:d.x,v:+(d.intensity/Math.max(...colData.intensity)).toFixed(4)}))} dataKey="v" stroke={T.primary} strokeWidth={2} dot={false} type="monotone"/>}
                  {colData.wavelength.length>0&&<Line name="Wavelength" data={data.filter(d=>d.wavelength).map(d=>({x:d.x,w:+(d.wavelength/Math.max(...colData.wavelength)).toFixed(4)}))} dataKey="w" stroke={T.accent} strokeWidth={2} dot={false} type="monotone"/>}
                  {colData.fwhm.length>0&&<Line name="FWHM" data={data.filter(d=>d.fwhm).map(d=>({x:d.x,f:+(d.fwhm/Math.max(...colData.fwhm)).toFixed(4)}))} dataKey="f" stroke={T.accent2} strokeWidth={2} dot={false} type="monotone"/>}
                  {colData.auc.length>0&&<Line name="AUC" data={data.filter(d=>d.auc).map(d=>({x:d.x,a:+(d.auc/Math.max(...colData.auc)).toFixed(4)}))} dataKey="a" stroke={T.danger} strokeWidth={2} dot={false} type="monotone"/>}
                </ComposedChart>
              </ResponsiveContainer>

              <div className="divider"/>
              <div style={{fontSize:"0.8rem",fontWeight:600,marginBottom:"0.5rem"}}>Discrimination Metrics</div>
              <div className="stat-row">
                <div className="stat-box"><div className="stat-val">{svFit?svFit.Ksv.toFixed(3):"—"}</div><div className="stat-lbl">Ksv</div></div>
                <div className="stat-box"><div className="stat-val">{svFit?svFit.r2.toFixed(3):"—"}</div><div className="stat-lbl">SV R²</div></div>
                <div className="stat-box"><div className="stat-val">{fofData.length?Math.max(...fofData.map(d=>d.fof||0)).toFixed(2):"—"}</div><div className="stat-lbl">Max F₀/F</div></div>
                <div className="stat-box"><div className="stat-val">{fofData.length?Math.max(...fofData.map(d=>d.delta||0)).toFixed(2):"—"}</div><div className="stat-lbl">Max ΔF/F₀</div></div>
              </div>
              <div className="info-banner" style={{marginTop:"0.5rem"}}>
                💡 High Ksv + linear SV → dynamic quenching · Upward-curving SV → combined static + dynamic · Compare against interferents in the Selectivity tab.
              </div>
            </div>
          )}

          {/* ══ EEM HEATMAP ══ */}
          {activeTab==="eem"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>2D Excitation–Emission Matrix (EEM)</h2>
              <p style={{marginBottom:"0.7rem"}}>Rows = excitation wavelengths · Columns = emission wavelengths · Colour = intensity</p>
              <div style={{overflowX:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:`52px repeat(${eem.wls.length},1fr)`,gap:3,minWidth:460}}>
                  <div style={{fontSize:"0.62rem",color:T.textMuted,display:"flex",alignItems:"flex-end",paddingBottom:3}}>Ex\Em</div>
                  {eem.wls.map(w=><div key={w} style={{fontSize:"0.6rem",color:T.textMuted,textAlign:"center",paddingBottom:3}}>{w}</div>)}
                  {exLabels.map((ex,ei)=>{
                    const row=eem.matrix[ei]||[];
                    const all=eem.matrix.flat();
                    const minV=Math.min(...all),maxV=Math.max(...all);
                    return[
                      <div key={`ex-${ei}`} style={{fontSize:"0.62rem",color:T.textMuted,display:"flex",alignItems:"center"}}>{ex}nm</div>,
                      ...row.map((val,wi)=>(
                        <div key={`${ei}-${wi}`} className="heatmap-cell"
                          style={{background:iColor(val,minV,maxV),height:29,borderRadius:3}}
                          title={`Ex:${ex}nm Em:${eem.wls[wi]}nm I:${val}`}/>
                      ))
                    ];
                  })}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginTop:"0.7rem",fontSize:"0.7rem",color:T.textMuted}}>
                <span>Low</span>
                <div style={{flex:1,height:10,borderRadius:5,background:"linear-gradient(to right,hsl(180,80%,85%),hsl(120,80%,65%),hsl(60,90%,50%),hsl(0,90%,40%))"}}/>
                <span>High</span>
              </div>
              <div className="info-banner" style={{marginTop:"0.6rem"}}>💡 EEM generated from your wavelength + intensity data. Hover cells for exact values.</div>
            </div>
          )}

          {/* ══ DATA TABLE ══ */}
          {activeTab==="table"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>Full Data Table</h2>
              <p style={{marginBottom:"0.7rem"}}>All columns including computed F₀/F and ΔF/F₀.</p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Conc/Vol</th><th>Intensity</th><th>Wavelength</th><th>FWHM</th><th>AUC</th><th>F₀/F</th><th>ΔF/F₀</th></tr></thead>
                  <tbody>{fofData.map((d,i)=>(
                    <tr key={i}>
                      <td style={{color:T.textMuted}}>{i+1}</td>
                      <td><strong>{d.x}</strong></td>
                      <td>{d.intensity??"—"}</td>
                      <td>{d.wavelength??"—"}</td>
                      <td>{d.fwhm??"—"}</td>
                      <td>{d.auc??"—"}</td>
                      <td style={{color:T.primary,fontWeight:600}}>{d.fof??"—"}</td>
                      <td style={{color:T.secondary,fontWeight:600}}>{d.delta??"—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ BATCH IMPORT ══ */}
          {activeTab==="batch"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.25rem"}}>Batch Import</h2>
              <p style={{marginBottom:"0.7rem"}}>Paste tab-separated data from Excel — one row per line.</p>
              <textarea rows={10} placeholder={"0.1\t485\t512\n0.2\t420\t513\n..."}
                value={batchPasted} onChange={e=>{setBatchPasted(e.target.value);setBatchRows(parsePaste(e.target.value));}}
                style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"0.78rem",resize:"vertical",marginBottom:"0.6rem"}}/>
              {batchRows.length>0&&(
                <div className="table-wrap" style={{maxHeight:210}}>
                  <table>
                    <thead><tr>{batchRows[0].map((_,i)=><th key={i}>Col {i+1}</th>)}</tr></thead>
                    <tbody>{batchRows.slice(0,30).map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              <div className="info-banner" style={{marginTop:"0.6rem"}}>{batchRows.length>0?`✓ ${batchRows.length} rows imported.`:"Paste tab-separated data from Excel."}</div>
            </div>
          )}

          {/* ══ REPORT ══ */}
          {activeTab==="report"&&(
            <div className="card">
              <h2 style={{marginBottom:"0.55rem"}}>Analysis Report</h2>
              <div style={{background:"linear-gradient(135deg,#f0fff8,#e8f9ff)",border:`1.5px solid ${T.border}`,borderRadius:12,padding:"1rem",marginBottom:"0.75rem"}}>
                <div style={{fontSize:"0.7rem",color:T.textMuted,marginBottom:"0.18rem"}}>Generated: {new Date().toLocaleString()}</div>
                <h1 style={{fontSize:"1.05rem",marginBottom:"0.18rem"}}>FluoroSynth Analysis Report</h1>
                <p>Analyst: <strong>{user.name}</strong> · Institute: <strong>{user.institute}</strong></p>
                <div style={{marginTop:"0.3rem",fontSize:"0.75rem"}}>
                  <a href={SITE_URL} target="_blank" rel="noreferrer" className="topbar-link">{SITE_URL}</a>
                  {" · "}<a href={`mailto:${EMAIL}`} className="topbar-link">{EMAIL}</a>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.55rem",marginBottom:"0.75rem"}}>
                {[
                  {label:"Experiment type",val:mode},
                  {label:"Data points",val:data.length},
                  {label:"Best fit model",val:bestFit==="poly"?"Polynomial (2nd)":"Linear"},
                  {label:"R² (best fit)",val:bestFit==="poly"&&poly?poly.r2.toFixed(4):lin?lin.r2.toFixed(4):"—"},
                  {label:"Ksv (Stern-Völmer)",val:svFit?svFit.Ksv.toFixed(4):"—"},
                  {label:"Mean intensity",val:yMean},
                ].map(item=>(
                  <div key={item.label} style={{background:"#f8fffe",border:`1px solid ${T.border}`,borderRadius:8,padding:"0.5rem 0.7rem"}}>
                    <div style={{fontSize:"0.68rem",color:T.textMuted}}>{item.label}</div>
                    <div style={{fontSize:"0.92rem",fontWeight:600,color:T.text}}>{item.val}</div>
                  </div>
                ))}
              </div>
              {lin&&<div style={{marginBottom:"0.55rem"}}><h2 style={{fontSize:"0.82rem",marginBottom:"0.22rem"}}>Linear Fit</h2><div className="eq-box">y = {lin.m.toFixed(6)}x + {lin.b.toFixed(6)} | R² = {lin.r2.toFixed(6)}</div></div>}
              {poly&&<div style={{marginBottom:"0.75rem"}}><h2 style={{fontSize:"0.82rem",marginBottom:"0.22rem"}}>Polynomial Fit</h2><div className="eq-box">y = {poly.c.toFixed(6)}x² + {poly.b.toFixed(6)}x + {poly.a.toFixed(6)} | R² = {poly.r2.toFixed(6)}</div></div>}
              <div style={{display:"flex",gap:"0.55rem",flexWrap:"wrap"}}>
                <button className="btn btn-primary btn-sm" onClick={()=>exportCSV(fofData.map(d=>({x:d.x,intensity:d.intensity??"",wavelength:d.wavelength??"",fwhm:d.fwhm??"",auc:d.auc??"",FoF:d.fof??"",deltaF:d.delta??""})),"original.csv")}>⬇ Data CSV</button>
                {syntheticGenerated&&<button className="btn btn-outline btn-sm" onClick={()=>exportCSV(syntheticData,"synthetic.csv")}>⬇ Synthetic CSV</button>}
                <button className="btn btn-outline btn-sm" onClick={()=>window.print()}>🖨 Print</button>
              </div>
            </div>
          )}

        </div>{/* end right panel */}
      </div>{/* end main-layout */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [step,setStep]=useState(0);
  const [user,setUser]=useState(null);
  const [expData,setExpData]=useState(null);
  const [confirm,setConfirm]=useState(null);

  const ask=(title,message,onYes)=>setConfirm({title,message,onYes});
  const handleLogout=()=>ask("Log out?","You will return to the registration page. Your current analysis will be cleared.",()=>{setUser(null);setExpData(null);setStep(0);});
  const handleBack=()=>ask("Go back to Data Input?","You will return to data entry. Analysis cleared but registration kept.",()=>{setExpData(null);setStep(1);});

  return(
    <>
      <style>{css}</style>

      {/* Confirm dialog */}
      {confirm&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{background:"#fff",borderRadius:20,padding:"2rem",maxWidth:400,width:"100%",border:`1.5px solid ${T.border}`,boxShadow:"0 20px 60px rgba(0,0,0,0.18)",textAlign:"center"}}>
            <div style={{fontSize:"2.2rem",marginBottom:"0.6rem"}}>{confirm.title.includes("Log")?"⏻":"←"}</div>
            <h2 style={{marginBottom:"0.4rem"}}>{confirm.title}</h2>
            <p style={{marginBottom:"1.2rem",fontSize:"0.86rem"}}>{confirm.message}</p>
            <div style={{display:"flex",gap:"0.6rem",justifyContent:"center"}}>
              <button className="btn btn-outline" onClick={()=>setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary"
                style={confirm.title.includes("Log")?{background:`linear-gradient(135deg,${T.danger},#f87171)`}:{}}
                onClick={()=>{confirm.onYes();setConfirm(null);}}>
                {confirm.title.includes("Log")?"Yes, Log out":"Yes, Go back"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step===0&&<RegistrationPage onNext={u=>{setUser(u);setStep(1);}}/>}
      {step===1&&<DataEntryPage user={user} onNext={d=>{setExpData(d);setStep(2);}} onLogout={handleLogout}/>}
      {step===2&&expData&&<AnalysisApp user={user} mode={expData.mode} rows={expData.rows} onBack={handleBack} onLogout={handleLogout}/>}
    </>
  );
}
