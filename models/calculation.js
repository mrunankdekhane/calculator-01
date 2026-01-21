const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
    expression: {
        type: String,
        required: true
    },
    result: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Calculation', calculationSchema);