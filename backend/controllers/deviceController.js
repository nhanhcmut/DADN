const Device = require('../models/Device');
const mqttService = require('../services/mqttService');
const WaterProcess = require('../models/WaterProcess');
const ActivationCondition = require('../models/ActivationCondition');
const SensorData = require('../models/SensorData');
const History = require('../models/History');

// Get all devices
exports.getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate({
        path: 'userId',
        select: 'username email -_id'
      });

    // Lấy thêm data từ các collection liên quan
    const devicesWithData = await Promise.all(devices.map(async (device) => {
      const waterProcesses = await WaterProcess.find({ deviceId: device._id });
      const conditions = await ActivationCondition.find({ deviceId: device._id });
      
      return {
        ...device._doc,
        waterProcesses,
        conditions
      };
    }));

    res.json(devicesWithData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single device - không cần filter theo userId
exports.getDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }
    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create device 
exports.createDevice = async (req, res) => {
  try {
    const { name, location, usernameaio, keyaio } = req.body;

    if (!name || !location || !usernameaio || !keyaio) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin thiết bị'
      });
    }

    // Tạo device mới
    const device = new Device({
      name,
      location, 
      usernameaio,
      keyaio,
      userId: req.user.userId
    });

    const savedDevice = await device.save();

    // Tạo water process mặc định
    const waterProcess = new WaterProcess({
      deviceId: savedDevice._id,
      startTime: new Date(),
      duration: 30,
      tempControlled: false,
      humidControlled: false,
      manualControl: true,
      pumpSpeed: 0
    });
    await waterProcess.save();

    // Tạo activation condition mặc định
    const condition = new ActivationCondition({
      deviceId: savedDevice._id,
      description: 'Điều kiện mặc định',
      conditions: {
        temperature: {
          min: 40,
          max: 35
        },
        humidity: {
          min: 40,
          max: 70
        }
      }
    });
    await condition.save();

    res.status(201).json({
      success: true,
      data: {
        device: savedDevice,
        waterProcess,
        condition
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false, 
      error: error.message
    });
  }
};

// Update device
exports.updateDevice = async (req, res) => {
  try {
    const { name, location, usernameaio, keyaio } = req.body;
    
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { name, location, usernameaio, keyaio },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy thiết bị'
      });
    }

    mqttService.updateCredentials(usernameaio, keyaio);

    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete device - không cần filter theo userId
exports.deleteDevice = async (req, res) => {
  try {
    // Delete related collections first
    await Promise.all([
      WaterProcess.deleteMany({ deviceId: req.params.id }),
      ActivationCondition.deleteMany({ deviceId: req.params.id }),
      SensorData.deleteMany({ deviceId: req.params.id }),
      History.deleteMany({ deviceId: req.params.id })
    ]);

    // Delete the device
    const device = await Device.findByIdAndDelete(req.params.id);
    
    if (!device) {
      return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
    }

    res.json({ message: 'Đã xóa thiết bị và các dữ liệu liên quan' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};