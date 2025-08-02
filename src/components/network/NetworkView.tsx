"use client";

import React, { useState, useEffect } from "react";
import { Search, User, Mail, Calendar, Eye } from "lucide-react";
import { IUser } from "@/models";

interface NetworkViewProps {
  onProfileView: (userId: string) => void;
}

export default function NetworkView({ onProfileView }: NetworkViewProps) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Network</h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search professionals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-red-600 hover:text-red-700 underline"
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
              Found {filteredUsers.length} professional
              {filteredUsers.length !== 1 ? "s" : ""}
            </>
          ) : (
            <>
              {users.length} professional{users.length !== 1 ? "s" : ""} in your
              network
            </>
          )}
        </p>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? "No professionals found" : "No professionals yet"}
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Be the first to join this professional network!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* User Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="text-blue-600" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <Mail size={14} />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                  {user.bio}
                </p>
              )}

              {/* Join Date */}
              <div className="flex items-center space-x-1 text-gray-500 text-sm mb-4">
                <Calendar size={14} />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onProfileView(user._id)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye size={16} />
                <span>View Profile</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
