import React, { useEffect, useRef, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

/* ─── Google Fonts (same as InstagramManager) ──────────────────────── */
if (!document.getElementById("ig-fonts")) {
  const l = document.createElement("link");
  l.id = "ig-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
}

/* ─── Theme tokens (mirrors InstagramManager) ───────────────────────── */
const THEMES = {
  dark: {
    "--bg": "#0a0a0f", "--bg2": "#0f0f1a",
    "--surface": "rgba(255,255,255,0.04)", "--surface-hover": "rgba(255,255,255,0.08)",
    "--border": "rgba(255,255,255,0.09)", "--border-accent": "rgba(255,100,130,0.35)",
    "--text-primary": "#f0eef8", "--text-secondary": "#a09fb5", "--text-muted": "#6e6c80",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.55)", "--scrollbar-thumb": "rgba(255,255,255,0.12)",
    "--topbar-bg": "rgba(10,10,15,0.92)",
    "--orb1": "rgba(245,133,41,0.12)", "--orb2": "rgba(129,52,175,0.10)",
  },
  light: {
    "--bg": "#f4f3fb", "--bg2": "#ffffff",
    "--surface": "rgba(255,255,255,0.75)", "--surface-hover": "rgba(255,255,255,0.95)",
    "--border": "rgba(0,0,0,0.08)", "--border-accent": "rgba(221,42,123,0.25)",
    "--text-primary": "#1a1828", "--text-secondary": "#6b6880", "--text-muted": "#9997aa",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.10)", "--scrollbar-thumb": "rgba(0,0,0,0.15)",
    "--topbar-bg": "rgba(255,255,255,0.92)",
    "--orb1": "rgba(245,133,41,0.10)", "--orb2": "rgba(129,52,175,0.08)",
  },
};

function applyTheme(el, mode) {
  Object.entries(THEMES[mode]).forEach(([k, v]) => el.style.setProperty(k, v));
}

