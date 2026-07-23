import React, { useEffect, useRef, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

/* ─── Google Fonts (same as dashboard) ─────────────────────────────── */
if (!document.getElementById("ig-fonts")) {
  const l = document.createElement("link");
  l.id = "ig-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
}

/* ─── Theme tokens (kept identical to InstagramManager so both pages match) ─ */
const THEMES = {
  dark: {
    "--bg": "#0a0a0f", "--bg2": "#0f0f1a",
    "--surface": "rgba(255,255,255,0.04)", "--surface-hover": "rgba(255,255,255,0.08)",
    "--border": "rgba(255,255,255,0.09)", "--border-accent": "rgba(255,100,130,0.35)",
    "--text-primary": "#f0eef8", "--text-secondary": "#a09fb5", "--text-muted": "#6e6c80",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.55)",
    "--orb1": "rgba(245,133,41,0.12)", "--orb2": "rgba(129,52,175,0.10)",
    "--card-bg": "rgba(255,255,255,0.03)", "--card-bg-featured": "rgba(221,42,123,0.06)",
  },
  light: {
    "--bg": "#f4f3fb", "--bg2": "#ffffff",
    "--surface": "rgba(255,255,255,0.75)", "--surface-hover": "rgba(255,255,255,0.95)",
    "--border": "rgba(0,0,0,0.08)", "--border-accent": "rgba(221,42,123,0.25)",
    "--text-primary": "#1a1828", "--text-secondary": "#6b6880", "--text-muted": "#9997aa",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.10)",
    "--orb1": "rgba(245,133,41,0.10)", "--orb2": "rgba(129,52,175,0.08)",
    "--card-bg": "rgba(255,255,255,0.6)", "--card-bg-featured": "rgba(221,42,123,0.05)",
  },
};
function applyTheme(el, mode) {
  Object.entries(THEMES[mode]).forEach(([k, v]) => el.style.setProperty(k, v));
}

/* ─── Plan + FAQ + comparison data ─────────────────────────────────── */
/* Mirrors the plans.json config. Move to a `/insta/plans` endpoint later
   if pricing needs to change without a redeploy. */
const PLANS_DATA = {
  plans: [
    { id: "free", name: "Free", tagline: "Get started with automation, no card needed.", monthlyPrice: 0, annualPrice: 0, dmCap: "50 DMs / day", badge: { label: "Forever free", icon: "🆓" },
      features: [
        { text: "50 automated DMs per day", included: true, highlight: true },
        { text: "1 Instagram account", included: true },
        { text: "Keyword trigger automation", included: true },
        { text: "Follow-to-DM flow", included: false },
        { text: "Message rotation", included: false },
        { text: "Priority support", included: false },
      ], cta: "Get started free" },
    { id: "starter", name: "Starter", tagline: "For creators growing their audience.", monthlyPrice: 19, annualPrice: 15, dmCap: "200 DMs / day", badge: null,
      features: [
        { text: "200 automated DMs per day", included: true, highlight: true },
        { text: "1 Instagram account", included: true },
        { text: "Keyword trigger automation", included: true },
        { text: "Follow-to-DM flow", included: true },
        { text: "Message rotation", included: false },
        { text: "Priority support", included: false },
      ], cta: "Start Starter" },
    { id: "growth", name: "Growth", tagline: "For brands ready to scale engagement.", monthlyPrice: 49, annualPrice: 39, dmCap: "500 DMs / day", badge: { label: "Most popular", icon: "🔥" }, featured: true,
      features: [
        { text: "500 automated DMs per day", included: true, highlight: true },
        { text: "3 Instagram accounts", included: true },
        { text: "Keyword trigger automation", included: true },
        { text: "Follow-to-DM flow", included: true },
        { text: "Message rotation", included: true },
        { text: "Priority support", included: false },
      ], cta: "Start Growth" },
    { id: "pro", name: "Pro", tagline: "Unlimited power for serious businesses.", monthlyPrice: 99, annualPrice: 79, dmCap: "Unlimited DMs", badge: { label: "Best value", icon: "⚡" },
      features: [
        { text: "Unlimited automated DMs", included: true, highlight: true },
        { text: "Unlimited accounts", included: true },
        { text: "Keyword trigger automation", included: true },
        { text: "Full activity log", included: true },
        { text: "Follow-to-DM flow", included: true },
        { text: "Message rotation", included: true },
        { text: "Priority support", included: true },
      ], cta: "Go Pro" },
  ],
  faqs: [
    { q: "Can I upgrade or downgrade anytime?", a: "Yes — changes take effect at the start of your next billing cycle. If you upgrade mid-cycle, you'll only pay the prorated difference." },
    { q: "What happens when I hit my daily DM cap?", a: "Automation pauses for the rest of that day and resumes automatically at midnight UTC. You'll see a warning in the dashboard when you're at 80% of your limit." },
    { q: "Do unused DMs roll over?", a: "No — the cap resets daily. It's designed to keep sending patterns within Instagram's own guidelines." },
    { q: "Is there a free trial on paid plans?", a: "Starter and Growth both include a 7-day free trial, no card required. Pro requires a card upfront but can be cancelled anytime in the first 14 days for a full refund." },
    { q: "What payment methods do you accept?", a: "All major credit and debit cards via Stripe. Indian users can also pay via UPI and net banking." },
  ],
  compareRows: [
    { feature: "Daily DM limit", free: "50", starter: "200", growth: "500", pro: "Unlimited" },
    { feature: "Instagram accounts", free: "1", starter: "1", growth: "3", pro: "Unlimited" },
    { feature: "Keyword triggers", free: true, starter: true, growth: true, pro: true },
    { feature: "Follow-to-DM flow", free: false, starter: true, growth: true, pro: true },
    { feature: "Message rotation", free: false, starter: false, growth: true, pro: true },
    { feature: "Analytics dashboard", free: false, starter: false, growth: true, pro: true },
    { feature: "Priority support", free: false, starter: false, growth: false, pro: true },
  ],
};

