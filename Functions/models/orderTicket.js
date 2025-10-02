const mongoose = require('mongoose');

const orderTicketSchema = new mongoose.Schema({
    customer: { type: String, required: true },
    items: [{ name: String, quantity: Number, price: Number }],
    total: { type: Number, required: true },
    status: { type: String, default: 'Pending' }, // Pending, Preparing, Ready, Delivered
    createdBy: { type: String, required: true }, // staff userId
    createdAt: { type: Date, default: Date.now },
    notes: { type: String }
});

module.exports = mongoose.model('OrderTicket', orderTicketSchema);
