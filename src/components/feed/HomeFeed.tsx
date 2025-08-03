// src/components/feed/HomeFeed.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, Users, MessageSquare } from "lucide-react";
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
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalEngagement: 0,
  });

  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const [postsResponse, usersResponse] = await Promise.all([
        fetch("/api/posts?limit=20"),
        fetch("/api/users?limit=1"), // Just to get count
      ]);

      if (!postsResponse.ok) {
        throw new Error("Failed to fetch posts");
      }

      const postsData = await postsResponse.json();

      if (!postsData.success) {
        throw new Error(postsData.error || "Failed to fetch posts");
      }

      setPosts(postsData.posts || []);

      // Calculate stats
      const totalEngagement = (postsData.posts || []).reduce(
        (sum: number, post: IPost) =>
          sum + (post.likes?.length || 0) + (post.comments?.length || 0),
        0
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setStats({
          totalPosts: postsData.pagination?.total || 0,
          totalUsers: usersData.pagination?.total || 0,
          totalEngagement,
        });
      }
    } catch (err: any) {
      console.error("Fetch posts error:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Create post skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* Posts skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 mb-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gray-200 rounded-full w-12 h-12"></div>
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
    <div className="max-w-4xl mx-auto p-4">
      {/* Enhanced Header with Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Professional Feed
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`${refreshing ? "animate-spin" : ""}`}
              size={16}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPosts}
                </p>
                <p className="text-gray-600">Total Posts</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </p>
                <p className="text-gray-600">Professionals</p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEngagement}
                </p>
                <p className="text-gray-600">Engagements</p>
              </div>
              <MessageSquare className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                Unable to load posts
              </p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button
                onClick={() => fetchPosts()}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {posts.length === 0 && !loading && !error ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 mb-4">
            Be the first to share something with the professional community!
          </p>
          <div className="text-sm text-gray-500">
            💡 Try creating your first post above to get started
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onAuthorClick={onProfileView}
              onPostUpdate={handleRefresh}
            />
          ))}

          {/* Load More Indicator */}
          {posts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                Showing {posts.length} of {stats.totalPosts} posts
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
