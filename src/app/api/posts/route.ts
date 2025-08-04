// src/app/api/posts/route.ts - Using your middleware system
import { NextRequest } from "next/server";
import { Post, User } from "@/models";
import {
  createAPIHandler,
  createSuccessResponse,
  createErrorResponse,
  validationSchemas,
  generateRequestId,
} from "@/lib/middleware";

// GET - Fetch posts with middleware
const getPosts = createAPIHandler({
  rateLimit: "general",
});

export const GET = getPosts(async (request: NextRequest) => {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    // Build query object
    let query: any = {};
    if (userId) {
      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        return createErrorResponse(
          "Invalid user ID format",
          "INVALID_USER_ID",
          400,
          null,
          requestId
        );
      }
      query.author = userId;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email bio avatar isOnline lastSeen")
        .populate("comments.user", "name email avatar")
        .populate("likes", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: skip + limit < total,
      hasPrev: page > 1,
    };

    return createSuccessResponse(
      {
        posts,
        pagination,
      },
      `Retrieved ${posts.length} posts`,
      200,
      requestId
    );
  } catch (error: any) {
    console.error(`[${requestId}] Get posts error:`, error);

    if (error.name === "CastError") {
      return createErrorResponse(
        "Invalid ID format in query",
        "INVALID_ID_FORMAT",
        400,
        error.message,
        requestId
      );
    }

    return createErrorResponse(
      "Failed to fetch posts",
      "FETCH_POSTS_ERROR",
      500,
      error.message,
      requestId
    );
  }
});

// POST - Create post with middleware
const createPost = createAPIHandler({
  requireAuth: true,
  rateLimit: "posts",
  validation: validationSchemas.post,
});

export const POST = createPost(
  async (request: NextRequest, { userId, validatedData }) => {
    const requestId = generateRequestId();

    try {
      const { content, images } = validatedData;

      // Additional validation for images
      if (images) {
        if (!Array.isArray(images)) {
          return createErrorResponse(
            "Images must be an array",
            "INVALID_IMAGES_FORMAT",
            400,
            null,
            requestId
          );
        }

        if (images.length > 5) {
          return createErrorResponse(
            "Maximum 5 images allowed per post",
            "TOO_MANY_IMAGES",
            400,
            null,
            requestId
          );
        }

        // Validate each image URL
        for (const imageUrl of images) {
          if (typeof imageUrl !== "string" || !isValidImageUrl(imageUrl)) {
            return createErrorResponse(
              "Invalid image URL provided",
              "INVALID_IMAGE_URL",
              400,
              null,
              requestId
            );
          }
        }
      }

      // Check if user exists
      const userExists = await User.findById(userId);
      if (!userExists) {
        return createErrorResponse(
          "User not found",
          "USER_NOT_FOUND",
          404,
          null,
          requestId
        );
      }

      // Create post
      const post = await Post.create({
        content: content.trim(),
        author: userId,
        images: images || [],
      });

      // Populate the created post
      const populatedPost = await Post.findById(post._id)
        .populate("author", "name email bio avatar isOnline lastSeen")
        .populate("comments.user", "name email avatar")
        .populate("likes", "name email")
        .lean();

      // Update user's last activity
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date(),
        isOnline: true,
      });

      return createSuccessResponse(
        { post: populatedPost },
        "Post created successfully",
        201,
        requestId
      );
    } catch (error: any) {
      console.error(`[${requestId}] Create post error:`, error);

      return createErrorResponse(
        "Failed to create post",
        "CREATE_POST_ERROR",
        500,
        error.message,
        requestId
      );
    }
  }
);

// DELETE - Delete post with middleware
const deletePost = createAPIHandler({
  requireAuth: true,
  rateLimit: "general",
});

export const DELETE = deletePost(async (request: NextRequest, { userId }) => {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId || !/^[0-9a-fA-F]{24}$/.test(postId)) {
      return createErrorResponse(
        "Valid post ID is required",
        "INVALID_POST_ID",
        400,
        null,
        requestId
      );
    }

    const post = await Post.findById(postId);

    if (!post) {
      return createErrorResponse(
        "Post not found",
        "POST_NOT_FOUND",
        404,
        null,
        requestId
      );
    }

    // Check if user owns the post
    if (post.author.toString() !== userId) {
      return createErrorResponse(
        "You don't have permission to delete this post",
        "FORBIDDEN",
        403,
        null,
        requestId
      );
    }

    await Post.findByIdAndDelete(postId);

    return createSuccessResponse(
      { deletedPostId: postId },
      "Post deleted successfully",
      200,
      requestId
    );
  } catch (error: any) {
    console.error(`[${requestId}] Delete post error:`, error);

    return createErrorResponse(
      "Failed to delete post",
      "DELETE_POST_ERROR",
      500,
      error.message,
      requestId
    );
  }
});

// Utility function to validate image URLs
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validDomains = [
      "images.unsplash.com",
      "cdn.cloudinary.com",
      "res.cloudinary.com",
      "i.imgur.com",
      "media.githubusercontent.com",
      "via.placeholder.com", // For testing
    ];

    const hasValidDomain = validDomains.some((domain) =>
      urlObj.hostname.includes(domain)
    );

    const hasValidExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(
      urlObj.pathname
    );

    return hasValidDomain && hasValidExtension;
  } catch {
    return false;
  }
}
