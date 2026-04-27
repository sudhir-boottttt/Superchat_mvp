const jwt = require("jsonwebtoken");

const Message = require("../models/Message");
const Stream = require("../models/Stream");
const User = require("../models/User");

async function resolveSocketUser(socket) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return User.findById(payload.id);
  } catch (error) {
    return null;
  }
}

function registerChatHandlers(io) {
  io.on("connection", async (socket) => {
    const user = await resolveSocketUser(socket);

    socket.on("join_stream", async ({ streamId }) => {
      if (!streamId) {
        return;
      }

      socket.join(`stream:${streamId}`);
    });

    socket.on("send_message", async ({ streamId, text }) => {
      if (!user || !streamId || !text?.trim()) {
        return;
      }

      const stream = await Stream.findById(streamId);
      if (!stream || stream.status !== "live") {
        return;
      }

      const message = await Message.create({
        stream_id: streamId,
        user_id: user._id,
        text: text.trim(),
        type: "normal"
      });

      const populatedMessage = await Message.findById(message._id).populate("user_id", "name role");
      io.to(`stream:${streamId}`).emit("message_received", populatedMessage);
    });
  });
}

module.exports = { registerChatHandlers };
