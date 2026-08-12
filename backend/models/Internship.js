import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    mode: { type: String, enum: ["Remote", "Hybrid", "Onsite"], default: "Remote" },
    skills: [String],
    applyUrl: String,
    deadline: Date,
    description: String,
    status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Internship", internshipSchema);
