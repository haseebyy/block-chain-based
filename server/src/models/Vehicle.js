const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleUid: { type: String, required: true, unique: true, index: true },
    vehicleName: { type: String, default: "" },
    registrationNumber: { type: String, required: true, unique: true, index: true },
    engineNumber: { type: String, required: true, unique: true, index: true },
    chassisNumber: { type: String, required: true, unique: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "ACTIVE" },
  },
  { versionKey: false, collection: "vehicles" }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
