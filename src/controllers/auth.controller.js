// Aut controller register + login
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { AppError } = require("../utils/AppError");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in .env");

  // håll payload liten och tydlig
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    secret,
    { expiresIn: "2h" }
  );
}

// POST /register
async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError("username and password are required", 400);
    }
    if (String(password).length < 6) {
      throw new AppError("password must be at least 6 characters", 400);
    }

    const existing = await User.findOne({ username });
    if (existing) {
      throw new AppError("Username already exists", 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      role: "User",
    });

    res.status(201).json({
      message: "User registered",
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// POST /login
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError("username and password are required", 400);
    }

    const user = await User.findOne({ username });
    if (!user) throw new AppError("Invalid credentials", 401);

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new AppError("Invalid credentials", 401);

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };