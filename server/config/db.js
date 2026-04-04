import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
    return true;
  } catch (error) {
    isConnected = false;
    console.error("❌ MongoDB connection error:", error.message);
    if (env.ALLOW_DB_OPTIONAL) {
      console.warn("⚠️  Continuing in offline mode (ALLOW_DB_OPTIONAL=true)");
      return false;
    }
    throw error;
  }
};

export const isDbConnected = () => isConnected;