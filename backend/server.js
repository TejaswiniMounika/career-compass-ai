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

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: "2mb" }));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.json({
    name: "Career Compass AI API",
    status: "ok"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Server error"
  });
});

export default app;