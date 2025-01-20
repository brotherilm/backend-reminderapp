import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

export async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    // Kembalikan hanya client untuk digunakan di route lain
    return client;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
