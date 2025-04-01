const History = require('../models/History');

// Get all history
exports.getAllHistory = async (req, res) => {
    try {
        const history = await History.find()
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get history by device
exports.getDeviceHistory = async (req, res) => {
    try {
        const history = await History.find({ deviceId: req.params.deviceId })
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get history by type (temperature/humidity)
exports.getHistoryByType = async (req, res) => {
    try {
        const history = await History.find({ type: req.params.type.toUpperCase() })
            .populate('deviceId', 'name location')
            .sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};