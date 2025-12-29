const express = require('express');
const router = express.Router();
const User = require('../models/User');
// const bcrypt = require('bcrypt'); // Uncomment if you implement password hashing

// --- GET (Read) User Settings ---
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select('-password');
        if (!user) {
            // If user 'parth' doesn't exist, create a dummy one for the demo
            if (req.params.username === 'parth') {
                const newUser = new User({
                    username: 'parth',
                    password: '123', // Default
                    fullName: 'Parth Malik',
                    email: 'parth@gmail.com',
                    notifications: { email: true, push: false }
                });
                await newUser.save();
                return res.json(newUser);
            }
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Settings GET Error:", err);
        res.status(500).json({ message: "Error fetching user settings" });
    }
});

// --- PUT (Update) User Profile ---
router.put('/:username/profile', async (req, res) => {
    try {
        const { fullName } = req.body;
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: { fullName: fullName } },
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ message: "Error saving profile" });
    }
});

// --- PUT (Update) User Security ---
router.put('/:username/security', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findOne({ username: req.params.username });

        if (!user) return res.status(404).json({ message: "User not found" });

        // Simple string comparison for this demo
        if (user.password !== currentPassword) {
            return res.status(400).json({ message: "Current password does not match" });
        }
        
        user.password = newPassword;
        await user.save();
        
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Security Update Error:", err);
        res.status(500).json({ message: "Error updating password" });
    }
});

// --- PUT (Update) User Notifications ---
router.put('/:username/notifications', async (req, res) => {
    try {
        // Safely access nested properties
        const notifs = req.body.notifications || {};
        
        const updatedUser = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: { 
                'notifications.email': notifs.email,
                'notifications.push': notifs.push
            }},
            { new: true }
        ).select('-password');
        
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json(updatedUser);
    } catch (err) {
        console.error("Notification Update Error:", err);
        res.status(500).json({ message: "Error saving notifications" });
    }
});

module.exports = router;