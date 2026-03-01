const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const authenticate = require("../middleware/auth");
const authorizeRoles = require("../middleware/rbac");
const upload = require("../middleware/upload");
const { sha256FileBuffer } = require("../utils/hash");
const {
  registerVehicleOnChain,
  storeDocumentHashOnChain,
  recordOwnershipTransferOnChain,
} = require("../services/blockchainService");
const { writeAuditLog } = require("../services/auditService");
const Vehicle = require("../models/Vehicle");
const Document = require("../models/Document");
const User = require("../models/User");
const OwnershipTransfer = require("../models/OwnershipTransfer");

const router = express.Router();

const vehicleValidator = [
  body("vehicleName").optional().isString(),
  body("registrationNumber").trim().notEmpty(),
  body("engineNumber").trim().notEmpty(),
  body("chassisNumber").trim().notEmpty(),
  body("ownerId").optional().isString(),
];

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "TRAFFIC_POLICE", "OWNER"),
  vehicleValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { vehicleName = "", registrationNumber, engineNumber, chassisNumber, ownerId } = req.body;
    const normalizedReg = registrationNumber.toUpperCase();
    const vehicleUid = `VHC-${Date.now()}`;
    const normalizedOwnerId = ownerId && ownerId.trim() ? ownerId.trim() : null;

    if (normalizedOwnerId && !mongoose.Types.ObjectId.isValid(normalizedOwnerId)) {
      return res.status(400).json({
        message: "Owner User ID must be a valid MongoDB ObjectId or leave it empty",
      });
    }

    const duplicate = await Vehicle.findOne({
      $or: [{ registrationNumber: normalizedReg }, { engineNumber }, { chassisNumber }],
    }).lean();
    if (duplicate) {
      return res.status(409).json({ message: "Vehicle details already exist" });
    }

    const chainTx = await registerVehicleOnChain({
      vehicleUid,
      registrationNumber: normalizedReg,
      engineNumber,
      chassisNumber,
    });

    const created = await Vehicle.create({
      vehicleUid,
      vehicleName,
      registrationNumber: normalizedReg,
      engineNumber,
      chassisNumber,
      ownerId: normalizedOwnerId,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    await writeAuditLog({
      action: "VEHICLE_REGISTERED",
      entityType: "VEHICLE",
      entityId: created._id.toString(),
      actorId: req.user.id,
      txId: chainTx.txId,
      details: { vehicleUid, registrationNumber: normalizedReg },
    });

    return res.status(201).json({
      message: "Vehicle registered successfully",
      vehicle: {
        id: created._id.toString(),
        vehicleUid,
        vehicleName,
        registrationNumber: normalizedReg,
        engineNumber,
        chassisNumber,
        ownerId: normalizedOwnerId,
      },
      blockchain: chainTx,
    });
  }
);

router.post(
  "/:vehicleId/documents",
  authenticate,
  authorizeRoles("ADMIN", "TRAFFIC_POLICE", "OWNER"),
  upload.single("document"),
  async (req, res) => {
    const { vehicleId } = req.params;
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Document type is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const vehicle = await Vehicle.findById(vehicleId).lean();
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const fileHash = sha256FileBuffer(buffer);
    const duplicateHash = await Document.findOne({ fileHash }).lean();
    if (duplicateHash) {
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ message: "Duplicate document hash found" });
    }

    const chainTx = await storeDocumentHashOnChain({
      vehicleUid: vehicle.vehicleUid,
      docHash: fileHash,
      docType: type,
    });

    const doc = await Document.create({
      vehicleId,
      type,
      originalName: req.file.originalname,
      filePath: path.basename(req.file.path),
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileHash,
      blockchainTxId: chainTx.txId,
      blockchainTimestamp: chainTx.timestamp,
      createdBy: req.user.id,
      createdAt: new Date(),
    });

    await writeAuditLog({
      action: "DOCUMENT_UPLOADED",
      entityType: "DOCUMENT",
      entityId: doc._id.toString(),
      actorId: req.user.id,
      txId: chainTx.txId,
      details: { vehicleId, type, fileHash },
    });

    return res.status(201).json({
      message: "Document uploaded and hashed successfully",
      document: {
        id: doc._id.toString(),
        type,
        fileHash,
        blockchainTxId: chainTx.txId,
        blockchainTimestamp: chainTx.timestamp,
      },
    });
  }
);

