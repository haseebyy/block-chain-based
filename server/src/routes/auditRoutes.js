const express = require("express");
const authenticate = require("../middleware/auth");
const authorizeRoles = require("../middleware/rbac");
const AuditTrail = require("../models/AuditTrail");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("ADMIN", "TRAFFIC_POLICE", "OWNER"), async (req, res) => {
  const logs = await AuditTrail.find()
    .populate("actorId", "fullName email")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    logs: logs.map((entry) => ({
      id: entry._id.toString(),
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      actor_name: entry.actorId?.fullName || null,
      actor_email: entry.actorId?.email || null,
      tx_id: entry.txId,
      current_hash: entry.currentHash,
      previous_hash: entry.previousHash,
      created_at: entry.createdAt,
      details: entry.details || {},
    })),
  });
});

module.exports = router;
