const jwt = require("jsonwebtoken");

// JWT secret (replace with your own secret or use environment variable)
const JWT_SECRET = "mySuperSecret123"; // same secret as used in login

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET); // token valid for 30 days
    req.user = decoded.user; // decoded contains user ID
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};