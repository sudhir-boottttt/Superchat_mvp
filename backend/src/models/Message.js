const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    stream_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    type: {
      type: String,
      enum: ["normal", "superchat"],
      default: "normal"
    },
    amount: {
      type: Number,
      default: 0
    },
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentOrder",
      default: null
    },
    highlight_expires_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updatedAt" }
  }
);

module.exports = mongoose.model("Message", messageSchema);
