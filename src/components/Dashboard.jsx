import React, { useEffect, useRef, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

/* ─── Google Fonts ────────────────────────────────────────────────── */
if (!document.getElementById("ig-fonts")) {
  const l = document.createElement("link");
  l.id = "ig-fonts";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
  document.head.appendChild(l);
}

/* ─── Theme tokens ────────────────────────────────────────────────── */
const THEMES = {
  dark: {
    "--bg":              "#0a0a0f",
    "--bg2":             "#0f0f1a",
    "--surface":         "rgba(255,255,255,0.04)",
    "--surface-hover":   "rgba(255,255,255,0.08)",
    "--border":          "rgba(255,255,255,0.09)",
    "--border-accent":   "rgba(255,100,130,0.35)",
    "--text-primary":    "#f0eef8",
    "--text-secondary":  "#8b8a99",
    "--text-muted":      "#555468",
    "--shadow-card":     "0 8px 40px rgba(0,0,0,0.55)",
    "--scrollbar-thumb": "rgba(255,255,255,0.12)",
    "--sidebar-bg":      "rgba(15,15,26,0.9)",
    "--topbar-bg":       "rgba(10,10,15,0.92)",
    "--input-bg":        "rgba(255,255,255,0.04)",
    "--input-focus-bg":  "rgba(221,42,123,0.05)",
    "--orb1":            "rgba(245,133,41,0.12)",
    "--orb2":            "rgba(129,52,175,0.10)",
    "--orb3":            "rgba(81,91,212,0.06)",
    "--stat1-bg":        "linear-gradient(135deg,rgba(245,133,41,0.15),rgba(221,42,123,0.1))",
    "--stat1-border":    "rgba(245,133,41,0.22)",
    "--stat2-bg":        "linear-gradient(135deg,rgba(129,52,175,0.15),rgba(81,91,212,0.1))",
    "--stat2-border":    "rgba(129,52,175,0.22)",
    "--user-menu-bg":    "#141420",
    "--user-menu-item":  "rgba(255,255,255,0.05)",
    "--user-menu-hover": "rgba(255,255,255,0.1)",
  },
  light: {
    "--bg":              "#f4f3fb",
    "--bg2":             "#ffffff",
    "--surface":         "rgba(255,255,255,0.75)",
    "--surface-hover":   "rgba(255,255,255,0.95)",
    "--border":          "rgba(0,0,0,0.08)",
    "--border-accent":   "rgba(221,42,123,0.25)",
    "--text-primary":    "#1a1828",
    "--text-secondary":  "#6b6880",
    "--text-muted":      "#b0aec0",
    "--shadow-card":     "0 8px 40px rgba(0,0,0,0.10)",
    "--scrollbar-thumb": "rgba(0,0,0,0.15)",
    "--sidebar-bg":      "rgba(255,255,255,0.85)",
    "--topbar-bg":       "rgba(255,255,255,0.92)",
    "--input-bg":        "rgba(0,0,0,0.03)",
    "--input-focus-bg":  "rgba(221,42,123,0.04)",
    "--orb1":            "rgba(245,133,41,0.10)",
    "--orb2":            "rgba(129,52,175,0.08)",
    "--orb3":            "rgba(81,91,212,0.05)",
    "--stat1-bg":        "linear-gradient(135deg,rgba(245,133,41,0.10),rgba(221,42,123,0.07))",
    "--stat1-border":    "rgba(245,133,41,0.18)",
    "--stat2-bg":        "linear-gradient(135deg,rgba(129,52,175,0.10),rgba(81,91,212,0.07))",
    "--stat2-border":    "rgba(129,52,175,0.18)",
    "--user-menu-bg":    "#ffffff",
    "--user-menu-item":  "rgba(0,0,0,0.03)",
    "--user-menu-hover": "rgba(0,0,0,0.07)",
  },
};

/* ─── Static CSS (theme-agnostic or uses CSS vars) ────────────────── */
const STATIC_CSS = `
  .ig-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ig-wrap { font-family: 'DM Sans', sans-serif; transition: background 0.35s ease, color 0.35s ease; }
  .ig-wrap h1,.ig-wrap h2,.ig-wrap h3,.ig-wrap .syne { font-family: 'Syne', sans-serif; }

  .ig-scroll::-webkit-scrollbar { width: 4px; }
  .ig-scroll::-webkit-scrollbar-track { background: transparent; }
  .ig-scroll::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 4px; }

  .ig-grad-text {
    background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .ig-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; backdrop-filter: blur(16px);
    transition: background 0.25s ease, box-shadow 0.25s ease;
    box-shadow: var(--shadow-card);
  }
  .ig-card:hover { background: var(--surface-hover); }

  /* Post thumbnails */
  .post-thumb {
    cursor: pointer; border-radius: 12px; overflow: hidden;
    border: 2px solid transparent; transition: all 0.25s ease; position: relative;
  }
  .post-thumb:hover { border-color: rgba(221,42,123,0.5); transform: translateY(-2px); }
  .post-thumb.active { border-color: #dd2a7b; box-shadow: 0 0 0 3px rgba(221,42,123,0.25); }
  .post-thumb img { width: 100%; height: 88px; object-fit: cover; display: block; }
  .post-thumb .thumb-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 55%);
    padding: 6px; display: flex; flex-direction: column; justify-content: flex-end;
  }
  .post-thumb .thumb-caption {
    font-size: 10px; color: rgba(255,255,255,0.9); font-weight: 500; line-height: 1.3;
    overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }

  /* Auto-reply toggle */
  .ig-toggle {
    position: relative; display: inline-flex; width: 52px; height: 28px;
    border-radius: 14px; transition: background 0.3s ease;
    cursor: pointer; border: none; outline: none; flex-shrink: 0;
  }
  .ig-toggle.on { background: linear-gradient(135deg,#f58529,#dd2a7b); box-shadow: 0 2px 12px rgba(221,42,123,0.45); }
  .ig-toggle.off { background: var(--border); }
  .ig-toggle-knob {
    position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
    border-radius: 50%; background: #fff;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center; font-size: 10px;
  }
  .ig-toggle.on .ig-toggle-knob { transform: translateX(24px); }

  /* Theme toggle button */
  .theme-toggle {
    width: 36px; height: 36px; border-radius: 10px;
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text-primary); font-size: 17px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s ease; flex-shrink: 0;
  }
  .theme-toggle:hover { background: var(--surface-hover); transform: rotate(15deg); }

  /* User button */
  .user-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 10px 5px 5px; border-radius: 50px;
    background: var(--surface); border: 1px solid var(--border);
    color: var(--text-primary); cursor: pointer; transition: all 0.2s ease;
    font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif;
  }
  .user-btn:hover { background: var(--surface-hover); }
  .user-btn-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    object-fit: cover; display: block;
    border: 1.5px solid #dd2a7b;
  }
  .user-btn-avatar-placeholder {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg,#f58529,#dd2a7b);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: #fff; font-weight: 700; flex-shrink: 0;
  }
  .user-btn-chevron { font-size: 10px; color: var(--text-secondary); transition: transform 0.2s; }
  .user-btn-chevron.open { transform: rotate(180deg); }

  /* User dropdown */
  .user-menu {
    position: absolute; right: 0; top: calc(100% + 8px);
    min-width: 220px; background: var(--user-menu-bg);
    border: 1px solid var(--border); border-radius: 16px;
    box-shadow: 0 16px 48px rgba(0,0,0,0.2);
    overflow: hidden; z-index: 200;
    animation: menuIn 0.18s cubic-bezier(.22,1,.36,1) forwards;
  }
  @keyframes menuIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
  .user-menu-header {
    padding: 14px 16px 10px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .user-menu-name { font-weight: 700; font-size: 14px; color: var(--text-primary); }
  .user-menu-handle { font-size: 12px; color: var(--text-secondary); margin-top: 1px; }
  .user-menu-item {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 11px 16px; background: none; border: none;
    color: var(--text-primary); font-size: 14px; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: background 0.15s; text-align: left;
  }
  .user-menu-item:hover { background: var(--user-menu-hover); }
  .user-menu-item.danger { color: #f87171; }
  .user-menu-item.danger:hover { background: rgba(248,113,113,0.1); }

  /* Radio pills */
  .radio-pill {
    display: flex; align-items: center; gap: 10px; padding: 12px 16px;
    border-radius: 12px; border: 1.5px solid var(--border);
    cursor: pointer; transition: all 0.2s ease;
    background: var(--surface); color: var(--text-secondary);
    font-size: 14px; font-weight: 500;
  }
  .radio-pill.selected {
    border-color: #dd2a7b; background: rgba(221,42,123,0.08);
    color: var(--text-primary); box-shadow: 0 0 0 3px rgba(221,42,123,0.12);
  }
  .radio-dot {
    width: 16px; height: 16px; border-radius: 50%; border: 2px solid currentColor;
    flex-shrink: 0; display: flex; align-items: center; justify-content: center;
  }
  .radio-dot::after {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: #dd2a7b; opacity: 0; transition: opacity 0.2s;
  }
  .radio-pill.selected .radio-dot::after { opacity: 1; }

  /* Inputs */
  .ig-input {
    width: 100%; background: var(--input-bg); border: 1.5px solid var(--border);
    border-radius: 12px; color: var(--text-primary);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    padding: 12px 14px; resize: none; outline: none; transition: border-color 0.2s, background 0.2s;
  }
  .ig-input:focus { border-color: #dd2a7b; background: var(--input-focus-bg); }
  .ig-input::placeholder { color: var(--text-muted); }

  /* Stat chips */
  .stat-chip {
    padding: 14px 18px; border-radius: 12px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .stat-chip .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; }
  .stat-chip .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }

  /* Primary button */
  .ig-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 50px;
    background: linear-gradient(135deg,#f58529,#dd2a7b,#8134af);
    color: #fff; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
    border: none; cursor: pointer; box-shadow: 0 4px 24px rgba(221,42,123,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .ig-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(221,42,123,0.55); }
  .ig-btn-primary:active { transform: translateY(0); }

  /* Keyword tags */
  .kw-tag {
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
    background: rgba(221,42,123,0.12); color: #e87fb8;
    border: 1px solid rgba(221,42,123,0.25);
  }

  /* Status badge */
  .status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .status-badge.on  { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .status-badge.off { background: rgba(248,113,113,0.10); color: #fca5a5; border: 1px solid rgba(248,113,113,0.2); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .status-badge.on .status-dot  { background: #4ade80; }
  .status-badge.off .status-dot { background: #f87171; }

  /* Sidebar drawer (mobile) */
  .sidebar-drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.65);
    z-index: 40; backdrop-filter: blur(4px);
  }
  .sidebar-drawer {
    position: fixed; left: 0; top: 0; bottom: 0; width: 300px; z-index: 50;
    background: var(--bg2); border-right: 1px solid var(--border);
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(.22,1,.36,1);
  }
  .sidebar-drawer.open { transform: translateX(0); }

  @media (max-width: 768px) {
    .desktop-sidebar { display: none !important; }
    .mobile-topbar   { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-topbar          { display: none !important; }
    .sidebar-drawer         { display: none !important; }
    .sidebar-drawer-overlay { display: none !important; }
  }

  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
  .skeleton { animation: pulse 1.5s ease infinite; background: var(--surface); border-radius: 8px; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
`;

if (!document.getElementById("ig-static-css")) {
  const s = document.createElement("style");
  s.id = "ig-static-css";
  s.textContent = STATIC_CSS;
  document.head.appendChild(s);
}

/* ─── Apply theme vars to a target element ────────────────────────── */
function applyTheme(el, mode) {
  Object.entries(THEMES[mode]).forEach(([k, v]) => el.style.setProperty(k, v));
}

/* ─── Helpers ─────────────────────────────────────────────────────── */
function autoResizeTextarea(e) {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
}
function highlightKeywords(text, keywords) {
  if (!keywords?.length) return text;
  const re = new RegExp(
    `\\b(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );
  return text.replace(re, '<span style="background:rgba(245,133,41,0.3);color:#fbbf24;border-radius:4px;padding:0 3px">$&</span>');
}
function initials(name) {
  return (name || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ─── UserButton ──────────────────────────────────────────────────── */
function UserButton({ account, onLogout, onRemove, isDark, onThemeToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="user-btn" onClick={() => setOpen((v) => !v)} aria-label="User menu">
        {account.profilePicture ? (
          <img src={account.profilePicture} alt="avatar" className="user-btn-avatar" />
        ) : (
          <span className="user-btn-avatar-placeholder">{initials(account.accountName)}</span>
        )}
        <span style={{ color: "var(--text-primary)", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.accountName || "Account"}
        </span>
        <span className={`user-btn-chevron ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="user-menu" style={{ right: 0 }}>
          {/* Header */}
          <div className="user-menu-header">
            {account.profilePicture ? (
              <img src={account.profilePicture} alt="avatar" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #dd2a7b" }} />
            ) : (
              <span className="user-btn-avatar-placeholder" style={{ width: 38, height: 38, fontSize: 14 }}>{initials(account.accountName)}</span>
            )}
            <div>
              <div className="user-menu-name">{account.accountName || "Instagram Account"}</div>
              <div className="user-menu-handle">@{account.username}</div>
            </div>
          </div>

          {/* Theme toggle */}
          <button className="user-menu-item" onClick={() => { onThemeToggle(); setOpen(false); }}>
            <span style={{ fontSize: 16 }}>{isDark ? "☀️" : "🌙"}</span>
            <span>{isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}</span>
          </button>

          <div style={{ height: 1, background: "var(--border)", margin: "2px 0" }} />

          <button className="user-menu-item" onClick={() => { onLogout(); setOpen(false); }}>
            <span style={{ fontSize: 16 }}>🚪</span>
            <span>Logout</span>
          </button>
          <button className="user-menu-item danger" onClick={() => { onRemove(); setOpen(false); }}>
            <span style={{ fontSize: 16 }}>🗑️</span>
            <span>Remove Account</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── SidebarContent ──────────────────────────────────────────────── */
function SidebarContent({
  thumbnailRef, instagramAccount, posts, selectedPost,
  setSelectedPost, loadingMore, loading,
  onClose, postFilter, onFilterChange,
}) {
  const filteredPosts = posts.filter((p) => {
    if (postFilter === "enabled")  return p.enabled === true;
    if (postFilter === "disabled") return !p.enabled;
    return true;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Sidebar filter header */}
      <div style={{
        padding: "12px 10px",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(160deg,rgba(245,133,41,0.08),rgba(129,52,175,0.08))",
        flexShrink: 0,
        display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
      }}>
        {[
          { key: "all",      label: "All",      icon: "◉" },
          { key: "enabled",  label: "Running",  icon: "🟢" },
          { key: "disabled", label: "Paused",   icon: "⏸" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "5px 10px", borderRadius: 50, fontSize: 11, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s ease", flex: 1,
              justifyContent: "center",
              border: postFilter === key
                ? key === "enabled"  ? "1.5px solid rgba(34,197,94,0.5)"
                : key === "disabled" ? "1.5px solid rgba(248,113,113,0.4)"
                :                     "1.5px solid var(--border-accent)"
                : "1.5px solid var(--border)",
              background: postFilter === key
                ? key === "enabled"  ? "rgba(34,197,94,0.12)"
                : key === "disabled" ? "rgba(248,113,113,0.10)"
                :                     "rgba(221,42,123,0.08)"
                : "var(--surface)",
              color: postFilter === key
                ? key === "enabled"  ? "#4ade80"
                : key === "disabled" ? "#fca5a5"
                :                     "var(--text-primary)"
                : "var(--text-secondary)",
            }}
          >
            <span style={{ fontSize: 10 }}>{icon}</span>
            {label}
          </button>
        ))}
        {onClose && (
          <button onClick={onClose} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", width: 28, height: 28, flexShrink: 0,
            borderRadius: "50%", cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        )}
      </div>

      {/* Grid */}
      <div ref={thumbnailRef} className="ig-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
        {loading && posts.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 10 }} />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 12px", color: "var(--text-secondary)" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>No posts match this filter</div>
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
                    {post.enabled && (
                      <span style={{ flexShrink: 0, width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", marginTop: 2 }} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loadingMore && (
          <div style={{ textAlign: "center", padding: "12px 0", color: "var(--text-secondary)", fontSize: 13 }}>Loading more…</div>
        )}
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────── */
export default function InstagramManager() {
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const [isDark, setIsDark] = useState(true);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [nextToken, setNextToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [commentType, setCommentType] = useState("all");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [triggerKeywords, setTriggerKeywords] = useState([]);
  const [dmMessage, setDmMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [postFilter, setPostFilter] = useState("all");
  const [instagramAccount, setInstagramAccount] = useState({ accountName: "", username: "", profilePicture: "" });

  /* Apply theme vars whenever isDark changes */
  useEffect(() => {
    if (wrapRef.current) applyTheme(wrapRef.current, isDark ? "dark" : "light");
  }, [isDark]);

  const thumbnailRef = useRef(null);

  useEffect(() => {
    api.get("/insta/profile")
      .then((res) => {
        setAuthenticated(true);
        setInstagramAccount({
          accountName: res.data?.accountName || res.data?.username || "Instagram Account",
          username: res.data?.username || "",
          profilePicture: res.data?.profilePicture || "",
        });
      })
      .catch((e) => { console.log("Not authenticated", e); navigate("/"); });
  }, []);

  const fetchPosts = async (next = null) => {
    try {
      next ? setLoadingMore(true) : setLoading(true);
      const res = await api.get("/insta/media", { params: { next } });
      const fetched = res.data?.posts || [];
      setPosts((prev) => (next ? [...prev, ...fetched] : fetched));
      if (!selectedPost && fetched.length > 0) setSelectedPost(fetched[0]);
      setNextToken(res.data?.next || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setLoadingMore(false); }
  };

  const handleLogout = async () => {
    try { await api.get("/insta/logout"); navigate("/"); }
    catch (e) { console.error(e); alert("Failed to logout."); }
  };

  const handleRemoveAccount = async () => {
    if (!window.confirm("Are you sure you want to remove this Instagram account?")) return;
    try { await api.delete("/insta/removeAccount"); alert("Account removed."); }
    catch (e) { console.error(e); alert("Failed to remove account."); }
  };

  const handleKeywordChange = (val) => {
    setKeywordInput(val);
    setKeywords(val.split(/[,\n]+/).map((w) => w.trim()).filter(Boolean));
  };

  const handleSubmitAutoReply = async () => {
    try {
      await api.post("/insta/automation", {
        postId: selectedPost?.id,
        instagramPostId: selectedPost?.instagramPostId || selectedPost?.id,
        mediaId: selectedPost?.mediaId,
        username: instagramAccount.username,
        autoReply: {
          enabled: autoReplyEnabled,
          replyType: commentType,
          replyAll: commentType === "all",
          keywords: commentType === "specific" ? keywords : [],
          message: dmMessage,
        },
      });
      alert("Auto Reply Settings Saved Successfully");
    } catch (e) { console.error(e); alert("Failed to save Auto Reply Settings"); }
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

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (!selectedPost) return;
    setAutoReplyEnabled(selectedPost.enabled ?? false);
    const replyAll = selectedPost.replyAll ?? true;
    setCommentType(replyAll ? "all" : "specific");
    const kw = selectedPost.keywords || [];
    setKeywords(kw);
    setKeywordInput(kw.join(", "));
    setDmMessage(selectedPost.message || "");
  }, [selectedPost]);

  useEffect(() => {
    const el = thumbnailRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200 && nextToken && !loadingMore)
        fetchPosts(nextToken);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [nextToken, loadingMore]);

  const sidebarProps = {
    thumbnailRef, instagramAccount, posts, selectedPost, setSelectedPost,
    loadingMore, loading, postFilter,
    onFilterChange: setPostFilter,
  };

  /* Initial theme tokens applied inline so first paint is correct */
  const initVars = Object.entries(THEMES[isDark ? "dark" : "light"])
    .reduce((acc, [k, v]) => { acc[k] = v; return acc; }, {});

  return (
    <div
      ref={wrapRef}
      className="ig-wrap"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        ...initVars,
      }}
    >
      {/* Ambient orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }} aria-hidden>
        <div style={{ position: "absolute", top: -120, left: -80, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle,var(--orb1) 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", bottom: -100, right: -60, width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle,var(--orb2) 0%,transparent 70%)` }} />
        <div style={{ position: "absolute", top: "40%", left: "40%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle,var(--orb3) 0%,transparent 70%)` }} />
      </div>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar ig-scroll" style={{
        width: 264, flexShrink: 0, height: "100vh", overflowY: "auto",
        borderRight: "1px solid var(--border)",
        background: "var(--sidebar-bg)", backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile topbar */}
      <div className="mobile-topbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 30, height: 60,
        background: "var(--topbar-bg)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
        alignItems: "center", padding: "0 14px", gap: 10,
      }}>
        {/* Hamburger */}
        <button onClick={() => setDrawerOpen(true)} style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--surface)", border: "1px solid var(--border)",
          color: "var(--text-primary)", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
        }} aria-label="Open menu">☰</button>

        {/* Brand */}
        <span className="syne" style={{ fontWeight: 800, fontSize: 16, flex: 1, color: "var(--text-primary)" }}>
          <span className="ig-grad-text">Instagram</span>
        </span>

        {/* User button — dropdown has theme toggle + logout + remove */}
        <UserButton
          account={instagramAccount}
          onLogout={handleLogout}
          onRemove={handleRemoveAccount}
          isDark={isDark}
          onThemeToggle={() => setIsDark((v) => !v)}
        />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && <div className="sidebar-drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <nav className={`sidebar-drawer ig-scroll ${drawerOpen ? "open" : ""}`}>
        <SidebarContent {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </nav>

      {/* Main content */}
      <main className="ig-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 24px 40px", position: "relative", zIndex: 1 }}>
        {/* Mobile spacer */}
        <div className="mobile-topbar" style={{ height: 60, background: "none", position: "static", backdropFilter: "none", border: "none" }} />

        {/* Main top bar — user dropdown right only */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "14px 0 8px", maxWidth: 820, margin: "0 auto", width: "100%",
        }}>
          <div className="desktop-sidebar" style={{ display: "flex" }}>
            <UserButton
              account={instagramAccount}
              onLogout={handleLogout}
              onRemove={handleRemoveAccount}
              isDark={isDark}
              onThemeToggle={() => setIsDark((v) => !v)}
            />
          </div>
        </div>

        {selectedPost ? (
          <div className="fade-up" style={{ maxWidth: 820, margin: "0 auto", paddingTop: 16, paddingBottom: 40 }}>
            {/* Hero */}
            <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", marginBottom: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
              <img src={selectedPost.image || selectedPost.mediaUrl} alt="" style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.15) 40%,transparent 70%)" }} />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>📸</span>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>@{selectedPost.username || instagramAccount.username}</span>
                </div>
                <h2 className="syne" style={{ color: "#fff", fontSize: "clamp(20px,4vw,28px)", fontWeight: 800, lineHeight: 1.2 }}>Instagram Post</h2>
                {selectedPost.daysAgo && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>{selectedPost.daysAgo}</p>}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
              <div className="stat-chip" style={{ background: "var(--stat1-bg)", border: `1px solid var(--stat1-border)` }}>
                <span className="stat-label" style={{ color: "#f58529" }}>Comments</span>
                <span className="stat-value" style={{ color: "var(--text-primary)" }}>{selectedPost.comments ?? 0}</span>
              </div>
              <div className="stat-chip" style={{ background: "var(--stat2-bg)", border: `1px solid var(--stat2-border)` }}>
                <span className="stat-label" style={{ color: "#8134af" }}>Media Type</span>
                <span className="stat-value" style={{ color: "var(--text-primary)", fontSize: 16 }}>{selectedPost.mediaType || "—"}</span>
              </div>
              <div className="stat-chip" style={{
                background: autoReplyEnabled ? "linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.08))" : "linear-gradient(135deg,rgba(248,113,113,0.1),rgba(239,68,68,0.06))",
                border: `1px solid ${autoReplyEnabled ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.18)"}`,
              }}>
                <span className="stat-label" style={{ color: autoReplyEnabled ? "#4ade80" : "#f87171" }}>Automation</span>
                <span className="stat-value" style={{ color: "var(--text-primary)", fontSize: 16 }}>{autoReplyEnabled ? "Active" : "Paused"}</span>
              </div>
            </div>

            {/* Caption */}
            {selectedPost.caption && (
              <div className="ig-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>📝</span>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Caption</span>
                </div>
                <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: 14 }}>{selectedPost.caption}</p>
              </div>
            )}

            {/* Auto Reply card */}
            <div className="ig-card" style={{ padding: 24, borderColor: "var(--border-accent)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <div>
                  <h3 className="ig-grad-text syne" style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>🤖 Auto Reply</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Automate DMs for <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>@{selectedPost.username || instagramAccount.username}</span>'s post
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={`status-badge ${autoReplyEnabled ? "on" : "off"}`}>
                    <span className="status-dot" />{autoReplyEnabled ? "Enabled" : "Disabled"}
                  </span>
                  <button type="button" onClick={handleToggle} className={`ig-toggle ${autoReplyEnabled ? "on" : "off"}`} aria-label="Toggle auto reply">
                    <span className="ig-toggle-knob">{autoReplyEnabled ? "✓" : ""}</span>
                  </button>
                </div>
              </div>

              {autoReplyEnabled && (
                <>
                  <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />

                  {/* Trigger type */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>
                      Trigger Condition
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[{ value: "all", label: "All Comments", icon: "💬" }, { value: "specific", label: "Keyword Match", icon: "🔍" }].map((opt) => (
                        <label key={opt.value} className={`radio-pill ${commentType === opt.value ? "selected" : ""}`} onClick={() => setCommentType(opt.value)}>
                          <span className="radio-dot" />
                          <span style={{ fontSize: 16 }}>{opt.icon}</span>
                          <span>{opt.label}</span>
                          <input type="radio" name="commentType" value={opt.value} checked={commentType === opt.value} onChange={(e) => setCommentType(e.target.value)} style={{ display: "none" }} />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  {commentType === "specific" && (
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                        Trigger Keywords
                      </label>
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

                  {/* DM message */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>
                      DM Auto Reply Message
                    </label>
                    <textarea rows={4} value={dmMessage} onChange={(e) => setDmMessage(e.target.value)}
                      placeholder={`Write an automated DM message for @${selectedPost.username || instagramAccount.username} followers…`}
                      className="ig-input" style={{ lineHeight: 1.6 }} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button onClick={handleSubmitAutoReply} className="ig-btn-primary">
                      <span>🚀</span><span>Save Settings</span>
                    </button>
                    {selectedPost.permalink && (
                      <a href={selectedPost.permalink} target="_blank" rel="noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "13px 22px", borderRadius: 50,
                        background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)",
                        fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14, textDecoration: "none", transition: "background 0.2s",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "var(--surface)")}>
                        🔗 View on Instagram
                      </a>
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