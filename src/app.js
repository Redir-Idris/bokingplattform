// Express-app + middleware + routs 
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { AppError } = require("./utils/AppError");
const { logger } = require("./utils/logger");

const authRoutes = require("./routes/auth.routes");
const roomsRoutes = require("./routes/rooms.routes");
const bookingsRoutes = require("./routes/bookings.routes");

function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(express.json());
  // Cors
  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  // Logs
  app.use(morgan("dev"));

  // Routs
  app.get("/health", (req, res) => {
    res.json({ status: "OK" });
  });

  // 404 + error handler
  app.use(authRoutes);
  app.use(roomsRoutes);
  app.use(bookingsRoutes);

  app.use((req, res, next) => {
    next(new AppError("Route not found", 404));
  });

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    logger.error(`${req.method} ${req.originalUrl}`, {
      message: err.message,
      statusCode,
    });

    res.status(statusCode).json({
      message: err.message || "Internal Server Error",
    });
  });

  return app;
}

module.exports = { createApp };