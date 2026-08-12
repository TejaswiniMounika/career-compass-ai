import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: "Internship" },
    company: String,
    role: String,
    applyUrl: String,
    status: {
      type: String,
      enum: ["Saved", "Applied", "Interview", "Selected", "Rejected"],
      default: "Saved"
    },
    appliedAt: Date,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Application", applicationSchema);
