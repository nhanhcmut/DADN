const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const mqttService = require('./services/mqttService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/device');
const sensorRoutes = require('./routes/sensor');
const waterProcessRoutes = require('./routes/waterProcess');
const activationConditionRoutes = require('./routes/activationCondition');
const historyRoutes = require('./routes/history');

const app = express();

// Connect Database
connectDB();

// Connect to MQTT
mqttService.connect();

// Middleware
const corsOptions = {
  origin: ["http://localhost:3002", "https://dadn-8nv0.onrender.com"],
  credentials: true,
  methods: ["GET", "POST","DELETE","PATCH","OPTIONS"],

};

app.use(cors(corsOptions));

  
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/sensor-data', sensorRoutes);
app.use('/api/water-processes', waterProcessRoutes);
app.use('/api/activation-conditions', activationConditionRoutes);
app.use('/api/history', historyRoutes);

// Cleanup MQTT connection on server shutdown
process.on('SIGINT', () => {
    mqttService.disconnect();
    process.exit();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
