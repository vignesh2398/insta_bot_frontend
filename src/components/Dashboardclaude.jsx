import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

/* ─── Google Fonts ─────────────────────────────────────────────────── */
if (!document.getElementById("ig-fonts")) {
  const l = document.createElement("link");
  l.id = "ig-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
}

/* ─── Theme tokens ─────────────────────────────────────────────────── */
const THEMES = {
  dark: {
    "--bg": "#0a0a0f", "--bg2": "#0f0f1a",
    "--surface": "rgba(255,255,255,0.04)", "--surface-hover": "rgba(255,255,255,0.08)",
    "--border": "rgba(255,255,255,0.09)", "--border-accent": "rgba(255,100,130,0.35)",
    "--text-primary": "#f0eef8", "--text-secondary": "#a09fb5", "--text-muted": "#6e6c80",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.55)", "--scrollbar-thumb": "rgba(255,255,255,0.12)",
    "--sidebar-bg": "rgba(15,15,26,0.9)", "--topbar-bg": "rgba(10,10,15,0.92)",
    "--input-bg": "rgba(255,255,255,0.04)", "--input-focus-bg": "rgba(221,42,123,0.05)",
    "--orb1": "rgba(245,133,41,0.12)", "--orb2": "rgba(129,52,175,0.10)",
    "--user-menu-bg": "#141420", "--user-menu-hover": "rgba(255,255,255,0.1)",
    "--log-bg": "rgba(255,255,255,0.03)", "--ctrl-bg": "rgba(255,255,255,0.06)",
    "--cap-bg": "rgba(255,255,255,0.04)", "--cap-border": "rgba(255,255,255,0.09)",
  },
  light: {
    "--bg": "#f4f3fb", "--bg2": "#ffffff",
    "--surface": "rgba(255,255,255,0.75)", "--surface-hover": "rgba(255,255,255,0.95)",
    "--border": "rgba(0,0,0,0.08)", "--border-accent": "rgba(221,42,123,0.25)",
    "--text-primary": "#1a1828", "--text-secondary": "#6b6880", "--text-muted": "#9997aa",
    "--shadow-card": "0 8px 40px rgba(0,0,0,0.10)", "--scrollbar-thumb": "rgba(0,0,0,0.15)",
    "--sidebar-bg": "rgba(255,255,255,0.85)", "--topbar-bg": "rgba(255,255,255,0.92)",
    "--input-bg": "rgba(0,0,0,0.03)", "--input-focus-bg": "rgba(221,42,123,0.04)",
    "--orb1": "rgba(245,133,41,0.10)", "--orb2": "rgba(129,52,175,0.08)",
    "--user-menu-bg": "#ffffff", "--user-menu-hover": "rgba(0,0,0,0.07)",
    "--log-bg": "rgba(0,0,0,0.02)", "--ctrl-bg": "rgba(0,0,0,0.04)",
    "--cap-bg": "rgba(0,0,0,0.02)", "--cap-border": "rgba(0,0,0,0.08)",
  },
};

