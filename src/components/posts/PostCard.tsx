"use client";

import React from "react";
import { User, Clock, Heart, MessageCircle } from "lucide-react";
import { IPost } from "@/models";

interface PostCardProps {
  post: IPost;
  onAuthorClick?: (userId: string) => void;
}

export default function PostCard({ post, onAuthorClick }: PostCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return postDate.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      {/* Post Header */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="bg-blue-100 rounded-full p-2">
          <User className="text-blue-600" size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAuthorClick?.(post.author._id)}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {post.author.name}
            </button>
            <span className="text-gray-500">•</span>
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Clock size={14} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">{post.author.email}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 pt-3 border-t border-gray-100">
        <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
          <Heart size={18} />
          <span className="text-sm">{post.likes?.length || 0} likes</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageCircle size={18} />
          <span className="text-sm">{post.comments?.length || 0} comments</span>
        </button>
      </div>
    </div>
  );
}
