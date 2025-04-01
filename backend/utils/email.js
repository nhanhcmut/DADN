const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: options.to,
      subject: "Yêu cầu thiết lập lại mật khẩu thành công",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Xin chào <strong>${options.name}</strong>,</p>

          <p>Chúng tôi nhận thấy bạn đã yêu cầu thiết lập lại mật khẩu. Dưới đây là mật khẩu mới của bạn:</p>
          
          <div style="background-color: #f8f9fa; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0; text-align: center;">
            <strong style="font-size: 18px; color: #d9534f;">${options.text}</strong>
          </div>
          
          <p>Vui lòng sử dụng mật khẩu này để đăng nhập vào tài khoản của bạn. Sau khi đăng nhập, chúng tôi khuyến nghị bạn thay đổi mật khẩu để tăng cường bảo mật. Hãy truy cập phần <strong>"Cài đặt"</strong> để thực hiện thay đổi.</p>

          <p>Nếu bạn không yêu cầu thiết lập lại mật khẩu, vui lòng liên hệ ngay với chúng tôi qua email 
            <a href="mailto:smartprint8386@gmail.com" style="color: #007bff; text-decoration: none;">smartprint8386@gmail.com</a> để được hỗ trợ.
          </p>

          <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!</p>
          <p>Trân trọng,<br><strong>SensorPump</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Đã xảy ra lỗi khi gửi email:", error);
  }
};


module.exports = sendEmail;