const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const History = require('../models/History');
const WaterProcess = require('../models/WaterProcess');
const ActivationCondition = require('../models/ActivationCondition');

class MqttService {
    constructor() {
        this.clients = {}; // Lưu trữ kết nối MQTT cho từng thiết bị
        this.connectAllDevices(); // Tự động kết nối tất cả thiết bị khi khởi tạo
    }

    // Lấy danh sách tất cả thiết bị từ MongoDB
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

    // Kết nối tất cả thiết bị với MQTT
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

    // Kết nối một thiết bị cụ thể với MQTT
    connect(device) {
        const brokerUrl = 'mqtt://io.adafruit.com';

        // Kiểm tra thiết bị trước khi kết nối
        if (!device || !device._id || !device.name) {
            console.error('Lỗi: Device bị undefined hoặc thiếu thuộc tính quan trọng!');
            return;
        }

        // Ngắt kết nối nếu thiết bị đã được kết nối trước đó
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
        });

        client.on('error', (error) => {
            console.error(`Lỗi kết nối MQTT cho thiết bị ${device.name}:`, error);
        });

        client.on('message', async (topic, message) => {
            await this.handleMessage(device, topic, message);
        });

        this.clients[device._id] = client; // Lưu client vào danh sách
    }



    // Gửi dữ liệu từ một thiết bị đến MQTT
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


    async publishThresholds(deviceId, conditions) {
        try {
            const device = await Device.findById(deviceId);
            if (!device) {
                throw new Error('Device not found');
            }

            // Publish temperature thresholds
            await this.publishToDeviceFeed(deviceId, 'tempstart', conditions.temperature.min.toString());
            await this.publishToDeviceFeed(deviceId, 'tempstop', conditions.temperature.max.toString());
            
            // Publish humidity thresholds
            await this.publishToDeviceFeed(deviceId, 'humidstart', conditions.humidity.min.toString());
            await this.publishToDeviceFeed(deviceId, 'humidstop', conditions.humidity.max.toString());

            console.log(`Published thresholds for device ${device.name}`);
        } catch (error) {
            console.error('Error publishing thresholds:', error);
            throw error;
        }
    }

    subscribeToFeeds() {
        const feeds = [
            'temp', 
            'humid',
            'tempswitch',    // điều khiển theo nhiệt độ
            'humidswitch',   // điều khiển theo độ ẩm
            'pump',          // điều khiển thủ công
            'speed',         // tốc độ bơm
            'tempstart',     // nhiệt độ min
            'tempstop',      // nhiệt độ max
            'humidstart',    // độ ẩm min
            'humidstop'      // độ ẩm max
        ];
        feeds.forEach(feed => {
            const topic = `${this.username}/feeds/${feed}`;
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error(`Error subscribing to ${feed}:`, err);
                } else {
                    console.log(`Subscribed to ${feed}`);
                }
            });
        });
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

    async handleMessage(topic, message) {
        try {
            const value = message.toString();
            const feedType = this.getFeedTypeFromTopic(topic);
            const device = await Device.findOne({ usernameaio: topic.split('/')[0] });

            if (!device) return;

            // Handle sensor data
            if (feedType === 'temperature' || feedType === 'humidity') {
                const oldValue = device.feeds[feedType];
                
                if (oldValue !== value) {
                    device.feeds[feedType] = value;
                    await device.save();

                    await this.createHistory(device, feedType, oldValue, value);
                }

                let sensorData = await SensorData.findOne({ deviceId: device._id });
                if (!sensorData) {
                    sensorData = new SensorData({
                        deviceId: device._id,
                        timestamp: new Date()
                    });
                }

                if (feedType === 'temperature') {
                    sensorData.tempvalue = value;
                } else if (feedType === 'humidity') {
                    sensorData.humidvalue = value;
                }

                sensorData.timestamp = new Date();
                await sensorData.save();
            }

            // Handle water process controls
            if (['tempControlled', 'humidControlled', 'manualControl', 'pumpSpeed'].includes(feedType)) {
                const waterProcess = await WaterProcess.findOne({ deviceId: device._id });
                if (waterProcess) {
                    if (feedType === 'pumpSpeed') {
                        waterProcess[feedType] = parseInt(value);
                    } else {
                        waterProcess[feedType] = value === '1';
                    }
                    await waterProcess.save();
                }
            }

            // Handle activation condition thresholds
            if (['tempStart', 'tempStop', 'humidStart', 'humidStop'].includes(feedType)) {
                const condition = await ActivationCondition.findOne({ deviceId: device._id });
                if (condition) {
                    if (feedType.startsWith('temp')) {
                        const key = feedType === 'tempStart' ? 'min' : 'max';
                        condition.conditions.temperature[key] = parseFloat(value);
                    } else {
                        const key = feedType === 'humidStart' ? 'min' : 'max';
                        condition.conditions.humidity[key] = parseFloat(value);
                    }
                    await condition.save();
                }
            }

        } catch (error) {
            console.error('Error processing MQTT message:', error);
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            console.log('Disconnected from MQTT broker');
        }
    }
}

module.exports = new MqttService();