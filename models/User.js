const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // In a real app, you MUST hash this!
    fullName: { type: String },
    avatar: { type: String, default: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Default' },
    
   
    notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);