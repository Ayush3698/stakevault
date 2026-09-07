// Bulk-mint staking tokens to a list of Preprod tester wallet addresses.
// Usage: put addresses (one per line) in scripts/testers.txt, then:
//   npm run faucet:mint
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, "..", "deployment.json");
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("deployment.json not found — run `npm run deploy:sepolia` first");
  }
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));

  const testersPath = path.join(__dirname, "testers.txt");
  if (!fs.existsSync(testersPath)) {
    throw new Error("scripts/testers.txt not found — add one wallet address per line");
  }
  const addresses = fs
    .readFileSync(testersPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && hre.ethers.isAddress(l));

  console.log(`Minting test tokens to ${addresses.length} addresses...`);

  const token = await hre.ethers.getContractAt("MockERC20", deployment.stakingToken);
  const amount = hre.ethers.parseUnits("500", 18); // 500 SVT per tester

  for (const addr of addresses) {
    const tx = await token.mint(addr, amount);
    await tx.wait();
    console.log(`Minted 500 SVT -> ${addr} (tx: ${tx.hash})`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
