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
    // Lấy các tham số từ request body
    const { tempControlled, humidControlled, manualControl, pumpSpeed } = req.body;

    // Kiểm tra xem các tham số có hợp lệ không
    if (tempControlled === undefined || humidControlled === undefined || manualControl === undefined) {
      return res.status(400).json({ message: 'Các tham số tempControlled, humidControlled và manualControl là bắt buộc' });
    }


    // Tìm quy trình tưới nước của thiết bị
    const process = await WaterProcess.findOne({ deviceId: req.params.id });
    if (!process) {
      return res.status(404).json({ message: 'Không tìm thấy quy trình tưới nước' });
    }

    // Lưu trạng thái trước đó
    const previousProcess = await WaterProcess.findOne({ deviceId: req.params.id });

    if (!previousProcess) {
      console.error("Không tìm thấy dữ liệu quy trình trước đó!");
      return;
    }

    // Kiểm tra và cập nhật nếu giá trị thay đổi
    if (previousProcess.tempControlled !== tempControlled) {
      process.tempControlled = tempControlled;
      const tempControlledValue = tempControlled ? "1" : "0"; // Chuyển boolean thành chuỗi "1" hoặc "0"
      await mqttService.publishToDeviceFeed(req.params.id, 'tempswitch', tempControlledValue);
    }
    
    if (previousProcess.humidControlled !== humidControlled) {
      process.humidControlled = humidControlled;
      const humidControlledValue = humidControlled ? "1" : "0"; // Chuyển boolean thành chuỗi "1" hoặc "0"
      await mqttService.publishToDeviceFeed(req.params.id, 'humidswitch', humidControlledValue);
    }
    
    if (previousProcess.manualControl !== manualControl) {
      process.manualControl = manualControl;
      const manualControlValue = manualControl ? "1" : "0"; // Chuyển boolean thành chuỗi "1" hoặc "0"
      await mqttService.publishToDeviceFeed(req.params.id, 'pump', manualControlValue);
    }

    if (previousProcess.pumpSpeed !== pumpSpeed && pumpSpeed !== undefined && pumpSpeed !== null
    ) {
      process.pumpSpeed = pumpSpeed;
      await mqttService.publishToDeviceFeed(req.params.id, 'speed', pumpSpeed);
    }

    // Lưu quy trình đã cập nhật nếu có thay đổi
    await process.save();


    // Trả về dữ liệu quy trình đã được cập nhật
    res.json(process);
  } catch (err) {
    console.error('Lỗi khi cập nhật quy trình tưới nước:', err.message);
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