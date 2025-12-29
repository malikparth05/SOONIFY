const mongoose = require('mongoose');

// This schema will store your shared spaces
const spaceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    // This will link to users in your 'users' collection
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // This must match the model name in 'User.js'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Space', spaceSchema);