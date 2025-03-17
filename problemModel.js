import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  problem_id: { type: String, required: true, unique: true },
  problem_title: { type: String, required: true },
  problem_description: String,
  problem_level: { type: String, enum: ["easy", "medium", "hard"], required: true },
  problem_tags: { type: [String], default: [] },  // ✅ Added missing field
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Problem", problemSchema);
