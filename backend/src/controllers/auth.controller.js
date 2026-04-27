const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { ApiError } = require("../utils/apiError");

async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "name, email, password and role are required");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, "Email is already in use");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(user)
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken(user);

  res.json({
    success: true,
    token,
    user: sanitizeUser(user)
  });
}

async function me(req, res) {
  res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
}

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    razorpay_account_id: user.razorpay_account_id
  };
}

module.exports = { register, login, me };
