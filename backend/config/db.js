import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ WARNING: MONGO_URI is not defined. Running database operations in mock/local mode.");
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      appName: "healthcare-portal",
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.warn("⚠️ Express server will continue running to allow port binding. Check your database network connection and IP whitelists.");
  }
}
