const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "OWNER", "BUYER", "TRAFFIC_POLICE"],
      required: true,
    },
    recoveryToken: { type: String, default: null },
    recoveryExpiresAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
