import express from "express";
import { protect } from "../middleware/auth.js";
import PortfolioItem from "../models/PortfolioItem.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  res.json(await PortfolioItem.find({ user: req.user._id }).sort({ date: -1 }));
});

router.post("/", protect, async (req, res) => {
  const item = await PortfolioItem.create({ ...req.body, user: req.user._id });
  res.status(201).json(item);
});

router.delete("/:id", protect, async (req, res) => {
  await PortfolioItem.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Deleted" });
});

export default router;
