// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/models";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userId = await getCurrentUser(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
