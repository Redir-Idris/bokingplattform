// Starting server + Mongo + socket

const http = require("http");
const { Server } = require("socket.io");
const { connectRedis } = require("./config/redis");

const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { logger } = require("./utils/logger");

async function start() {
  await connectDB();
  await connectRedis();

  const app = createApp();
  const server = http.createServer(app);

  // Socket.IO server connected to the same HTTP-server
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
  console.error(err);
  process.exit(1);
});