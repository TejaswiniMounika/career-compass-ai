import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import User from "../models/User.js";
import Internship from "../models/Internship.js";
import Application from "../models/Application.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, async (req, res) => {
  const [users, internships, applications, admins] = await Promise.all([
    User.countDocuments({ role: "student" }),
    Internship.countDocuments(),
    Application.countDocuments(),
    User.countDocuments({ role: "admin" })
  ]);

  res.json({ users, internships, applications, admins });
});

router.get("/users", protect, adminOnly, async (req, res) => {
  res.json(await User.find().select("-password").sort({ createdAt: -1 }));
});

export default router;
