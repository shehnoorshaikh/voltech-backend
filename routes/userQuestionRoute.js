import express from "express";
import Question from "../models/UserQuestion.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/submit-question", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, question } = req.body;
    const questionData = await Question.create({
      userId: req.user._id,
      name,
      email,
      phone,
      question,
    });
    await questionData.save();
    res.status(201).send({ message: "Question submitted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to submit question" });
  }
});

export default router;
