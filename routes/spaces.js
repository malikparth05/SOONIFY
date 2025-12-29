const express = require('express');
const router = express.Router();
const Space = require('../models/Space');
require('../models/User'); // This ensures the 'User' model is registered for populate

// --- READ (GET /api/spaces) ---
// This will get all spaces
router.get('/', async (req, res) => {
    try {
        // Find all spaces. We will try to populate members.
        // If 'User' model isn't registered, it might error here.
        const spaces = await Space.find().populate('members', 'username avatar');
        res.json(spaces);
    } catch (err) {
        console.error("Error fetching spaces:", err);
        res.status(500).json({ message: "Error fetching spaces" });
    }
});

// --- CREATE (POST /api/spaces) ---
// This will create a new space
router.post('/', async (req, res) => {
    try {
        const { title, description } = req.body; // Get data from the frontend
        
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        
        const newSpace = new Space({
            title: title,
            description: description,
            members: [] // Start with no members
        });
        
        await newSpace.save(); // Save to database
        res.status(201).json(newSpace); // Send the new space back

    } catch (err) {
        console.error("Error saving space:", err);
        res.status(500).json({ message: "Error saving space" });
    }
});

module.exports = router;