const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema(
  {
    creator_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["draft", "live", "ended"],
      default: "draft"
    },
    playback_url: {
      type: String,
      default: null
    },
    started_at: {
      type: Date,
      default: null
    },
    ended_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Stream", streamSchema);
