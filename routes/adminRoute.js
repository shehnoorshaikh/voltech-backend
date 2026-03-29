import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { getAllBookings } from "../controller/bookingController.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import Booking from "../models/Booking.js";
import moment from "moment";
import Question from "../models/UserQuestion.js";

const router = express.Router();

router.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

router.get("/bookings", adminMiddleware, getAllBookings);

export const getDashboardState = async (req, res) => {
  try {
    const startOfWeek = moment().startOf("week").toDate();
    const endOfWeek = moment().endOf("week").toDate();

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.find({
      status: "completed",
    });
    const completedBookingsCount = completedBookings.length;
    const totalUsers = await User.countDocuments({
      role: "user",
      isBlocked: false,
    });
    const totalEarnings = completedBookings.reduce(
      (sum, b) => sum + (Number(b.totalAmount) || 0),
      0,
    );

    const sevenDaysAgo = moment().subtract(7, "days").toDate();

    const weeklyBookings = await Booking.find({
      status: "completed",
      createdAt: { $gte: sevenDaysAgo },
    });

    const weeklyEarnings = weeklyBookings.reduce(
      (sum, b) => sum + (Number(b.totalAmount) || 0),
      0,
    );

    const weeklyUsers = await User.countDocuments({
      role: "user",
      isBlocked: false,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    });

    res.json({
      totalBookings,
      completedBookings: completedBookingsCount,
      totalUsers,
      totalEarnings,
      weeklyBookings: weeklyBookings.length,
      weeklyEarnings,
      weeklyUsers,
    });
  } catch (error) {
    console.error("Error fetching dashboard state:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

router.get(
  "/dashboard-state",
  authMiddleware,
  adminMiddleware,
  getDashboardState,
);

router.put("/users/:id/block", adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true },
    );
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.save();
    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/users/:id/role", adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.role = role;
    // Unblock the user when changing role to user or admin
    if (role === "user" || role === "admin") {
      user.isBlocked = false;
    }
    await user.save();
    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    const usersWithStatus = users.map((user) => ({
      ...user.toObject(),
      status:
        user.role === "admin" ? "admin" : user.isBlocked ? "blocked" : "user",
    }));
    res.json(usersWithStatus);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/questions", adminMiddleware, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
