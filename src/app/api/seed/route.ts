// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";
import { connectToDatabase } from "@/models";

export async function GET() {
  return NextResponse.json({
    message:
      "Seed endpoint is available. Use POST method to seed the database.",
    instructions:
      "Send a POST request to this endpoint to seed the database with sample data.",
    testAccounts: [
      { email: "sarah.chen@techcorp.com", password: "password123" },
      { email: "marcus.j@innovate.io", password: "password123" },
      { email: "emily.rodriguez@designstudio.com", password: "password123" },
    ],
  });
}

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          error: "Database seeding is not allowed in production",
        },
        { status: 403 }
      );
    }

    console.log("🌱 Starting database seeding process...");

    // Test database connection first
    try {
      await connectToDatabase();
      console.log("✅ Database connection successful");
    } catch (dbError: any) {
      console.error("❌ Database connection failed:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to connect to database",
          details: dbError.message,
          troubleshooting: {
            mongodb_uri: process.env.MONGODB_URI ? "Set" : "Missing",
            suggestions: [
              "Ensure MongoDB is running locally",
              "Check if MONGODB_URI is correct in .env.local",
              "Verify MongoDB service is started",
            ],
          },
        },
        { status: 500 }
      );
    }

    // Run the seed function
    const result = await seedDatabase();

    console.log("🎉 Database seeding completed successfully!");

    return NextResponse.json({
      ...result,
      success: true, // Move this after the spread to ensure it's not overwritten
      message: "Database seeded successfully!",
      testAccounts: {
        message: "You can now log in with any of these test accounts:",
        accounts: [
          {
            email: "sarah.chen@techcorp.com",
            password: "password123",
            role: "Software Engineer",
          },
          {
            email: "marcus.j@innovate.io",
            password: "password123",
            role: "Product Manager",
          },
          {
            email: "emily.rodriguez@designstudio.com",
            password: "password123",
            role: "UX Designer",
          },
          {
            email: "david.kim@datainsights.com",
            password: "password123",
            role: "Data Scientist",
          },
        ],
      },
    });
  } catch (error: any) {
    console.error("❌ Seed API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed database",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        troubleshooting: {
          common_issues: [
            "MongoDB not running",
            "Connection string incorrect",
            "Database permissions issue",
            "Network connectivity problem",
          ],
        },
      },
      { status: 500 }
    );
  }
}
