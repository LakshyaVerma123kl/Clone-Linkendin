// src/components/posts/PostCard.tsx
"use client";

import React, { useState } from "react";
import {
  User,
  Clock,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share,
  Eye,
} from "lucide-react";
import { IPost } from "@/models";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  post: IPost;
  onAuthorClick?: (userId: string) => void;
  onPostUpdate?: () => void;
}

export default function PostCard({
  post,
  onAuthorClick,
  onPostUpdate,
}: PostCardProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(
    user ? post.likes?.includes(user._id) : false
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

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
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      return postDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          postDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const handleLike = async () => {
    if (isLiking || !user) return;

    setIsLiking(true);
    const wasLiked = liked;

    // Optimistic update
    setLiked(!liked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        // Revert on failure
        setLiked(wasLiked);
        setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
        throw new Error("Failed to toggle like");
      }

      const data = await response.json();
      if (data.success) {
        setLikeCount(data.likesCount);
        setLiked(data.liked);
      }
    } catch (error) {
      console.error("Like error:", error);
      // Revert optimistic update on error
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isCommenting || !user) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content: newComment.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to add comment");
      }

      setNewComment("");
      onPostUpdate?.();
    } catch (error: any) {
      console.error("Comment error:", error);
      // You could show a toast notification here
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${
            typeof post.author === "object" ? post.author.name : "Unknown"
          }`,
          text: post.content,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${post.content}\n\n— ${
            typeof post.author === "object" ? post.author.name : "Unknown"
          }`
        );
        // You could show a toast: "Copied to clipboard!"
      } catch (error) {
        console.error("Failed to copy to clipboard");
      }
    }
  };

  // Handle author data (could be populated object or just ID)
  const authorData = typeof post.author === "object" ? post.author : null;
  const authorName = authorData?.name || "Unknown User";
  const authorEmail = authorData?.email || "";
  const authorBio = authorData?.bio || "";
  const authorImage = authorData?.profileImage;

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {/* Profile Avatar */}
            <button
              onClick={() => authorData && onAuthorClick?.(authorData._id)}
              className="group relative"
            >
              {authorImage ? (
                <img
                  src={authorImage}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-500 transition-colors"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="text-white" size={20} />
                </div>
              )}

              {/* Online Status Indicator */}
              {authorData?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => authorData && onAuthorClick?.(authorData._id)}
                  className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                >
                  {authorName}
                </button>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>

              {authorEmail && (
                <p className="text-gray-500 text-sm truncate">{authorEmail}</p>
              )}

              {authorBio && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                  {authorBio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Profile Button */}
            {authorData && (
              <button
                onClick={() => onAuthorClick?.(authorData._id)}
                className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all"
                title="View Profile"
              >
                <Eye size={16} />
              </button>
            )}

            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
          {post.content}
        </p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Post image ${index + 1}`}
                className="rounded-lg max-h-96 w-full object-cover border border-gray-200"
              />
            ))}
          </div>
        )}
      </div>

      {/* Engagement Summary */}
      {(likeCount > 0 || (post.comments?.length || 0) > 0) && (
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between text-sm text-gray-500 py-2 border-t border-gray-50">
            <div className="flex items-center space-x-4">
              {likeCount > 0 && (
                <span className="flex items-center space-x-1">
                  <Heart size={14} className="text-red-500 fill-current" />
                  <span>
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </span>
                </span>
              )}
            </div>

            {(post.comments?.length || 0) > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-blue-600 transition-colors flex items-center space-x-1"
              >
                <MessageCircle size={14} />
                <span>
                  {post.comments?.length || 0}{" "}
                  {(post.comments?.length || 0) === 1 ? "comment" : "comments"}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              disabled={isLiking || !user}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                liked
                  ? "text-red-600 bg-red-50 hover:bg-red-100"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Heart size={16} className={liked ? "fill-current" : ""} />
              <span className="text-sm">
                {isLiking ? "..." : liked ? "Liked" : "Like"}
              </span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
            >
              <MessageCircle size={16} />
              <span className="text-sm">Comment</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all font-medium"
            >
              <Share size={16} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleComment} className="mt-4 mb-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={14} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a thoughtful comment..."
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    rows={2}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {newComment.length}/500
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isCommenting}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isCommenting ? "Posting..." : "Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-4 mt-4">
              {post.comments.map((comment) => {
                const commentUser =
                  typeof comment.user === "object" ? comment.user : null;
                return (
                  <div key={comment._id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {commentUser?.profileImage ? (
                        <img
                          src={commentUser.profileImage}
                          alt={commentUser.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="text-gray-600" size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={() =>
                              commentUser && onAuthorClick?.(commentUser._id)
                            }
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-sm"
                          >
                            {commentUser?.name || "Unknown User"}
                          </button>
                          <span className="text-gray-400 text-xs">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show/Hide Comments Toggle for many comments */}
          {!showComments && (post.comments?.length || 0) > 0 && (
            <button
              onClick={() => setShowComments(true)}
              className="w-full mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium py-2"
            >
              View all {post.comments?.length} comments
            </button>
          )}
        </div>
      )}
    </article>
  );
}
