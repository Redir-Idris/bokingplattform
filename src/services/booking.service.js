// Crash check + Time validation

const Booking = require("../models/Booking");
const { AppError } = require("../utils/AppError");

// Validerar tider:
function validateTimes(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // S-E time must be valid date
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("startTime and endTime must be valid dates", 400);
  }
  // S must be before E
  if (start >= end) {
    throw new AppError("startTime must be before endTime", 400);
  }

  return { start, end };
}

// Crash
// There is a conflict if an existing booking overlaps the interval
async function assertRoomIsAvailable(roomId, start, end, ignoreBookingId = null) {
  const query = {
    roomId,
    startTime: { $lt: end },
    endTime: { $gt: start },
  };

  if (ignoreBookingId) {
    query._id = { $ne: ignoreBookingId };
  }
  // Overlap : existing.start < newEnd AND existing.end > newStart
  const conflict = await Booking.findOne(query);
  if (conflict) {
    throw new AppError("Room is already booked for that time", 409);
  }
}

module.exports = { validateTimes, assertRoomIsAvailable };