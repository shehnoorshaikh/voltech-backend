import mongoose from "mongoose";

const UserQuestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: false,
    },
    question: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("UserQuestion", UserQuestionSchema);
