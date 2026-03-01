const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const env = require("../config/env");

let contract = null;
let provider = null;
let signer = null;
let isMock = true;
const deployedMetaPath = path.resolve(__dirname, "../../.deployed-contract.json");

const abiPath = path.resolve(
  __dirname,
  "../../../contracts/artifacts/contracts/CarDocumentVerification.sol/CarDocumentVerification.json"
);

const initBlockchain = () => {
  let contractAddress = env.blockchainContractAddress;
  if (!contractAddress && fs.existsSync(deployedMetaPath)) {
    const deployed = JSON.parse(fs.readFileSync(deployedMetaPath, "utf-8"));
    contractAddress = deployed.address || "";
  }

  if (!contractAddress || !fs.existsSync(abiPath)) {
    isMock = true;
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
  provider = new ethers.JsonRpcProvider(env.blockchainRpcUrl, env.blockchainChainId);
  signer = new ethers.Wallet(env.blockchainPrivateKey, provider);
  contract = new ethers.Contract(contractAddress, artifact.abi, signer);
  isMock = false;
};

const fakeTx = () => ({
  txId: `MOCK_TX_${Date.now()}`,
  timestamp: new Date().toISOString(),
});

const registerVehicleOnChain = async ({
  vehicleUid,
  registrationNumber,
  engineNumber,
  chassisNumber,
}) => {
  if (isMock || !contract) {
    return fakeTx();
  }

  const tx = await contract.registerVehicle(
    vehicleUid,
    registrationNumber,
    engineNumber,
    chassisNumber
  );
  const receipt = await tx.wait();
  const block = await provider.getBlock(receipt.blockNumber);
  return {
    txId: tx.hash,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
  };
};

const storeDocumentHashOnChain = async ({ vehicleUid, docHash, docType }) => {
  if (isMock || !contract) {
    return fakeTx();
  }

  const tx = await contract.storeDocumentHash(vehicleUid, docHash, docType);
  const receipt = await tx.wait();
  const block = await provider.getBlock(receipt.blockNumber);
  return {
    txId: tx.hash,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
  };
};

const recordOwnershipTransferOnChain = async ({ vehicleUid, fromUser, toUser }) => {
  if (isMock || !contract) {
    return fakeTx();
  }

  const tx = await contract.recordOwnershipTransfer(vehicleUid, fromUser, toUser);
  const receipt = await tx.wait();
  const block = await provider.getBlock(receipt.blockNumber);
  return {
    txId: tx.hash,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
  };
};

const getTransactionDetails = async (txId) => {
  if (isMock || !provider || txId.startsWith("MOCK_TX_")) {
    return {
      txId,
      status: "MOCK_CONFIRMED",
      blockNumber: null,
      timestamp: null,
    };
  }

  const tx = await provider.getTransaction(txId);
  const receipt = await provider.getTransactionReceipt(txId);
  let timestamp = null;
  if (receipt?.blockNumber) {
    const block = await provider.getBlock(receipt.blockNumber);
    timestamp = new Date(Number(block.timestamp) * 1000).toISOString();
  }

  return {
    txId,
    status: receipt?.status === 1 ? "CONFIRMED" : "FAILED",
    blockNumber: receipt?.blockNumber ?? null,
    timestamp,
    from: tx?.from ?? null,
    to: tx?.to ?? null,
  };
};

initBlockchain();

module.exports = {
  initBlockchain,
  isMock: () => isMock,
  registerVehicleOnChain,
  storeDocumentHashOnChain,
  recordOwnershipTransferOnChain,
  getTransactionDetails,
};
