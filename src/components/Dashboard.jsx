import React, { useEffect, useRef, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

/* ─── Google Fonts injected once ─────────────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
document.head.appendChild(fontLink);

/* ─── Inline global styles ────────────────────────────────────────── */
const globalStyles = `
  :root {
    --bg: #0a0a0f;
    --surface: rgba(255,255,255,0.04);
    --surface-hover: rgba(255,255,255,0.07);
    --border: rgba(255,255,255,0.08);
    --border-accent: rgba(255,100,130,0.35);
    --ig1: #f58529;
    --ig2: #dd2a7b;
    --ig3: #8134af;
    --ig4: #515bd4;
    --text-primary: #f0eef8;
    --text-secondary: #8b8a99;
    --radius: 20px;
    --radius-sm: 12px;
  }

  .ig-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .ig-wrap { font-family: 'DM Sans', sans-serif; }
  .ig-wrap h1,
  .ig-wrap h2,
  .ig-wrap h3,
  .ig-wrap .syne { font-family: 'Syne', sans-serif; }

  /* Scrollbar */
  .ig-scroll::-webkit-scrollbar { width: 4px; }
  .ig-scroll::-webkit-scrollbar-track { background: transparent; }
  .ig-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

  /* Gradient text */
  .ig-grad-text {
    background: linear-gradient(135deg, var(--ig1), var(--ig2), var(--ig3));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Cards */
  .ig-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    backdrop-filter: blur(16px);
    transition: all 0.25s ease;
  }
  .ig-card:hover { background: var(--surface-hover); }

  /* Post thumbnail */
  .post-thumb {
    cursor: pointer;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 2px solid transparent;
    transition: all 0.25s ease;
    position: relative;
  }
  .post-thumb:hover { border-color: rgba(221,42,123,0.5); transform: translateY(-2px); }
  .post-thumb.active {
    border-color: var(--ig2);
    box-shadow: 0 0 0 3px rgba(221,42,123,0.25);
  }
  .post-thumb img { width: 100%; height: 88px; object-fit: cover; display: block; }
  .post-thumb .thumb-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
    padding: 6px;
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .post-thumb .thumb-caption {
    font-size: 10px; color: rgba(255,255,255,0.85);
    font-weight: 500; line-height: 1.3;
    overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }

  /* Toggle */
  .ig-toggle {
    position: relative; display: inline-flex;
    width: 52px; height: 28px;
    border-radius: 14px;
    transition: background 0.3s ease;
    cursor: pointer; border: none; outline: none;
    flex-shrink: 0;
  }
  .ig-toggle.on {
    background: linear-gradient(135deg, var(--ig1), var(--ig2));
    box-shadow: 0 2px 12px rgba(221,42,123,0.45);
  }
  .ig-toggle.off { background: rgba(255,255,255,0.12); }
  .ig-toggle-knob {
    position: absolute; top: 3px; left: 3px;
    width: 22px; height: 22px; border-radius: 50%;
    background: #fff;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px;
  }
  .ig-toggle.on .ig-toggle-knob { transform: translateX(24px); }

  /* Radio pill */
  .radio-pill {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border);
    cursor: pointer; transition: all 0.2s ease;
    background: var(--surface);
    color: var(--text-secondary);
    font-size: 14px; font-weight: 500;
  }
  .radio-pill.selected {
    border-color: var(--ig2);
    background: rgba(221,42,123,0.08);
    color: var(--text-primary);
    box-shadow: 0 0 0 3px rgba(221,42,123,0.12);
  }
  .radio-dot {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid currentColor; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .radio-dot::after {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: var(--ig2); opacity: 0;
    transition: opacity 0.2s;
  }
  .radio-pill.selected .radio-dot::after { opacity: 1; }

  /* Inputs */
  .ig-input {
    width: 100%; background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm); color: var(--text-primary);
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    padding: 12px 14px; resize: none; outline: none;
    transition: border-color 0.2s ease;
  }
  .ig-input:focus { border-color: var(--ig2); background: rgba(221,42,123,0.04); }
  .ig-input::placeholder { color: var(--text-secondary); }

  /* Stat chip */
  .stat-chip {
    padding: 14px 18px; border-radius: var(--radius-sm);
    display: flex; flex-direction: column; gap: 4px;
  }
  .stat-chip .stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.75; }
  .stat-chip .stat-value { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }

  /* Save button */
  .ig-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 28px; border-radius: 50px;
    background: linear-gradient(135deg, var(--ig1), var(--ig2), var(--ig3));
    color: #fff; font-family: 'Syne', sans-serif; font-weight: 700;
    font-size: 15px; border: none; cursor: pointer;
    box-shadow: 0 4px 24px rgba(221,42,123,0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .ig-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(221,42,123,0.55); }
  .ig-btn-primary:active { transform: translateY(0); }

  /* Keyword tag */
  .kw-tag {
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
    background: rgba(221,42,123,0.15); color: #f0a0c0;
    border: 1px solid rgba(221,42,123,0.25);
  }

  /* Status badge */
  .status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  }
  .status-badge.on { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.25); }
  .status-badge.off { background: rgba(248,113,113,0.1); color: #fca5a5; border: 1px solid rgba(248,113,113,0.2); }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .status-badge.on .status-dot { background: #4ade80; }
  .status-badge.off .status-dot { background: #f87171; }

  /* Sidebar drawer (mobile) */
  .sidebar-drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    z-index: 40; backdrop-filter: blur(4px);
  }
  .sidebar-drawer {
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 300px; z-index: 50;
    background: #0f0f1a;
    border-right: 1px solid var(--border);
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(.22,1,.36,1);
  }
  .sidebar-drawer.open { transform: translateX(0); }

  /* Responsive */
  @media (max-width: 768px) {
    .desktop-sidebar { display: none !important; }
    .mobile-topbar { display: flex !important; }
  }
  @media (min-width: 769px) {
    .mobile-topbar { display: none !important; }
    .sidebar-drawer { display: none !important; }
    .sidebar-drawer-overlay { display: none !important; }
  }

  /* Skeleton pulse */
  @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }
  .skeleton { animation: pulse 1.5s ease infinite; background: rgba(255,255,255,0.06); border-radius: 8px; }

  /* Fade-in */
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .fade-up { animation: fadeUp 0.4s ease forwards; }
`;

/* ─── Inject styles ────────────────────────────────────────────────── */
const styleTag = document.createElement("style");
styleTag.textContent = globalStyles;
document.head.appendChild(styleTag);

/* ─── Helpers ─────────────────────────────────────────────────────── */
function autoResizeTextarea(e) {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
}

function highlightKeywords(text, keywords) {
  if (!keywords?.length) return text;
  const regex = new RegExp(
    `\\b(${keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
    "gi"
  );
  return text.replace(
    regex,
    '<span style="background:rgba(245,133,41,0.35);color:#fbbf24;border-radius:4px;padding:0 3px;">$&</span>'
  );
}

/* ─── Sidebar content (shared between desktop & mobile drawer) ─────── */
function SidebarContent({
  thumbnailRef,
  instagramAccount,
  posts,
  selectedPost,
  setSelectedPost,
  loadingMore,
  loading,
  handleLogout,
  handleRemoveAccount,
  onClose,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Profile header */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border)",
          background:
            "linear-gradient(160deg, rgba(245,133,41,0.12), rgba(129,52,175,0.12))",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {instagramAccount.profilePicture ? (
            <img
              src={instagramAccount.profilePicture}
              alt="Profile"
              style={{
                width: 48, height: 48, borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid",
                borderColor: "var(--ig2)",
                boxShadow: "0 0 16px rgba(221,42,123,0.4)",
              }}
            />
          ) : (
            <div
              className="skeleton"
              style={{ width: 48, height: 48, borderRadius: "50%" }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="syne"
              style={{
                fontWeight: 700, fontSize: 15,
                color: "var(--text-primary)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {instagramAccount.accountName || "Instagram Account"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              @{instagramAccount.username}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.07)", border: "none",
                color: "var(--text-secondary)", width: 30, height: 30,
                borderRadius: "50%", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleLogout}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
          >
            Logout
          </button>
          <button
            onClick={handleRemoveAccount}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 10,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#fca5a5", fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.2)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Section label */}
      <div
        style={{
          padding: "12px 16px 8px",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--text-secondary)",
          flexShrink: 0,
        }}
      >
        Posts
      </div>

      {/* Thumbnails grid */}
      <div
        ref={thumbnailRef}
        className="ig-scroll"
        style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}
      >
        {loading && posts.length === 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 10 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className={`post-thumb ${selectedPost?.id === post.id ? "active" : ""}`}
                onClick={() => { setSelectedPost(post); onClose?.(); }}
              >
                <img src={post.image || post.mediaUrl} alt="" />
                <div className="thumb-overlay">
                  <div className="thumb-caption">{post.caption || "Instagram Post"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {loadingMore && (
          <div style={{ textAlign: "center", padding: "12px 0", color: "var(--text-secondary)", fontSize: 13 }}>
            Loading more…
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function InstagramManager() {
  const navigate = useNavigate();
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
  const [instagramAccount, setInstagramAccount] = useState({
    accountName: "",
    username: "",
    profilePicture: "",
  });

  const thumbnailRef = useRef(null);

  useEffect(() => {
    api
      .get("/insta/profile")
      .then((response) => {
        setAuthenticated(true);
        setInstagramAccount({
          accountName:
            response.data?.accountName || response.data?.username || "Instagram Account",
          username: response.data?.username || "",
          profilePicture: response.data?.profilePicture || "",
        });
      })
      .catch((e) => {
        console.log("Not authenticated", e);
        navigate("/");
      });
  }, []);

  const fetchPosts = async (next = null) => {
    try {
      next ? setLoadingMore(true) : setLoading(true);
      const response = await api.get("/insta/media", { params: { next } });
      const fetchedPosts = response.data?.posts || [];
      setPosts((prev) => (next ? [...prev, ...fetchedPosts] : fetchedPosts));
      if (!selectedPost && fetchedPosts.length > 0) setSelectedPost(fetchedPosts[0]);
      setNextToken(response.data?.next || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.get("/insta/logout");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Failed to logout Instagram account.");
    }
  };

  const handleRemoveAccount = async () => {
    if (!window.confirm("Are you sure you want to remove this Instagram account?")) return;
    try {
      await api.delete("/insta/removeAccount");
      alert("Instagram account removed successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to remove Instagram account.");
    }
  };

  const handleKeywordChange = (value) => {
    setKeywordInput(value);
    const keywordArray = value.split(/[,\n]+/).map((w) => w.trim()).filter(Boolean);
    setKeywords(keywordArray);
  };

  const handleSubmitAutoReply = async () => {
    try {
      const payload = {
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
      };
      await api.post("/insta/automation", payload);
      alert("Auto Reply Settings Saved Successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to save Auto Reply Settings");
    }
  };

  const handleToggle = async () => {
    const newValue = !autoReplyEnabled;
    setAutoReplyEnabled(newValue);
    if (!newValue) {
      try {
        await api.post("/insta/automation", {
          instagramPostId: selectedPost?.instagramPostId || selectedPost?.id,
          autoReply: { enabled: false },
        });
      } catch (error) {
        console.error(error);
        setAutoReplyEnabled(true);
      }
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    if (!selectedPost) return;
    setAutoReplyEnabled(selectedPost.enabled ?? false);
    const replyAll = selectedPost.replyAll ?? true;
    setCommentType(replyAll ? "all" : "specific");
    const postKeywords = selectedPost.keywords || [];
    setKeywords(postKeywords);
    setKeywordInput(postKeywords.join(", "));
    setDmMessage(selectedPost.message || "");
  }, [selectedPost]);

  useEffect(() => {
    const container = thumbnailRef.current;
    if (!container) return;
    const handleScroll = () => {
      const reachedBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 200;
      if (reachedBottom && nextToken && !loadingMore) fetchPosts(nextToken);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [nextToken, loadingMore]);

  const sidebarProps = {
    thumbnailRef,
    instagramAccount,
    posts,
    selectedPost,
    setSelectedPost,
    loadingMore,
    loading,
    handleLogout,
    handleRemoveAccount,
  };

  return (
    <div
      className="ig-wrap"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background orbs */}
      <div
        style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div style={{
          position: "absolute", top: -120, left: -80,
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,133,41,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: -100, right: -60,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(129,52,175,0.1) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "40%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(81,91,212,0.06) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className="desktop-sidebar ig-scroll"
        style={{
          width: 264,
          flexShrink: 0,
          height: "100vh",
          overflowY: "auto",
          borderRight: "1px solid var(--border)",
          background: "rgba(15,15,26,0.85)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────── */}
      <div
        className="mobile-topbar"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
          height: 60,
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: 12,
        }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Open menu"
        >
          ☰
        </button>

        {instagramAccount.profilePicture && (
          <img
            src={instagramAccount.profilePicture}
            alt="Profile"
            style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
          />
        )}
        <span
          className="syne"
          style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}
        >
          {instagramAccount.accountName || "Instagram"}
        </span>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="sidebar-drawer-overlay"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <nav className={`sidebar-drawer ig-scroll ${drawerOpen ? "open" : ""}`}>
        <SidebarContent {...sidebarProps} onClose={() => setDrawerOpen(false)} />
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main
        className="ig-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 24px",
          paddingTop: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Mobile spacer for fixed topbar */}
        <div className="mobile-topbar" style={{ height: 60, background: "none", position: "static", backdropFilter: "none", border: "none" }} />

        {selectedPost ? (
          <div
            className="fade-up"
            style={{ maxWidth: 820, margin: "0 auto", paddingTop: 24, paddingBottom: 40 }}
          >
            {/* Hero image */}
            <div
              style={{
                borderRadius: 24, overflow: "hidden",
                position: "relative", marginBottom: 24,
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
              }}
            >
              <img
                src={selectedPost.image || selectedPost.mediaUrl}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: 420,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "5px 12px", borderRadius: 20,
                    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 14 }}>📸</span>
                  <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                    @{selectedPost.username || instagramAccount.username}
                  </span>
                </div>
                <h2
                  className="syne"
                  style={{ color: "#fff", fontSize: "clamp(20px,4vw,30px)", fontWeight: 800, lineHeight: 1.2 }}
                >
                  Instagram Post
                </h2>
                {selectedPost.daysAgo && (
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                    {selectedPost.daysAgo}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12, marginBottom: 20,
              }}
            >
              <div className="stat-chip" style={{ background: "linear-gradient(135deg, rgba(245,133,41,0.15), rgba(221,42,123,0.1))", border: "1px solid rgba(245,133,41,0.2)" }}>
                <span className="stat-label" style={{ color: "#f58529" }}>Comments</span>
                <span className="stat-value" style={{ color: "var(--text-primary)" }}>{selectedPost.comments ?? 0}</span>
              </div>
              <div className="stat-chip" style={{ background: "linear-gradient(135deg, rgba(129,52,175,0.15), rgba(81,91,212,0.1))", border: "1px solid rgba(129,52,175,0.2)" }}>
                <span className="stat-label" style={{ color: "#8134af" }}>Media Type</span>
                <span className="stat-value" style={{ color: "var(--text-primary)", fontSize: 16 }}>{selectedPost.mediaType || "—"}</span>
              </div>
              <div className="stat-chip" style={{ background: autoReplyEnabled ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))" : "linear-gradient(135deg, rgba(248,113,113,0.1), rgba(239,68,68,0.06))", border: `1px solid ${autoReplyEnabled ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.18)"}` }}>
                <span className="stat-label" style={{ color: autoReplyEnabled ? "#4ade80" : "#f87171" }}>Automation</span>
                <span className="stat-value" style={{ color: "var(--text-primary)", fontSize: 16 }}>{autoReplyEnabled ? "Active" : "Paused"}</span>
              </div>
            </div>

            {/* Caption card */}
            {selectedPost.caption && (
              <div className="ig-card" style={{ padding: "18px 20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 14 }}>📝</span>
                  <span className="syne" style={{ fontWeight: 700, fontSize: 14, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Caption
                  </span>
                </div>
                <p style={{ color: "var(--text-primary)", lineHeight: 1.7, fontSize: 14 }}>
                  {selectedPost.caption}
                </p>
              </div>
            )}

            {/* Auto-reply settings card */}
            <div
              className="ig-card"
              style={{ padding: "24px", border: "1px solid var(--border-accent)" }}
            >
              {/* Card header */}
              <div
                style={{
                  display: "flex", alignItems: "flex-start",
                  justifyContent: "space-between", gap: 12, marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3
                    className="ig-grad-text syne"
                    style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}
                  >
                    🤖 Auto Reply
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                    Automate DMs for comments on{" "}
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                      @{selectedPost.username || instagramAccount.username}
                    </span>
                    's post
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className={`status-badge ${autoReplyEnabled ? "on" : "off"}`}
                  >
                    <span className="status-dot" />
                    {autoReplyEnabled ? "Enabled" : "Disabled"}
                  </span>

                  <button
                    type="button"
                    onClick={handleToggle}
                    className={`ig-toggle ${autoReplyEnabled ? "on" : "off"}`}
                    aria-label="Toggle auto reply"
                  >
                    <span className="ig-toggle-knob">
                      {autoReplyEnabled ? "✓" : ""}
                    </span>
                  </button>
                </div>
              </div>

              {autoReplyEnabled && (
                <>
                  {/* Divider */}
                  <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />

                  {/* Reply type */}
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--text-secondary)", marginBottom: 10,
                      }}
                    >
                      Trigger Condition
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { value: "all", label: "All Comments", icon: "💬" },
                        { value: "specific", label: "Keyword Match", icon: "🔍" },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`radio-pill ${commentType === opt.value ? "selected" : ""}`}
                          onClick={() => setCommentType(opt.value)}
                        >
                          <span className="radio-dot" />
                          <span style={{ fontSize: 16 }}>{opt.icon}</span>
                          <span>{opt.label}</span>
                          <input
                            type="radio"
                            name="commentType"
                            value={opt.value}
                            checked={commentType === opt.value}
                            onChange={(e) => setCommentType(e.target.value)}
                            style={{ display: "none" }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Keywords */}
                  {commentType === "specific" && (
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block", fontSize: 12, fontWeight: 700,
                          letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "var(--text-secondary)", marginBottom: 8,
                        }}
                      >
                        Trigger Keywords
                      </label>
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute", inset: 0, pointerEvents: "none",
                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                            borderRadius: 12, border: "1.5px solid transparent",
                            padding: "12px 14px", color: "transparent",
                            overflow: "hidden", lineHeight: 1.5, fontSize: 14,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: highlightKeywords(keywordInput, triggerKeywords),
                          }}
                        />
                        <textarea
                          rows={1}
                          value={keywordInput}
                          onChange={(e) => {
                            handleKeywordChange(e.target.value);
                            autoResizeTextarea(e);
                          }}
                          placeholder="price, details, catalog, menu…"
                          className="ig-input"
                          style={{ minHeight: 48, lineHeight: 1.5 }}
                        />
                      </div>

                      {keywords.length > 0 && (
                        <div
                          style={{
                            display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10,
                          }}
                        >
                          {keywords.map((keyword, index) => (
                            <span key={`${keyword}-${index}`} className="kw-tag">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DM message */}
                  <div style={{ marginBottom: 24 }}>
                    <label
                      style={{
                        display: "block", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        color: "var(--text-secondary)", marginBottom: 8,
                      }}
                    >
                      DM Auto Reply Message
                    </label>
                    <textarea
                      rows={4}
                      value={dmMessage}
                      onChange={(e) => setDmMessage(e.target.value)}
                      placeholder={`Write an automated DM message for @${selectedPost.username || instagramAccount.username} followers…`}
                      className="ig-input"
                      style={{ lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Save button */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <button
                      onClick={handleSubmitAutoReply}
                      className="ig-btn-primary"
                    >
                      <span>🚀</span>
                      <span>Save Settings</span>
                    </button>

                    {selectedPost.permalink && (
                      <a
                        href={selectedPost.permalink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "13px 22px", borderRadius: 50,
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid var(--border)",
                          color: "var(--text-primary)",
                          fontFamily: "'Syne', sans-serif",
                          fontWeight: 600, fontSize: 14,
                          textDecoration: "none",
                          transition: "background 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                        onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                      >
                        🔗 View on Instagram
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1, display: "flex", alignItems: "center",
              justifyContent: "center", minHeight: "60vh",
            }}
          >
            <div style={{ textAlign: "center", padding: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
              <h2
                className="ig-grad-text syne"
                style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}
              >
                Select a Post
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
                Choose a post from the panel to configure automation.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}