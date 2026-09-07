# Changelog

All notable changes to StakeVault are logged here, each tied back to the
feedback or decision that motivated it. Newest first.

## [Unreleased]

- _Add entries here as you ship fixes from the feedback backlog._

## [1.0.0] — Level 5 Preprod release

### Added
- `MockERC20` staking + reward tokens with public faucet (1,000 tokens /
  wallet / 24h) for self-serve tester onboarding.
- `StakingRewards` contract: stake, withdraw, claim, and combined `exit()`.
- Hardhat test suite covering staking, withdrawal, reward accrual (single
  and multi-staker), access control, and faucet cooldown (10 tests).
- React + wagmi/viem frontend: wallet connect, live balances, staking
  actions, real-time reward polling.
- Bulk tester onboarding script (`scripts/mint-faucet.js`) for minting test
  tokens to a batch of Preprod wallet addresses.
- Documentation: architecture, onboarding guide, feedback loop process,
  user log.

### Notes
- This is the baseline this cycle's feedback loop builds on. Every future
  entry in this file should reference the backlog item in
  `docs/FEEDBACK_LOOP.md` that caused it, e.g.:

  ```
  ### Fixed
  - Show a clear warning when wallet has no Sepolia ETH for gas
    (docs/FEEDBACK_LOOP.md backlog: "Blocker" from User #3)
  ```
