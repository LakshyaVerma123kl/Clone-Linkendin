// src/components/network/NetworkView.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  Mail,
  Calendar,
  Eye,
  Globe,
  Users as UsersIcon,
} from "lucide-react";
import { IUser } from "@/models";

interface NetworkViewProps {
  onProfileView: (userId: string) => void;
}

export default function NetworkView({ onProfileView }: NetworkViewProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "recent">("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users?limit=50", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    switch (filter) {
      case "online":
        return user.isOnline;
      case "recent":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(user.lastSeen || user.createdAt) > oneWeekAgo;
      default:
        return true;
    }
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatLastSeen = (lastSeen?: Date, isOnline?: boolean) => {
    if (isOnline) return "Online now";
    if (!lastSeen) return "Not available";

    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInHours = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Active recently";
    if (diffInHours < 24) return `Active ${diffInHours}h ago`;
    if (diffInHours < 168) return `Active ${Math.floor(diffInHours / 24)}d ago`;
    return `Last seen ${formatDate(lastSeen)}`;
  };

  const onlineUsers = users.filter((u) => u.isOnline).length;
  const recentUsers = users.filter((u) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(u.lastSeen || u.createdAt) > oneWeekAgo;
  }).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
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

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gray-200 rounded-full w-12 h-12"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Professional Network
        </h1>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search professionals by name, email, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-2">
            {[
              { key: "all", label: "All", count: users.length },
              { key: "online", label: "Online", count: onlineUsers },
              { key: "recent", label: "Recent", count: recentUsers },
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === filterOption.key
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-gray-600">Total Professionals</p>
            </div>
            <UsersIcon className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{onlineUsers}</p>
              <p className="text-gray-600">Online Now</p>
            </div>
            <Globe className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{recentUsers}</p>
              <p className="text-gray-600">Active This Week</p>
            </div>
            <Calendar className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">
            Unable to load professionals
          </p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-red-600 hover:text-red-700 underline font-medium text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          {searchTerm ? (
            <>
              Found{" "}
              <span className="font-semibold">{filteredUsers.length}</span>{" "}
              professional
              {filteredUsers.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </>
          ) : (
            <>
              Showing{" "}
              <span className="font-semibold">{filteredUsers.length}</span>{" "}
              professional
              {filteredUsers.length !== 1 ? "s" : ""}
              {filter !== "all" && ` (${filter})`}
            </>
          )}
        </p>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 && !loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? "No professionals found" : "No professionals yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? "Try adjusting your search terms or filters"
              : "Be the first to join this professional network!"}
          </p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search and show all
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
            >
              {/* User Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="text-white" size={24} />
                    </div>
                  )}

                  {/* Online Status Indicator */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                      user.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  ></div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">
                    {user.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm mb-1">
                    <Mail size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatLastSeen(user.lastSeen, user.isOnline)}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {user.bio}
                  </p>
                </div>
              )}

              {/* User Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4 py-2 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isOnline
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.isOnline ? "Online" : "Offline"}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onProfileView(user._id)}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Eye size={16} />
                  <span>View Profile</span>
                </button>

                <button
                  className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Connect (Coming Soon)"
                  disabled
                >
                  <UsersIcon size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredUsers.length > 0 && filteredUsers.length < users.length && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // This could trigger loading more users from API
              console.log("Load more functionality can be added here");
            }}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Load More Professionals
          </button>
        </div>
      )}

      {/* Network Insights */}
      {users.length > 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Network Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round((onlineUsers / users.length) * 100)}%
              </div>
              <div className="text-gray-600">Currently Active</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round((recentUsers / users.length) * 100)}%
              </div>
              <div className="text-gray-600">Active This Week</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {users.filter((u) => u.bio.length > 0).length}
              </div>
              <div className="text-gray-600">With Complete Profiles</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
