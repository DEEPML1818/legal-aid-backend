const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    salary: { type: Number, required: true },
    document: { type: String, required: true }, // Path to the uploaded document
    status: { type: String, default: 'pending' }, // Application status
    notes: { type: [String], default: [] } // Array of notes
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
