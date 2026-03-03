// Room Routs 

const router = require("express").Router();

const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/rooms.controller");

const { requireAuth, requireRole } = require("../middleware/auth");

// Public, everybody can se rum
router.get("/rooms", getRooms);

// Admin: hantera rum
router.post("/rooms", requireAuth, requireRole("Admin"), createRoom);
router.put("/rooms/:id", requireAuth, requireRole("Admin"), updateRoom);
router.delete("/rooms/:id", requireAuth, requireRole("Admin"), deleteRoom);

module.exports = router;