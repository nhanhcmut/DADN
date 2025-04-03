const History = require('../models/History');

// Get all history
// Lấy tất cả lịch sử (giới hạn 50 giá trị gần nhất)
exports.getAllHistory = async (req, res) => {
    try {
        const history = await History.find()
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 })
            .limit(50); // 🔥 Giới hạn chỉ lấy 50 bản ghi mới nhất

        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDeviceHistory = async (req, res) => {
    try {
        const history = await History.find({ deviceId: req.params.deviceId })
            .populate('deviceId', 'name location')
            .sort({ timestamp: 1 })
            .limit(50);

        // Chuyển timestamp sang múi giờ Đông Dương (ICT, GMT+7)
        const convertedHistory = history.map(record => ({
            time_ICT: new Date(record.timestamp).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" }), // Chuyển đổi thời gian
            temperature: record.tempvalue, // Nhiệt độ
            humidity: record.humidvalue // Độ ẩm
        }));

        res.json({ deviceId: req.params.deviceId, history: convertedHistory });
    } catch (err) {
        console.error("❌ Lỗi API:", err);
        res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại." });
    }
};





// Get history by type (temperature/humidity)
exports.getHistoryByType = async (req, res) => {
    try {
        const history = await History.find({ type: req.params.type.toUpperCase() })
            .populate('deviceId', 'name location')
            .sort({ timestamp: 1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};