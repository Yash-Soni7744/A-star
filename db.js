import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_account: {
    primary_email: { type: String, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
    last_logged_in_at: Date,
    role: String,
    user_id: { type: String, required: true, unique: true, index: true }, // ✅ Added index for fast lookup
  },
  user_profile: {
    avatar_url: String,
    display_name: { type: String, required: true },
  },
});

export default mongoose.model("User", userSchema);
