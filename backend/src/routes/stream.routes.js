const express = require("express");

const {
  createStream,
  getLiveStreams,
  getStreamById,
  updateStreamStatus
} = require("../controllers/stream.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");
const { asyncHandler } = require("../utils/asyncHandler");
const { USER_ROLES } = require("../constants/roles");

const router = express.Router();

router.get("/live", asyncHandler(getLiveStreams));
router.get("/:id", asyncHandler(getStreamById));
router.post(
  "/",
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  asyncHandler(createStream)
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(USER_ROLES.CREATOR),
  asyncHandler(updateStreamStatus)
);

module.exports = router;
