import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import cors from "cors";
import passport from "passport";
import "./config/google.js";
import cartItemsRoute from "./routes/cartItemsRoute.js";
import bookingRoutes from "./routes/bookingRoute.js";
import adminRoute from "./routes/adminRoute.js";
import testimonialRoute from "./routes/testimonialRoute.js";
import userQuestionRoute from "./routes/userQuestionRoute.js";
import serviceRoute from "./routes/serviceRoute.js";
import path from "path";

import { fileURLToPath } from "url";

const app = express();
app.use(cors(), passport.initialize());
app.use(express.json());
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(200).json({});
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API is running" });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Example app listening on port ${process.env.PORT || 4000}`);
  console.log(process.env.MONGODB_URL);
});
app.use("/api", authRoutes);
app.use("/auth", authRoutes);
app.use("/api", cartItemsRoute);
app.use("/api", bookingRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/testimonials", testimonialRoute);
app.use("/api/user-questions", userQuestionRoute);
app.use("/api/services", serviceRoute);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