/* ─── Static CSS ───────────────────────────────────────────────────── */
const STATIC_CSS = `
  .ig-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ig-wrap { font-family: 'DM Sans', sans-serif; transition: background 0.35s ease; }
  .ig-wrap h1,.ig-wrap h2,.ig-wrap h3,.ig-wrap .syne { font-family: 'Syne', sans-serif; }
  .ig-scroll::-webkit-scrollbar { width: 4px; }
  .ig-scroll::-webkit-scrollbar-track { background: transparent; }
  .ig-scroll::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }
  .ig-grad-text { background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .ig-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; backdrop-filter: blur(16px); transition: background 0.25s ease; box-shadow: var(--shadow-card); }
  .ig-card:hover { background: var(--surface-hover); }
  .post-thumb { cursor: pointer; border-radius: 12px; overflow: hidden; border: 2px solid transparent; transition: all 0.25s ease; position: relative; }
  .post-thumb:hover { border-color: rgba(221,42,123,0.5); transform: translateY(-2px); }
  .post-thumb.active { border-color: #dd2a7b; box-shadow: 0 0 0 3px rgba(221,42,123,0.25); }
  .post-thumb img { width: 100%; height: 88px; object-fit: cover; display: block; }
  .post-thumb .thumb-overlay { position: absolute; inset: 0; background: linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%); padding: 6px; display: flex; flex-direction: column; justify-content: flex-end; }
  .post-thumb .thumb-caption { font-size: 10px; color: rgba(255,255,255,0.9); font-weight: 500; line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .ig-toggle { position: relative; display: inline-flex; width: 52px; height: 28px; border-radius: 14px; transition: background 0.3s ease; cursor: pointer; border: none; outline: none; flex-shrink: 0; }
  .ig-toggle.on { background: linear-gradient(135deg,#f58529,#dd2a7b); box-shadow: 0 2px 12px rgba(221,42,123,0.45); }
  .ig-toggle.off { background: var(--border); }
  .ig-toggle-knob { position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #fff; transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .ig-toggle.on .ig-toggle-knob { transform: translateX(24px); }

  .theme-btn { width: 36px; height: 36px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; }
  .theme-btn:hover { background: var(--surface-hover); transform: rotate(15deg); }

  .user-btn { display: flex; align-items: center; gap: 8px; padding: 5px 10px 5px 5px; border-radius: 50px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer; transition: all 0.2s ease; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
  .user-btn:hover { background: var(--surface-hover); }
  .user-btn-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; display: block; border: 1.5px solid #dd2a7b; }
  .user-btn-avatar-placeholder { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg,#f58529,#dd2a7b); display: flex; align-items: center; justify-content: center; font-size: 11px; color: #fff; font-weight: 700; flex-shrink: 0; }
  .user-btn-chevron { font-size: 10px; color: var(--text-secondary); transition: transform 0.2s; }
  .user-btn-chevron.open { transform: rotate(180deg); }
  .user-menu { position: absolute; right: 0; top: calc(100% + 8px); min-width: 220px; background: var(--user-menu-bg); border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 16px 48px rgba(0,0,0,0.2); overflow: hidden; z-index: 200; animation: menuIn 0.18s cubic-bezier(.22,1,.36,1) forwards; }
  @keyframes menuIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
  .user-menu-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .user-menu-name { font-weight: 700; font-size: 14px; color: var(--text-primary); }
  .user-menu-handle { font-size: 12px; color: var(--text-secondary); margin-top: 1px; }
  .user-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 11px 16px; background: none; border: none; color: var(--text-primary); font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; text-align: left; }
  .user-menu-item:hover { background: var(--user-menu-hover); }
  .user-menu-item.danger { color: #f87171; }
  .user-menu-item.danger:hover { background: rgba(248,113,113,0.1); }
  .radio-pill { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--border); cursor: pointer; transition: all 0.2s ease; background: var(--surface); color: var(--text-secondary); font-size: 14px; font-weight: 500; }
  .radio-pill.selected { border-color: #dd2a7b; background: rgba(221,42,123,0.08); color: var(--text-primary); box-shadow: 0 0 0 3px rgba(221,42,123,0.12); }
  .radio-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .radio-dot::after { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #dd2a7b; opacity: 0; transition: opacity 0.2s; }
  .radio-pill.selected .radio-dot::after { opacity: 1; }
  .ig-input { width: 100%; background: var(--input-bg); border: 1.5px solid var(--border); border-radius: 12px; color: var(--text-primary); -webkit-text-fill-color: var(--text-primary); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 12px 14px; resize: none; outline: none; transition: border-color 0.2s, background 0.2s; color-scheme: inherit; }
  .ig-input:focus { border-color: #dd2a7b; background: var(--input-focus-bg); }
  .ig-input::placeholder { color: var(--text-muted); -webkit-text-fill-color: var(--text-muted); }
  .stat-chip { padding: 14px 18px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; }
  .stat-chip .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; }
  .stat-chip .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }
  .ig-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 50px; background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af); color: #fff; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(221,42,123,0.4); transition: transform 0.2s, box-shadow 0.2s; }
  .ig-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(221,42,123,0.55); }
  .ig-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 13px 22px; border-radius: 50px; background: var(--surface); border: 1px solid var(--border); color: var(--text-primary); font-family: 'Syne', sans-serif; font-weight: 600; font-size: 14px; cursor: pointer; transition: background 0.2s; }
  .ig-btn-secondary:hover { background: var(--surface-hover); }
  .kw-tag { padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(221,42,123,0.12); color: #e87fb8; border: 1px solid rgba(221,42,123,0.25); }
  .token-tag { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: rgba(245,133,41,0.12); color: #fbbf24; border: 1px solid rgba(245,133,41,0.25); cursor: pointer; transition: background 0.2s; }
  .token-tag:hover { background: rgba(245,133,41,0.22); }
  .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .status-badge.on { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .status-badge.off { background: rgba(248,113,113,0.10); color: #fca5a5; border: 1px solid rgba(248,113,113,0.2); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .status-badge.on .status-dot { background: #4ade80; }
  .status-badge.off .status-dot { background: #f87171; }

  /* ── Activity Log — table style ── */
  .log-table-hdr { display: grid; grid-template-columns: 20px 140px 68px 1fr 54px 24px; align-items: center; gap: 8px; padding: 5px 14px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); }
  .log-col-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap; }
  .log-row { display: grid; grid-template-columns: 20px 140px 68px 1fr 54px 24px; align-items: center; gap: 8px; padding: 4px 14px; border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .log-row:last-child { border-bottom: none; }
  .log-row:hover { background: rgba(255,255,255,0.03); }
  .log-avatar { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: #fff; flex-shrink: 0; }
  .log-uname { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .log-kw-pill { font-size: 10px; padding: 1px 7px; border-radius: 10px; background: rgba(245,133,41,0.12); color: #fbbf24; border: 1px solid rgba(245,133,41,0.25); font-weight: 600; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
  .log-msg-preview { font-size: 11px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .log-time { font-size: 11px; color: var(--text-muted); white-space: nowrap; text-align: right; }
  .log-status-dot { width: 7px; height: 7px; border-radius: 50%; margin: 0 auto; }
  .log-dot-sent { background: rgba(74,222,128,0.4); border: 1.5px solid #4ade80; }
  .log-dot-fail { background: rgba(248,113,113,0.4); border: 1.5px solid #f87171; }
  .log-filter-row { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02); flex-wrap: wrap; }
  .log-f-btn { font-size: 11px; padding: 3px 10px; border-radius: 20px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .log-f-btn.active { background: rgba(221,42,123,0.08); color: var(--text-primary); border-color: rgba(221,42,123,0.4); }
  .log-search { margin-left: auto; display: flex; align-items: center; gap: 5px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 3px 9px; }
  .log-search input { border: none; background: transparent; font-size: 11px; color: var(--text-primary); outline: none; width: 130px; font-family: 'DM Sans', sans-serif; }
  .log-search input::placeholder { color: var(--text-muted); }
  .log-footer { display: flex; align-items: center; justify-content: space-between; padding: 7px 14px; border-top: 1px solid var(--border); background: rgba(255,255,255,0.02); }
  .log-pg-info { font-size: 11px; color: var(--text-muted); }
  .log-pg-btns { display: flex; gap: 4px; }
  .log-pg-btn { font-size: 11px; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text-secondary); cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .log-pg-btn:disabled { opacity: 0.35; cursor: default; }
  .log-pg-btn.cur { background: rgba(129,52,175,0.2); color: #c4b5fd; border-color: rgba(129,52,175,0.4); }

  .bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 48px; }
  .bar-item { flex: 1; border-radius: 4px 4px 0 0; min-width: 8px; transition: opacity 0.2s; cursor: pointer; }
  .bar-item:hover { opacity: 0.75; }

  .cap-banner { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--cap-bg); border: 1px solid var(--cap-border); border-radius: 14px; flex-wrap: wrap; }
  .cap-bar-track { flex: 1; min-width: 100px; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; }
  .cap-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  .follow-hint { display: flex; align-items: flex-start; gap: 10px; padding: 12px 16px; border-radius: 12px; background: rgba(15,110,86,0.08); border: 1px solid rgba(15,110,86,0.25); margin-bottom: 20px; }
  .follow-hint-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .follow-hint-body { font-size: 13px; line-height: 1.6; color: var(--text-secondary); }
  .follow-hint-body strong { color: var(--text-primary); font-weight: 600; }

  .sidebar-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 40; backdrop-filter: blur(4px); }
  .sidebar-drawer { position: fixed; left: 0; top: 0; bottom: 0; width: 300px; z-index: 50; background: var(--bg2); border-right: 1px solid var(--border); overflow-y: auto; transform: translateX(-100%); transition: transform 0.35s cubic-bezier(.22,1,.36,1); }
  .sidebar-drawer.open { transform: translateX(0); }
  @media (max-width: 768px) { .desktop-sidebar { display: none !important; } .mobile-topbar { display: flex !important; } }
  @media (min-width: 769px) { .mobile-topbar { display: none !important; } .sidebar-drawer { display: none !important; } .sidebar-drawer-overlay { display: none !important; } }
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
  .skeleton { animation: pulse 1.5s ease infinite; background: var(--surface); border-radius: 8px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
  .section-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
`;

