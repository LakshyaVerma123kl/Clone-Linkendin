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

      const response = await fetch(`/api/users/${targetUserId}`);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gray-200 rounded-full w-20 h-20"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="text-red-600 hover:text-red-700 underline"
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
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
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
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to feed</span>
        </button>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="bg-blue-100 rounded-full p-4">
            <User className="text-blue-600" size={48} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {profile.name}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-3">
              <div className="flex items-center space-x-1">
                <Mail size={16} />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-blue-600 mb-1">
              <FileText size={20} />
              <span className="text-2xl font-bold">{stats.postsCount}</span>
            </div>
            <p className="text-gray-600 text-sm">Posts</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-red-500 mb-1">
              <Heart size={20} />
              <span className="text-2xl font-bold">{stats.totalLikes}</span>
            </div>
            <p className="text-gray-600 text-sm">Likes Received</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-green-500 mb-1">
              <MessageSquare size={20} />
              <span className="text-2xl font-bold">{stats.totalComments}</span>
            </div>
            <p className="text-gray-600 text-sm">Comments Received</p>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isOwnProfile ? "Your Posts" : `${profile.name}'s Posts`}
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
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
    </div>
  );
}
