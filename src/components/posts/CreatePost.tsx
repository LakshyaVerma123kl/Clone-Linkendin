// src/components/posts/CreatePost.tsx
"use client";

import React, { useState, useRef } from "react";
import { Send, User, Image, Smile, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create post");
      }

      setContent("");
      setIsExpanded(false);
      onPostCreated();

      // Show success feedback (you could replace this with a toast)
      console.log("Post created successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent("");
    setError("");
    setIsExpanded(false);
  };

  const remainingChars = 1000 - content.length;
  const isNearLimit = remainingChars <= 100;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2">
            <User className="text-white" size={24} />
          </div>

          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleTextareaChange}
                  onFocus={handleFocus}
                  placeholder={`What's on your mind, ${
                    user?.name?.split(" ")[0] || "there"
                  }?`}
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg placeholder-gray-400"
                  rows={isExpanded ? 4 : 2}
                  maxLength={1000}
                  style={{ minHeight: isExpanded ? "120px" : "60px" }}
                />

                {content && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {isExpanded && (
                <>
                  {/* Formatting Options */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                        disabled
                      >
                        <Image size={16} />
                        <span className="text-sm">Photo</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 px-2 py-1 rounded transition-colors"
                        disabled
                      >
                        <Smile size={16} />
                        <span className="text-sm">Emoji</span>
                      </button>
                    </div>

                    <div
                      className={`text-sm font-medium ${
                        isOverLimit
                          ? "text-red-600"
                          : isNearLimit
                          ? "text-yellow-600"
                          : "text-gray-500"
                      }`}
                    >
                      {remainingChars} characters remaining
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!content.trim() || loading || isOverLimit}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                      <Send size={16} />
                      <span>{loading ? "Posting..." : "Post"}</span>
                    </button>
                  </div>
                </>
              )}

              {!isExpanded && content.trim() && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!content.trim() || loading || isOverLimit}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                  >
                    <Send size={14} />
                    <span>{loading ? "Posting..." : "Post"}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
