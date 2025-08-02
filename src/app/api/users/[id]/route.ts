import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User, Post } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;

    // Get user profile
    const user = await User.findById(id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's posts
    const posts = await Post.find({ author: id })
      .populate("author", "name email bio")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      user,
      posts,
      stats: {
        postsCount: posts.length,
        totalLikes: posts.reduce((sum, post) => sum + post.likes.length, 0),
        totalComments: posts.reduce(
          (sum, post) => sum + post.comments.length,
          0
        ),
      },
    });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