/* ─── Static CSS ────────────────────────────────────────────────────── */
const PRICING_CSS = `
  .pp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .pp-wrap { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: var(--bg); color: var(--text-primary); transition: background 0.35s ease; }
  .pp-wrap h1,.pp-wrap h2,.pp-wrap h3,.pp-wrap .syne { font-family: 'Syne', sans-serif; }
  .pp-scroll::-webkit-scrollbar { width: 4px; }
  .pp-scroll::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }

  .pp-grad-text { background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  /* Topbar */
  .pp-topbar { position: sticky; top: 0; z-index: 20; height: 60px; background: var(--topbar-bg); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 12px; }
  .pp-back-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 50px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
  .pp-back-btn:hover { background: var(--surface-hover); }
  .pp-theme-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; margin-left: auto; flex-shrink: 0; }
  .pp-theme-btn:hover { background: var(--surface-hover); transform: rotate(15deg); }

  /* Plan cards */
  .plan-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto; padding: 0 24px 60px; }
  .plan-card { border-radius: 24px; border: 1.5px solid var(--border); background: var(--surface); backdrop-filter: blur(16px); padding: 28px 24px 24px; display: flex; flex-direction: column; gap: 0; transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; position: relative; overflow: hidden; }
  .plan-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
  .plan-card.featured { border-color: rgba(221,42,123,0.55); background: rgba(221,42,123,0.04); box-shadow: 0 0 0 4px rgba(221,42,123,0.10), var(--shadow-card); }
  .plan-card.active-plan { border-color: rgba(74,222,128,0.55); background: rgba(74,222,128,0.03); box-shadow: 0 0 0 4px rgba(74,222,128,0.10), var(--shadow-card); }

  /* Glow strip at top of featured card */
  .plan-card.featured::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,#f58529,#dd2a7b,#8134af); }
  .plan-card.active-plan::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg,#4ade80,#22c55e); }

  .plan-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 14px; width: fit-content; }
  .plan-badge.popular { background: rgba(221,42,123,0.12); color: #e879a8; border: 1px solid rgba(221,42,123,0.3); }
  .plan-badge.current { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
  .plan-badge.free-badge { background: rgba(129,52,175,0.12); color: #c084fc; border: 1px solid rgba(129,52,175,0.28); }
  .plan-badge.pro-badge { background: rgba(245,133,41,0.12); color: #fb923c; border: 1px solid rgba(245,133,41,0.3); }

  .plan-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
  .plan-tagline { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; min-height: 38px; }

  .plan-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
  .plan-currency { font-size: 18px; font-weight: 700; color: var(--text-primary); font-family: 'Syne', sans-serif; }
  .plan-amount { font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800; color: var(--text-primary); line-height: 1; }
  .plan-period { font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }

  .plan-divider { height: 1px; background: var(--border); margin: 20px 0; }

  .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; flex: 1; }
  .plan-feature { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--text-secondary); line-height: 1.45; }
  .plan-feature .feat-check { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 9px; margin-top: 1px; }
  .plan-feature.included .feat-check { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
  .plan-feature.excluded { opacity: 0.38; }
  .plan-feature.excluded .feat-check { background: rgba(255,255,255,0.06); color: var(--text-muted); border: 1px solid var(--border); }
  .plan-feature.highlight { color: var(--text-primary); font-weight: 600; }

  /* DM cap callout inside card */
  .dm-cap-pill { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 50px; font-size: 13px; font-weight: 700; margin-bottom: 20px; width: 100%; justify-content: center; }
  .dm-cap-pill.free  { background: rgba(129,52,175,0.10); color: #c084fc; border: 1px solid rgba(129,52,175,0.25); }
  .dm-cap-pill.starter { background: rgba(59,130,246,0.10); color: #60a5fa; border: 1px solid rgba(59,130,246,0.25); }
  .dm-cap-pill.growth  { background: rgba(245,133,41,0.10); color: #fb923c; border: 1px solid rgba(245,133,41,0.25); }
  .dm-cap-pill.pro  { background: rgba(221,42,123,0.10); color: #e879a8; border: 1px solid rgba(221,42,123,0.25); }

  /* CTA buttons */
  .plan-cta { width: 100%; padding: 13px 0; border-radius: 50px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; border: none; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .plan-cta:hover { transform: translateY(-2px); }
  .plan-cta.cta-gradient { background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af); color: #fff; box-shadow: 0 4px 20px rgba(221,42,123,0.38); }
  .plan-cta.cta-gradient:hover { box-shadow: 0 8px 28px rgba(221,42,123,0.52); }
  .plan-cta.cta-outline { background: var(--surface); border: 1.5px solid var(--border); color: var(--text-primary); }
  .plan-cta.cta-outline:hover { background: var(--surface-hover); }
  .plan-cta.cta-current { background: rgba(74,222,128,0.12); border: 1.5px solid rgba(74,222,128,0.35); color: #4ade80; cursor: default; }
  .plan-cta.cta-current:hover { transform: none; }
  .plan-cta:disabled { opacity: 0.55; cursor: not-allowed; transform: none !important; }

  /* Billing toggle */
  .billing-toggle { display: flex; align-items: center; gap: 12px; padding: 6px 8px; border-radius: 50px; background: var(--surface); border: 1px solid var(--border); width: fit-content; margin: 0 auto 40px; }
  .billing-toggle-opt { padding: 7px 18px; border-radius: 50px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; color: var(--text-secondary); background: none; border: none; font-family: 'DM Sans', sans-serif; }
  .billing-toggle-opt.active { background: linear-gradient(135deg,#f58529,#dd2a7b); color: #fff; box-shadow: 0 2px 12px rgba(221,42,123,0.35); }

  /* Save badge on annual */
  .save-badge { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }

  /* FAQ */
  .faq-item { border-bottom: 1px solid var(--border); }
  .faq-q { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 0; background: none; border: none; color: var(--text-primary); font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; text-align: left; }
  .faq-chevron { font-size: 16px; color: var(--text-muted); transition: transform 0.25s ease; flex-shrink: 0; }
  .faq-chevron.open { transform: rotate(180deg); }
  .faq-a { font-size: 14px; color: var(--text-secondary); line-height: 1.7; padding-bottom: 16px; max-width: 640px; }

  /* Comparison table */
  .compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .compare-table th { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-secondary); padding: 10px 16px; text-align: center; border-bottom: 1px solid var(--border); }
  .compare-table th:first-child { text-align: left; }
  .compare-table td { padding: 12px 16px; text-align: center; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
  .compare-table td:first-child { text-align: left; color: var(--text-primary); font-weight: 500; }
  .compare-table tr:last-child td { border-bottom: none; }
  .compare-table tr:hover td { background: var(--surface); }
  .compare-check { color: #4ade80; font-size: 16px; }
  .compare-cross { color: var(--text-muted); font-size: 16px; opacity: 0.4; }

  .pp-skel { position: relative; overflow: hidden; background: var(--surface); border-radius: 12px; }
  .pp-skel::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, var(--surface-hover), transparent); animation: pp-shimmer 1.4s infinite; }
  @keyframes pp-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

  .pp-error-box { max-width: 520px; margin: 40px auto; padding: 24px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); text-align: center; color: var(--text-secondary); }
  .pp-retry-btn { margin-top: 14px; padding: 9px 20px; border-radius: 50px; border: 1.5px solid var(--border); background: var(--surface-hover); color: var(--text-primary); font-weight: 600; font-size: 13px; cursor: pointer; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }

  @media (max-width: 600px) {
    .plan-grid { grid-template-columns: 1fr; padding: 0 16px 48px; }
    .plan-amount { font-size: 36px; }
  }
`;

