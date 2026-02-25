// Aut controller register + login
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { AppError } = require("../utils/AppError");

async function register(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError("username and password are required", 400);
    }

    if (password.length < 6) {
      throw new AppError("password must be at least 6 charaters", 400);
    }

    const existing = await User.findOne({ username });
    if (existing) {
      throw new AppError("username already exists", 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashed,
      role: "User",
    });

    res.status(201).json({
      message: "User registered",
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

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

    const token = signToken({ userId: user._id.toString(), role: user.role });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };