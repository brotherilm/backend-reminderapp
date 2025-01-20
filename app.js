import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/route.js";
import { connectToDatabase } from "./config/db.js";

const app = express();
const port = process.env.PORT || 4000;

// CORS middleware
app.use(
  cors({
    origin: "*", // Mengizinkan semua origin untuk development
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Method yang diizinkan
    allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan
    credentials: true, // Mengizinkan credentials (cookies, authorization headers, dll)
  })
);

// Basic middleware for parsing JSON
app.use(express.json());

// Routes
app.use("/api", userRoutes);

// Initialize server
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
