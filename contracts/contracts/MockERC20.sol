// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title MockERC20
/// @notice Simple mintable ERC20 used as the staking + reward token for the
///         StakeVault Preprod demo. NOT for production use — mint is open
///         to the owner only, but this token has no real value.
contract MockERC20 is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address initialOwner
    ) ERC20(name_, symbol_) Ownable(initialOwner) {
        _decimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /// @notice Mint tokens to `to`. Restricted to owner (the deploy script /
    ///         faucet backend) so Preprod users can get test tokens.
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Public faucet so testers can self-serve a fixed amount of
    ///         test tokens without needing the owner key. Rate-limited by
    ///         a simple per-address cooldown to discourage abuse.
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public constant FAUCET_AMOUNT = 1_000 * 10 ** 18;
    uint256 public constant FAUCET_COOLDOWN = 1 days;

    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN,
            "MockERC20: faucet cooldown active"
        );
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
}
