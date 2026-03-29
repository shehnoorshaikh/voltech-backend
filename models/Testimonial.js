import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "rejected"],
      default: "approved",
    },
  },
  { timestamps: true },
);
export default mongoose.model("Testimonial", testimonialSchema);
