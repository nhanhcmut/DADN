const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const WaterProcess = require('../models/WaterProcess');
const ActivationCondition = require('../models/ActivationCondition');

class MqttService {
    constructor() {
        this.clients = {}; // Chứa các kết nối MQTT cho từng thiết bị
        this.connectAllDevices(); // Kết nối tất cả thiết bị khi khởi tạo dịch vụ
    }

    // Hàm lấy tất cả thiết bị từ MongoDB
    async getAllDevices() {
        try {
            const devices = await Device.find({});
            console.log('Danh sách thiết bị từ MongoDB:', devices);
            return devices;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thiết bị:', error);
            throw error;
        }
    }

    // Hàm kết nối tất cả thiết bị lên MQTT
    async connectAllDevices() {
        try {
            const devices = await this.getAllDevices();
            devices.forEach(device => {
                if (device.usernameaio && device.keyaio) {
                    this.connect(device);
                } else {
                    console.warn(`Thiết bị ${device.name} thiếu thông tin đăng nhập MQTT`);
                }
            });
        } catch (error) {
            console.error('Lỗi khi kết nối tất cả thiết bị:', error);
        }
    }

    // Hàm kết nối một thiết bị đến broker MQTT
    connect(device) {
        const brokerUrl = 'mqtt://io.adafruit.com';

        if (!device || !device._id || !device.name) {
            console.error('Lỗi: Device bị undefined hoặc thiếu thuộc tính quan trọng!');
            return;
        }

        // Nếu thiết bị đã kết nối rồi, ngắt kết nối cũ
        if (this.clients[device._id]) {
            this.clients[device._id].end(true);
        }

        console.log(`Kết nối MQTT cho thiết bị: ${device.name}`);

        // Kết nối với Adafruit
        const client = mqtt.connect(brokerUrl, {
            username: device.usernameaio,
            password: device.keyaio,
            reconnectPeriod: 5000,
            connectTimeout: 30000
        });

        client.on('connect', async () => {
            console.log(`📡 Thiết bị ${device.name} đã kết nối MQTT`);
            this.subscribeToFeeds(client, device);

            // Gửi toàn bộ dữ liệu lên Adafruit sau khi kết nối thành công
            await this.sendDeviceDataToAdafruit(client, device);
        });

        client.on('error', (error) => {
            console.error(`Lỗi kết nối MQTT cho thiết bị ${device.name}:`, error);
        });

        client.on('message', async (topic, message) => {
            await this.handleMessage(device, topic, message);
        });

        this.clients[device._id] = client;
    }

    // Hàm gửi dữ liệu thiết bị lên Adafruit
    async sendDeviceDataToAdafruit(client, device) {
        try {
            const sensorData = await SensorData.findOne({ deviceId: device._id });
            const waterProcess = await WaterProcess.findOne({ deviceId: device._id });
            const activationCondition = await ActivationCondition.findOne({ deviceId: device._id });

            if (sensorData || waterProcess || activationCondition) {
                console.log(`🚀 Đang gửi toàn bộ dữ liệu lên Adafruit...`);

                const feedMapping = {
                    'temp': sensorData?.tempvalue,
                    'humid': sensorData?.humidvalue,
                    'tempswitch': waterProcess?.tempControlled,
                    'humidswitch': waterProcess?.humidControlled,
                    'pump': waterProcess?.manualControl,
                    'speed': waterProcess?.pumpSpeed,
                    'tempstart': activationCondition?.conditions.temperature.start,
                    'tempstop': activationCondition?.conditions.temperature.stop,
                    'humidstart': activationCondition?.conditions.humidity.start,
                    'humidstop': activationCondition?.conditions.humidity.stop
                };

                for (const [feed, value] of Object.entries(feedMapping)) {
                    if (value !== undefined && value !== null) {
                        await this.publishToDeviceFeed(device._id, feed, value.toString());
                        console.log(`✅ Đã gửi dữ liệu lên ${feed}: ${value}`);
                    }
                }
            }
        } catch (error) {
            console.error("🚨 Lỗi khi gửi toàn bộ dữ liệu lên Adafruit:", error);
        }
    }

