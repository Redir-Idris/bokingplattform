// Room Routs 

const express = require("express");
const router = express.Router();

const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/rooms.controller");

const { requireAuth, authorizeRoles } = require("../middleware/auth");

// Public, everybody can se rum
router.get("/rooms", requireAuth, getRooms);

// Admin: hantera rum
router.post("/rooms", requireAuth, authorizeRoles("Admin"), createRoom);
router.put("/rooms/:id", requireAuth, authorizeRoles("Admin"), updateRoom);
router.delete("/rooms/:id", requireAuth, authorizeRoles("Admin"), deleteRoom);

module.exports = router;