const ActivationCondition = require('../models/ActivationCondition');
const mqttService = require('../services/mqttService');

// Get all activation conditions
exports.getAllConditions = async (req, res) => {
  try {
    const conditions = await ActivationCondition.find()
      .populate('deviceId', 'name location');
    res.json(conditions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get conditions by device ID
exports.getDeviceConditions = async (req, res) => {
  try {
    const conditions = await ActivationCondition.find({ deviceId: req.params.deviceId })
      .populate('deviceId', 'name location')
      .populate('waterProcessId', 'startTime duration');
    res.json(conditions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new activation condition
exports.createCondition = async (req, res) => {
  try {
    const { deviceId, waterProcessId, description, conditions } = req.body;

    // Validate conditions
    if (!conditions.temperature || !conditions.humidity) {
      return res.status(400).json({ 
        message: 'Điều kiện phải bao gồm nhiệt độ và độ ẩm' 
      });
    }

    const activationCondition = new ActivationCondition({
      deviceId,
      waterProcessId,
      description,
      conditions: {
        temperature: conditions.temperature,
        humidity: conditions.humidity
      }
    });

    const newCondition = await activationCondition.save();

    // Publish thresholds to Adafruit
    await mqttService.publishThresholds(deviceId, conditions);

    res.status(201).json(newCondition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update activation condition
exports.updateCondition = async (req, res) => {
  try {
    const { description, conditions, flag } = req.body;
    const condition = await ActivationCondition.findById(req.params.id);
    
    if (!condition) {
      return res.status(404).json({ message: 'Không tìm thấy điều kiện kích hoạt' });
    }

    // Validate conditions if provided
    if (conditions && (!conditions.temperature || !conditions.humidity)) {
      return res.status(400).json({ 
        message: 'Điều kiện phải bao gồm nhiệt độ và độ ẩm' 
      });
    }

    // Update condition
    condition.description = description || condition.description;
    if (conditions) {
      condition.conditions = conditions;
      // Publish new thresholds to Adafruit
      await mqttService.publishThresholds(condition.deviceId, conditions);
    }
    condition.flag = flag !== undefined ? flag : condition.flag;

    await condition.save();

    res.json(condition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete activation condition
exports.deleteCondition = async (req, res) => {
  try {
    const condition = await ActivationCondition.findByIdAndDelete(req.params.id);
    if (!condition) {
      return res.status(404).json({ message: 'Không tìm thấy điều kiện kích hoạt' });
    }
    res.json({ message: 'Đã xóa điều kiện kích hoạt' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle activation flag
exports.toggleFlag = async (req, res) => {
  try {
    const condition = await ActivationCondition.findById(req.params.id);
    if (!condition) {
      return res.status(404).json({ message: 'Không tìm thấy điều kiện kích hoạt' });
    }
    condition.flag = !condition.flag;
    await condition.save();
    res.json(condition);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};