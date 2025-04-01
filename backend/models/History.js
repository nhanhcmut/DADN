const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    type: {
        type: String,
        enum: ['TEMPERATURE', 'HUMIDITY'],
        required: true
    },
    oldValue: {
        type: String,
        required: true
    },
    newValue: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('History', HistorySchema);