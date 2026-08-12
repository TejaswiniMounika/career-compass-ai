import express from "express";
import { protect } from "../middleware/auth.js";
import Application from "../models/Application.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const apps = await Application.find({ user: req.user._id }).populate("internship").sort({ createdAt: -1 });
  res.json(apps);
});

router.post("/", protect, async (req, res) => {
  const app = await Application.create({ ...req.body, user: req.user._id });
  res.status(201).json(app);
});

router.put("/:id", protect, async (req, res) => {
  const app = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!app) return res.status(404).json({ message: "Application not found" });
  res.json(app);
});

router.delete("/:id", protect, async (req, res) => {
  await Application.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Deleted" });
});

export default router;
