const History = require('../models/History');

// Get all history
// Lấy tất cả lịch sử (giới hạn 50 giá trị gần nhất)
exports.getAllHistory = async (req, res) => {
    try {
        const history = await History.find()
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDeviceHistory = async (req, res) => {
    try {
        let history = await History.find({ deviceId: req.params.deviceId })
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 }) // Lấy 40 giá trị mới nhất

        // Lọc dữ liệu để chỉ lấy một bản ghi trong cùng khoảng thời gian
        const uniqueHistory = [];
        let lastTimestamp = null;

        history.forEach(record => {
            const currentTimestamp = new Date(record.timestamp).getTime(); // Lấy timestamp dưới dạng số
            if (!lastTimestamp || Math.abs(currentTimestamp - lastTimestamp) > 1000) { // Kiểm tra nếu cách nhau hơn 1 giây
                uniqueHistory.push(record);
                lastTimestamp = currentTimestamp;
            }
        });

        // Đảo ngược mảng để sắp xếp từ cũ nhất đến mới nhất
        uniqueHistory.reverse();

        // Chuyển timestamp sang múi giờ Đông Dương (ICT, GMT+7)
        const convertedHistory = uniqueHistory.map(record => ({
            time_ICT: new Date(record.timestamp).toLocaleString("vi-VN", { timeZone: "Asia/Bangkok" }),
            temperature: record.tempvalue,
            humidity: record.humidvalue
        }));

        res.json({ deviceId: req.params.deviceId, history: convertedHistory });
    } catch (err) {
        console.error("Lỗi API:", err);
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