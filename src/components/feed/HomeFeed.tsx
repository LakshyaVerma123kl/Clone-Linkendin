"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { IPost } from "@/models";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";

interface HomeFeedProps {
  onProfileView: (userId: string) => void;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  posts?: IPost[];
  users?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}

interface FeedStats {
  totalPosts: number;
  totalUsers: number;
  totalEngagement: number;
}

export default function HomeFeed({ onProfileView }: HomeFeedProps) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState<FeedStats>({
    totalPosts: 0,
    totalUsers: 0,
    totalEngagement: 0,
  });

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (posts.length === 0 && error) {
        fetchPosts();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("No internet connection");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [posts.length, error]);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      console.log("Fetching posts...");

      // Fetch posts with proper error handling
      const postsResponse = await fetch("/api/posts?limit=20", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      console.log("Posts response status:", postsResponse.status);

      if (!postsResponse.ok) {
        const errorText = await postsResponse.text();
        console.error("Posts API error:", errorText);

        if (postsResponse.status === 404) {
          throw new Error(
            "Posts API endpoint not found. Check your API routes."
          );
        } else if (postsResponse.status === 500) {
          throw new Error(
            "Server error. Please check your database connection."
          );
        } else if (postsResponse.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        }

        throw new Error(`API Error (${postsResponse.status}): ${errorText}`);
      }

      const postsData: ApiResponse<IPost[]> = await postsResponse.json();
      console.log("Posts data:", postsData);

      // Handle both old and new API response formats
      let fetchedPosts: IPost[] = [];
      if (postsData.success === false) {
        throw new Error(
          postsData.error || postsData.message || "Failed to fetch posts"
        );
      }

      // Handle different response formats
      if (postsData.posts) {
        // Direct posts array in response
        fetchedPosts = postsData.posts;
      } else if (postsData.data && Array.isArray(postsData.data)) {
        // Posts in data array
        fetchedPosts = postsData.data;
      } else if (
        postsData.data &&
        typeof postsData.data === "object" &&
        "posts" in postsData.data
      ) {
        // Posts nested in data object
        fetchedPosts = (postsData.data as any).posts || [];
      } else if (postsData.success && postsData.data) {
        // Fallback - try to use data directly if it's an array
        fetchedPosts = Array.isArray(postsData.data) ? postsData.data : [];
      } else {
        fetchedPosts = [];
      }

      setPosts(fetchedPosts);
      setRetryCount(0); // Reset retry count on success

      // Calculate engagement stats
      const totalEngagement = fetchedPosts.reduce(
        (sum: number, post: IPost) =>
          sum + (post.likes?.length || 0) + (post.comments?.length || 0),
        0
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalPosts: postsData.pagination?.total || fetchedPosts.length,
        totalEngagement,
      }));

      // Fetch users count separately (non-blocking)
      fetchUsersCount();
    } catch (err: any) {
      console.error("Fetch posts error:", err);
      setError(err.message || "Failed to load posts");
      setRetryCount((prev) => prev + 1);

      // Keep existing posts if this is a refresh
      if (!isRefresh) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchUsersCount = async () => {
    try {
      const usersResponse = await fetch("/api/users?limit=1", {
        credentials: "include",
      });

      if (usersResponse.ok) {
        const usersData: ApiResponse<any[]> = await usersResponse.json();

        let totalUsers = 0;
        if (usersData.pagination?.total) {
          totalUsers = usersData.pagination.total;
        } else if (usersData.users?.length) {
          totalUsers = usersData.users.length;
        }

        setStats((prev) => ({
          ...prev,
          totalUsers,
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch users count:", err);
      // Don't set error for this, as it's not critical
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = useCallback(
    (newPost?: IPost) => {
      if (newPost) {
        setPosts((prev) => [newPost, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
        }));
      } else {
        fetchPosts(true);
      }
    },
    [fetchPosts]
  );

  const handleRefresh = useCallback(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const handleRetry = useCallback(() => {
    fetchPosts(false);
  }, [fetchPosts]);

  // Enhanced loading skeleton
  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create post skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        {/* Posts skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-4 animate-pulse"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-12"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-32"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-blue-600 mr-2" size={20} />
          <span className="text-gray-600 dark:text-gray-400">
            Loading posts...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Network status indicator */}
      {!isOnline && (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <WifiOff className="text-yellow-500 mr-3" size={20} />
            <div>
              <p className="text-yellow-700 dark:text-yellow-200 font-medium">
                You're offline
              </p>
              <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                Some features may not work properly until you're back online.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Professional Feed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay connected with your professional network
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isOnline && (
              <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                <Wifi size={16} className="mr-1" />
                Online
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing || !isOnline}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`${refreshing ? "animate-spin" : ""}`}
                size={16}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalPosts.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Posts</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalUsers.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Professionals
                </p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-500 sm:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalEngagement.toLocaleString()}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Engagements</p>
              </div>
              <MessageSquare className="text-purple-500" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle
              className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
              size={20}
            />
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-200 font-medium">
                Unable to load posts
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={handleRetry}
                  disabled={refreshing}
                  className="text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline font-medium text-sm disabled:opacity-50"
                >
                  {refreshing ? "Retrying..." : "Try again"}
                </button>
                {retryCount > 0 && (
                  <span className="text-red-500 text-xs">
                    Attempt {retryCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Content */}
      {posts.length === 0 && !loading && !error ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageSquare
              className="text-gray-400 dark:text-gray-500"
              size={32}
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No posts yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Be the first to share something with the professional community!
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
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

          {/* Posts summary */}
          {posts.length > 0 && (
            <div className="text-center py-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Showing {posts.length} of {stats.totalPosts.toLocaleString()}{" "}
                posts
              </p>
              {posts.length < stats.totalPosts && (
                <button
                  onClick={() => {
                    // TODO: Implement load more functionality
                    console.log("Load more posts");
                  }}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                >
                  Load more posts
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Refreshing indicator */}
      {refreshing && posts.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-sm">Refreshing posts...</span>
        </div>
      )}
    </div>
  );
}
