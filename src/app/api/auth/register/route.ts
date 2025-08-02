import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase, User } from "@/models";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, email, password, bio } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      bio: bio || "",
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user data (without password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: userData,
        token,
      },
      { status: 201 }
    );

    // Set token as HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
