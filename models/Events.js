const mongoose = require('mongoose');

// This schema is based on your add.js file
const eventSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    rawDateISO: { type: Date },
    time: { type: String },
    category: { type: String, default: 'personal' },
    priority: { type: String, default: 'medium' },
    imageRandomSeed: { type: Number, default: () => Math.floor(Math.random() * 1000) }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Event', eventSchema);