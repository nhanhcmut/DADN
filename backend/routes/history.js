const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Get all history
router.get('/', historyController.getAllHistory);

// Get history by device
router.get('/device/:deviceId', historyController.getDeviceHistory);

// Get history by type
router.get('/type/:type', historyController.getHistoryByType);

module.exports = router;