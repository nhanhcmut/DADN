const User = require('../models/User');
const { getHashedPassword } = require("../utils/password.js");
var bcrypt = require("bcryptjs")
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const {email, password, newPassword } = req.body;
    if (!password || !newPassword || !email) {
      return res.status(400).json({ message: "Thiếu thông tin" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

  

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mật khẩu cũ không chính xác" });
    }

    const hashedNewPassword=await getHashedPassword(newPassword);

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
