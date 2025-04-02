const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    humidvalue: {
        type: String,
        default: '0'
    },
    tempvalue: {
        type: String,
        default: '0'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('History', HistorySchema);