import express from "express";
import Testimonial from "../models/Testimonial.js";
import { authMiddleware } from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Create a new testimonial
router.post("/", authMiddleware, async (req, res) => {
  try {
    const testimonialData = await Testimonial.create({
      userId: req.user.userId,
      name: req.body.name,
      rating: req.body.rating,
      message: req.body.message,
    });
    res.status(201).json({ message: "Thank you for your feedback!" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin", adminMiddleware, adminMiddleware, async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });

    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/approved", async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" });
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id/approve", adminMiddleware, async (req, res) => {
  try {
    const testimonials = await Testimonial.findByIdAndUpdate();
    (req.params.id, { status: "approved" }, { new: true });
    res.status(200).json({ message: "Testimonial approved" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
export default router;
