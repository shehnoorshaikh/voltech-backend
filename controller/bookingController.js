import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { cartDB } from "../routes/cartItemsRoute.js";

export const createBooking = async (req, res) => {
  try {
    const bookingId = Math.floor(10000000 + Math.random() * 90000000);

    const booking = await Booking.create({
      userId: req.user._id.toString(),
      bookingId,
      services: req.body.services,
      addressDetails: req.body.addressDetails,
      schedule: req.body.schedule,
      totalAmount: req.body.totalAmount,
      status: "confirmed",
    });

    // Clear the cart for the user after successful booking
    const userId = req.user._id.toString();
    const initialLength = cartDB.length;
    const filteredCart = cartDB.filter((item) => item.userId !== userId);
    cartDB.length = 0; // Clear the array
    cartDB.push(...filteredCart); // Add back non-user items

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id.toString(),
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.user.role === "admin" ? "admin" : "user";
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// PUT /api/bookings/:id/complete
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    booking.status = "completed";
    await booking.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = req.body.status;
    if (req.body.status === "cancelled") {
      booking.cancelledBy = req.user.role === "admin" ? "admin" : "user";
    }
    await booking.save();

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalEarningsAgg = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalEarnings =
      totalEarningsAgg.length > 0 ? totalEarningsAgg[0].totalEarnings : 0;
    const totalUsers = await User.countDocuments();

    res.json({
      totalBookings,
      totalEarnings,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const cancelBookingByUser = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    booking.status = "cancelled";
    booking.cancelledBy = "user";
    await booking.save();
    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const cancelBookingByAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === "cancelled") {
      updateData.cancelledBy = "admin";
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
