const SensorData = require('../models/SensorData');
const mqttService = require('../services/mqttService');

// Get all sensor data
exports.getAllSensorData = async (req, res) => {
    try {
        const sensorData = await SensorData.find()
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 })
            .limit(100); // Giới hạn 100 bản ghi mới nhất
        res.json(sensorData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get sensor data by device ID
exports.getSensorDataByDevice = async (req, res) => {
    try {
        const sensorData = await SensorData.find({ deviceId: req.params.deviceId })
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 })
            .limit(50); // Giới hạn 50 bản ghi mới nhất cho mỗi thiết bị
        res.json(sensorData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new sensor data
exports.createSensorData = async (req, res) => {
  try {
    const { sensorType, value, deviceId } = req.body;
    const sensorData = new SensorData({
      sensorType,
      value,
      deviceId
    });
    const newSensorData = await sensorData.save();
    res.status(201).json(newSensorData);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get latest sensor data by type and device
exports.getLatestSensorData = async (req, res) => {
    try {
        const { deviceId, sensorType } = req.params;
        const latestData = await SensorData.findOne({
            deviceId,
            sensorType
        })
            .sort({ timestamp: -1 })
            .populate('deviceId', 'name location');

        if (!latestData) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu cảm biến' });
        }
        res.json(latestData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Publish command to MQTT
exports.publishSensorCommand = async (req, res) => {
    try {
        const { feed, value } = req.body;
        const success = mqttService.publishCommand(feed, value);
        
        if (success) {
            res.json({ message: 'Command published successfully' });
        } else {
            res.status(400).json({ message: 'Invalid feed or MQTT client not connected' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};