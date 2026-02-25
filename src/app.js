// Express-app + middleware + routs 
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const healtRouts = require("./routes/health.routes");

function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(express.json());

  // Logs
  app.use(morgan("dev"));

  // Cors
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  // Routs
  app.use("/health", healtRouts);
  app.use("/", authRoutes);

  // 404 + error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

