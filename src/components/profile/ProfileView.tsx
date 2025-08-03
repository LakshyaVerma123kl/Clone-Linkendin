// src/components/profile/ProfileView.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Calendar,
  MessageSquare,
  Heart,
  FileText,
  ArrowLeft,
  Globe,
  Edit3,
  MapPin,
  Clock,
} from "lucide-react";
import { IUser, IPost } from "@/models";
import PostCard from "@/components/posts/PostCard";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileViewProps {
  userId?: string;
  onBack?: () => void;
  onProfileView?: (userId: string) => void;
}

export default function ProfileView({
  userId,
  onBack,
  onProfileView,
}: ProfileViewProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<IUser | null>(null);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [stats, setStats] = useState({
    postsCount: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts");

  const isOwnProfile = !userId || userId === currentUser?._id;
  const targetUserId = userId || currentUser?._id;

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/users/${targetUserId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.user);
      setPosts(data.posts);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatLastSeen = (lastSeen?: Date, isOnline?: boolean) => {
    if (isOnline) return "Online now";
    if (!lastSeen) return "Last seen unknown";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInHours = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Active recently";
    if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
    if (diffInHours < 168)
      return `Last seen ${Math.floor(diffInHours / 24)}d ago`;
    return `Last seen ${lastSeenDate.toLocaleDateString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-6 mb-6">
              <div className="bg-gray-200 rounded-full w-24 h-24"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <p className="text-red-700 font-medium mb-2">
            Unable to load profile
          </p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="text-red-600 hover:text-red-700 underline font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-medium">Back to feed</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Profile Image */}
          <div className="relative">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={40} />
              </div>
            )}

            {/* Online Status */}
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${
                profile.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile.name}
                </h1>

                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-gray-600 mb-3">
                  <div className="flex items-center space-x-1">
                    <Mail size={16} />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>
                      {formatLastSeen(profile.lastSeen, profile.isOnline)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Globe size={14} />
                  <span>{profile.isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>

              {/* Edit Profile Button (for own profile) */}
              {isOwnProfile && (
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {profile.bio && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-2">
              <FileText size={24} />
              <span className="text-2xl font-bold">{stats.postsCount}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Posts</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-red-500 mb-2">
              <Heart size={24} />
              <span className="text-2xl font-bold">{stats.totalLikes}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">Likes Received</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 text-green-500 mb-2">
              <MessageSquare size={24} />
              <span className="text-2xl font-bold">{stats.totalComments}</span>
            </div>
            <p className="text-gray-600 text-sm font-medium">
              Comments Received
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "posts"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Posts ({stats.postsCount})
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "about"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              About
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "posts" && (
            <>
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600">
                    {isOwnProfile
                      ? "You haven't shared anything yet. Create your first post!"
                      : `${profile.name} hasn't shared anything yet.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onAuthorClick={onProfileView}
                      onPostUpdate={fetchProfile}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="text-gray-500" size={20} />
                    <span className="text-gray-700">{profile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-gray-500" size={20} />
                    <span className="text-gray-700">
                      Member since {formatDate(profile.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="text-gray-500" size={20} />
                    <span className="text-gray-700">
                      {formatLastSeen(profile.lastSeen, profile.isOnline)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              {profile.bio && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Activity Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activity Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {stats.postsCount}
                      </div>
                      <div className="text-gray-600 text-sm">Posts Shared</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {stats.totalLikes + stats.totalComments}
                      </div>
                      <div className="text-gray-600 text-sm">
                        Total Engagement
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Network Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Network Impact
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xl font-bold text-purple-600">
                      {stats.totalLikes}
                    </div>
                    <div className="text-gray-600 text-sm">Likes Received</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">
                      {stats.totalComments}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Comments Received
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
