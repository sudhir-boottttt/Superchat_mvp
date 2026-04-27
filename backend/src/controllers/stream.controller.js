const Stream = require("../models/Stream");
const Message = require("../models/Message");
const { ApiError } = require("../utils/apiError");

async function createStream(req, res) {
  const { title, playbackUrl } = req.body;

  if (!title) {
    throw new ApiError(400, "title is required");
  }

  const stream = await Stream.create({
    creator_id: req.user._id,
    title,
    playback_url: playbackUrl || null,
    status: "draft"
  });

  res.status(201).json({
    success: true,
    stream
  });
}

async function getLiveStreams(req, res) {
  const streams = await Stream.find({ status: "live" })
    .populate("creator_id", "name email")
    .sort({ started_at: -1, createdAt: -1 });

  res.json({
    success: true,
    streams
  });
}

async function getStreamById(req, res) {
  const stream = await Stream.findById(req.params.id).populate("creator_id", "name email");

  if (!stream) {
    throw new ApiError(404, "Stream not found");
  }

  const messages = await Message.find({ stream_id: stream._id })
    .populate("user_id", "name role")
    .sort({ created_at: 1 })
    .limit(100);

  res.json({
    success: true,
    stream,
    messages
  });
}

async function updateStreamStatus(req, res) {
  const { status } = req.body;
  const stream = await Stream.findById(req.params.id);

  if (!stream) {
    throw new ApiError(404, "Stream not found");
  }

  if (String(stream.creator_id) !== String(req.user._id)) {
    throw new ApiError(403, "You can update only your own stream");
  }

  if (!["draft", "live", "ended"].includes(status)) {
    throw new ApiError(400, "Invalid stream status");
  }

  stream.status = status;

  if (status === "live" && !stream.started_at) {
    stream.started_at = new Date();
  }

  if (status === "ended") {
    stream.ended_at = new Date();
  }

  await stream.save();

  res.json({
    success: true,
    stream
  });
}

module.exports = {
  createStream,
  getLiveStreams,
  getStreamById,
  updateStreamStatus
};
