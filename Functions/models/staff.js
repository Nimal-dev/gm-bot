const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true }, // e.g., Manager, Cook, Waiter
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Staff', staffSchema);
