const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const { generateRandomPassword, getHashedPassword } = require("../utils/password.js");
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!email || ! password || !username) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Tạo tài khoản thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; 
    if (!email || ! password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
    }
    const user = await User.findOne({ email });
   
    
    if (!user) {
      return res.status(400).json({ message: 'Email không đúng.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không đúng.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' });
    }
    console.log(user)
    let dummyPassword = generateRandomPassword();
    let hashedPassword = await getHashedPassword(dummyPassword);
    user.password=hashedPassword;
    await user.save();

    await sendEmail({
      to: user.email,
      name:user.username,
      text: dummyPassword
    });

    res.json({ message: 'Email đặt lại mật khẩu đã được gửi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
