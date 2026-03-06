// jwt Authorization for user & admin
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError("Missing or invalid Authorization header", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is missing in .env");

    const payload = jwt.verify(token, secret);

    const user = await User.findById(payload.id).select("_id username role");
    if (!user) throw new AppError("Invalid or expired token", 401);

    // user 
    req.user = user; // => { _id, username, role }
    next();
  } catch (err) {
    // jwt.verify kan kasta (expired, invalid)
    if (
      err.name === "JsonWebTokenError" ||
      err.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(err);
  }
}

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Unauthorized", 401));
    if (!allowed.includes(req.user.role)) {
      return next(new AppError("Forbidden", 403));
    }
    next();
  };
}

module.exports = { requireAuth, authorizeRoles };

