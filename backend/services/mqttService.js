const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const WaterProcess = require('../models/WaterProcess');
const ActivationCondition = require('../models/ActivationCondition');
const History = require('../models/History');

class MqttService {
    constructor() {
        this.clients = {}; // Chứa các kết nối MQTT cho từng thiết bị
        this.lastPublished = {}; // Lưu trữ topic và giá trị cuối cùng đã gửi
        this.connectAllDevices(); // Kết nối tất cả thiết bị khi khởi tạo dịch vụ
    }

    async getAllDevices() {
        try {
            const devices = await Device.find({});
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

        client.on('connect', async () => {
            console.log(`Thiết bị ${device.name} đã kết nối MQTT`);
            this.subscribeToFeeds(client, device);

            setTimeout(async () => {
                await this.sendDeviceDataToAdafruit(client, device);
            }, 3000); 
         
        });

        client.on('error', (error) => {
            console.error(`Lỗi kết nối MQTT cho thiết bị ${device.name}`);
        });

        client.on('message', async (topic, message) => {
            await this.handleMessage(device.id, topic, message);
        });

        this.clients[device._id] = client;
    }

    async sendDeviceDataToAdafruit(client, device) {
        try {
            const sensorData = await SensorData.findOne({ deviceId: device._id });
            const waterProcess = await WaterProcess.findOne({ deviceId: device._id });
            const activationCondition = await ActivationCondition.findOne({ deviceId: device._id });

            if (sensorData || waterProcess || activationCondition) {

                const feedMapping = {
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
                    }
                }
            }
        } catch (error) {
            console.error(" Lỗi khi gửi toàn bộ dữ liệu lên Adafruit:", error);
        }
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

            // Lưu lại dữ liệu vừa gửi để tránh nhận phản hồi từ Adafruit
            this.lastPublished[topic] = value.toString();
        } catch (error) {
            console.error(" Lỗi khi gửi dữ liệu:", error);
        }
    }

    async handleMessage(deviceId, topic, message) {
        try {
            const receivedValue = message.toString();
    
      
            if (!deviceId) {
                console.error("Lỗi: Device bị undefined!");
                return;
            }
    
            console.log(`Nhận dữ liệu từ ${topic}: ${receivedValue}`);
            
            // Xác định loại dữ liệu từ topic
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
    
            const cleanTopic = topic.split('/').pop(); // Lấy phần cuối của topic
            const feedType = feedMap[cleanTopic] || cleanTopic;
    
    
            // Cập nhật SensorData nếu là cảm biến
            if (['temperature', 'humidity'].includes(feedType)) {
                let sensorData = await SensorData.findOne({ deviceId: deviceId });
            
                if (!sensorData) {
                    sensorData = new SensorData({
                        deviceId: deviceId,
                        humidvalue: feedType === "humidity" ? receivedValue : "0",
                        tempvalue: feedType === "temperature" ? receivedValue : "0",
                        timestamp: new Date()
                    });
                } else {
                    if (feedType === "temperature") {
                        sensorData.tempvalue = receivedValue;
                        const timeThreshold = new Date();
                        timeThreshold.setSeconds(timeThreshold.getSeconds() - 0); // Giảm 2 giây để kiểm tra dữ liệu gần nhất
                        
                        let existingHistory = await History.findOne({
                            deviceId: deviceId,
                            timestamp: { $gte: timeThreshold, $lte: new Date() } // Kiểm tra trong khoảng từ 2 giây trước đến hiện tại
                        });
                        
                        
                        if (existingHistory) {
                            existingHistory.tempvalue =receivedValue;
                            await existingHistory.save();
                        } else {
                            await History.create({
                                deviceId: deviceId,
                                humidvalue: sensorData.humidvalue,
                                tempvalue: receivedValue,
                                timestamp: new Date()
                            });
                    
                        }
                    
                    } else if (feedType === "humidity") {
                        sensorData.humidvalue = receivedValue;
                        const timeThreshold = new Date();
                        timeThreshold.setSeconds(timeThreshold.getSeconds() - 0); // Giảm 2 giây để kiểm tra dữ liệu gần nhất
                        
                        let existingHistory = await History.findOne({
                            deviceId: deviceId,
                            timestamp: { $gte: timeThreshold, $lte: new Date() } // Kiểm tra trong khoảng từ 2 giây trước đến hiện tại
                        });
                        
                        
                        if (existingHistory) {
                            existingHistory.humidvalue =receivedValue;
                            await existingHistory.save();
                        } else {
                            await History.create({
                                deviceId: deviceId,
                                humidvalue: receivedValue,
                                tempvalue: sensorData.tempvalue,
                                timestamp: new Date()
                            });
                    
                        }
                    }
                    sensorData.timestamp = new Date();
                }
            
                await sensorData.save();
            
                // Cập nhật lại lastPublished sau khi lưu vào DB
                this.lastPublished[topic] = receivedValue;
            
            }
            
            // Cập nhật WaterProcess nếu là điều khiển bơm
            if (['tempControlled', 'humidControlled', 'manualControl', 'pumpSpeed'].includes(feedType)) {
                let waterProcess = await WaterProcess.findOne({ deviceId: deviceId });
    
                if (!waterProcess) {
                    waterProcess = new WaterProcess({
                        deviceId: deviceId,
                        [feedType]: feedType === 'pumpSpeed' ? parseInt(receivedValue) : receivedValue === '1',
                        updatedAt: new Date()
                    });
                } else {
                    if (feedType === 'pumpSpeed') {
                        waterProcess.pumpSpeed = parseInt(receivedValue);
                    } else {
                        waterProcess[feedType] = receivedValue === '1';
                    }
                    waterProcess.updatedAt = new Date();
                }
    
                await waterProcess.save();
    
                // Cập nhật lại lastPublished sau khi lưu vào DB
                this.lastPublished[topic] = receivedValue;
            }
    
            // Cập nhật ActivationCondition nếu là điều kiện kích hoạt
            if (['tempStart', 'tempStop', 'humidStart', 'humidStop'].includes(feedType)) {
                let activationCondition = await ActivationCondition.findOne({ deviceId: deviceId });
    
                if (!activationCondition) {
                    activationCondition = new ActivationCondition({ 
                        deviceId: deviceId,
                        conditions: { temperature: {}, humidity: {} }
                    });
                }
    
                if (feedType === 'tempStart') {
                    activationCondition.conditions.temperature.start = receivedValue;
                } else if (feedType === 'tempStop') {
                    activationCondition.conditions.temperature.stop = receivedValue;
                } else if (feedType === 'humidStart') {
                    activationCondition.conditions.humidity.start = receivedValue;
                } else if (feedType === 'humidStop') {
                    activationCondition.conditions.humidity.stop = receivedValue;
                }
    
                activationCondition.updatedAt = new Date();
                await activationCondition.save();
    
         
            }
    
        } catch (error) {
            console.error("Lỗi xử lý MQTT message:", error);
        }
    }
    
    
}

module.exports = new MqttService();
