// Redis, Logger, Error handling, Health route
const mongoose = require("mongoose");
const { logger } = require("../utils/logger");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing in .env");

  await mongoose.connect(uri);
  logger.info("MongoDB connected");
}

module.exports = { connectDB };