function getFeePercent() {
  const value = Number(process.env.PLATFORM_FEE_PERCENT || 10);
  return Number.isNaN(value) ? 10 : value;
}

function calculateSplit(amount) {
  const feePercent = getFeePercent();
  const platformFee = Math.round((amount * feePercent) / 100);
  const creatorShare = amount - platformFee;

  return {
    feePercent,
    platformFee,
    creatorShare
  };
}

function getHighlightExpiry(amount) {
  const now = Date.now();

  if (amount >= 10000) {
    return new Date(now + 15 * 60 * 1000);
  }

  if (amount >= 5000) {
    return new Date(now + 10 * 60 * 1000);
  }

  return new Date(now + 5 * 60 * 1000);
}

module.exports = { calculateSplit, getHighlightExpiry };
