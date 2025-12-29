const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username, password: password });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        res.json({ 
            username: user.username, 
            fullName: user.fullName, 
            avatar: user.avatar 
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login" });
    }
});

// NEW: GET ALL USERS (GET /api/auth/users) 
// This is for your collaboration page to list all members
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Find all users, but don't send their passwords
        res.json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
});

//  REGISTER/INVITE (POST /api/auth/register) 
// This will be called by your new modal
router.post('/register', async (req, res) => {
    try {
        const { username, email, fullName } = req.body;

        if (!username || !email) {
            return res.status(400).json({ message: 'Username and Email are required.' });
        }

        // Check if user already exists
        let user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: 'User with this username or email already exists.' });
        }

        // Create a new user
        user = new User({
            username,
            email,
            fullName,
            password: 'defaultPassword123', // Set a default temporary password
            avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`
        });

        await user.save(); // Save to database
        res.status(201).json(user); // Send the new user back

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: "Server error during registration." });
    }
});

module.exports = router;