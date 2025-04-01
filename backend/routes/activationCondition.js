const express = require('express');
const router = express.Router();
const activationConditionController = require('../controllers/activationConditionController');
const auth = require('../middleware/auth');

// Apply authentication middleware
router.use(auth);

// Get all conditions
router.get('/', activationConditionController.getAllConditions);

// Get conditions by device
router.get('/device/:deviceId', activationConditionController.getDeviceConditions);

// Create new condition
router.post('/', activationConditionController.createCondition);

// Update condition
router.put('/:id', activationConditionController.updateCondition);

// Delete condition
router.delete('/:id', activationConditionController.deleteCondition);

// Toggle activation flag
router.patch('/:id/toggle', activationConditionController.toggleFlag);

module.exports = router;