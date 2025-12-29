const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'New' } // Optional: track status
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);