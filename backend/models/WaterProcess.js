const mongoose = require('mongoose');

const WaterProcessSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  tempControlled: {
    type: Boolean,
    default: false
  },
  humidControlled: {
    type: Boolean,
    default: false
  },
  manualControl: {
    type: Boolean,
    default: false
  },
  pumpSpeed: {
    type: Number,
    default: "0"
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
    default: 'SCHEDULED'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WaterProcess', WaterProcessSchema);