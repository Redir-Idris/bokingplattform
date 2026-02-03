// Redis; cache  
const { creteClient } = require("redis");
const { logger } = require("../utils/logger");

let client;

async function getRedisClient() {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is missing in .env");

  client = creteClient({ url });

  client.on("error", (err) => logger.error(`Redis error: ${err.message}`));

  await client.connect();
  logger.info("Redis connected");

  return client;
}

module.exports = { getRedisClient };

// connecting to redis
// logging error
// return a client to  