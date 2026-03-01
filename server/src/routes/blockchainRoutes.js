const express = require("express");
const authenticate = require("../middleware/auth");
const { getTransactionDetails, isMock } = require("../services/blockchainService");
const Document = require("../models/Document");

const router = express.Router();

router.get("/status", authenticate, (req, res) => {
  return res.json({
    blockchainMode: isMock() ? "MOCK" : "LIVE",
    message: isMock()
      ? "Running in mock mode. Configure contract address and artifacts for live chain."
      : "Connected to blockchain node and contract",
  });
});

router.get("/tx/:txId", authenticate, async (req, res, next) => {
  try {
    const details = await getTransactionDetails(req.params.txId);
    return res.json({ transaction: details });
  } catch (error) {
    return next(error);
  }
});

router.get("/history", authenticate, async (req, res) => {
  const rows = await Document.find({ blockchainTxId: { $ne: null } })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({
    records: rows.map((row) => ({
      id: row._id.toString(),
      file_hash: row.fileHash,
      blockchain_tx_id: row.blockchainTxId,
      blockchain_timestamp: row.blockchainTimestamp,
      created_at: row.createdAt,
    })),
  });
});

module.exports = router;
