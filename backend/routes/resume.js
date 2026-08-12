import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { askAI, safeJson } from "../utils/ai.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  }
});

router.post("/upload", protect, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Upload a PDF resume" });

    const buffer = fs.readFileSync(req.file.path);
    const parsed = await pdfParse(buffer);
    const text = parsed.text.slice(0, 20000);

    const user = await User.findById(req.user._id);
    user.resume = {
      originalName: req.file.originalname,
      path: req.file.path,
      text,
      uploadedAt: new Date()
    };
    await user.save();

    res.json({ message: "Resume uploaded", textPreview: text.slice(0, 500) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/analyze", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.resume?.text) return res.status(400).json({ message: "Upload a resume first" });

    const target = user.profile?.targetCareer || "software developer";
    const prompt = `
You are a career coach. Analyze this student's resume for the target career: ${target}.
Return ONLY valid JSON with:
{
  "summary": "short summary",
  "strengths": ["..."],
  "missingSkills": ["..."],
  "suggestions": ["..."],
  "atsScore": 0
}
Resume:
${user.resume.text}
`;

    const raw = await askAI(prompt);
    const analysis = safeJson(raw) || {
      summary: raw,
      strengths: [],
      missingSkills: [],
      suggestions: [],
      atsScore: 0
    };

    user.resume.analysis = analysis;
    await user.save();
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
