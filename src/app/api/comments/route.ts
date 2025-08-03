import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, Post } from "@/models";
import { getCurrentUser } from "@/lib/auth";

// POST - Add comment to post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const userId = await getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Comment cannot exceed 500 characters" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate("author", "name email bio profileImage")
      .populate("comments.user", "name email profileImage");

    return NextResponse.json({
      message: "Comment added successfully",
      post: updatedPost,
    });
  } catch (error: any) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const userId = await getCurrentUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user owns the comment or the post
    if (
      comment.user.toString() !== userId &&
      post.author.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    post.comments.pull(commentId);
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate("author", "name email bio profileImage")
      .populate("comments.user", "name email profileImage");

    return NextResponse.json({
      message: "Comment deleted successfully",
      post: updatedPost,
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