if (!document.getElementById("ig-static-css")) {
  const s = document.createElement("style");
  s.id = "ig-static-css"; s.textContent = STATIC_CSS;
  document.head.appendChild(s);
}

/* ─── Apply theme ──────────────────────────────────────────────────── */
function applyTheme(el, mode) {
  Object.entries(THEMES[mode]).forEach(([k, v]) => el.style.setProperty(k, v));
}

/* ─── Helpers ──────────────────────────────────────────────────────── */
function autoResizeTextarea(e) {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
}
function highlightKeywords(text, keywords) {
  if (!keywords?.length) return text;
  const re = new RegExp(`\\b(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
  return text.replace(re, '<span style="background:rgba(245,133,41,0.3);color:#fbbf24;border-radius:4px;padding:0 3px">$&</span>');
}
function initials(name) {
  return (name || "U").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function avatarColor(str) {
  const colors = [
    "linear-gradient(135deg,#f58529,#dd2a7b)",
    "linear-gradient(135deg,#534AB7,#8134af)",
    "linear-gradient(135deg,#0F6E56,#1D9E75)",
    "linear-gradient(135deg,#854F0B,#EF9F27)",
    "linear-gradient(135deg,#993556,#D4537E)",
  ];
  let h = 0;
  for (let i = 0; i < (str || "").length; i++) h = (h * 31 + str.charCodeAt(i)) % colors.length;
  return colors[h];
}

/* ─── SparkBar ─────────────────────────────────────────────────────── */
function SparkBar({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div key={i} className="bar-item" style={{ height: `${Math.round((v / max) * 100)}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.4 }} />
      ))}
    </div>
  );
}

/* ─── DailyCapBanner ───────────────────────────────────────────────── */
function DailyCapBanner({ profile }) {
  const sentToday = profile?.dmsSentToday ?? 0;
  const cap       = profile?.dailyCap     ?? 100;
  const pct       = Math.min(Math.round((sentToday / cap) * 100), 100);
  const danger    = pct >= 80;
  const fillColor = danger
    ? "linear-gradient(90deg,#f87171,#ef4444)"
    : "linear-gradient(90deg,#4ade80,#22c55e)";
  const countColor = danger ? "#f87171" : "#4ade80";

  return (
    <div className="cap-banner">
      <div style={{ flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
          Account DM Cap
        </div>
        <div style={{ fontSize: 12, marginTop: 2, color: countColor, fontWeight: 700 }}>
          {sentToday} / {cap} sent today
        </div>
      </div>
      <div className="cap-bar-track">
        <div className="cap-bar-fill" style={{ width: `${pct}%`, background: fillColor }} />
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: countColor }}>{cap - sentToday}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>remaining</div>
      </div>
      {danger && (
        <div style={{ padding: "3px 8px", borderRadius: 20, background: "rgba(248,113,113,0.12)", color: "#fca5a5", fontSize: 10, fontWeight: 700, border: "1px solid rgba(248,113,113,0.3)", flexShrink: 0 }}>
          ⚠️ Near limit
        </div>
      )}
    </div>
  );
}

