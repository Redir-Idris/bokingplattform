const router = require("express").Router();

const { createBooking,
  getBookings,
  updateBooking,
  deleteBooking
} = require("../controllers/bookings.controller");

const { requireAuth } = require("../middleware/auth");

// all booking routs demand login
router.post("/bookings", requireAuth, createBooking);
router.get("/bookings", requireAuth, getBookings);
router.put("/bookings/:id", requireAuth, updateBooking);
router.delete("/bookings/:id", requireAuth, deleteBooking);

module.exports = router;