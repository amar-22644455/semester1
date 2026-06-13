const jwt = require('jsonwebtoken');
const User = require('../models/users');

module.exports = async function (req, res, next) {
  try {
    let token = null;

    // 1. Try to read token from cookies
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
        const [k, v] = c.split('=').map(p => p.trim());
        if (k) acc[k] = v;
        return acc;
      }, {});
      token = cookies.token;
    }

    // 2. Fallback to Authorization header if cookie not present
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      const authHeaderToken = req.headers.authorization.split(" ")[1];
      if (authHeaderToken && authHeaderToken !== 'null' && authHeaderToken !== 'undefined') {
        token = authHeaderToken;
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

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
