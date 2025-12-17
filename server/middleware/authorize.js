const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header
    const jwtToken = req.header("Authorization");

    if (!jwtToken) {
      return res.status(403).json({ msg: "Authorization Denied: No Token" });
    }

    // 2. Verify token (Format: "Bearer <token>")
    const token = jwtToken.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = payload.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};