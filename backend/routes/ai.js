import express from "express";
import { protect } from "../middleware/auth.js";
import { askAI, safeJson } from "../utils/ai.js";
import User from "../models/User.js";
import MockInterview from "../models/MockInterview.js";

const router = express.Router();

router.post("/skill-gap", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const career = req.body.career || user.profile?.targetCareer || "Software Developer";
    const currentSkills = user.profile?.skills || [];

    const raw = await askAI(`
Create a practical skill-gap analysis for a student targeting ${career}.
Current skills: ${currentSkills.join(", ") || "none"}.
Return ONLY JSON:
{
  "career": "${career}",
  "requiredSkills": ["..."],
  "matchedSkills": ["..."],
  "skillGaps": ["..."],
  "priorityOrder": ["..."]
}
`);
    const data = safeJson(raw) || { career, requiredSkills: [], matchedSkills: [], skillGaps: [], priorityOrder: [] };
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/roadmap", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const career = req.body.career || user.profile?.targetCareer || "Software Developer";

    const raw = await askAI(`
Create a 12-week placement preparation roadmap for a student targeting ${career}.
Current skills: ${(user.profile?.skills || []).join(", ") || "beginner"}.
Return ONLY JSON:
{
  "career": "${career}",
  "weeks": [
    {"week": 1, "focus": "...", "tasks": ["..."], "outcome": "..."}
  ]
}
Exactly 12 weeks.
`);
    const data = safeJson(raw) || { career, weeks: [] };
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/chat", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const message = req.body.message?.trim();
    if (!message) return res.status(400).json({ message: "Message is required" });

    const answer = await askAI(`
You are Career Compass AI, a helpful career and placement assistant.
Student profile:
Name: ${user.name}
Target career: ${user.profile?.targetCareer || "not set"}
Skills: ${(user.profile?.skills || []).join(", ") || "not set"}
Question: ${message}
Give concise, practical guidance. Do not invent job openings.
`);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/mock-interview", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const career = req.body.career || user.profile?.targetCareer || "Software Developer";

    const raw = await askAI(`
Create 5 interview questions for a ${career} placement interview.
Return ONLY JSON: {"questions":["q1","q2","q3","q4","q5"]}
`);
    const data = safeJson(raw) || { questions: [] };
    const interview = await MockInterview.create({
      user: user._id,
      career,
      questions: data.questions
    });

    res.json({ interviewId: interview._id, questions: interview.questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/mock-interview/:id/evaluate", protect, async (req, res) => {
  try {
    const interview = await MockInterview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    interview.answers = req.body.answers || [];

    const raw = await askAI(`
Evaluate this mock interview for ${interview.career}.
Questions:
${interview.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}
Answers:
${interview.answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}
Return ONLY JSON:
{"score":0,"feedback":"...","strengths":["..."],"improvements":["..."]}
`);
    const data = safeJson(raw) || { score: 0, feedback: raw, strengths: [], improvements: [] };
    interview.score = Number(data.score) || 0;
    interview.feedback = JSON.stringify(data);
    await interview.save();

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
