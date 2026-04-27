const express = require("express");

const {
  createOrder,
  verifyPayment,
  handleWebhook
} = require("../controllers/payment.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/asyncHandler");
const { USER_ROLES } = require("../constants/roles");

const router = express.Router();

router.post("/webhook", asyncHandler(handleWebhook));
router.post(
  "/create-order",
  requireAuth,
  requireRole(USER_ROLES.VIEWER, USER_ROLES.CREATOR),
  asyncHandler(createOrder)
);
router.post(
  "/verify",
  requireAuth,
  requireRole(USER_ROLES.VIEWER, USER_ROLES.CREATOR),
  asyncHandler(verifyPayment)
);

module.exports = router;
