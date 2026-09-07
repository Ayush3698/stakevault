const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("StakingRewards", function () {
  let owner, alice, bob;
  let stakingToken, rewardsToken, staking;
  const rewardRate = ethers.parseUnits("1", 18); // 1 token/sec for easy math

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("MockERC20");
    stakingToken = await Token.deploy("Stake Token", "STK", 18, owner.address);
    rewardsToken = await Token.deploy("Reward Token", "RWD", 18, owner.address);

    const Staking = await ethers.getContractFactory("StakingRewards");
    staking = await Staking.deploy(
      await stakingToken.getAddress(),
      await rewardsToken.getAddress(),
      rewardRate,
      owner.address
    );

    // fund staking contract with rewards
    await rewardsToken.mint(await staking.getAddress(), ethers.parseUnits("1000000", 18));

    // give alice and bob stake tokens
    await stakingToken.mint(alice.address, ethers.parseUnits("1000", 18));
    await stakingToken.mint(bob.address, ethers.parseUnits("1000", 18));
  });

  it("allows a user to stake tokens", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    expect(await staking.balanceOf(alice.address)).to.equal(ethers.parseUnits("100", 18));
    expect(await staking.totalSupply()).to.equal(ethers.parseUnits("100", 18));
  });

  it("rejects staking 0 tokens", async function () {
    await expect(staking.connect(alice).stake(0)).to.be.revertedWith("StakingRewards: cannot stake 0");
  });

  it("accrues rewards linearly over time for a single staker", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await time.increase(100); // 100 seconds pass

    const earned = await staking.earned(alice.address);
    // rewardRate * time = 1 * 100 = 100 tokens (single staker gets it all)
    expect(earned).to.be.closeTo(ethers.parseUnits("100", 18), ethers.parseUnits("1", 18));
  });

  it("splits rewards proportionally between two stakers", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await stakingToken.connect(bob).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(bob).stake(ethers.parseUnits("100", 18));

    await time.increase(100);

    const aliceEarned = await staking.earned(alice.address);
    const bobEarned = await staking.earned(bob.address);

    // both staked equal amounts for the same period -> roughly equal rewards
    // (small skew expected: Alice accrued alone for the 1 block before Bob staked)
    expect(aliceEarned).to.be.closeTo(bobEarned, ethers.parseUnits("3", 18));
  });

  it("allows a user to withdraw staked tokens", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await staking.connect(alice).withdraw(ethers.parseUnits("40", 18));

    expect(await staking.balanceOf(alice.address)).to.equal(ethers.parseUnits("60", 18));
    expect(await stakingToken.balanceOf(alice.address)).to.equal(ethers.parseUnits("940", 18));
  });

  it("reverts when withdrawing more than staked balance", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await expect(
      staking.connect(alice).withdraw(ethers.parseUnits("200", 18))
    ).to.be.revertedWith("StakingRewards: insufficient balance");
  });

  it("pays out claimed rewards in rewardsToken", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await time.increase(50);

    await staking.connect(alice).claimReward();
    const balance = await rewardsToken.balanceOf(alice.address);
    expect(balance).to.be.gt(0);
  });

  it("exit() withdraws stake and claims rewards together", async function () {
    await stakingToken.connect(alice).approve(await staking.getAddress(), ethers.parseUnits("100", 18));
    await staking.connect(alice).stake(ethers.parseUnits("100", 18));

    await time.increase(50);
    await staking.connect(alice).exit();

    expect(await staking.balanceOf(alice.address)).to.equal(0);
    expect(await rewardsToken.balanceOf(alice.address)).to.be.gt(0);
    expect(await stakingToken.balanceOf(alice.address)).to.equal(ethers.parseUnits("1000", 18));
  });

  it("only owner can change the reward rate", async function () {
    await expect(
      staking.connect(alice).setRewardRate(ethers.parseUnits("2", 18))
    ).to.be.revertedWithCustomError(staking, "OwnableUnauthorizedAccount");

    await staking.connect(owner).setRewardRate(ethers.parseUnits("2", 18));
    expect(await staking.rewardRate()).to.equal(ethers.parseUnits("2", 18));
  });

  it("faucet mints tokens with a cooldown", async function () {
    const before = await stakingToken.balanceOf(alice.address);
    await stakingToken.connect(alice).faucet();
    const after = await stakingToken.balanceOf(alice.address);

    expect(after - before).to.equal(ethers.parseUnits("1000", 18));

    await expect(stakingToken.connect(alice).faucet()).to.be.revertedWith(
      "MockERC20: faucet cooldown active"
    );
  });
});
