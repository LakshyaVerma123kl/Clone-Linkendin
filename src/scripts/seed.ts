// src/scripts/seed.ts
import mongoose from "mongoose";
import { seedDatabase } from "@/lib/seed";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

async function runSeed() {
  try {
    console.log("🚀 Starting database seeding process...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Run the seed function
    const result = await seedDatabase();

    console.log("🎉 Seeding completed successfully!");
    console.log("📊 Results:", result);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seed script
runSeed();
