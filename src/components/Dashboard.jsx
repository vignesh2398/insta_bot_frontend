import React, { useState, useEffect } from "react";
import api from "../services/axios";

export default function AutoDMReplyPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts from backend when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/insta/media");
        const fetchedPosts =
          response.data?.posts || response.data || [];

        setPosts(Array.isArray(fetchedPosts) ? fetchedPosts : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch posts"
        );
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const toggleReply = (id) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, enabled: !post.enabled }
          : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 lg:p-6">
      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          Error: {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-xl">
          Loading posts...
        </div>
      )}



      {/* FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6">
        <div className="text-gray-700 font-medium">
          Showing {posts.length} post{posts.length === 1 ? "" : "s"}
        </div>

        <div className="flex gap-3">
          <select className="border rounded-xl px-4 py-3 bg-white">
            <option>Sort by: Newest</option>
            <option>Oldest</option>
          </select>

          <button className="w-12 h-12 border rounded-xl bg-pink-50 text-pink-600">
            ⬜
          </button>

          <button className="w-12 h-12 border rounded-xl bg-white">
            ☰
          </button>
        </div>
      </div>

      {/* POSTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
        {loading ? (
          <div className="col-span-1 xl:col-span-3 bg-white border rounded-2xl flex flex-col items-center justify-center h-[300px] text-gray-500">
            <div className="animate-spin text-4xl">⏳</div>
            <div className="mt-5">Loading posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="col-span-1 xl:col-span-3 bg-white border rounded-2xl flex flex-col items-center justify-center h-[300px] text-center p-6">
            <div className="text-5xl">🖼️</div>
            <h2 className="text-2xl font-semibold mt-5">No posts found</h2>
            <p className="text-gray-500 mt-3">
              Connect your Instagram Business account to see your posts here.
            </p>
            <button className="mt-6 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-semibold">
              Connect Instagram
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border rounded-2xl overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={post.image}
                  alt=""
                  className={`w-full h-[220px] object-cover ${
                    post.oldPost ? "opacity-40" : ""
                  }`}
                />

                {/* Days */}
                <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                  {post.daysAgo}
                </div>

                {/* Warning */}
                {post.oldPost && (
                  <div className="absolute top-4 right-4 bg-black text-white text-sm px-3 py-2 rounded-xl">
                    Too old for DM reply
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-5">
                <p className="text-gray-800 leading-relaxed">
                  {post.caption}
                </p>

                {/* COMMENTS + TOGGLE */}
                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-2 text-gray-600">
                    💬 {post.comments}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      Auto Reply
                    </span>

                    <button
                      onClick={() =>
                        !post.oldPost && toggleReply(post.id)
                      }
                      className={`w-14 h-8 rounded-full flex items-center px-1 transition ${
                        post.enabled
                          ? "bg-pink-500 justify-end"
                          : "bg-gray-300 justify-start"
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-white"></div>
                    </button>
                  </div>
                </div>

                {/* OLD POST */}
                {post.oldPost ? (
                  <div className="mt-10 text-gray-500 leading-relaxed">
                    This post is older than 7 days and
                    can’t receive auto-DM replies.
                  </div>
                ) : (
                  <>
                    {/* TRIGGER */}
                    <div className="mt-6">
                      <div className="font-semibold mb-4">
                        Trigger
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={post.replyAll}
                            readOnly
                          />

                          <span>
                            Reply to all comments
                          </span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={!post.replyAll}
                            readOnly
                          />

                          <span>
                            Reply only when comment contains keywords
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* KEYWORDS */}
                    <div className="mt-6">
                      <div className="font-semibold mb-3">
                        Keywords
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {post.keywords.map((keyword) => (
                          <div
                            key={keyword}
                            className="px-4 py-2 bg-gray-100 rounded-xl text-sm flex items-center gap-2"
                          >
                            {keyword}
                            <span className="cursor-pointer">✕</span>
                          </div>
                        ))}

                        <button className="px-4 py-2 border rounded-xl text-sm hover:bg-gray-100">
                          + Add keyword
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 mt-3">
                        We’ll reply when a comment contains any of these keywords.
                      </p>
                    </div>

                    {/* MESSAGE */}
                    <div className="mt-6">
                      <div className="font-semibold mb-3">
                        DM text
                      </div>

                      <textarea
                        value={post.message}
                        readOnly
                        rows={4}
                        className="w-full border rounded-2xl p-4 outline-none resize-none"
                      />

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-green-600 text-sm">
                          ✅ Includes opt-out keyword
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-sm">
                            {post.charCount} / 500
                          </span>

                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
                            Looks good
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER INFO */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex gap-4">
          <div className="text-2xl">ℹ️</div>

          <div>
            <span className="font-semibold">
              Meta Rules:
            </span>{" "}
            We can only DM users who commented in
            the last 7 days. Always include “Reply
            STOP to opt out” to stay compliant.
          </div>
        </div>

        <button className="text-blue-600 font-semibold">
          Learn more ↗
        </button>
      </div>
    </div>
  );
}