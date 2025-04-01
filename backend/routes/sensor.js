const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Get all sensor data
router.get('/', sensorController.getAllSensorData);

// Get sensor data by device ID
router.get('/device/:deviceId', sensorController.getSensorDataByDevice);

// Get latest sensor data by type and device
router.get('/latest/:deviceId/:sensorType', sensorController.getLatestSensorData);

// Create new sensor data
router.post('/', sensorController.createSensorData);

// Add this to your existing routes
router.post('/publish', sensorController.publishSensorCommand);

module.exports = router;