import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    category: String,
    title: String,
    description: String,
    price: String,
    priceType: {
      type: String,
      enum: ["fixed", "range", "unit", "inspection"],
      required: true,
    },
    priceRange: {
      min: Number,
      max: Number,
    },
    unit: String,
    duration: String,
    img: String,
    rating: Number,
    type: { type: String, require: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Service", serviceSchema);
