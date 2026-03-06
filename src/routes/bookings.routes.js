const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookings.controller");

const { requireAuth } = require("../middleware/auth");

// All booking routes require login
router.post("/bookings", requireAuth, createBooking);
router.get("/bookings", requireAuth, getBookings);
router.put("/bookings/:id", requireAuth, updateBooking);
router.delete("/bookings/:id", requireAuth, deleteBooking);

module.exports = router;