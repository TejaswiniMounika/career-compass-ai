import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import resumeRoutes from "./routes/resume.js";
import aiRoutes from "./routes/ai.js";
import applicationRoutes from "./routes/applications.js";
import portfolioRoutes from "./routes/portfolio.js";
import internshipRoutes from "./routes/internships.js";
import adminRoutes from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((value) => value.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health routes
app.get("/", (req, res) => {
  res.json({
    name: "Career Compass AI API",
    status: "ok",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: err.message || "Server error",
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    console.log("MongoDB connected successfully");

    app.listen(port, "0.0.0.0", () => {
      console.log(`API running on port ${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}

startServer();