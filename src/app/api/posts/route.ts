import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Post } from "@/models";
import { getCurrentUser } from "@/lib/auth";

// GET - Fetch all posts
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) {
      query = { author: userId };
    }

    const posts = await Post.find(query)
      .populate("author", "name email bio")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Post content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Post content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    const post = await Post.create({
      content: content.trim(),
      author: userId,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email bio")
      .populate("comments.user", "name email");

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: populatedPost,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
