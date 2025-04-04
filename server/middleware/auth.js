const jwt = require('jsonwebtoken');
const User = require('../models/users');

module.exports = async function (req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    req.user = user; // Attach user to request
    next(); // Proceed to next middleware
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};
