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
    const conditions = await ActivationCondition.findOne({ deviceId: req.params.deviceId })
      .populate('deviceId', 'name location')
      .populate({ path: 'waterProcessId', select: 'startTime duration', strictPopulate: false });

    if (!conditions) {
      return res.status(404).json({ message: "Không tìm thấy điều kiện kích hoạt cho thiết bị này." });
    }

    res.json(conditions.conditions); 
  } catch (err) {
    console.error("Lỗi API:", err);
    res.status(500).json({ message: "Lỗi máy chủ, vui lòng kiểm tra log." });
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
    const { conditions } = req.body;
    const deviceId = req.params.id;

    if (!conditions) {
      return res.status(400).json({ message: 'Điều kiện không được để trống' });
    }

    // Tìm điều kiện kích hoạt của thiết bị
    const condition = await ActivationCondition.findOne({ deviceId });
    
    if (!condition) {
      return res.status(404).json({ message: 'Không tìm thấy điều kiện kích hoạt' });
    }

    // Kiểm tra điều kiện nếu đã cung cấp
    if (conditions) {
      if (!conditions.temperature || !conditions.humidity) {
        return res.status(400).json({ 
          message: 'Điều kiện phải bao gồm cả nhiệt độ và độ ẩm' 
        });
      }

      // Kiểm tra các giá trị start và stop có hợp lệ không
      const { temperature, humidity } = conditions;
      if (
        isNaN(temperature.start) || isNaN(temperature.stop) ||
        isNaN(humidity.start) || isNaN(humidity.stop)
      ) {
        return res.status(400).json({
          message: 'Giá trị start và stop của nhiệt độ và độ ẩm phải là số hợp lệ'
        });
      }

      // Cập nhật các điều kiện
      condition.conditions = conditions;
      
    //   // Gửi thông tin lên Adafruit thông qua MQTT
    //   await mqttService.publishToDeviceFeed(deviceId, 'tempstart', temperature.start.toString());
    //   await mqttService.publishToDeviceFeed(deviceId, 'tempstop', temperature.stop.toString());
    //   await mqttService.publishToDeviceFeed(deviceId, 'humidstart', humidity.start.toString());
    //   await mqttService.publishToDeviceFeed(deviceId, 'humidstop', humidity.stop.toString());
   }

    // Lưu điều kiện đã cập nhật vào cơ sở dữ liệu
    await condition.save();

    // Trả về điều kiện đã cập nhật
    res.json(condition);
  } catch (err) {
    console.error('Lỗi khi cập nhật điều kiện:', err.message);
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