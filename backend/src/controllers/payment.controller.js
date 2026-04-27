const crypto = require("crypto");

const Message = require("../models/Message");
const PaymentOrder = require("../models/PaymentOrder");
const Stream = require("../models/Stream");
const { getRazorpayClient } = require("../config/razorpay");
const { ApiError } = require("../utils/apiError");
const { calculateSplit, getHighlightExpiry } = require("../utils/superchat");

async function createOrder(req, res) {
  const { streamId, amount, message } = req.body;

  if (!streamId || !amount || !message) {
    throw new ApiError(400, "streamId, amount and message are required");
  }

  const minAmount = Number(process.env.MIN_SUPERCHAT_AMOUNT || 1000);
  if (amount < minAmount) {
    throw new ApiError(400, `Minimum superchat amount is ${minAmount}`);
  }

  const stream = await Stream.findById(streamId);

  if (!stream || stream.status !== "live") {
    throw new ApiError(400, "Stream is not live");
  }

  const { platformFee, creatorShare } = calculateSplit(amount);
  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `stream_${stream._id}_${Date.now()}`,
    notes: {
      streamId: String(stream._id),
      viewerId: String(req.user._id),
      creatorId: String(stream.creator_id)
    }
  });

  const paymentOrder = await PaymentOrder.create({
    stream_id: stream._id,
    user_id: req.user._id,
    creator_id: stream.creator_id,
    amount,
    currency: "INR",
    platform_fee: platformFee,
    creator_share: creatorShare,
    message_text: message,
    razorpay_order_id: order.id,
    status: "created"
  });

  res.status(201).json({
    success: true,
    order: {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    },
    paymentOrderId: paymentOrder._id,
    split: {
      platformFee,
      creatorShare
    }
  });
}

async function verifyPayment(req, res) {
  const {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature
  } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new ApiError(400, "Payment verification fields are required");
  }

  const paymentOrder = await PaymentOrder.findOne({ razorpay_order_id: razorpayOrderId });

  if (!paymentOrder) {
    throw new ApiError(404, "Payment order not found");
  }

  if (paymentOrder.status === "paid") {
    return res.json({
      success: true,
      alreadyProcessed: true
    });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    paymentOrder.status = "failed";
    paymentOrder.razorpay_payment_id = razorpayPaymentId;
    paymentOrder.razorpay_signature = razorpaySignature;
    await paymentOrder.save();
    throw new ApiError(400, "Invalid payment signature");
  }

  paymentOrder.status = "paid";
  paymentOrder.razorpay_payment_id = razorpayPaymentId;
  paymentOrder.razorpay_signature = razorpaySignature;
  await paymentOrder.save();

  const message = await Message.create({
    stream_id: paymentOrder.stream_id,
    user_id: paymentOrder.user_id,
    text: paymentOrder.message_text,
    type: "superchat",
    amount: paymentOrder.amount,
    payment_id: paymentOrder._id,
    highlight_expires_at: getHighlightExpiry(paymentOrder.amount)
  });

  const populatedMessage = await Message.findById(message._id).populate("user_id", "name role");
  const io = req.app.get("io");

  if (io) {
    io.to(`stream:${paymentOrder.stream_id}`).emit("superchat_received", populatedMessage);
  }

  res.json({
    success: true,
    message: populatedMessage
  });
}

async function handleWebhook(req, res) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ApiError(500, "Webhook secret is not configured");
  }

  const signature = req.headers["x-razorpay-signature"];
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const payload = JSON.parse(req.body.toString("utf8"));
  const event = payload.event;

  if (event === "payment.captured") {
    const razorpayOrderId = payload.payload.payment.entity.order_id;
    const razorpayPaymentId = payload.payload.payment.entity.id;

    await PaymentOrder.findOneAndUpdate(
      { razorpay_order_id: razorpayOrderId, status: "created" },
      {
        status: "paid",
        razorpay_payment_id: razorpayPaymentId
      }
    );
  }

  res.json({ received: true });
}

module.exports = { createOrder, verifyPayment, handleWebhook };
