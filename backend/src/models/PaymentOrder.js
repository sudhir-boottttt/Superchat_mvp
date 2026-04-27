const mongoose = require("mongoose");

const paymentOrderSchema = new mongoose.Schema(
  {
    stream_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "INR"
    },
    platform_fee: {
      type: Number,
      required: true
    },
    creator_share: {
      type: Number,
      required: true
    },
    message_text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    razorpay_order_id: {
      type: String,
      required: true,
      unique: true
    },
    razorpay_payment_id: {
      type: String,
      default: null
    },
    razorpay_signature: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created"
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updatedAt" }
  }
);

module.exports = mongoose.model("PaymentOrder", paymentOrderSchema);
