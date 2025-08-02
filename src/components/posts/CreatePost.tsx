"use client";

import React, { useState } from "react";
import { Send, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      setContent("");
      onPostCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-100 rounded-full p-2">
          <User className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              maxLength={1000}
            />

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {content.length}/1000 characters
              </span>
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
                <span>{loading ? "Posting..." : "Post"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
