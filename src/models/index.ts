import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Post Schema
const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [1000, "Post cannot be more than 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: [500, "Comment cannot be more than 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Connection function
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Export models
export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Post = mongoose.models.Post || mongoose.model("Post", postSchema);

// Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  bio: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost {
  _id: string;
  content: string;
  author: IUser;
  likes: string[];
  comments: {
    user: IUser;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
