import express from "express";
import { checkBlocked, verifyToken } from "../middleware/auth.js";
import {
  cancelBooking,
  completeBooking,
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBookingByUser,
} from "../controller/bookingController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/bookings", verifyToken, checkBlocked, createBooking);
router.get("/bookings/my", verifyToken, getMyBookings);
router.put("/bookings/:id/cancel", verifyToken, cancelBooking);
router.put("/bookings/:id/complete", verifyToken, completeBooking);
router.get("/admin/bookings", verifyToken, getAllBookings);
router.put("/bookings/:id", verifyToken, updateBookingStatus);
router.put("/cancel/:id", authMiddleware, cancelBookingByUser);

export default router;
