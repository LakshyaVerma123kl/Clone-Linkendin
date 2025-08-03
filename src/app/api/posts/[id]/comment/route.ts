// src/app/api/posts/[id]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Post } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: "Comment cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    const { id: postId } = params;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    post.comments.push({
      user: userId,
      content: content.trim(),
      createdAt: new Date(),
    });

    await post.save();

    // Return updated post with populated data
    const updatedPost = await Post.findById(postId)
      .populate("author", "name email bio avatar")
      .populate("comments.user", "name email avatar")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Comment added successfully",
      post: updatedPost,
    });
  } catch (error: any) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
