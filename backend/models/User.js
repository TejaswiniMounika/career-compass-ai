import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    profile: {
      phone: String,
      college: String,
      degree: String,
      branch: String,
      graduationYear: Number,
      targetCareer: String,
      skills: [String],
      bio: String,
      github: String,
      linkedin: String
    },
    resume: {
      originalName: String,
      path: String,
      text: String,
      uploadedAt: Date,
      analysis: mongoose.Schema.Types.Mixed
    },
    readinessScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