    // Hàm đăng ký nhận dữ liệu từ các feed của thiết bị
    subscribeToFeeds(client, device) {
        const feeds = [
            'temp', 'humid', 'tempswitch', 'humidswitch', 
            'pump', 'speed', 'tempstart', 'tempstop', 
            'humidstart', 'humidstop'
        ];

        feeds.forEach(feed => {
            const topic = `${device.usernameaio}/feeds/${feed}`;
            client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Lỗi khi đăng ký ${feed}:`, err);
                } else {
                    console.log(`Đã đăng ký nhận dữ liệu từ ${topic}`);
                }
            });
        });
    }

    // Hàm gửi dữ liệu lên Adafruit
    async publishToDeviceFeed(deviceId, feed, value) {
        try {
            const device = await Device.findById(deviceId);
            if (!device) {
                throw new Error('Thiết bị không tồn tại');
            }
    
            const client = this.clients[deviceId];
            if (!client) {
                throw new Error(`Thiết bị ${device.name} chưa kết nối MQTT`);
            }
    
            const topic = `${device.usernameaio}/feeds/${feed}`;
    
            // Nếu feed thuộc nhóm kiểm soát, chuyển đổi giá trị thành chuỗi "ON"/"OFF"
            const controlFeeds = ["tempControlled", "humidControlled", "manualControl"];
            if (controlFeeds.includes(feed)) {
                value = value === "true" ? "1" : "0";
            }
    
            client.publish(topic, value.toString());
            console.log(`📤 Gửi dữ liệu đến ${topic}: ${value}`);
        } catch (error) {
            console.error("🚨 Lỗi khi gửi dữ liệu:", error);
        }
    }
    

    // Hàm xử lý các message từ Adafruit
    async handleMessage(device, topic, message) {
        try {
            if (!device) {
                console.error("Lỗi: Device bị undefined!");
                return;
            }

            const value = message.toString();
            const feedType = this.getFeedTypeFromTopic(topic);

            let sensorData = await SensorData.findOne({ deviceId: device._id });

            if (!sensorData) {
                sensorData = new SensorData({
                    deviceId: device._id,
                    humidvalue: feedType === "humidity" ? value : "0",
                    tempvalue: feedType === "temperature" ? value : "0",
                    timestamp: new Date()
                });
            } else {
                if (feedType === "temperature") {
                    sensorData.tempvalue = value;
                } else if (feedType === "humidity") {
                    sensorData.humidvalue = value;
                }
                sensorData.timestamp = new Date();
            }

            await sensorData.save();
            console.log("📡 Dữ liệu nhiệt độ & độ ẩm đã được cập nhật:", sensorData);

            // Cập nhật WaterProcess nếu có
            if (['tempControlled', 'humidControlled', 'manualControl', 'pumpSpeed'].includes(feedType)) {
                let waterProcess = await WaterProcess.findOneAndUpdate(
                    { deviceId: device._id },
                    { $set: { updatedAt: new Date() }, $setOnInsert: { startTime: new Date(), status: "SCHEDULED" } },
                    { upsert: true, new: true }
                );

                if (feedType === 'pumpSpeed') {
                    waterProcess.pumpSpeed = parseInt(value);
                } else {
                    waterProcess[feedType] = value === '1';
                }

                await waterProcess.save();
                console.log(`💧 Đã cập nhật WaterProcess cho thiết bị ${device._id}:`, waterProcess);
            }

            // Cập nhật ActivationCondition nếu có
            if (['tempStart', 'tempStop', 'humidStart', 'humidStop'].includes(feedType)) {
                let condition = await ActivationCondition.findOneAndUpdate(
                    { deviceId: device._id },
                    { $set: { updatedAt: new Date() }, $setOnInsert: { description: "connect to adafruit", flag: true } },
                    { upsert: true, new: true }
                );

                if (feedType === 'tempStart') {
                    condition.conditions.temperature.start = value;
                } else if (feedType === 'tempStop') {
                    condition.conditions.temperature.stop = value;
                } else if (feedType === 'humidStart') {
                    condition.conditions.humidity.start = value;
                } else if (feedType === 'humidStop') {
                    condition.conditions.humidity.stop = value;
                }

                await condition.save();
                console.log(`🔥 Đã cập nhật ActivationCondition cho thiết bị ${device._id}:`, condition);
            }
        } catch (error) {
            console.error("🚨 Lỗi xử lý MQTT message:", error);
        }
    }

    // Hàm xác định loại feed từ topic
    getFeedTypeFromTopic(topic) {
        const feed = topic.split('/').pop();
        const feedMap = {
            'temp': 'temperature',
            'humid': 'humidity',
            'tempswitch': 'tempControlled',
            'humidswitch': 'humidControlled', 
            'pump': 'manualControl',
            'speed': 'pumpSpeed',
            'tempstart': 'tempStart',
            'tempstop': 'tempStop',
            'humidstart': 'humidStart',
            'humidstop': 'humidStop'
        };
        return feedMap[feed] || feed;
    }

    // Ngắt kết nối MQTT khi cần
    disconnect() {
        Object.values(this.clients).forEach(client => client.end());
        console.log('Disconnected from MQTT broker');
    }
}

module.exports = new MqttService();
