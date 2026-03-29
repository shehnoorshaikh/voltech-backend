import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  category: String,
  title: String,
  description: String,
  price: String,
  duration: String,
  img: String,
  rating: Number,
  type: { type: String, require: true },
  isPopular: { type: Boolean, default: false },
});

export default mongoose.model("Service", serviceSchema);
