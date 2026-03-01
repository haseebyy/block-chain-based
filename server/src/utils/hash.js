const crypto = require("crypto");

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const sha256FileBuffer = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

module.exports = {
  sha256,
  sha256FileBuffer,
};
