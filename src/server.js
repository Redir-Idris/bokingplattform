// Starting server + Mongo + socket
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");
const { logger } = require("./utils/logger");

async function start() {
  await connectDB();
  logger.info("MongoDB connected");

  await connectRedis();
  logger.info("Redis connected");

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  // Make io available in request (so controllers can trigger notifications later)
  app.set("io", io);

  // handle socket-connection and disconnect
  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    logger.info(`API running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  logger.error("Server failed to start", err);
  process.exit(1);
});