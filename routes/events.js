const express = require('express');
const router = express.Router();

//  Import the model you created
// (Your file is named 'Events.js', so we use that path)
const Event = require('../models/Events'); 

// This is the "R" in CRUD (Read) ---
// GET /api/events - List all events
router.get('/', async (req, res) => {
    try {
        // This finds ALL events in your database
        const events = await Event.find().sort({ rawDateISO: 1 }); 
        res.json(events); // Send them as JSON
    } catch (err) {
        console.error("Error fetching events:", err);
        res.status(500).json({ message: "Error fetching events" });
    }
});

//  This is the "C" in CRUD (Create) ---
// POST /api/events - Create a new event
router.post('/', async (req, res) => {
    try {
        // req.body comes from your add.js
        const eventData = req.body;
        
        // Create a new event instance using the model
        const newEvent = new Event(eventData);
        
        // Save it to the MongoDB database
        await newEvent.save();
        
        console.log("SUCCESS: Event saved to MongoDB:", newEvent.title);
        res.status(201).json(newEvent); // Send the new event back
        
    } catch (err) {
        console.error("Error saving event:", err);
        res.status(500).json({ message: "Error saving event" });
    }
});


// GET /api/events/:id - Get a single event
router.get('/:id', async (req, res) => {
    try {
        // Find by the unique 'id' field, not the mongo _id
        const event = await Event.findOne({ id: req.params.id }); 
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(event);
    } catch (err) {
        console.error("Error fetching event:", err);
        res.status(500).json({ message: "Error fetching event" });
    }
});

module.exports = router;