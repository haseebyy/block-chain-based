const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5001),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
  jwtExpiry: process.env.JWT_EXPIRY || "8h",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
  mongoDbName: process.env.MONGO_DB_NAME || "blockchain_car_verification",
  uploadDir:
    process.env.UPLOAD_DIR || "uploads",
  blockchainRpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
  blockchainPrivateKey:
    process.env.BLOCKCHAIN_PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  blockchainContractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || "",
  blockchainChainId: Number(process.env.BLOCKCHAIN_CHAIN_ID || 31337),
};

module.exports = env;
