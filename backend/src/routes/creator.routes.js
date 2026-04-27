const express = require("express");

const { getEarnings, getTransactions } = require("../controllers/creator.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/asyncHandler");
const { USER_ROLES } = require("../constants/roles");

const router = express.Router();

router.get(
  "/earnings",
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  asyncHandler(getEarnings)
);
router.get(
  "/transactions",
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  asyncHandler(getTransactions)
);

module.exports = router;
