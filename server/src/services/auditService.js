const { v4: uuidv4 } = require("uuid");
const { sha256 } = require("../utils/hash");
const AuditTrail = require("../models/AuditTrail");

const getLatestAuditHash = async () => {
  const row = await AuditTrail.findOne({}, { currentHash: 1 }).sort({ createdAt: -1 }).lean();
  return row?.currentHash || null;
};

const writeAuditLog = async ({
  action,
  entityType,
  entityId = null,
  actorId = null,
  details = {},
  txId = null,
}) => {
  const createdAt = new Date();
  const previousHash = await getLatestAuditHash();
  const payload = JSON.stringify({
    action,
    entityType,
    entityId,
    actorId,
    details,
    txId,
    createdAt,
    previousHash,
  });
  const currentHash = sha256(payload);

  const created = await AuditTrail.create({
    action,
    entityType,
    entityId,
    actorId: actorId || null,
    details,
    previousHash,
    currentHash,
    txId,
    createdAt,
  });

  return { id: created._id.toString(), currentHash, previousHash, createdAt };
};

module.exports = {
  writeAuditLog,
};
