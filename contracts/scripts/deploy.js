const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy the staking token (what users stake)
  const StakingToken = await hre.ethers.getContractFactory("MockERC20");
  const stakingToken = await StakingToken.deploy(
    "StakeVault Test Token",
    "SVT",
    18,
    deployer.address
  );
  await stakingToken.waitForDeployment();
  console.log("StakingToken (SVT) deployed to:", await stakingToken.getAddress());

  // 2. Deploy the rewards token (what users earn)
  const RewardsToken = await hre.ethers.getContractFactory("MockERC20");
  const rewardsToken = await RewardsToken.deploy(
    "StakeVault Reward Token",
    "SVR",
    18,
    deployer.address
  );
  await rewardsToken.waitForDeployment();
  console.log("RewardsToken (SVR) deployed to:", await rewardsToken.getAddress());

  // 3. Deploy the staking contract
  // rewardRate: tokens per second, e.g. 0.001 SVR/sec ~= 86.4 SVR/day
  const rewardRate = hre.ethers.parseUnits("0.001", 18);
  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");
  const staking = await StakingRewards.deploy(
    await stakingToken.getAddress(),
    await rewardsToken.getAddress(),
    rewardRate,
    deployer.address
  );
  await staking.waitForDeployment();
  console.log("StakingRewards deployed to:", await staking.getAddress());

  // 4. Fund the staking contract with reward tokens so users can be paid
  const fundAmount = hre.ethers.parseUnits("1000000", 18); // 1,000,000 SVR
  const mintTx = await rewardsToken.mint(await staking.getAddress(), fundAmount);
  await mintTx.wait();
  console.log("Funded StakingRewards with", hre.ethers.formatUnits(fundAmount, 18), "SVR");

  // 5. Write addresses out for the frontend + docs to consume
  const deployment = {
    network: hre.network.name,
    deployer: deployer.address,
    stakingToken: await stakingToken.getAddress(),
    rewardsToken: await rewardsToken.getAddress(),
    stakingContract: await staking.getAddress(),
    rewardRate: rewardRate.toString(),
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "deployment.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("\nDeployment info written to", outPath);
  console.log(deployment);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
