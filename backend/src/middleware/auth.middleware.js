const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("../utils/apiError");

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You are not allowed to perform this action"));
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
