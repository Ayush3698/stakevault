# Architecture

## Overview

StakeVault has three moving pieces:

1. **`MockERC20`** — a standard, mintable ERC-20 used twice: once as the
   staking token (SVT) and once as the reward token (SVR). Includes a public
   `faucet()` function (1,000 tokens / wallet / 24h) so Preprod testers can
   self-serve without asking anyone for tokens.
2. **`StakingRewards`** — the core contract. Implements the widely-used
   Synthetix-style linear reward accrual model:
   - `rewardPerTokenStored` tracks cumulative rewards per staked token.
   - Every state-changing call runs the `updateReward` modifier, which
     settles the caller's pending rewards before applying the new action.
   - `earned(address)` is a pure view calculation — safe to poll from the
     frontend on an interval without costing gas.
3. **Frontend** — React + [wagmi](https://wagmi.sh) + [viem](https://viem.sh).
   Wallet connection uses the injected connector (MetaMask, Rabby, etc.) —
   no WalletConnect project ID required, which keeps the Preprod deploy
   dependency-free.

## Data flow

```
 User wallet
     │  1. faucet() / approve()
     ▼
 MockERC20 (SVT)
     │  2. stake(amount) — pulls SVT via transferFrom
     ▼
 StakingRewards ──── accrues SVR over time (rewardRate × time / totalSupply)
     │  3. claimReward() / exit()
     ▼
 MockERC20 (SVR) ──► back to user wallet
```

## Trust assumptions & known limitations (Preprod scope)

These are intentional simplifications for a Preprod / testnet MVP, listed
here so reviewers and testers know what's out of scope for this release:

- **Owner-controlled reward rate.** `setRewardRate` is `onlyOwner`. On
  mainnet this would move to a timelock or DAO-controlled parameter.
  Tracked in `docs/FEEDBACK_LOOP.md` backlog.
- **No slashing / lockup.** Users can withdraw staked tokens at any time.
  This is deliberate for the Preprod MVP — lockup periods are a candidate
  feature pending user feedback (see backlog).
- **Unaudited.** These contracts follow a well-known, battle-tested pattern
  (Synthetix `StakingRewards`) but have not been through a third-party
  audit. Not intended for mainnet deployment as-is.
- **Reward funding is manual.** The deploy script mints 1,000,000 SVR
  directly into the staking contract at deploy time. A production version
  would need a sustainable emissions/funding mechanism.

## Why this pattern

The Synthetix-style `rewardPerToken` accumulator avoids looping over all
stakers to distribute rewards (an O(n) gas trap common in naive staking
contracts). Every user's rewards are computed lazily, on-demand, in O(1),
which is why this pattern is the de facto standard for single-asset
staking contracts.
