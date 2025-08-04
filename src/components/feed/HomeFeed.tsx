"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { IPost } from "@/models";
import CreatePost from "@/components/posts/CreatePost";
import PostCard from "@/components/posts/PostCard";

interface HomeFeedProps {
  onProfileView: (userId: string) => void;
}

// Mock data for development/testing
const mockPosts: IPost[] = [
  {
    _id: "1",
    content:
      "Just launched our new product feature! Excited to see how the community responds. The journey from concept to deployment was challenging but incredibly rewarding. Looking forward to your feedback! 🚀",
    author: {
      _id: "user1",
      name: "Alex Johnson",
      email: "alex@example.com",
      bio: "Senior Product Manager at TechCorp, passionate about user experience and innovation.",
      isOnline: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      lastSeen: new Date(),
    },
    likes: ["user2", "user3", "user4"],
    comments: [
      {
        _id: "c1",
        content:
          "Congratulations! This looks amazing. Can't wait to try it out.",
        user: {
          _id: "user2",
          name: "Sarah Chen",
          email: "sarah@example.com",
          bio: "UX Designer",
          isOnline: false,
          createdAt: new Date("2024-01-10"),
          updatedAt: new Date("2024-01-10"),
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
    ],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    _id: "2",
    content:
      "Sharing some insights from today's industry conference. The future of AI in business automation looks incredibly promising. Key takeaways: 1) Focus on augmenting human capabilities, not replacing them 2) Data quality remains crucial 3) Ethical AI implementation should be a priority from day one.",
    author: {
      _id: "user3",
      name: "Marcus Rodriguez",
      email: "marcus@example.com",
      bio: "AI Research Scientist, helping businesses leverage machine learning for growth.",
      isOnline: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
      lastSeen: new Date(),
    },
    likes: ["user1", "user4"],
    comments: [],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    _id: "3",
    content:
      "Team collaboration tip: Start each sprint with a 'definition of done' session. It has dramatically improved our delivery quality and reduced back-and-forth. What are your favorite team productivity hacks?",
    author: {
      _id: "user4",
      name: "Emily Davis",
      email: "emily@example.com",
      bio: "Agile Coach and Scrum Master with 8+ years experience in software development.",
      isOnline: false,
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    likes: ["user1"],
    comments: [
      {
        _id: "c2",
        content:
          "Great tip! We also do 'Three Amigos' sessions before development starts.",
        user: {
          _id: "user1",
          name: "Alex Johnson",
          email: "alex@example.com",
          bio: "Senior Product Manager",
          isOnline: true,
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-01-15"),
        },
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export default function HomeFeed({ onProfileView }: HomeFeedProps) {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 4, // Mock data
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

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to fetch from API first
      try {
        const [postsResponse, usersResponse] = await Promise.all([
          fetch("/api/posts?limit=20").catch(() => null),
          fetch("/api/users?limit=1").catch(() => null), // Just to get count
        ]);

        if (postsResponse?.ok) {
          const postsData = await postsResponse.json();
          if (postsData.success && postsData.posts?.length > 0) {
            setPosts(postsData.posts);
            setStats((prev) => ({
              ...prev,
              totalPosts: postsData.pagination?.total || postsData.posts.length,
            }));
            return;
          }
        }
      } catch (apiError) {
        console.log("API not available, using mock data");
      }

      // Fallback to mock data
      setPosts(mockPosts);

      // Calculate stats from mock data
      const totalEngagement = mockPosts.reduce(
        (sum, post) =>
          sum + (post.likes?.length || 0) + (post.comments?.length || 0),
        0
      );

      setStats({
        totalPosts: mockPosts.length,
        totalUsers: 4,
        totalEngagement,
      });
    } catch (err: any) {
      console.error("Fetch posts error:", err);
      setError(err.message || "Failed to load posts");

      // Even on error, show mock data
      setPosts(mockPosts);
      setStats({
        totalPosts: mockPosts.length,
        totalUsers: 4,
        totalEngagement: mockPosts.reduce(
          (sum, post) =>
            sum + (post.likes?.length || 0) + (post.comments?.length || 0),
          0
        ),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = useCallback(
    (newPost?: IPost) => {
      if (newPost) {
        // Add new post to the beginning of the list
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Create post skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Enhanced Header with Stats */}
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <RefreshCw
              className={`${refreshing ? "animate-spin" : ""}`}
              size={16}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalPosts}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Posts</p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalUsers}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Professionals
                </p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-l-4 border-purple-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalEngagement}
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
            <div>
              <p className="text-red-700 dark:text-red-200 font-medium">
                Unable to load posts from server
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error} - Showing sample posts instead.
              </p>
              <button
                onClick={() => fetchPosts()}
                className="mt-2 text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline font-medium text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed */}
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

          {/* Load More Indicator */}
          {posts.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Showing {posts.length} of {stats.totalPosts} posts
              </p>
              {stats.totalPosts > posts.length && (
                <button
                  onClick={() => fetchPosts()}
                  className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                >
                  Load more posts
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
