const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    primary_email: String,
    user_id: String,
    display_name: String
});

module.exports = mongoose.model('User',userSchema, 'users')