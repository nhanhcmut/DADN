const WaterProcess = require('../models/WaterProcess');
const mqttService = require('../services/mqttService');

// Get all water processes
exports.getAllWaterProcesses = async (req, res) => {
  try {
    const processes = await WaterProcess.find()
      .populate('deviceId', 'name location')
      .sort({ startTime: -1 });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get water processes for a specific device
exports.getDeviceWaterProcesses = async (req, res) => {
  try {
    const processes = await WaterProcess.find({ deviceId: req.params.deviceId })
      .populate('deviceId', 'name location')
      .sort({ startTime: -1 });
    res.json(processes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Schedule new water process
exports.scheduleWaterProcess = async (req, res) => {
  try {
    const { deviceId, startTime, tempControlled, humidControlled, manualControl, pumpSpeed } = req.body;

    const waterProcess = new WaterProcess({
      deviceId,
      startTime,
      tempControlled,
      humidControlled,
      manualControl,
      pumpSpeed
    });

    const newProcess = await waterProcess.save();
    
    // Update MQTT feeds based on controls
    if (tempControlled) {
      await mqttService.publishToDeviceFeed(deviceId, 'tempswitch', '1');
    }
    if (humidControlled) {
      await mqttService.publishToDeviceFeed(deviceId, 'humidswitch', '1');
    }
    if (manualControl) {
      await mqttService.publishToDeviceFeed(deviceId, 'pump', '1');
    }
    // Update pump speed
    await mqttService.publishToDeviceFeed(deviceId, 'speed', pumpSpeed.toString());

    res.status(201).json(newProcess);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update water process controls
exports.updateProcessControls = async (req, res) => {
  try {
    const { tempControlled, humidControlled, manualControl, pumpSpeed } = req.body;
    const process = await WaterProcess.findById(req.params.id);
    
    if (!process) {
      return res.status(404).json({ message: 'Không tìm thấy quy trình tưới nước' });
    }

    // Validate pump speed
    if (pumpSpeed !== undefined && (pumpSpeed < 0 || pumpSpeed > 100)) {
      return res.status(400).json({ message: 'Tốc độ bơm phải từ 0 đến 100' });
    }

    // Update process controls
    process.tempControlled = tempControlled;
    process.humidControlled = humidControlled;
    process.manualControl = manualControl;
    if (pumpSpeed !== undefined) {
      process.pumpSpeed = pumpSpeed;
    }
    
    await process.save();

    // Update MQTT feeds
    await mqttService.publishToDeviceFeed(process.deviceId, 'tempswitch', tempControlled ? '1' : '0');
    await mqttService.publishToDeviceFeed(process.deviceId, 'humidswitch', humidControlled ? '1' : '0');
    await mqttService.publishToDeviceFeed(process.deviceId, 'pump', manualControl ? '1' : '0');
    if (pumpSpeed !== undefined) {
      await mqttService.publishToDeviceFeed(process.deviceId, 'speed', pumpSpeed.toString());
    }

    res.json(process);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update water process status
exports.updateWaterProcessStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const process = await WaterProcess.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('deviceId', 'name location');
    
    if (!process) {
      return res.status(404).json({ message: 'Không tìm thấy quy trình tưới nước' });
    }
    res.json(process);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete water process
exports.deleteWaterProcess = async (req, res) => {
  try {
    const process = await WaterProcess.findByIdAndDelete(req.params.id);
    if (!process) {
      return res.status(404).json({ message: 'Không tìm thấy quy trình tưới nước' });
    }
    res.json({ message: 'Đã xóa quy trình tưới nước' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};