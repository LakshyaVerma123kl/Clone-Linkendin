import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Database seeding is not allowed in production" },
        { status: 403 }
      );
    }

    const result = await seedDatabase();

    return NextResponse.json({
      message: "Database seeded successfully!",
      ...result,
    });
  } catch (error: any) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}
