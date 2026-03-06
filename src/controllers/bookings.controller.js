// Booking: Crud + socket notis
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { AppError } = require("../utils/AppError");
const { validateTimes, assertRoomIsAvailable } = require("../services/booking.service");

function emitBookingEvent(req, event, payload) {
  const io = req.app.get("io");
  if (!io) return;
  // Simple: broadcast to all connected clients
  io.emit(event, payload);
}

// POST /bookings
async function createBooking(req, res, next) {
  try {
    const { roomId, startTime, endTime } = req.body;

    if (!roomId || !startTime || !endTime) {
      throw new AppError("roomId, startTime and endTime are required", 400);
    }

    const userId = req.user?._id; // requireAuth puts req.user
    if (!userId) throw new AppError("Unauthorized", 401);

    // is there room?
    const room = await Room.findById(roomId);
    if (!room) throw new AppError("Room not found", 404);

    const { start, end } = validateTimes(startTime, endTime);

    // Collision controll
    await assertRoomIsAvailable(roomId, start, end);

    const booking = await Booking.create({
      roomId,
      userId,
      startTime: start,
      endTime: end,
    });

    // Notification (realtime)
    emitBookingEvent(req, "booking:created", {
      id: booking._id,
      roomId: booking.roomId,
      userId: booking.userId,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    next(err);
  }
}

// GET /bookings  (User: sina egna, Admin: alla)
async function getBookings(req, res, next) {
  try {
    const isAdmin = req.user.role === "Admin";
    const filter = isAdmin ? {} : { userId: req.user._id };

    const bookings = await Booking.find(filter)
      .populate("roomId", "name capacity type")
      .populate("userId", "username role")
      .sort({ startTime: 1 });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// PUT /bookings/:id (endast skaparen eller Admin)
async function updateBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { roomId, startTime, endTime } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError("Booking not found", 404);

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";
    if (!isOwner && !isAdmin) throw new AppError("Forbidden", 403);

    // Determine new values ​​(if fields are not sent → keep old ones)
    const nextRoomId = roomId ?? booking.roomId.toString();
    const nextStartTime = startTime ?? booking.startTime;
    const nextEndTime = endTime ?? booking.endTime;

    // Check that room exists if roomId changes
    const room = await Room.findById(nextRoomId);
    if (!room) throw new AppError("Room not found", 404);

    const { start, end } = validateTimes(nextStartTime, nextEndTime);

    // Collision check (ignore the booking itself)
    await assertRoomIsAvailable(nextRoomId, start, end, booking._id);

    booking.roomId = nextRoomId;
    booking.startTime = start;
    booking.endTime = end;

    await booking.save();

    emitBookingEvent(req, "booking:updated", {
      id: booking._id,
      roomId: booking.roomId,
      userId: booking.userId,
      startTime: booking.startTime,
      endTime: booking.endTime,
    });

    res.json({ message: "Booking updated", booking });
  } catch (err) {
    next(err);
  }
}

// DELETE /bookings/:id (endast skaparen eller Admin)
async function deleteBooking(req, res, next) {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) throw new AppError("Booking not found", 404);

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "Admin";
    if (!isOwner && !isAdmin) throw new AppError("Forbidden", 403);

    await Booking.deleteOne({ _id: id });

    emitBookingEvent(req, "booking:deleted", {
      id,
      roomId: booking.roomId,
      userId: booking.userId,
    });

    res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, getBookings, updateBooking, deleteBooking };