/* ─── Resolve the user's current plan from the profile API ────────── */
/* Accepts `subscription`, plus the same fallback keys the dashboard reads,
   and treats the legacy "grow" value (used elsewhere in the app) as "growth". */
function normalizeSubscriptionTier(profile) {
  const raw = profile?.subscription ?? profile?.subscriptionType ?? profile?.plan ?? profile?.subscriptionPlan ?? profile?.package ?? "";
  const v = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (v === "grow") return "growth";
  if (["free", "starter", "growth", "pro"].includes(v)) return v;
  if (profile?.isSubscribed || profile?.subscriptionActive) return "starter";
  return "free";
}

const PLAN_ACCENTS = {
  free:    { c: "#8b8fff", grad: "linear-gradient(135deg,#534AB7,#8134af)" },
  starter: { c: "#4ade80", grad: "linear-gradient(135deg,#0F6E56,#1D9E75)" },
  growth:  { c: "#f58529", grad: "linear-gradient(135deg,#f58529,#dd2a7b)" },
  pro:     { c: "#fbbf24", grad: "linear-gradient(135deg,#854F0B,#EF9F27)" },
};

/* ─── FAQ item ──────────────────────────────────────────────────────── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button onClick={() => setOpen((v) => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "18px 4px", background: "none", border: "none", cursor: "pointer",
        textAlign: "left", color: "var(--text-primary)", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
      }}>
        {q}
        <span style={{ flexShrink: 0, fontSize: 18, color: "var(--text-muted)", transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s ease" }}>+</span>
      </button>
      {open && (
        <p style={{ margin: 0, padding: "0 4px 18px", color: "var(--text-secondary)", fontSize: 13.5, lineHeight: 1.7, maxWidth: 640 }}>{a}</p>
      )}
    </div>
  );
}

/* ─── Plan card ─────────────────────────────────────────────────────── */
function PlanCard({ plan, billing, isCurrent, onSelect, busy }) {
  const accent = PLAN_ACCENTS[plan.id];
  const price = billing === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const showsSavings = billing === "annual" && plan.monthlyPrice > 0;

  return (
    <div style={{
      position: "relative", borderRadius: 22, padding: "26px 22px 22px",
      background: plan.featured ? "var(--card-bg-featured)" : "var(--card-bg)",
      border: plan.featured ? "1.5px solid rgba(221,42,123,0.4)" : "1.5px solid var(--border)",
      boxShadow: plan.featured ? "0 20px 60px rgba(221,42,123,0.18)" : "var(--shadow-card)",
      display: "flex", flexDirection: "column", gap: 16,
      transform: plan.featured ? "translateY(-8px)" : "none",
      transition: "transform 0.25s ease",
    }}>
      {plan.badge && (
        <div style={{
          position: "absolute", top: -13, left: 22, padding: "4px 12px", borderRadius: 20,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", color: "#fff",
          background: accent.grad, display: "flex", alignItems: "center", gap: 5,
          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        }}>
          <span>{plan.badge.icon}</span>{plan.badge.label}
        </div>
      )}

      <div>
        <h3 className="syne" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{plan.name}</h3>
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, minHeight: 32 }}>{plan.tagline}</p>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 38, fontWeight: 800, color: "var(--text-primary)" }}>
            {price === 0 ? "$0" : `$${price}`}
          </span>
          {price > 0 && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/mo</span>}
        </div>
        {showsSavings ? (
          <div style={{ fontSize: 11.5, color: accent.c, fontWeight: 600, marginTop: 3 }}>
            billed annually · save ${((plan.monthlyPrice - plan.annualPrice) * 12).toFixed(0)}/yr
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3 }}>
            {price === 0 ? "no card required" : billing === "annual" ? "billed annually" : "billed monthly"}
          </div>
        )}
      </div>

      <div style={{ padding: "9px 12px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12.5, fontWeight: 700, color: accent.c, textAlign: "center" }}>
        {plan.dmCap}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: f.included ? "var(--text-primary)" : "var(--text-muted)", opacity: f.included ? 1 : 0.6 }}>
            <span style={{ flexShrink: 0, marginTop: 1, color: f.included ? accent.c : "var(--text-muted)" }}>{f.included ? "✓" : "–"}</span>
            <span style={{ fontWeight: f.highlight ? 700 : 400, textDecoration: f.included ? "none" : "line-through" }}>{f.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => !isCurrent && onSelect(plan)}
        disabled={isCurrent || busy}
        style={{
          marginTop: 4, padding: "12px 0", borderRadius: 12, fontSize: 13.5, fontWeight: 700,
          fontFamily: "'DM Sans',sans-serif", cursor: isCurrent ? "default" : "pointer",
          border: isCurrent ? "1.5px solid var(--border)" : plan.featured ? "none" : "1.5px solid var(--border-accent)",
          background: isCurrent ? "var(--surface)" : plan.featured ? accent.grad : "transparent",
          color: isCurrent ? "var(--text-secondary)" : plan.featured ? "#fff" : "var(--text-primary)",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {isCurrent ? "✓ Current Plan" : busy ? "Please wait…" : plan.cta}
      </button>
    </div>
  );
}

/* ─── Comparison table ──────────────────────────────────────────────── */
function CompareTable({ rows, currentTier }) {
  const cols = [
    { key: "free", label: "Free" }, { key: "starter", label: "Starter" },
    { key: "growth", label: "Growth" }, { key: "pro", label: "Pro" },
  ];
  const renderCell = (v) => {
    if (v === true) return <span style={{ color: "#4ade80", fontSize: 16 }}>✓</span>;
    if (v === false) return <span style={{ color: "var(--text-muted)", fontSize: 16 }}>–</span>;
    return <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13 }}>{v}</span>;
  };
  return (
    <div style={{ overflowX: "auto", borderRadius: 16, border: "1px solid var(--border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
        <thead>
          <tr style={{ background: "var(--surface)" }}>
            <th style={{ textAlign: "left", padding: "14px 18px", fontSize: 11.5, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-secondary)" }}>Feature</th>
            {cols.map((c) => (
              <th key={c.key} style={{
                padding: "14px 10px", fontSize: 12.5, fontWeight: 700, color: c.key === currentTier ? "#dd2a7b" : "var(--text-primary)",
              }}>{c.label}{c.key === currentTier && <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)" }}>(yours)</div>}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.feature} style={{ borderTop: "1px solid var(--border)", background: i % 2 ? "transparent" : "var(--card-bg)" }}>
              <td style={{ padding: "12px 18px", fontSize: 13, color: "var(--text-secondary)" }}>{r.feature}</td>
              {cols.map((c) => <td key={c.key} style={{ padding: "12px 10px", textAlign: "center" }}>{renderCell(r[c.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const wrapRef  = useRef(null);

  const [isDark, setIsDark]   = useState(false);
  const [profile, setProfile] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [busyPlan, setBusyPlan] = useState(null);

  const currentTier = normalizeSubscriptionTier(profile);

  useEffect(() => {
    if (wrapRef.current) applyTheme(wrapRef.current, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    api.get("/insta/profile")
      .then((res) => {
        setProfile(res.data);
        setIsDark(res.data?.theme === "dark");
      })
      .catch(() => navigate("/"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPlan = async (plan) => {
    if (plan.id === "free") {
      try {
        setBusyPlan(plan.id);
        await api.post("/insta/subscription/downgrade", { planId: plan.id });
        setProfile((p) => ({ ...p, subscription: "free" }));
      } catch (e) { console.error(e); alert("Couldn't switch to Free. Please try again."); }
      finally { setBusyPlan(null); }
      return;
    }
    try {
      setBusyPlan(plan.id);
      const res = await api.post("/insta/subscription/checkout", { planId: plan.id, billing });
      if (res.data?.checkoutUrl) window.location.href = res.data.checkoutUrl;
      else alert("Checkout could not be started. Please try again.");
    } catch (e) { console.error(e); alert("Couldn't start checkout. Please try again."); }
    finally { setBusyPlan(null); }
  };

  const initVars = Object.entries(THEMES[isDark ? "dark" : "light"]).reduce((a, [k, v]) => { a[k] = v; return a; }, {});

  return (
    <div ref={wrapRef} className="ig-wrap" style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden", fontFamily: "'DM Sans',sans-serif", ...initVars }}>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div style={{ position: "absolute", top: -120, left: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,var(--orb1) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -60, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,var(--orb2) 0%,transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto", padding: "56px 24px 80px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <button onClick={() => navigate(-1)} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 14px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>← Back</button>
          <button onClick={() => setIsDark((v) => !v)} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", fontSize: 16 }}>{isDark ? "☀️" : "🌙"}</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(221,42,123,0.1)", border: "1px solid rgba(221,42,123,0.3)", fontSize: 11.5, fontWeight: 700, color: "#dd2a7b", marginBottom: 16 }}>
            You're on the {profile ? currentTier[0].toUpperCase() + currentTier.slice(1) : "…"} plan
          </div>
          <h1 className="syne" style={{ fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.15, marginBottom: 12 }}>
            Send more DMs.<br />Automate more of your growth.
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto" }}>
            Every plan runs the same automation engine — higher tiers just raise your daily sending cap and unlock smarter targeting.
          </p>

          <div style={{ display: "inline-flex", marginTop: 28, padding: 4, borderRadius: 30, background: "var(--surface)", border: "1px solid var(--border)" }}>
            {["monthly", "annual"].map((b) => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "8px 18px", borderRadius: 26, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: "none",
                background: billing === b ? "linear-gradient(135deg,#f58529,#dd2a7b)" : "transparent",
                color: billing === b ? "#fff" : "var(--text-secondary)",
              }}>
                {b === "monthly" ? "Monthly" : "Annual · save 20%"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginBottom: 64, alignItems: "stretch" }}>
          {PLANS_DATA.plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} isCurrent={plan.id === currentTier} onSelect={handleSelectPlan} busy={busyPlan === plan.id} />
          ))}
        </div>

        <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 18, textAlign: "center" }}>Compare every feature</h2>
        <div style={{ marginBottom: 64 }}>
          <CompareTable rows={PLANS_DATA.compareRows} currentTier={currentTier} />
        </div>

        <h2 className="syne" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8, textAlign: "center" }}>Questions, answered</h2>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {PLANS_DATA.faqs.map((f) => <FaqItem key={f.q} {...f} />)}
        </div>
      </div>
    </div>
  );
}