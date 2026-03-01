const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    type: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileHash: { type: String, required: true, unique: true, index: true },
    blockchainTxId: { type: String, default: null },
    blockchainTimestamp: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "documents" }
);

module.exports = mongoose.model("Document", documentSchema);
