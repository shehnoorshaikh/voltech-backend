import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import passport from "passport";
import "../config/google.js";

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
  const { userName, email, password } = req.body;
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "⚠️ User already exists!" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new user
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
    });
    // Save user to database
    await newUser.save();

    // JWT CREATE
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    res.status(201).json({
      message: "User signup successfully",
      token: token,
      user: {
        _id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error signup user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2d",
      },
    );
    res.status(200).json({
      message: "User logged in successfully",
      token: token,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  // Formate email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  try {
    const user = await User.findOne({ email });

    // Generic response (security)
    if (!user) {
      return res
        .status(404)
        .json({ message: "Email not found. Please signup first" });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save in DB
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Reset link
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    console.log("Reset Link:", resetLink);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Reset your Voltech account password",
      html: `
        <div style="max-width:500px; margin:auto; padding:20px; border-radius:8px; background:#f9f9f9;
        font-family:Arial, sans-serif;">
          <h2 style="color:#222;">Reset your password Request</h2>
          <p>Hello <b>${user.userName || "User"}</b>,</p>
          <p>You requested to reset your password for your Voltech account.</p>
          <p>Click the button below to reset your password.</p>
          <a href="${resetLink}"
            style="display:inline-block; padding:12px 20px; background:#FFD000; color:#000; text-decoration:none; border-radius:6px; font-weight:bold;">Reset Password</a>
          <p style="margin-top:15px; color:#555;">This link will expire in <br>10 minutes</br> for security reasons.</p>
          <p>If you did not request this password change, please ignore this email.</p>

          <hr>

          <p style="color:#777; font-size:12px">- Team Voltech <br> This is an automated email. Please do not reply</p>
        </div>
      `,
    });

    res.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending reset link" });
  }
});

// Reset Password route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash front token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Clear token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

// email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.get("/test-mail", async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: "shaikhshehnoor2308@gmail.com",
      subject: "Test Email",
      text: "This is a test email from Voltech app.",
    });
    res.json({ message: "Test email sent" });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ message: "Error sending test email" });
  }
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    // Check if user is blocked
    if (req.user.isBlocked) {
      return res.redirect(`http://localhost:5173/login?error=blocked`);
    }
    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.redirect(
      `http://localhost:5173/google-success?token=${token}&userId=${req.user._id}&userName=${req.user.userName}&email=${req.user.email}&role=${req.user.role}`,
    );
  },
);

export default router;
