// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title StakingRewards
/// @notice Minimal, audited-pattern (Synthetix-style) staking contract.
///         Users stake `stakingToken` and accrue `rewardsToken` linearly
///         over time based on a fixed reward rate. This is the core MVP
///         contract for the StakeVault Preprod product.
contract StakingRewards is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    uint256 public rewardRate; // reward tokens emitted per second, scaled 1e18
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(
        address _stakingToken,
        address _rewardsToken,
        uint256 _initialRewardRate,
        address initialOwner
    ) Ownable(initialOwner) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        rewardRate = _initialRewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        return
            rewardPerTokenStored +
            (timeElapsed * rewardRate * 1e18) /
            totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return
            (balanceOf[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) /
            1e18 +
            rewards[account];
    }

    /// @notice Stake `amount` of stakingToken. Requires prior approve().
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: cannot stake 0");
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked tokens without claiming rewards.
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        require(amount > 0, "StakingRewards: cannot withdraw 0");
        require(balanceOf[msg.sender] >= amount, "StakingRewards: insufficient balance");
        totalSupply -= amount;
        balanceOf[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Claim accrued rewards.
    function claimReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /// @notice Withdraw full stake and claim rewards in one call.
    function exit() external {
        withdraw(balanceOf[msg.sender]);
        claimReward();
    }

    /// @notice Owner-only: adjust emission rate (e.g. to fund a new epoch).
    function setRewardRate(uint256 newRate) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
        emit RewardRateUpdated(newRate);
    }

    /// @notice Owner-only: rescue tokens accidentally sent to this contract,
    ///         excluding the staking token itself (to protect user funds).
    function recoverERC20(address tokenAddress, uint256 amount) external onlyOwner {
        require(tokenAddress != address(stakingToken), "StakingRewards: cannot recover staking token");
        IERC20(tokenAddress).safeTransfer(owner(), amount);
    }
}
