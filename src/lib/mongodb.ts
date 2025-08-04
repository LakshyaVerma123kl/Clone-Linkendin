// src/lib/mongodb.ts
import mongoose from "mongoose";

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

// Environment variables validation
const MONGODB_URI = process.env.MONGODB_URI!;
const NODE_ENV = process.env.NODE_ENV || "development";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Connection configuration
const connectionConfig = {
  bufferCommands: false,
  maxPoolSize: NODE_ENV === "production" ? 10 : 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4, skip trying IPv6
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  compressors: "snappy,zlib", // Enable compression
  retryWrites: true,
  retryReads: true,
  // Database name from URI or default
  dbName: process.env.MONGODB_DB_NAME,
};

// Enhanced logging with sanitized URI
function getSafeUri(uri: string): string {
  try {
    const url = new URL(uri);
    return `${url.protocol}//${url.hostname}:${url.port || "27017"}${
      url.pathname
    }`;
  } catch {
    return uri.replace(/\/\/.*@/, "//***:***@");
  }
}

// Connection state tracking
interface ConnectionState {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  lastConnected: Date | null;
  connectionCount: number;
}

let cached: ConnectionState = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
    isConnecting: false,
    lastConnected: null,
    connectionCount: 0,
  };
}

// Connection event handlers
function setupConnectionEventHandlers() {
  if (mongoose.connection.listenerCount("connected") === 0) {
    mongoose.connection.on("connected", () => {
      cached.lastConnected = new Date();
      cached.connectionCount++;
      console.log(
        `✅ MongoDB connected successfully! (Connection #${cached.connectionCount})`
      );
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
      console.log(
        `🏠 Host: ${mongoose.connection.host}:${mongoose.connection.port}`
      );
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected");
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
      cached.lastConnected = new Date();
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🛑 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        console.error("Error during MongoDB shutdown:", error);
        process.exit(1);
      }
    });
  }
}

/**
 * Connect to MongoDB with enhanced error handling and connection management
 * @returns Promise<typeof mongoose>
 */
async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log("📦 Using cached MongoDB connection");
    return cached.conn;
  }

  // Prevent multiple connection attempts
  if (cached.isConnecting && cached.promise) {
    console.log("⏳ MongoDB connection in progress, waiting...");
    return cached.promise;
  }

  // Clean up stale connection state
  if (mongoose.connection.readyState === 3) {
    // Disconnected
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.isConnecting = true;

    console.log("🚀 Establishing new MongoDB connection...");
    console.log(`🌐 Target: ${getSafeUri(MONGODB_URI)}`);
    console.log(`🔧 Environment: ${NODE_ENV}`);

    // Setup event handlers before connecting
    setupConnectionEventHandlers();

    cached.promise = mongoose
      .connect(MONGODB_URI, connectionConfig)
      .then((mongooseInstance) => {
        cached.isConnecting = false;
        return mongooseInstance;
      })
      .catch((error) => {
        cached.isConnecting = false;
        cached.promise = null;
        console.error("❌ MongoDB initial connection failed:", error.message);

        // Enhanced error information
        if (error.code === "ENOTFOUND") {
          console.error(
            "🔍 DNS resolution failed. Check your MongoDB URI hostname."
          );
        } else if (error.code === "ECONNREFUSED") {
          console.error(
            "🚫 Connection refused. Check if MongoDB is running and accessible."
          );
        } else if (error.name === "MongoAuthenticationError") {
          console.error(
            "🔐 Authentication failed. Check your MongoDB credentials."
          );
        } else if (error.name === "MongoNetworkError") {
          console.error(
            "🌐 Network error. Check your network connection and MongoDB URI."
          );
        }

        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    cached.promise = null;
    cached.isConnecting = false;
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

/**
 * Get current connection status information
 */
export function getConnectionStatus() {
  const readyState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    state: states[readyState as keyof typeof states] || "unknown",
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    database: mongoose.connection.db?.databaseName,
    lastConnected: cached.lastConnected,
    connectionCount: cached.connectionCount,
    isConnecting: cached.isConnecting,
  };
}

/**
 * Forcefully disconnect from MongoDB
 */
export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    cached.isConnecting = false;
    console.log("🔌 MongoDB connection closed manually");
  } catch (error: any) {
    console.error("Error closing MongoDB connection:", error.message);
    throw error;
  }
}

/**
 * Check if database connection is healthy
 */
export async function healthCheck(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) {
      return false;
    }

    // Ping the database
    await mongoose.connection.db?.admin().ping();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Wrapper for database operations with connection retry
 */
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectToDatabase();
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(
        `Database operation attempt ${attempt} failed:`,
        error.message
      );

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Database operation failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// Export the main connection function as default
export default connectToDatabase;

// Additional exports for convenience
export { connectToDatabase };

// Development helper - log connection stats
if (NODE_ENV === "development") {
  setInterval(() => {
    const status = getConnectionStatus();
    if (status.state === "connected") {
      console.log(
        `📊 MongoDB Status: ${status.state} | DB: ${status.database} | Connections: ${status.connectionCount}`
      );
    }
  }, 30000); // Log every 30 seconds in development
}
