const PaymentOrder = require("../models/PaymentOrder");

async function getEarnings(req, res) {
  const [summary] = await PaymentOrder.aggregate([
    {
      $match: {
        creator_id: req.user._id,
        status: "paid"
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$amount" },
        totalPlatformFee: { $sum: "$platform_fee" },
        totalCreatorShare: { $sum: "$creator_share" },
        totalTransactions: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    earnings: summary || {
      totalRevenue: 0,
      totalPlatformFee: 0,
      totalCreatorShare: 0,
      totalTransactions: 0
    }
  });
}

async function getTransactions(req, res) {
  const transactions = await PaymentOrder.find({
    creator_id: req.user._id
  })
    .populate("user_id", "name email")
    .populate("stream_id", "title status")
    .sort({ created_at: -1 });

  res.json({
    success: true,
    transactions
  });
}

module.exports = { getEarnings, getTransactions };
