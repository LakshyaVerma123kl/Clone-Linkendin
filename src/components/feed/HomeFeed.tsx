"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { IPost } from "@/models";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";

interface HomeFeedProps {
  onProfileView: (userId: string) => void;
}

export default function HomeFeed({ onProfileView }: HomeFeedProps) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts(true);
  };

  const handleRefresh = () => {
    fetchPosts(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-200 rounded-full w-10 h-10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Home Feed</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`${refreshing ? "animate-spin" : ""}`}
            size={20}
          />
          <span>Refresh</span>
        </button>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchPosts()}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600">
            Be the first to share something with the community!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onAuthorClick={onProfileView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
