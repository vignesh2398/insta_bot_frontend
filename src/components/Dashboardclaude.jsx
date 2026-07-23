import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";
import "./Dashboardclaude.css";

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
      <div className="cap-banner__meta">
        <div className="cap-banner__label">Account DM Cap</div>
        <div className="cap-banner__count" style={{ color: countColor }}>
          {sentToday} / {cap} sent today
        </div>
      </div>
      <div className="cap-bar-track">
        <div className="cap-bar-fill" style={{ width: `${pct}%`, background: fillColor }} />
      </div>
      <div className="cap-banner__remaining">
        <div style={{ fontSize: 13, fontWeight: 700, color: countColor }}>{cap - sentToday}</div>
        <div style={{ fontSize: 10, color: "var(--text-muted)" }}>remaining</div>
      </div>
      {danger && (
        <div className="cap-banner__warning">
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
    <div ref={ref} className="user-menu-wrap">
      <button className="user-btn" onClick={() => setOpen((v) => !v)}>
        {account.profilePicture
          ? <img src={account.profilePicture} alt="avatar" className="user-btn-avatar" />
          : <span className="user-btn-avatar-placeholder">{initials(account.accountName)}</span>}
        <span className="user-btn-label">
          {account.accountName || "Account"}
        </span>
        <span className={`user-btn-chevron ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="user-menu">
          <div className="user-menu-header">
            {account.profilePicture
              ? <img src={account.profilePicture} alt="avatar" className="user-menu-avatar" />
              : <span className="user-btn-avatar-placeholder user-menu-avatar-placeholder">{initials(account.accountName)}</span>}
            <div>
              <div className="user-menu-name">{account.accountName || "Instagram Account"}</div>
              <div className="user-menu-handle">@{account.username}</div>
            </div>
          </div>
          <div className="user-menu-divider" />
          <button className="user-menu-item" onClick={() => { onLogout(); setOpen(false); }}>
            <span className="user-menu-icon">🚪</span><span>Logout</span>
          </button>
          <button className="user-menu-item danger" onClick={() => { onRemove(); setOpen(false); }}>
            <span className="user-menu-icon">🗑️</span><span>Remove Account</span>
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
    <div className="sidebar-shell">
      <div className="sidebar-filter-bar">
        {[
          { key: "all",     label: "All",     icon: "◉" },
          { key: "running", label: "Running", icon: "▶" },
          { key: "paused",  label: "Paused",  icon: "⏸" },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => { onFilterChange(key); onClose?.(); }}
            className={`sidebar-filter-pill ${postFilter === key ? "active" : ""} ${key === "running" ? "running" : key === "paused" ? "paused" : "all"}`}>
            <span className="sidebar-filter-icon">{icon}</span>{label}
          </button>
        ))}
        {onClose && (
          <button onClick={onClose} className="sidebar-close-btn">×</button>
        )}
      </div>
      <div ref={thumbnailRef} className="ig-scroll sidebar-post-list">
        {loading && posts.length === 0 ? (
          <div className="sidebar-post-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton sidebar-post-skeleton" />)}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="sidebar-empty-state">
            <div className="sidebar-empty-icon">🔍</div>
            <div className="sidebar-empty-text">No posts match</div>
          </div>
        ) : (
          <div className="sidebar-post-grid">
            {filteredPosts.map((post) => (
              <div key={post.id} className={`post-thumb ${selectedPost?.id === post.id ? "active" : ""}`}
                onClick={() => { setSelectedPost(post); onClose?.(); }}>
                <img src={post.image || post.mediaUrl} alt="" />
                <div className="thumb-overlay">
                  <div className="thumb-meta-row">
                    <div className="thumb-caption">{post.caption || "Instagram Post"}</div>
                    {post.enabled && <span className="thumb-status-dot" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loadingMore && <div className="sidebar-loading-more">Loading more…</div>}
      </div>
    </div>
  );
}

/* ─── AnalyticsSection ─────────────────────────────────────────────── */
function AnalyticsSection({ analytics, analyticsLoading }) {
  if (analyticsLoading) return (
    <div className="analytics-grid analytics-grid--loading">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton analytics-skeleton" />)}
    </div>
  );
  const stats = [
    { label: "Comments",   value: analytics?.comments  ?? 0,    color: "#f58529", bg: "linear-gradient(135deg,rgba(245,133,41,0.15),rgba(221,42,123,0.1))", border: "rgba(245,133,41,0.22)" },
    { label: "DMs Sent",   value: analytics?.dmsSent   ?? 0,    color: "#8b8fff", bg: "linear-gradient(135deg,rgba(81,91,212,0.15),rgba(129,52,175,0.1))",  border: "rgba(81,91,212,0.22)" },
    { label: "Conversion", value: `${analytics?.conversionRate ?? 0}%`, color: "#4ade80", bg: "linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.08))", border: "rgba(34,197,94,0.2)" },
    { label: "Reach",      value: analytics?.reach      ?? 0,   color: "#fbbf24", bg: "linear-gradient(135deg,rgba(245,133,41,0.10),rgba(251,191,36,0.07))", border: "rgba(251,191,36,0.2)" },
  ];
  return (
    <div className="analytics-grid">
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
    <div className="section-block">
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
        className="ig-input follow-template-input"
      />
      <div className="follow-template-help">
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
    <div className="smart-controls-grid">
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
            className={`smart-control-card ${active ? "active" : ""}`}
            style={{ background: bgColor, border: `2px solid ${borderColor}`, boxShadow: active ? `0 2px 16px ${activeBg[mode]}` : "none" }}>
            <div className="smart-control-badge" style={{ background: active ? "rgba(74,222,128,0.18)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"), color: active ? "#4ade80" : (isDark ? "#a09fb5" : "#6b6880"), border: active ? "1px solid rgba(74,222,128,0.35)" : (isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.10)") }}>
              {active ? "ON" : "OFF"}
            </div>
            <div className="smart-control-icon" style={{ background: active ? borderColor : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"), border: `1.5px solid ${active ? borderColor : "var(--border)"}` }}>{icon}</div>
            <div className="smart-control-content">
              <div className="smart-control-label" style={{ color: labelColor }}>{label}</div>
              <div className="smart-control-sub" style={{ color: subColor }}>{sub}</div>
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
    <div className="section-block">
      <div className="variants-header">
        <span className="section-label" style={{ marginBottom: 0 }}>Message Variants</span>
        {variants.length < 3 && (
          <button onClick={addVariant} className="variants-add-btn">+ Add variant</button>
        )}
      </div>
      {variants.map((v, i) => (
        <div key={i} className="variant-row">
          <textarea rows={2} value={v} onChange={(e) => updateVariant(i, e.target.value)} placeholder={`Variant ${i + 1}…`} className="ig-input variant-textarea" />
          {variants.length > 1 && (
            <button onClick={() => removeVariant(i)} className="variant-remove-btn">×</button>
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
    <div className="topbar-actions">
      <button className="theme-btn" onClick={handleThemeToggle} title={isDark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle theme">
        {isDark ? "☀️" : "🌙"}
      </button>
      <UserButton account={instagramAccount} onLogout={handleLogout} onRemove={handleRemoveAccount} />
    </div>
  );

  return (
    <div ref={wrapRef} className="ig-wrap ig-dashboard-shell" style={{ ...initVars }}>

      {/* Ambient orbs */}
      <div className="ig-ambient-layer" aria-hidden>
        <div className="ig-ambient-orb ig-ambient-orb--one" />
        <div className="ig-ambient-orb ig-ambient-orb--two" />
      </div>

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar ig-scroll ig-desktop-sidebar">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile topbar */}
      <div className="mobile-topbar ig-mobile-topbar">
        <button onClick={() => setDrawerOpen(true)} className="mobile-nav-btn">☰</button>
        <span className="syne mobile-topbar-title"><span className="ig-grad-text">Instagram</span></span>
        <TopbarActions />
      </div>

      {drawerOpen && <div className="sidebar-drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <nav className={`sidebar-drawer ig-scroll ${drawerOpen ? "open" : ""}`}>
        <SidebarContent {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </nav>

      {/* Main */}
      <main className="ig-scroll ig-main-content">
        <div className="mobile-topbar ig-mobile-topbar-spacer" />

        {/* Desktop topbar row */}
        <div className="ig-topbar-row">
          <div className="desktop-sidebar">
            <TopbarActions />
          </div>
        </div>

        {/* Account-level Daily DM Cap banner */}
        <div className="ig-page-frame">
          <DailyCapBanner profile={profile} />
        </div>

        {selectedPost ? (
          <div className="fade-up ig-page-shell">

            {/* Hero */}
            <div className="ig-hero-card">
              <img src={selectedPost.image || selectedPost.mediaUrl} alt="" className="ig-hero-media" />
              <div className="ig-hero-overlay" />

              <div className="ig-hero-content">
                <div className="ig-hero-badge">
                  <span style={{ fontSize: 14 }}>📸</span>
                  <span className="ig-hero-badge-text">@{selectedPost.username || instagramAccount.username}</span>
                </div>
                <h2 className={`syne ig-hero-title ${selectedPost.daysAgo ? "ig-hero-title--compact" : ""}`}>Instagram Post</h2>
                {selectedPost.daysAgo && <p className="ig-hero-subtitle">{selectedPost.daysAgo}</p>}

                <div className="ig-hero-stats-grid">
                  {analyticsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="ig-hero-stat-skeleton" />
                      ))
                    : [
                        { label: "Comments",   value: analytics?.comments          ?? 0,    color: "#f58529", border: "rgba(245,133,41,0.4)"  },
                        { label: "DMs Sent",   value: analytics?.dmsSent           ?? 0,    color: "#8b8fff", border: "rgba(139,143,255,0.4)" },
                        { label: "Conversion", value: `${analytics?.conversionRate ?? 0}%`, color: "#4ade80", border: "rgba(74,222,128,0.4)"  },
                        { label: "Reach",      value: analytics?.reach             ?? 0,    color: "#fbbf24", border: "rgba(251,191,36,0.4)"  },
                      ].map((s) => (
                        <div key={s.label} className="ig-hero-stat-card" style={{ border: `1px solid ${s.border}` }}>
                          <span className="ig-hero-stat-label" style={{ color: s.color }}>{s.label}</span>
                          <span className="ig-hero-stat-value">{s.value}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            </div>

            {selectedPost.caption && (
              <div className="ig-card ig-card-section">
                <div className="caption-header">
                  <span>📝</span>
                  <span className="syne caption-label">Caption</span>
                </div>
                <p className="caption-text">{selectedPost.caption}</p>
              </div>
            )}

            {/* Auto Reply card */}
            <div className="ig-card ig-card-section--compact" style={{ borderColor: "var(--border-accent)" }}>
              <div className="ig-auto-reply-head">
                <div>
                  <h3 className="ig-grad-text syne ig-auto-reply-title">🤖 Auto Reply</h3>
                  <p className="ig-auto-reply-subtitle">
                    Automate DMs for <strong>@{selectedPost.username || instagramAccount.username}</strong>'s post
                  </p>
                </div>
                <div className="ig-auto-reply-actions">
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
                  <div className="ig-divider" />
                  <span className="section-label">Trigger Condition</span>
                  <div className="ig-trigger-grid">
                    {[{ value: "all", label: "All Comments", icon: "💬" }, { value: "specific", label: "Keyword Match", icon: "🔍" }].map((opt) => (
                      <label key={opt.value} className={`radio-pill ${commentType === opt.value ? "selected" : ""}`} onClick={() => setCommentType(opt.value)}>
                        <span className="radio-dot" />
                        <span className="trigger-option-icon">{opt.icon}</span>
                        <span>{opt.label}</span>
                        <input className="ig-radio-input" type="radio" name="commentType" value={opt.value} checked={commentType === opt.value} onChange={(e) => setCommentType(e.target.value)} />
                      </label>
                    ))}
                  </div>

                  {commentType === "specific" && (
                    <div className="section-block">
                      <span className="section-label">Trigger Keywords</span>
                      <div className="ig-keyword-overlay">
                        <div className="ig-keyword-preview"
                          dangerouslySetInnerHTML={{ __html: highlightKeywords(keywordInput, triggerKeywords) }} />
                        <textarea rows={1} value={keywordInput}
                          onChange={(e) => { handleKeywordChange(e.target.value); autoResizeTextarea(e); }}
                          placeholder="price, details, catalog, menu…" className="ig-input ig-input--compact" />
                      </div>
                      {keywords.length > 0 && (
                        <div className="ig-keywords-list">
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
                    <div className="section-block section-block--compact">
                      <span className="section-label">
                        {smartSettings.followToDm ? "DM Message (sent after they follow)" : "DM Auto Reply Message"}
                      </span>
                      <textarea rows={4} value={dmMessage} onChange={(e) => setDmMessage(e.target.value)}
                        placeholder={
                          smartSettings.followToDm
                            ? `Write the DM to send once @${selectedPost.username || instagramAccount.username} followers follow your page…`
                            : `Write an automated DM for @${selectedPost.username || instagramAccount.username} followers…`
                        }
                        className="ig-input ig-input--message" />
                    </div>
                  )}

                  {smartSettings.personalizeMessage && (
                    <div className="token-row">
                      <span className="token-row-label">Insert:</span>
                      {["{name}", "{username}", "{keyword}"].map((t) => (
                        <button key={t} className="token-tag" onClick={() => insertToken(t)}>{t}</button>
                      ))}
                    </div>
                  )}

                  <div className="ig-action-row">
                    <button onClick={handleSubmitAutoReply} className="ig-btn-primary"><span>🚀</span><span>Save Settings</span></button>
                    <button onClick={handleDuplicateSettings} className="ig-btn-secondary"><span>⧉</span><span>Copy to another post</span></button>
                    {selectedPost.permalink && (
                      <a href={selectedPost.permalink} target="_blank" rel="noreferrer" className="ig-btn-secondary ig-link-button">🔗 View on Instagram</a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="ig-empty-state">
            <div className="ig-empty-state-inner">
              <div className="ig-empty-state-icon">📸</div>
              <h2 className="ig-grad-text syne ig-empty-state-title">Select a Post</h2>
              <p className="ig-empty-state-desc">Choose a post from the panel to configure automation.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}