
import React, { useEffect, useRef, useState } from "react";
import api from "../services/axios";
import { useNavigate } from "react-router-dom";

export default function InstagramManager() {
  const navigate = useNavigate()
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
  const [instagramAccount, setInstagramAccount] = useState({
    accountName: "",
    username: "",
    profilePicture: "",
  });

  useEffect(() => {
  api.get("/insta/profile")
    .then((response) => {setAuthenticated(true)
           
      setInstagramAccount({
        accountName:
          response.data?.accountName ||
          response.data?.username ||
          "Instagram Account",
        username: response.data?.username || "",
        profilePicture: response.data?.profilePicture || "",
      });


    })
    .catch((e) =>{ 
      console.log("Not authenticated", e);
      navigate("/")});
}, []);





  const thumbnailRef = useRef(null);

  const fetchPosts = async (next = null) => {
    try {
      next ? setLoadingMore(true) : setLoading(true);

      const response = await api.get("/insta/media", {
        params: { next },
      });

      const fetchedPosts = response.data?.posts || [];

      setPosts((prev) =>
        next ? [...prev, ...fetchedPosts] : fetchedPosts
      );

      if (!selectedPost && fetchedPosts.length > 0) {
        setSelectedPost(fetchedPosts[0]);
      }



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
      await api.post("/insta/logout");
      alert("Instagram account logged out successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to logout Instagram account.");
    }
  };

  const handleRemoveAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this Instagram account?"
    );

    if (!confirmed) return;

    try {
      await api.delete("/insta/account");
      alert("Instagram account removed successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to remove Instagram account.");
    }
  };

  const handleKeywordChange = (value) => {
    setKeywordInput(value);

    const keywordArray = value
      .split(/[,\n]+/)
      .map((word) => word.trim())
      .filter(Boolean);

    setKeywords(keywordArray);
  };

  const handleSubmitAutoReply = async () => {
    try {
      const payload = {
        postId: selectedPost?.id,
        instagramPostId:
          selectedPost?.instagramPostId || selectedPost?.id,
        mediaId: selectedPost?.mediaId,
        username: instagramAccount.username,
        autoReply: {
          enabled: autoReplyEnabled,
          replyType: commentType,
          replyAll: commentType === "all",
          keywords:
            commentType === "specific" ? keywords : [],
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

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!selectedPost) return;

    const enabled = selectedPost.enabled ?? false;
    const replyAll = selectedPost.replyAll ?? true;
    const postKeywords = selectedPost.keywords || [];
    const message = selectedPost.message || "";

    setAutoReplyEnabled(enabled);
    setCommentType(replyAll ? "all" : "specific");
    setKeywords(postKeywords);
    setKeywordInput(postKeywords.join(", "));
    setDmMessage(message);
  }, [selectedPost]);

  useEffect(() => {
    const container = thumbnailRef.current;

    if (!container) return;

    const handleScroll = () => {
      const reachedBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 200;

      if (reachedBottom && nextToken && !loadingMore) {
        fetchPosts(nextToken);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [nextToken, loadingMore]);

  const highlightKeywords = 
  (text, keywords) => 
    { if (!keywords?.length)
       return text; const regex = new RegExp( `\\b(${keywords .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") ) .join("|")})\\b`, "gi" ); 
       return text.replace( regex, '<span class="bg-yellow-300 text-black rounded px-1">$&</span>' );
       };


       const handleToggle = async () => {
  const newValue = !autoReplyEnabled;

  setAutoReplyEnabled(newValue);

  // Call API when disabling
  if (!newValue) {
    try {
      await api.post("/insta/automation", {
        instagramPostId:
          selectedPost?.instagramPostId || selectedPost?.id,
        autoReply: {
          enabled: false,
        },
      });


    } catch (error) {
      console.error(error);

      // Revert UI if API fails
      setAutoReplyEnabled(true);

    }
  }
};
  return (
    <div className="h-screen flex bg-gradient-to-br from-fuchsia-100 via-purple-50 to-cyan-100">
      <div
        ref={thumbnailRef}
        className="w-96 overflow-y-auto border-r border-white/30 backdrop-blur-xl bg-white/70 shadow-2xl"
      >
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 text-white">
          <div className="p-5">
            <div className="flex items-center gap-4">
              {instagramAccount.profilePicture ? (
                <img
                  src={instagramAccount.profilePicture}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/30" />
              )}

              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {instagramAccount.accountName}
                </h3>
                <p className="text-sm text-pink-100">
                  @{instagramAccount.username}
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleLogout}
                className="flex-1 py-2 rounded-xl bg-white text-purple-700 font-semibold shadow hover:scale-105 transition"
              >
                Logout
              </button>

              <button
                onClick={handleRemoveAccount}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold shadow hover:bg-red-600 hover:scale-105 transition"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="px-5 py-3 bg-black/10 font-semibold">
            📸 Instagram Posts
          </div>
        </div>

        <div className="p-3 space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${selectedPost?.id === post.id
                  ? "ring-4 ring-pink-500 shadow-2xl scale-[1.02]"
                  : "hover:scale-[1.02] hover:shadow-xl"
                }`}
            >
              <div className="relative">
                <img
                  src={post.image || post.mediaUrl}
                  alt=""
                  className="w-full h-44 object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="font-semibold text-sm">
                    @{post.username || instagramAccount.username}
                  </div>
                  <div className="text-xs text-white/80 truncate">
                    {post.caption || "Instagram Post"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loadingMore && (
          <div className="p-5 text-center text-purple-600 font-medium">
            Loading more posts...
          </div>
        )}

        {loading && posts.length === 0 && (
          <div className="p-5 text-center text-purple-600 font-medium">
            Loading Instagram Posts...
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedPost ? (
          <div className="max-w-6xl mx-auto p-8">
            <div className="overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="relative">
                <img
                  src={selectedPost.image || selectedPost.mediaUrl}
                  alt=""
                  className="w-full h-[520px] object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 text-white">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md mb-3">
                    <span className="text-pink-300">📸</span>
                    <span className="font-semibold">
                      @{selectedPost.username || instagramAccount.username}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold">
                    Instagram Post
                  </h2>

                  <p className="text-white/80">
                    {selectedPost.daysAgo}
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow">
                    👤 @{selectedPost.username || instagramAccount.username}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium">
                    Post ID: {selectedPost.id}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <div className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white p-5 shadow-lg">
                    <p className="text-sm opacity-90">Comments</p>
                    <h3 className="text-3xl font-bold">
                      {selectedPost.comments || 0}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-5 shadow-lg">
                    <p className="text-sm opacity-90">Media Type</p>
                    <h3 className="text-xl font-bold">
                      {selectedPost.mediaType}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-5 shadow-lg">
                    <p className="text-sm opacity-90">Automation</p>
                    <h3 className="text-xl font-bold">
                      {autoReplyEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </h3>
                  </div>
                </div>

                <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-purple-50 p-6 border border-purple-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📝</span>
                    <h3 className="font-bold text-xl text-gray-800">
                      Caption by @{selectedPost.username || instagramAccount.username}
                    </h3>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    {selectedPost.caption}
                  </p>
                </div>

                <div className="mt-8 rounded-3xl bg-white border border-purple-100 shadow-lg p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        🤖 Auto Reply Settings
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Configure automation for comments on{" "}
                        <span className="font-semibold text-purple-700">
                          @{selectedPost.username || instagramAccount.username}
                        </span>
                        's post
                      </p>
                    </div>

<button
  type="button"
  onClick={handleToggle}
  className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all duration-300 shadow-lg ${
    autoReplyEnabled
      ? "bg-gradient-to-r from-pink-500 to-purple-600"
      : "bg-slate-300"
  }`}
>
  <span
    className={`absolute left-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-all duration-300 ${
      autoReplyEnabled ? "translate-x-10" : "translate-x-0"
    }`}
  >
    {autoReplyEnabled ? "✓" : ""}
  </span>
</button>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${autoReplyEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {autoReplyEnabled
                        ? "✅ Auto Reply Enabled"
                        : "❌ Auto Reply Disabled"}
                    </span>
                  </div>

                  {autoReplyEnabled && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-pink-200 bg-pink-50">
                          <input
                            type="radio"
                            name="commentType"
                            value="all"
                            checked={commentType === "all"}
                            onChange={(e) =>
                              setCommentType(e.target.value)
                            }
                          />
                          <span className="font-medium">
                            Reply to All Comments
                          </span>
                        </label>

                        <label className="flex items-center gap-3 p-4 rounded-2xl border border-purple-200 bg-purple-50">
                          <input
                            type="radio"
                            name="commentType"
                            value="specific"
                            checked={
                              commentType === "specific"
                            }
                            onChange={(e) =>
                              setCommentType(e.target.value)
                            }
                          />
                          <span className="font-medium">
                            Reply Using Keywords
                          </span>
                        </label>
                      </div>

                      {commentType === "specific" && (
                        <div className="mt-6">
                          <label className="block font-semibold mb-2">
                            Trigger Keywords
                          </label>

<div className="relative"> <div className="absolute inset-0 pointer-events-none whitespace-pre-wrap break-words rounded-2xl border-2 border-purple-200 p-3 text-transparent overflow-hidden" dangerouslySetInnerHTML={{ __html: highlightKeywords( keywordInput, triggerKeywords ), }} /> <textarea rows={1} value={keywordInput} onChange={(e) => { handleKeywordChange(e.target.value); autoResizeTextarea(e); }} placeholder="price, details, catalog, menu..." className="relative w-full min-h-[48px] resize-none overflow-hidden rounded-2xl border-2 border-purple-200 bg-transparent p-3 focus:outline-none focus:border-pink-500" /> </div>

                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {keywords.map(
                                (keyword, index) => (
                                  <span
                                    key={`${keyword}-${index}`}
                                    className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium shadow"
                                  >
                                    {keyword}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-6">
                        <label className="block font-semibold mb-2">
                          DM Auto Reply Message
                        </label>

                        <textarea
                          rows={4}
                          value={dmMessage}
                          onChange={(e) =>
                            setDmMessage(e.target.value)
                          }
                          placeholder={`Write an automated DM message for @${selectedPost.username || instagramAccount.username} followers...`}
                          className="w-full rounded-2xl border-2 border-cyan-200 p-4 focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={handleSubmitAutoReply}
                          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold shadow-xl hover:scale-105 transition"
                        >
                          🚀 Save Auto Reply Settings
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {selectedPost.permalink && (
                  <div className="mt-8">
                    <a
                      href={selectedPost.permalink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition"
                    >
                      🔗 View @{selectedPost.username || instagramAccount.username} on Instagram
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-purple-700">
                Select a Post
              </h2>
              <p className="text-gray-500 mt-2">
                Choose a post from the left panel to manage automation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

