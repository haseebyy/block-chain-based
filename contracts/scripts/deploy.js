import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { ethers } = await network.connect();
  const Contract = await ethers.getContractFactory("CarDocumentVerification");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("CarDocumentVerification deployed to:", address);

  const outputPath = path.resolve(__dirname, "../../server/.deployed-contract.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        address,
        network: "localhost",
        deployedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
  console.log("Deployment metadata written to:", outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
