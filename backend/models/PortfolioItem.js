import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["certificate", "project"], required: true },
    title: { type: String, required: true },
    issuer: String,
    url: String,
    description: String,
    skills: [String],
    date: Date
  },
  { timestamps: true }
);

export default mongoose.model("PortfolioItem", itemSchema);
