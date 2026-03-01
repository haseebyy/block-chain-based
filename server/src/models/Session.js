const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "sessions" }
);

module.exports = mongoose.model("Session", sessionSchema);
