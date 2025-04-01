const express = require('express');
const router = express.Router();
const waterProcessController = require('../controllers/waterProcessController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Get all water processes
router.get('/', waterProcessController.getAllWaterProcesses);

// Get water processes for a specific device
router.get('/device/:deviceId', waterProcessController.getDeviceWaterProcesses);

// Schedule new water process
router.post('/', waterProcessController.scheduleWaterProcess);

// Update water process controls
router.patch('/:id/controls', waterProcessController.updateProcessControls);

// Update water process status
router.patch('/:id/status', waterProcessController.updateWaterProcessStatus);

// Delete water process
router.delete('/:id', waterProcessController.deleteWaterProcess);

module.exports = router;