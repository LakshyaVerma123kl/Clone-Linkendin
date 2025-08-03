// src/app/api/posts/[id]/like/route.ts
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

    const { id: postId } = params;
    const post = await Post.findById(postId);

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter((id: string) => id.toString() !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error: any) {
    console.error("Like toggle error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
