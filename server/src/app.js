const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");
const env = require("./config/env");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const blockchainRoutes = require("./routes/blockchainRoutes");
const auditRoutes = require("./routes/auditRoutes");
const errorHandler = require("./middleware/errorHandler");

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const app = express();
app.use(
  cors({
    origin: [env.clientUrl, "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(env.uploadDir)));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "BLOCK-C backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/audit", auditRoutes);

app.use(errorHandler);

module.exports = app;
