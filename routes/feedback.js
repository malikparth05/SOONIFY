const express = require('express');
const router = express.Router();
// Ensure this matches the filename 'Feedback.js' EXACTLY
const Feedback = require('../models/Feedback'); 

// --- CREATE (POST /api/feedback) ---
router.post('/', async (req, res) => {
    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ message: "Email and message are required" });
        }

        const newFeedback = new Feedback({ email, message });
        await newFeedback.save();
        
        res.status(201).json({ message: "Feedback submitted successfully" });

    } catch (err) {
        console.error("Feedback error:", err);
        res.status(500).json({ message: "Error submitting feedback" });
    }
});

module.exports = router;
