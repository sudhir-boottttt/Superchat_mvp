const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const streamRoutes = require("./routes/stream.routes");
const paymentRoutes = require("./routes/payment.routes");
const creatorRoutes = require("./routes/creator.routes");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  })
);

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(apiLimiter);

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "superchat-mvp-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/creator", creatorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