if (!document.getElementById("pp-static-css")) {
  const s = document.createElement("style");
  s.id = "pp-static-css"; s.textContent = PRICING_CSS;
  document.head.appendChild(s);
}

/*
 * ─── Expected backend response shape (GET /billing/pricing) ──────────
 * {
 *   plans: [
 *     {
 *       id: "free",
 *       name: "Free",
 *       tagline: "Get started with automation, no card needed.",
 *       monthlyPrice: 0,
 *       annualPrice: 0,
 *       dmCap: "50 DMs / day",
 *       dmCapClass: "free",              // one of: free | starter | growth | pro
 *       badge: { label: "Forever free", cls: "free-badge", icon: "🆓" } | null,
 *       features: [
 *         { text: "50 automated DMs per day", included: true, highlight: true },
 *         ...
 *       ],
 *       cta: "Get started free",
 *       ctaCls: "cta-outline",           // cta-outline | cta-gradient
 *       featured: false
 *     },
 *     ...
 *   ],
 *   faqs: [ { q: "...", a: "..." }, ... ],
 *   compareRows: [
 *     { feature: "Daily DM limit", free: "50", starter: "200", growth: "500", pro: "Unlimited" },
 *     ...
 *   ]
 * }
 */

/* ─── FAQ Item ──────────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className={`faq-chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

/* ─── PlanCard ──────────────────────────────────────────────────────── */
function PlanCard({ plan, annual, currentPlanId, onSelect, loading }) {
  const price      = annual ? plan.annualPrice : plan.monthlyPrice;
  const isCurrent  = currentPlanId === plan.id;
  const isFree     = plan.monthlyPrice === 0 && plan.annualPrice === 0;
  const isLoading  = loading === plan.id;

  let ctaCls = plan.ctaCls;
  if (isCurrent) ctaCls = "cta-current";

  return (
    <div className={`plan-card ${plan.featured ? "featured" : ""} ${isCurrent ? "active-plan" : ""}`}>
      {plan.badge && (
        <div className={`plan-badge ${plan.badge.cls}`}>
          <span>{plan.badge.icon}</span>
          <span>{plan.badge.label}</span>
        </div>
      )}
      {isCurrent && !plan.badge && (
        <div className="plan-badge current">✓ Current plan</div>
      )}
      {isCurrent && plan.badge && (
        <div className="plan-badge current" style={{ marginTop: 6 }}>✓ Your plan</div>
      )}

      <div className="plan-name">{plan.name}</div>
      <div className="plan-tagline">{plan.tagline}</div>

      <div className={`dm-cap-pill ${plan.dmCapClass}`}>
        <span style={{ fontSize: 15 }}>📨</span>
        <span>{plan.dmCap}</span>
      </div>

      <div className="plan-price-row">
        {!isFree && <span className="plan-currency">$</span>}
        <span className="plan-amount">{isFree ? "Free" : price}</span>
      </div>
      <div className="plan-period">
        {isFree ? "No credit card required" : annual ? "per month, billed annually" : "per month"}
        {annual && !isFree && (
          <span className="save-badge" style={{ marginLeft: 8 }}>
            Save ${(plan.monthlyPrice - plan.annualPrice) * 12}/yr
          </span>
        )}
      </div>

      <div className="plan-divider" />

      <ul className="plan-features">
        {plan.features.map((f, i) => (
          <li key={i} className={`plan-feature ${f.included ? "included" : "excluded"} ${f.highlight ? "highlight" : ""}`}>
            <span className="feat-check">{f.included ? "✓" : "×"}</span>
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <button
        className={`plan-cta ${ctaCls}`}
        disabled={isCurrent || isLoading}
        onClick={() => !isCurrent && onSelect(plan)}
      >
        {isLoading
          ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Processing…</span>
          : isCurrent ? "✓ Active"
          : plan.cta}
      </button>
    </div>
  );
}

/* ─── Compare Table ─────────────────────────────────────────────────── */
function CompareTable({ rows }) {
  const renderCell = (val) => {
    if (val === true)  return <span className="compare-check">✓</span>;
    if (val === false) return <span className="compare-cross">—</span>;
    return <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{val}</span>;
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="compare-table">
        <thead>
          <tr>
            <th style={{ width: "35%" }}>Feature</th>
            <th>Free</th>
            <th>Starter</th>
            <th style={{ color: "#e879a8" }}>Growth</th>
            <th>Pro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{row.feature}</td>
              <td>{renderCell(row.free)}</td>
              <td>{renderCell(row.starter)}</td>
              <td>{renderCell(row.growth)}</td>
              <td>{renderCell(row.pro)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Skeleton loading state for plan cards ────────────────────────── */
function PlanCardSkeleton() {
  return (
    <div className="plan-card">
      <div className="pp-skel" style={{ width: 90, height: 20, marginBottom: 14, borderRadius: 20 }} />
      <div className="pp-skel" style={{ width: "70%", height: 24, marginBottom: 8 }} />
      <div className="pp-skel" style={{ width: "90%", height: 32, marginBottom: 20 }} />
      <div className="pp-skel" style={{ width: "100%", height: 34, marginBottom: 20, borderRadius: 50 }} />
      <div className="pp-skel" style={{ width: "50%", height: 40, marginBottom: 20 }} />
      <div className="pp-skel" style={{ width: "100%", height: 160, marginBottom: 24 }} />
      <div className="pp-skel" style={{ width: "100%", height: 44, borderRadius: 50 }} />
    </div>
  );
}

/* ─── Main PricingPage ──────────────────────────────────────────────── */
export default function PricingPage() {
  const navigate       = useNavigate();
  const wrapRef        = useRef(null);
  const [isDark, setIsDark]           = useState(false);
  const [annual, setAnnual]           = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [loading, setLoading]         = useState(null);   // plan id being processed
  const [showCompare, setShowCompare] = useState(false);

  // Dynamic pricing data fetched from the backend
  const [plans, setPlans]             = useState([]);
  const [faqs, setFaqs]               = useState([]);
  const [compareRows, setCompareRows] = useState([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError]     = useState(null);

  /* Apply theme */
  useEffect(() => {
    if (wrapRef.current) applyTheme(wrapRef.current, isDark ? "dark" : "light");
  }, [isDark]);

  /* Fetch current plan / profile from API */
  useEffect(() => {
    api.get("/insta/profile")
      .then((res) => {
        if (res.data?.theme === "dark") setIsDark(true);
        if (res.data?.plan) setCurrentPlanId(res.data.plan);
      })
      .catch(() => {});
  }, []);

  /* Fetch pricing data (plans, faqs, comparison table) from the backend */
  const fetchPricing = () => {
    setPricingLoading(true);
    setPricingError(null);
    api.get("/billing/pricing")
      .then((res) => {
        setPlans(res.data?.plans || []);
        setFaqs(res.data?.faqs || []);
        setCompareRows(res.data?.compareRows || []);
      })
      .catch((e) => {
        console.error(e);
        setPricingError("Could not load pricing plans. Please try again.");
      })
      .finally(() => setPricingLoading(false));
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  /* Add spin keyframe once */
  useEffect(() => {
    if (document.getElementById("pp-spin")) return;
    const s = document.createElement("style");
    s.id = "pp-spin";
    s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
    document.head.appendChild(s);
  }, []);

  const handleSelect = async (plan) => {
    const isFree = plan.monthlyPrice === 0 && plan.annualPrice === 0;

    if (isFree) {
      // Downgrade — just call API
      try {
        setLoading(plan.id);
        await api.post("/billing/downgrade", { plan: plan.id });
        setCurrentPlanId(plan.id);
      } catch (e) {
        console.error(e);
        alert("Could not change plan. Please try again.");
      } finally {
        setLoading(null);
      }
      return;
    }

    // Paid plan → create Stripe checkout session
    try {
      setLoading(plan.id);
      const res = await api.post("/billing/checkout", {
        plan: plan.id,
        billing: annual ? "annual" : "monthly",
      });
      // Redirect to Stripe Checkout URL returned by your backend
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
      setLoading(null);
    }
  };

  const initVars = Object.entries(THEMES[isDark ? "dark" : "light"])
    .reduce((a, [k, v]) => { a[k] = v; return a; }, {});

  return (
    <div ref={wrapRef} className="pp-wrap" style={{ ...initVars, position: "relative", overflow: "hidden" }}>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div style={{ position: "absolute", top: -120, left: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,var(--orb1) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -60, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,var(--orb2) 0%,transparent 70%)" }} />
      </div>

      {/* Topbar */}
      <div className="pp-topbar">
        <button className="pp-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="syne" style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
          <span className="pp-grad-text">Plans &amp; Billing</span>
        </span>
        <button
          className="pp-theme-btn"
          onClick={() => setIsDark((v) => !v)}
          aria-label="Toggle theme"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Page content */}
      <div className="fade-up" style={{ position: "relative", zIndex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "56px 24px 40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(221,42,123,0.08)", border: "1px solid rgba(221,42,123,0.22)", fontSize: 12, fontWeight: 700, color: "#e879a8", marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            💬 Simple pricing
          </div>
          <h1 className="syne" style={{ fontSize: "clamp(30px,6vw,52px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 14 }}>
            Automate more,<br /><span className="pp-grad-text">pay less than you think.</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Every plan includes the core automation engine. Upgrade when you need more reach.
          </p>

          {/* Billing toggle */}
          <div className="billing-toggle">
            <button
              className={`billing-toggle-opt ${!annual ? "active" : ""}`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`billing-toggle-opt ${annual ? "active" : ""}`}
              onClick={() => setAnnual(true)}
            >
              Annual <span className="save-badge" style={{ marginLeft: 6 }}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        {pricingError ? (
          <div className="pp-error-box">
            <div>{pricingError}</div>
            <button className="pp-retry-btn" onClick={fetchPricing}>Retry</button>
          </div>
        ) : (
          <div className="plan-grid">
            {pricingLoading
              ? Array.from({ length: 4 }).map((_, i) => <PlanCardSkeleton key={i} />)
              : plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    annual={annual}
                    currentPlanId={currentPlanId}
                    onSelect={handleSelect}
                    loading={loading}
                  />
                ))}
          </div>
        )}

        {/* Compare toggle */}
        {!pricingLoading && !pricingError && compareRows.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <button
              onClick={() => setShowCompare((v) => !v)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {showCompare ? "Hide" : "Show"} full feature comparison
              <span style={{ transition: "transform 0.25s", display: "inline-block", transform: showCompare ? "rotate(180deg)" : "none" }}>▾</span>
            </button>
          </div>
        )}

        {/* Compare table */}
        {showCompare && compareRows.length > 0 && (
          <div style={{ maxWidth: 860, margin: "0 auto 56px", padding: "0 24px" }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 20px", backdropFilter: "blur(16px)" }}>
              <h2 className="syne" style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
                Full comparison
              </h2>
              <CompareTable rows={compareRows} />
            </div>
          </div>
        )}

        {/* Trust bar */}
        <div style={{ maxWidth: 860, margin: "0 auto 56px", padding: "0 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
            {[
              { icon: "🔒", text: "Payments secured by Stripe" },
              { icon: "↩️", text: "Cancel anytime, no questions" },
              { icon: "🛡️", text: "No Instagram credentials stored" },
              { icon: "📞", text: "Support via chat + email" },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>{t.text}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        {faqs.length > 0 && (
          <div style={{ maxWidth: 680, margin: "0 auto 80px", padding: "0 24px" }}>
            <h2 className="syne" style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center", color: "var(--text-primary)" }}>
              Common questions
            </h2>
            {faqs.map((f, i) => <FaqItem key={i} {...f} />)}
          </div>
        )}

      </div>
    </div>
  );
}