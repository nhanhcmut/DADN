const mongoose = require('mongoose');

const ActivationConditionSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  flag: {
    type: Boolean,
    default: false
  },
  conditions: {
    temperature: {
      start: Number,
      stop: Number
    },
    humidity: {
      start: Number,
      stop: Number
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ActivationCondition', ActivationConditionSchema);