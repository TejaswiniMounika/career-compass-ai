import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import Internship from "../models/Internship.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { status: "Open" };
  res.json(await Internship.find(filter).sort({ createdAt: -1 }));
});

router.post("/", protect, adminOnly, async (req, res) => {
  const item = await Internship.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(item);
});

router.put("/:id", protect, adminOnly, async (req, res) => {
  const item = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(item);
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  await Internship.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;