/* ─── UserButton ───────────────────────────────────────────────────── */
function UserButton({ account, onLogout, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="user-btn" onClick={() => setOpen((v) => !v)}>
        {account.profilePicture
          ? <img src={account.profilePicture} alt="avatar" className="user-btn-avatar" />
          : <span className="user-btn-avatar-placeholder">{initials(account.accountName)}</span>}
        <span style={{ color: "var(--text-primary)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.accountName || "Account"}
        </span>
        <span className={`user-btn-chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="user-menu">
          <div className="user-menu-header">
            {account.profilePicture
              ? <img src={account.profilePicture} alt="avatar" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #dd2a7b" }} />
              : <span className="user-btn-avatar-placeholder" style={{ width: 38, height: 38, fontSize: 14 }}>{initials(account.accountName)}</span>}
            <div>
              <div className="user-menu-name">{account.accountName || "Instagram Account"}</div>
              <div className="user-menu-handle">@{account.username}</div>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />
          <button className="user-menu-item" onClick={() => { onLogout(); setOpen(false); }}>
            <span style={{ fontSize: 16 }}>🚪</span><span>Logout</span>
          </button>
          <button className="user-menu-item danger" onClick={() => { onRemove(); setOpen(false); }}>
            <span style={{ fontSize: 16 }}>🗑️</span><span>Remove Account</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── SidebarContent ───────────────────────────────────────────────── */
function SidebarContent({ thumbnailRef, posts, selectedPost, setSelectedPost, loadingMore, loading, onClose, postFilter, onFilterChange }) {
  const filteredPosts = posts.filter((p) => {
    if (postFilter === "running") return p.enabled === true;
    if (postFilter === "paused")  return !p.enabled;
    return true;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px", borderBottom: "1px solid var(--border)", background: "linear-gradient(160deg,rgba(245,133,41,0.08),rgba(129,52,175,0.08))", flexShrink: 0, display: "flex", gap: 5 }}>
        {[
          { key: "all",     label: "All",     icon: "◉" },
          { key: "running", label: "Running", icon: "▶" },
          { key: "paused",  label: "Paused",  icon: "⏸" },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => { onFilterChange(key); onClose?.(); }}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              padding: "6px 0", borderRadius: 50, fontSize: 11, fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s ease",
              border: postFilter === key
                ? key === "running" ? "1.5px solid rgba(34,197,94,0.5)"
                : key === "paused"  ? "1.5px solid rgba(248,113,113,0.4)"
                :                    "1.5px solid var(--border-accent)"
                : "1.5px solid var(--border)",
              background: postFilter === key
                ? key === "running" ? "rgba(34,197,94,0.12)"
                : key === "paused"  ? "rgba(248,113,113,0.10)"
                :                    "rgba(221,42,123,0.08)"
                : "var(--surface)",
              color: postFilter === key
                ? key === "running" ? "#4ade80"
                : key === "paused"  ? "#fca5a5"
                :                    "var(--text-primary)"
                : "var(--text-secondary)",
            }}>
            <span style={{ fontSize: 10 }}>{icon}</span>{label}
          </button>
        ))}
        {onClose && (
          <button onClick={onClose} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", width: 28, height: 28, flexShrink: 0, borderRadius: "50%", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        )}
      </div>
      <div ref={thumbnailRef} className="ig-scroll" style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {loading && posts.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 10 }} />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 12px", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>No posts match</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {filteredPosts.map((post) => (
              <div key={post.id} className={`post-thumb ${selectedPost?.id === post.id ? "active" : ""}`}
                onClick={() => { setSelectedPost(post); onClose?.(); }}>
                <img src={post.image || post.mediaUrl} alt="" />
                <div className="thumb-overlay">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
                    <div className="thumb-caption">{post.caption || "Instagram Post"}</div>
                    {post.enabled && <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px #4ade80", marginTop: 2 }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loadingMore && <div style={{ textAlign: "center", padding: "12px 0", color: "var(--text-secondary)", fontSize: 13 }}>Loading more…</div>}
      </div>
    </div>
  );
}

/* ─── AnalyticsSection ─────────────────────────────────────────────── */
function AnalyticsSection({ analytics, analyticsLoading }) {
  if (analyticsLoading) return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
    </div>
  );
  const stats = [
    { label: "Comments",   value: analytics?.comments  ?? 0,    color: "#f58529", bg: "linear-gradient(135deg,rgba(245,133,41,0.15),rgba(221,42,123,0.1))", border: "rgba(245,133,41,0.22)" },
    { label: "DMs Sent",   value: analytics?.dmsSent   ?? 0,    color: "#8b8fff", bg: "linear-gradient(135deg,rgba(81,91,212,0.15),rgba(129,52,175,0.1))",  border: "rgba(81,91,212,0.22)" },
    { label: "Conversion", value: `${analytics?.conversionRate ?? 0}%`, color: "#4ade80", bg: "linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.08))", border: "rgba(34,197,94,0.2)" },
    { label: "Reach",      value: analytics?.reach      ?? 0,   color: "#fbbf24", bg: "linear-gradient(135deg,rgba(245,133,41,0.10),rgba(251,191,36,0.07))", border: "rgba(251,191,36,0.2)" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
      {stats.map((s) => (
        <div key={s.label} className="stat-chip" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
          <span className="stat-label" style={{ color: s.color }}>{s.label}</span>
          <span className="stat-value" style={{ color: "var(--text-primary)", fontSize: typeof s.value === "string" ? 18 : 22 }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── FollowToDmHint ───────────────────────────────────────────────── */
function FollowToDmHint({ followReplyTemplate, onChangeTemplate }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="follow-hint">
        <span className="follow-hint-icon">👥</span>
        <div className="follow-hint-body">
          <strong>How it works:</strong> When someone comments, the bot replies publicly asking them to follow your account.
          Once they follow, the DM is sent automatically via a follow-event webhook.
        </div>
      </div>
      <span className="section-label">Public reply template</span>
      <textarea
        rows={2}
        value={followReplyTemplate}
        onChange={(e) => onChangeTemplate(e.target.value)}
        placeholder="Hey! Follow our page and we'll send you all the details in your DMs 📩"
        className="ig-input"
        style={{ lineHeight: 1.5 }}
      />
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
        This comment is posted publicly in reply to the commenter. Use <span style={{ color: "#fbbf24" }}>{"{name}"}</span> to personalise it.
      </div>
    </div>
  );
}

/* ─── SmartControls ────────────────────────────────────────────────── */
function SmartControls({ settings, onChange, isDark }) {
  const controls = [
    {
      key: "oneDmPerUser", icon: "👤", label: "One DM per user", sub: "Never message same person twice",
      lightColor: "#7c3aed", darkColor: "#c4b5fd",
      activeBg:  { light: "rgba(124,58,237,0.08)",  dark: "rgba(167,139,250,0.12)" },
      activeBdr: { light: "rgba(124,58,237,0.45)",  dark: "rgba(196,181,253,0.55)" },
    },
    {
      key: "followToDm", icon: "👥", label: "Follow to get DM", sub: "Ask to follow first, DM after they do",
      lightColor: "#0F6E56", darkColor: "#5DCAA5",
      activeBg:  { light: "rgba(15,110,86,0.08)",   dark: "rgba(93,202,165,0.12)" },
      activeBdr: { light: "rgba(15,110,86,0.45)",   dark: "rgba(93,202,165,0.55)" },
    },
    {
      key: "rotateMessages", icon: "🔄", label: "Rotate messages", sub: "Cycle through message variants",
      lightColor: "#1d4ed8", darkColor: "#93c5fd",
      activeBg:  { light: "rgba(29,78,216,0.08)",   dark: "rgba(96,165,250,0.12)"  },
      activeBdr: { light: "rgba(29,78,216,0.45)",   dark: "rgba(96,165,250,0.55)"  },
    },
    {
      key: "personalizeMessage", icon: "✨", label: "Personalize {name}", sub: "Insert commenter's name in DM",
      lightColor: "#b45309", darkColor: "#fde68a",
      activeBg:  { light: "rgba(180,83,9,0.08)",    dark: "rgba(251,191,36,0.12)"  },
      activeBdr: { light: "rgba(180,83,9,0.45)",    dark: "rgba(251,191,36,0.55)"  },
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10, marginBottom: 20 }}>
      {controls.map(({ key, icon, label, sub, lightColor, darkColor, activeBg, activeBdr }) => {
        const active      = !!settings[key];
        const mode        = isDark ? "dark" : "light";
        const accentColor = isDark ? darkColor : lightColor;
        const bgColor     = active ? activeBg[mode]  : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)");
        const borderColor = active ? activeBdr[mode] : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)");
        const labelColor  = active ? accentColor : (isDark ? "#f0eef8" : "#1a1828");
        const subColor    = isDark ? "#a09fb5" : "#6b6880";
        return (
          <div key={key} onClick={() => onChange(key, !active)}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, cursor: "pointer", transition: "all 0.22s ease", background: bgColor, border: `2px solid ${borderColor}`, boxShadow: active ? `0 2px 16px ${activeBg[mode]}` : "none", position: "relative" }}>
            <div style={{ position: "absolute", top: 9, right: 12, padding: "2px 7px", borderRadius: 20, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", background: active ? "rgba(74,222,128,0.18)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"), color: active ? "#4ade80" : (isDark ? "#a09fb5" : "#6b6880"), border: active ? "1px solid rgba(74,222,128,0.35)" : (isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)"), transition: "all 0.2s ease" }}>
              {active ? "ON" : "OFF"}
            </div>
            <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, transition: "all 0.2s ease", background: active ? borderColor : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"), border: `1.5px solid ${active ? borderColor : "var(--border)"}` }}>{icon}</div>
            <div style={{ minWidth: 0, flex: 1, paddingRight: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: labelColor, transition: "color 0.2s" }}>{label}</div>
              <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.4, color: subColor }}>{sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MessageVariants ──────────────────────────────────────────────── */
function MessageVariants({ variants, onChange }) {
  const addVariant    = () => onChange([...variants, ""]);
  const removeVariant = (i) => onChange(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i, val) => { const v = [...variants]; v[i] = val; onChange(v); };
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span className="section-label" style={{ marginBottom: 0 }}>Message Variants</span>
        {variants.length < 3 && (
          <button onClick={addVariant} style={{ fontSize: 12, fontWeight: 600, color: "#dd2a7b", background: "none", border: "none", cursor: "pointer", padding: "2px 6px" }}>+ Add variant</button>
        )}
      </div>
      {variants.map((v, i) => (
        <div key={i} style={{ position: "relative", marginBottom: 8 }}>
          <textarea rows={2} value={v} onChange={(e) => updateVariant(i, e.target.value)} placeholder={`Variant ${i + 1}…`} className="ig-input" style={{ lineHeight: 1.5, paddingRight: 36 }} />
          {variants.length > 1 && (
            <button onClick={() => removeVariant(i)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 16 }}>×</button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */
export default function InstagramManager() {
  const navigate     = useNavigate();
  const wrapRef      = useRef(null);
  const thumbnailRef = useRef(null);

  const [isDark, setIsDark]             = useState(false);
  const [posts, setPosts]               = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [nextToken, setNextToken]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [postFilter, setPostFilter]     = useState("all");
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [instagramAccount, setInstagramAccount] = useState({ accountName: "", username: "", profilePicture: "" });

  const [profile, setProfile] = useState(null);

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [commentType, setCommentType]   = useState("all");
  const [keywords, setKeywords]         = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [triggerKeywords]               = useState([]);
  const [dmMessage, setDmMessage]       = useState("");

  const [smartSettings, setSmartSettings] = useState({
    oneDmPerUser:       true,
    followToDm:         false,
    rotateMessages:     false,
    personalizeMessage: true,
  });

  const [followReplyTemplate, setFollowReplyTemplate] = useState(
    "Hey {name}! Follow our page and we'll send you all the details in your DMs 📩"
  );

  const [messageVariants, setMessageVariants] = useState([""]);

  const [analytics, setAnalytics]           = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (wrapRef.current) applyTheme(wrapRef.current, isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    api.get("/insta/profile")
      .then((res) => {
        const data = res.data;
        setInstagramAccount({
          accountName:    data?.accountName || data?.username || "Instagram Account",
          username:       data?.username    || "",
          profilePicture: data?.profilePicture || "",
        });
        setProfile(data);
        if (data?.theme === "dark") setIsDark(true);
        else setIsDark(false);
      })
      .catch(() => navigate("/"));
  }, []);

  const fetchPosts = useCallback(async (next = null) => {
    try {
      next ? setLoadingMore(true) : setLoading(true);
      const res     = await api.get("/insta/media", { params: { next } });
      const fetched = res.data?.posts || [];
      setPosts((prev) => (next ? [...prev, ...fetched] : fetched));
      if (!selectedPost && fetched.length > 0) setSelectedPost(fetched[0]);
      setNextToken(res.data?.next || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [selectedPost]);

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const el = thumbnailRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200 && nextToken && !loadingMore)
        fetchPosts(nextToken);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [nextToken, loadingMore, fetchPosts]);

  useEffect(() => {
    if (!selectedPost) return;
    setAutoReplyEnabled(selectedPost.enabled ?? false);
    setCommentType((selectedPost.replyAll ?? true) ? "all" : "specific");
    const kw = selectedPost.keywords || [];
    setKeywords(kw);
    setKeywordInput(kw.join(", "));
    setDmMessage(selectedPost.message || "");
    setSmartSettings({
      oneDmPerUser:       selectedPost.oneDmPerUser       ?? true,
      followToDm:         selectedPost.followToDm         ?? false,
      rotateMessages:     selectedPost.rotateMessages     ?? false,
      personalizeMessage: selectedPost.personalizeMessage ?? true,
    });
    setFollowReplyTemplate(
      selectedPost.followReplyTemplate ||
      "Hey {name}! Follow our page and we'll send you all the details in your DMs 📩"
    );
    setMessageVariants(selectedPost.messageVariants?.length ? selectedPost.messageVariants : [selectedPost.message || ""]);

    const mediaId = selectedPost.mediaId || selectedPost.instagramPostId || selectedPost.id;

    setAnalyticsLoading(true);
    api.get(`/insta/analytics/${mediaId}`)
      .then((r) => setAnalytics(r.data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));

    api.get(`/insta/automation/${mediaId}/variants`)
      .then((r) => { if (r.data?.messages?.length) setMessageVariants(r.data.messages); })
      .catch(() => {});
  }, [selectedPost]);

  const handleLogout = async () => {
    try { await api.get("/insta/logout"); navigate("/"); }
    catch (e) { console.error(e); alert("Failed to logout."); }
  };
  const handleRemoveAccount = async () => {
    if (!window.confirm("Remove this Instagram account?")) return;
    try { await api.delete("/insta/removeAccount"); alert("Account removed."); }
    catch (e) { console.error(e); alert("Failed to remove account."); }
  };
  const handleKeywordChange = (val) => {
    setKeywordInput(val);
    setKeywords(val.split(/[,\n]+/).map((w) => w.trim()).filter(Boolean));
  };
  const handleToggle = async () => {
    const next = !autoReplyEnabled;
    setAutoReplyEnabled(next);
    if (!next) {
      try {
        await api.post("/insta/automation", {
          instagramPostId: selectedPost?.instagramPostId || selectedPost?.id,
          autoReply: { enabled: false },
        });
      } catch (e) { console.error(e); setAutoReplyEnabled(true); }
    }
  };
  const handleSmartChange = (key, val) => setSmartSettings((prev) => ({ ...prev, [key]: val }));

  const handleSubmitAutoReply = async () => {
    try {
      const mediaId = selectedPost?.mediaId || selectedPost?.instagramPostId || selectedPost?.id;
      await api.post("/insta/automation", {
        postId: selectedPost?.id,
        instagramPostId: mediaId,
        mediaId,
        username: instagramAccount.username,
        autoReply: {
          enabled: autoReplyEnabled,
          replyType: commentType,
          replyAll: commentType === "all",
          keywords: commentType === "specific" ? keywords : [],
          message: dmMessage,
          ...smartSettings,
          ...(smartSettings.followToDm ? { followReplyTemplate } : {}),
        },
      });
      if (smartSettings.rotateMessages) {
        await api.post(`/insta/automation/${mediaId}/variants`, { messages: messageVariants.filter(Boolean) });
      }
      alert("Settings saved successfully");
    } catch (e) { console.error(e); alert("Failed to save settings"); }
  };

  const handleDuplicateSettings = async () => {
    const target = prompt("Enter comma-separated post IDs to copy settings to:");
    if (!target) return;
    try {
      await api.post("/insta/automation/duplicate", {
        fromMediaId: selectedPost?.mediaId || selectedPost?.id,
        toMediaIds: target.split(",").map((s) => s.trim()).filter(Boolean),
      });
      alert("Settings copied successfully");
    } catch (e) { console.error(e); alert("Failed to duplicate settings"); }
  };

  const insertToken = (token) => setDmMessage((prev) => prev + token);
  const handleThemeToggle = () => setIsDark((v) => !v);

  const initVars     = Object.entries(THEMES[isDark ? "dark" : "light"]).reduce((a, [k, v]) => { a[k] = v; return a; }, {});
  const sidebarProps = { thumbnailRef, posts, selectedPost, setSelectedPost, loadingMore, loading, postFilter, onFilterChange: setPostFilter };

  const TopbarActions = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button className="theme-btn" onClick={handleThemeToggle} title={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme">
        {isDark ? "☀️" : "🌙"}
      </button>
      <UserButton account={instagramAccount} onLogout={handleLogout} onRemove={handleRemoveAccount} />
    </div>
  );

  return (
    <div ref={wrapRef} className="ig-wrap" style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", position: "relative", overflow: "hidden", ...initVars }}>

      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div style={{ position: "absolute", top: -120, left: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,var(--orb1) 0%,transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: -100, right: -60, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,var(--orb2) 0%,transparent 70%)" }} />
      </div>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar ig-scroll" style={{ width: 264, flexShrink: 0, height: "100vh", overflowY: "auto", borderRight: "1px solid var(--border)", background: "var(--sidebar-bg)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile topbar */}
      <div className="mobile-topbar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, height: 60, background: "var(--topbar-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)", alignItems: "center", padding: "0 14px", gap: 10 }}>
        <button onClick={() => setDrawerOpen(true)} style={{ width: 36, height: 36, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>☰</button>
        <span className="syne" style={{ fontWeight: 800, fontSize: 16, flex: 1, color: "var(--text-primary)" }}><span className="ig-grad-text">Instagram</span></span>
        <TopbarActions />
      </div>

      {drawerOpen && <div className="sidebar-drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <nav className={`sidebar-drawer ig-scroll ${drawerOpen ? "open" : ""}`}>
        <SidebarContent {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </nav>

      {/* Main */}
      <main className="ig-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="mobile-topbar" style={{ height: 60, background: "none", position: "static", backdropFilter: "none", border: "none" }} />

        {/* Desktop topbar row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "16px 0 4px", maxWidth: 860, margin: "0 auto" }}>
          <div className="desktop-sidebar" style={{ display: "flex" }}>
            <TopbarActions />
          </div>
        </div>

        {/* Account-level Daily DM Cap banner */}
        <div style={{ maxWidth: 860, margin: "0 auto 16px" }}>
          <DailyCapBanner profile={profile} />
        </div>

        {selectedPost ? (
          <div className="fade-up" style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 40 }}>

            {/* Hero */}
            <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", marginBottom: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
              <img src={selectedPost.image || selectedPost.mediaUrl} alt="" style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.35) 45%,transparent 72%)" }} />

              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 20px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>📸</span>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>@{selectedPost.username || instagramAccount.username}</span>
                </div>
                <h2 className="syne" style={{ color: "#fff", fontSize: "clamp(16px,3.5vw,22px)", fontWeight: 800, lineHeight: 1.2, marginBottom: selectedPost.daysAgo ? 2 : 12 }}>Instagram Post</h2>
                {selectedPost.daysAgo && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginBottom: 14 }}>{selectedPost.daysAgo}</p>}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {analyticsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ height: 56, borderRadius: 12, background: "rgba(255,255,255,0.08)", animation: "pulse 1.5s ease infinite" }} />
                      ))
                    : [
                        { label: "Comments",   value: analytics?.comments          ?? 0,    color: "#f58529", border: "rgba(245,133,41,0.4)"  },
                        { label: "DMs Sent",   value: analytics?.dmsSent           ?? 0,    color: "#8b8fff", border: "rgba(139,143,255,0.4)" },
                        { label: "Conversion", value: `${analytics?.conversionRate ?? 0}%`, color: "#4ade80", border: "rgba(74,222,128,0.4)"  },
                        { label: "Reach",      value: analytics?.reach             ?? 0,    color: "#fbbf24", border: "rgba(251,191,36,0.4)"  },
                      ].map((s) => (
                        <div key={s.label} style={{
                          padding: "10px 12px", borderRadius: 12,
                          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
                          border: `1px solid ${s.border}`,
                          display: "flex", flexDirection: "column", gap: 3,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: s.color }}>{s.label}</span>
                          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.value}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>

            {selectedPost.caption && (
              <div className="ig-card" style={{ padding: "16px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span>📝</span>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Caption</span>
                </div>
                <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: 14 }}>{selectedPost.caption}</p>
              </div>
            )}

            {/* Auto Reply card */}
            <div className="ig-card" style={{ padding: 24, borderColor: "var(--border-accent)", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div>
                  <h3 className="ig-grad-text syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🤖 Auto Reply</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Automate DMs for <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>@{selectedPost.username || instagramAccount.username}</span>'s post
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`status-badge ${autoReplyEnabled ? "on" : "off"}`}>
                    <span className="status-dot" />{autoReplyEnabled ? "Running" : "Paused"}
                  </span>
                  <button type="button" onClick={handleToggle} className={`ig-toggle ${autoReplyEnabled ? "on" : "off"}`}>
                    <span className="ig-toggle-knob">{autoReplyEnabled ? "✓" : ""}</span>
                  </button>
                </div>
              </div>

              {autoReplyEnabled && (
                <>
                  <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
                  <span className="section-label">Trigger Condition</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[{ value: "all", label: "All Comments", icon: "💬" }, { value: "specific", label: "Keyword Match", icon: "🔍" }].map((opt) => (
                      <label key={opt.value} className={`radio-pill ${commentType === opt.value ? "selected" : ""}`} onClick={() => setCommentType(opt.value)}>
                        <span className="radio-dot" />
                        <span style={{ fontSize: 16 }}>{opt.icon}</span>
                        <span>{opt.label}</span>
                        <input type="radio" name="commentType" value={opt.value} checked={commentType === opt.value} onChange={(e) => setCommentType(e.target.value)} style={{ display: "none" }} />
                      </label>
                    ))}
                  </div>

                  {commentType === "specific" && (
                    <div style={{ marginBottom: 20 }}>
                      <span className="section-label">Trigger Keywords</span>
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", whiteSpace: "pre-wrap", wordBreak: "break-word", borderRadius: 12, border: "1.5px solid transparent", padding: "12px 14px", color: "transparent", overflow: "hidden", lineHeight: 1.5, fontSize: 14 }}
                          dangerouslySetInnerHTML={{ __html: highlightKeywords(keywordInput, triggerKeywords) }} />
                        <textarea rows={1} value={keywordInput}
                          onChange={(e) => { handleKeywordChange(e.target.value); autoResizeTextarea(e); }}
                          placeholder="price, details, catalog, menu…" className="ig-input" style={{ minHeight: 48, lineHeight: 1.5 }} />
                      </div>
                      {keywords.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {keywords.map((kw, i) => <span key={`${kw}-${i}`} className="kw-tag">{kw}</span>)}
                        </div>
                      )}
                    </div>
                  )}

                  <span className="section-label">Smart Controls</span>
                  <SmartControls settings={smartSettings} onChange={handleSmartChange} isDark={isDark} />

                  {smartSettings.followToDm && (
                    <FollowToDmHint
                      followReplyTemplate={followReplyTemplate}
                      onChangeTemplate={setFollowReplyTemplate}
                    />
                  )}

                  {smartSettings.rotateMessages ? (
                    <MessageVariants variants={messageVariants} onChange={setMessageVariants} />
                  ) : (
                    <div style={{ marginBottom: 16 }}>
                      <span className="section-label">
                        {smartSettings.followToDm ? "DM Message (sent after they follow)" : "DM Auto Reply Message"}
                      </span>
                      <textarea rows={4} value={dmMessage} onChange={(e) => setDmMessage(e.target.value)}
                        placeholder={
                          smartSettings.followToDm
                            ? `Write the DM to send once @${selectedPost.username || instagramAccount.username} followers follow your page…`
                            : `Write an automated DM for @${selectedPost.username || instagramAccount.username} followers…`
                        }
                        className="ig-input" style={{ lineHeight: 1.6 }} />
                    </div>
                  )}

                  {smartSettings.personalizeMessage && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)", alignSelf: "center" }}>Insert:</span>
                      {["{name}", "{username}", "{keyword}"].map((t) => (
                        <button key={t} className="token-tag" onClick={() => insertToken(t)}>{t}</button>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 4 }}>
                    <button onClick={handleSubmitAutoReply} className="ig-btn-primary"><span>🚀</span><span>Save Settings</span></button>
                    <button onClick={handleDuplicateSettings} className="ig-btn-secondary"><span>⧉</span><span>Copy to another post</span></button>
                    {selectedPost.permalink && (
                      <a href={selectedPost.permalink} target="_blank" rel="noreferrer" className="ig-btn-secondary" style={{ textDecoration: "none" }}>🔗 View on Instagram</a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
              <h2 className="ig-grad-text syne" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Select a Post</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>Choose a post from the panel to configure automation.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}