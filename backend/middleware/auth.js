const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "failed", message: "Authorization token missing or invalid" });
  }
  const token = authorizationHeader.split(" ")[1]; // Extract the token after "Bearer"
  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
          return res.status(403).json({ status: "failed", message: "Token không hợp lệ hoặc đã hết hạn." });
      }
      req.user = user;
      next();
  });
};

module.exports = authenticateToken;