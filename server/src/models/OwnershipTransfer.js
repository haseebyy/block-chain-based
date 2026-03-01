const mongoose = require("mongoose");

const ownershipTransferSchema = new mongoose.Schema(
  {
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    txId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { versionKey: false, collection: "ownership_transfers" }
);

module.exports = mongoose.model("OwnershipTransfer", ownershipTransferSchema);
