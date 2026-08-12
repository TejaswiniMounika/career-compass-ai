import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

router.put("/", protect, async (req, res) => {
  const allowed = [
    "phone", "college", "degree", "branch", "graduationYear",
    "targetCareer", "skills", "bio", "github", "linkedin"
  ];

  const profile = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) profile[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: Object.fromEntries(Object.entries(profile).map(([k, v]) => [`profile.${k}`, v])) },
    { new: true }
  ).select("-password");

  res.json(user);
});

export default router;
