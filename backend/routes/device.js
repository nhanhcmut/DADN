const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Get all devices with related data
router.get('/', deviceController.getAllDevices);

// Get single device with related data
router.get('/:id', deviceController.getDevice);

// Create new device (will auto create related collections)
router.post('/', deviceController.createDevice);

// Update device
router.put('/:id', deviceController.updateDevice);

// Delete device (should also delete related collections)
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;