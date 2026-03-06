// Room Controller 
const Room = require("../models/Room");
const { AppError } = require("../utils/AppError");
const { getRedisClient } = require("../config/redis");

const ROOMS_CACHE_KEY = "rooms:all";
const ROOMS_CACHE_TTL_SECONDS = 60; // 1 minut

// GET /rooms (cache -> db)
async function getRooms(req, res, next) {
  try {
    const redis = await getRedisClient();

    // 1) try get from cache
    const cached = await redis.get(ROOMS_CACHE_KEY);
    if (cached) {
      return res.json({ source: "cache", rooms: JSON.parse(cached) });
    }

    // 2) if no cache, get from DB
    const rooms = await Room.find().sort({ createdAt: -1 });

    // 3) Save in cache
    await redis.set(ROOMS_CACHE_KEY, JSON.stringify(rooms), {
      EX: ROOMS_CACHE_TTL_SECONDS,
    });

    res.json({ source: "db", rooms });
  } catch (err) {
    next(err);
  }
}

// POST /rooms (Admin only)
// Create room
async function createRoom(req, res, next) {
  try {
    const { name, capacity, type } = req.body;

    if (!name || capacity === undefined || !type) {
      throw new AppError("name, capacity and type are required", 400);
    }

    if (!Number.isFinite(Number(capacity)) || Number(capacity) < 1) {
      throw new AppError("capacity must be a number >= 1", 400);
    }

    if (!["workspace", "conference"].includes(type)) {
      throw new AppError("type must be 'workspace' or 'conference'", 400);
    }

    const room = await Room.create({
      name,
      capacity: Number(capacity),
      type,
    });

    // cache invalidation
    const redis = await getRedisClient();
    await redis.del(ROOMS_CACHE_KEY);

    res.status(201).json({ message: "Room created", room });
  } catch (err) {
    next(err);
  }
}

// PUT /rooms/:id (Admin only)
// Update Room
async function updateRoom(req, res, next) {
  try {
    const { id } = req.params;
    const { name, capacity, type } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;

    if (capacity !== undefined) {
      if (!Number.isFinite(Number(capacity)) || Number(capacity) < 1) {
        throw new AppError("capacity must be a number >= 1", 400);
      }
      updates.capacity = Number(capacity);
    }

    if (type !== undefined) {
      if (!["workspace", "conference"].includes(type)) {
        throw new AppError("type must be 'workspace' or 'conference'", 400);
      }
      updates.type = type;
    }

    if (Object.keys(updates).length === 0) {
      throw new AppError("Provide at least one field to update", 400);
    }

    const room = await Room.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!room) throw new AppError("Room not found", 404);

    // cache invalidation
    const redis = await getRedisClient();
    await redis.del(ROOMS_CACHE_KEY);

    res.json({ message: "Room updated", room });
  } catch (err) {
    next(err);
  }
}

// DELETE /rooms/:id (Admin only)
// Delete room
async function deleteRoom(req, res, next) {
  try {
    const { id } = req.params;

    const room = await Room.findByIdAndDelete(id);
    if (!room) throw new AppError("Room not found", 404);

    // cache invalidation
    const redis = await getRedisClient();
    await redis.del(ROOMS_CACHE_KEY);

    res.json({ message: "Room deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };