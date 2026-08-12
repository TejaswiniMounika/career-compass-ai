import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    career: String,
    questions: [String],
    answers: [String],
    feedback: String,
    score: Number
  },
  { timestamps: true }
);

export default mongoose.model("MockInterview", interviewSchema);
