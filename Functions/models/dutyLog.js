const mongoose = require('mongoose');

const dutyLogSchema = new mongoose.Schema({
    staffId: { type: String, required: true },
    date: { type: Date, default: Date.now },
    duty: { type: String, required: true }, // e.g., Opening, Closing, Shift
    notes: { type: String }
});

module.exports = mongoose.model('DutyLog', dutyLogSchema);
