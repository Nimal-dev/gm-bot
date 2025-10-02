const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
    staffId: { type: String, required: true },
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    totalHours: { type: Number }, // calculated on clock out
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeLog', timeLogSchema);
