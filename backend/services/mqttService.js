const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const History = require('../models/History');
const WaterProcess = require('../models/WaterProcess');
const ActivationCondition = require('../models/ActivationCondition');

class MqttService {
    constructor() {
        this.clients = {}; 
        this.connectAllDevices(); 
    }

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

    connect(device) {
        const brokerUrl = 'mqtt://io.adafruit.com';

        if (!device || !device._id || !device.name) {
            console.error('Lỗi: Device bị undefined hoặc thiếu thuộc tính quan trọng!');
            return;
        }

        if (this.clients[device._id]) {
            this.clients[device._id].end(true);
        }

        console.log(`Kết nối MQTT cho thiết bị: ${device.name}`);

        const client = mqtt.connect(brokerUrl, {
            username: device.usernameaio,
            password: device.keyaio,
            reconnectPeriod: 5000,
            connectTimeout: 30000
        });

        client.on('connect', () => {
            console.log(`Thiết bị ${device.name} đã kết nối MQTT`);
            this.subscribeToFeeds(client, device);
        });

        client.on('error', (error) => {
            console.error(`Lỗi kết nối MQTT cho thiết bị ${device.name}:`, error);
        });

        client.on('message', async (topic, message) => {
            await this.handleMessage(device, topic, message);
        });

        this.clients[device._id] = client;
    }

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
            client.publish(topic, value.toString());
            console.log(`Gửi dữ liệu đến ${topic}: ${value}`);
        } catch (error) {
            console.error('Lỗi khi gửi dữ liệu:', error);
        }
    }

    async handleMessage(device, topic, message) {
        try {
            if (!device) {
                console.error("Lỗi: Device bị undefined!");
                return;
            }
    
            const value = message.toString();
            const feedType = this.getFeedTypeFromTopic(topic);
            const newHistory = new History({
                deviceId: device._id,
                humidvalue: feedType === "humidity" ? value : "0",
                tempvalue: feedType === "temperature" ? value : "0",
                timestamp: new Date()
            });
    
            await newHistory.save();
            console.log("Lịch sử dữ liệu đã được cập nhật:", newHistory);
    
            // Cập nhật hoặc tạo mới SensorData
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
            console.log("Dữ liệu nhiệt độ & độ ẩm đã được cập nhật:", sensorData);
    
            if (['tempControlled', 'humidControlled', 'manualControl', 'pumpSpeed'].includes(feedType)) {
                let waterProcess = await WaterProcess.findOne({ deviceId: device._id });
    
                if (!waterProcess) {
                    // Tạo mới nếu chưa có dữ liệu
                    waterProcess = new WaterProcess({
                        deviceId: device._id,
                        startTime: new Date(),
                        tempControlled: false,
                        humidControlled: false,
                        manualControl: false,
                        pumpSpeed: 0,
                        status: "SCHEDULED"
                    });
                }
    
                // Cập nhật giá trị theo feed nhận được
                if (feedType === 'tempControlled') {
                    waterProcess.tempControlled = value === '1';
                } else if (feedType === 'humidControlled') {
                    waterProcess.humidControlled = value === '1';
                } else if (feedType === 'manualControl') {
                    waterProcess.manualControl = value === '1';
                } else if (feedType === 'pumpSpeed') {
                    waterProcess.pumpSpeed = parseInt(value);
                }
    
                waterProcess.updatedAt = new Date();
                await waterProcess.save();
                console.log(`Đã cập nhật WaterProcess cho thiết bị ${device._id}:`, waterProcess);
            }
            
            if (['tempStart', 'tempStop', 'humidStart', 'humidStop'].includes(feedType)) {
                let condition = await ActivationCondition.findOne({ deviceId: device._id });
    
                if (!condition) {
                    condition = new ActivationCondition({
                        deviceId: device._id,
                        description: "connect to adafruit",
                        flag: true,
                        conditions: {
                            temperature: { min: 0, max: 0 },
                            humidity: { min: 0, max: 0 }
                        }
                    });
                }
    
                // Cập nhật giá trị tương ứng
                if (feedType === 'tempStart') {
                    condition.conditions.temperature.start = value;
                } else if (feedType === 'tempStop') {
                    condition.conditions.temperature.stop = value;
                } else if (feedType === 'humidStart') {
                    condition.conditions.humidity.start = value;
                } else if (feedType === 'humidStop') {
                    condition.conditions.humidity.stop = value;
                }
    
                condition.updatedAt = new Date();
                await condition.save();
                console.log(`Đã cập nhật ActivationCondition cho thiết bị ${device._id}:`, condition);
            }
    
    

        } catch (error) {
            console.error("Lỗi xử lý MQTT message:", error);
        }
    }
    
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

    disconnect() {
        Object.values(this.clients).forEach(client => client.end());
        console.log('Disconnected from MQTT broker');
    }
}

module.exports = new MqttService();
