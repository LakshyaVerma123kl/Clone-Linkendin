// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Post } from "@/models";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch all posts with improved error handling
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Max 50 posts per request
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) {
      query = { author: userId };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email bio avatar")
        .populate("comments.user", "name email avatar")
        .populate("likes", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Use lean() for better performance
      Post.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch posts",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Create new post with enhanced validation
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getCurrentUser(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;

    // Enhanced validation
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Post content is required and must be a string",
        },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: "Post content cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Post content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // Create post
    const post = await Post.create({
      content: trimmedContent,
      author: userId,
    });

    // Populate the created post
    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email bio avatar")
      .populate("comments.user", "name email avatar")
      .populate("likes", "name email")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        post: populatedPost,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create post error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create post",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