router.get("/", authenticate, async (req, res) => {
  const vehicles = await Vehicle.find().sort({ createdAt: -1 }).lean();
  const docs = await Document.find().sort({ createdAt: -1 }).lean();
  const ownerIds = [...new Set(vehicles.map((v) => (v.ownerId ? v.ownerId.toString() : null)).filter(Boolean))];
  const owners = await User.find({ _id: { $in: ownerIds } }, "fullName").lean();
  const ownerMap = Object.fromEntries(owners.map((o) => [o._id.toString(), o.fullName]));

  const docsByVehicle = docs.reduce((acc, doc) => {
    const key = doc.vehicleId.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      id: doc._id.toString(),
      type: doc.type,
      file_hash: doc.fileHash,
      blockchain_tx_id: doc.blockchainTxId,
    });
    return acc;
  }, {});

  return res.json({
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle._id.toString(),
      vehicle_uid: vehicle.vehicleUid,
      vehicle_name: vehicle.vehicleName || "",
      registration_number: vehicle.registrationNumber,
      engine_number: vehicle.engineNumber,
      chassis_number: vehicle.chassisNumber,
      owner_id: vehicle.ownerId ? vehicle.ownerId.toString() : null,
      owner_name: vehicle.ownerId ? ownerMap[vehicle.ownerId.toString()] || null : null,
      created_at: vehicle.createdAt,
      documents: docsByVehicle[vehicle._id.toString()] || [],
    })),
  });
});

router.get("/verify/:hash", authenticate, async (req, res) => {
  const { hash } = req.params;
  const doc = await Document.findOne({ fileHash: hash }).lean();
  if (!doc) {
    return res.status(404).json({ verified: false, message: "No matching document hash found" });
  }

  const vehicle = await Vehicle.findById(doc.vehicleId).lean();
  if (!vehicle) {
    return res.status(404).json({ verified: false, message: "Vehicle record missing" });
  }

  return res.json({
    verified: true,
    message: "Document hash verified",
    document: {
      id: doc._id.toString(),
      type: doc.type,
      file_hash: doc.fileHash,
      blockchain_tx_id: doc.blockchainTxId,
      blockchain_timestamp: doc.blockchainTimestamp,
      vehicle_uid: vehicle.vehicleUid,
      registration_number: vehicle.registrationNumber,
    },
  });
});

router.post(
  "/:vehicleId/transfer",
  authenticate,
  authorizeRoles("ADMIN", "OWNER"),
  [body("toUserId").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    const { vehicleId } = req.params;
    const { toUserId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Target User ID must be a valid MongoDB ObjectId" });
    }
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (req.user.role === "OWNER" && vehicle.ownerId?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Owner can transfer only their own vehicle" });
    }

    const buyer = await User.findById(toUserId).lean();
    if (!buyer || !["BUYER", "OWNER"].includes(buyer.role)) {
      return res.status(400).json({ message: "Target user must be BUYER or OWNER role" });
    }

    const chainTx = await recordOwnershipTransferOnChain({
      vehicleUid: vehicle.vehicleUid,
      fromUser: vehicle.ownerId ? vehicle.ownerId.toString() : "NA",
      toUser: toUserId,
    });

    const fromUserId = vehicle.ownerId || null;
    vehicle.ownerId = toUserId;
    await vehicle.save();

    await OwnershipTransfer.create({
      vehicleId: vehicle._id,
      fromUserId,
      toUserId,
      txId: chainTx.txId,
      timestamp: chainTx.timestamp,
      createdBy: req.user.id,
    });

    await writeAuditLog({
      action: "OWNERSHIP_TRANSFERRED",
      entityType: "VEHICLE",
      entityId: vehicle._id.toString(),
      actorId: req.user.id,
      txId: chainTx.txId,
      details: { fromUserId: fromUserId ? fromUserId.toString() : null, toUserId },
    });

    return res.json({ message: "Ownership transferred successfully", blockchain: chainTx });
  }
);

module.exports = router;
