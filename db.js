const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user_account: {
        primary_email: String,
        user_id: String,
        role: String
    },
    user_profile: {
        display_name: String
    }
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
