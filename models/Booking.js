import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    services: [
      {
        serviceId: String,
        serviceName: String,
        category: String,
        price: Number,
        quantity: Number,
        priceType: {
          type: String,
          enum: ["fixed", "range", "unit", "inspection"],
        },
      },
    ],

    addressDetails: {
      name: String,
      mobile: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    schedule: {
      date: String,
      time: String,
    },

    totalAmount: Number,

    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },

    cancelledBy: {
      type: String,
      enum: ["user", "admin"],
      default: null,
    },

    bookingId: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
