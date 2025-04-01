const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên thiết bị']
  },
  location: {
    type: String,
    required: [true, 'Vui lòng nhập vị trí thiết bị']
  },
  usernameaio: {
    type: String,
    required: [true, 'Vui lòng nhập Adafruit username']
  },
  keyaio: {
    type: String,
    required: [true, 'Vui lòng nhập Adafruit key']
  },
  feeds: {
    temperature: {
      type: String,
      default: '0'
    },
    humidity: {
      type: String,
      default: '0'
    },
    soil: {
      type: String,
      default: '0'
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Device', DeviceSchema);