import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user_id: { type: String, required: true },  // Matches user's user_id
  problem_id: { type: String, required: true },  // Matches problem's problem_id
  submission_status: { type: String, enum: ["Accepted", "Wrong Answer", "Runtime Error"], required: true }, // ✅ Added status tracking
  score: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Submission", submissionSchema);
