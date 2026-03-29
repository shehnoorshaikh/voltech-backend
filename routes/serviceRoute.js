import express from "express";
import Service from "../models/Service.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const { category, isPopular } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (isPopular === "true") {
      filter.isPopular = true;
    }
    const services = await Service.find(filter);
    res.json(services);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
