// Starting server + Mongo + socket

const http = require("http");
const { Server } = require("socket.io");

const { createApp } = require("./app");
const { connectDB } = require("./config/db");
const { logger } = require("./utils/logger");

async function start() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  // Gör io tillgängligt i request (så controllers kan trigga notiser senare)
  app.set("io", io);

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