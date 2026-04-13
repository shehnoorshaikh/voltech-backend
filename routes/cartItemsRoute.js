import express from "express";
import { checkBlocked, verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Temporary database
export let cartDB = [];

// ADD to cart
router.post("/cart", verifyToken, checkBlocked, (req, res) => {
  const item = {
    id: Date.now().toString(),
    userId: req.user._id.toString(),
    img: req.body.img,
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    count: 1,
    category: req.body.category,
    priceType: req.body.priceType || "fixed",
    priceRange: req.body.priceRange || null,
    unit: req.body.unit || null,
  };
  const exists = cartDB.find(
    (i) => i.userId === req.user._id.toString() && i.title === req.body.title,
  );

  if (exists) {
    return res.json({
      success: false,
      message: "Item already in cart",
    });
  }

  cartDB.push(item);

  return res.json({
    success: true,
    message: "Item added to cart",
    item,
  });
});

// GET cart items
router.get("/cart", verifyToken, (req, res) => {
  const userItems = cartDB.filter((i) => i.userId === req.user._id.toString());

  return res.json({
    success: true,
    items: userItems,
  });
});

router.delete("/cart/:id", verifyToken, (req, res) => {
  const itemId = req.params.id;

  const index = cartDB.findIndex(
    (item) => item.id === itemId && item.userId === req.user._id.toString(),
  );

  if (index === -1) {
    return res.status(404).json({ message: "Item not found" });
  }

  cartDB.splice(index, 1);
  return res.json({
    success: true,
    message: "Item removed successfully",
  });
});

router.patch("/cart/:id", verifyToken, (req, res) => {
  const itemId = req.params.id;
  const { action } = req.body;
  const item = cartDB.find(
    (i) => i.id === itemId && i.userId === req.user._id.toString(),
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }
  if (action === "inc") item.count += 1;
  if (action === "dec" && item.count > 1) item.count -= 1;
  return res.json({ success: true, item });
});

export default router;
