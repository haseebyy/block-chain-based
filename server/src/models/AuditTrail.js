const mongoose = require("mongoose");

const auditTrailSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: null },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    previousHash: { type: String, default: null },
    currentHash: { type: String, required: true },
    txId: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false, collection: "audit_trail" }
);

module.exports = mongoose.model("AuditTrail", auditTrailSchema);
