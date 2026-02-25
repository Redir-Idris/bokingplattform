// jwt Authorization for user & admin
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Missing or invalid Authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing in .ev");

    const decoded = jwt.verify(token, secret);
    // decoded = { userID, role, iat, exp }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) throw new AppError("User not found", 401);

    // user 
    req.user = user;

    next();
    // jwt.verify can throw various errors → we map to 401
  } catch (err) {
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError"
    ) {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401));
    if (req.user.role !== role) return next(new AppError("Forbidden", 403));
    next();
  };
}

module.exports = { requireAuth, requireRole };