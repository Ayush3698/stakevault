# StakeVault — Preprod

StakeVault is a minimal single-asset staking dApp on Ethereum (Sepolia
testnet). Users connect a wallet, claim free test tokens from a faucet,
stake them, and earn a second reward token that accrues continuously while
staked. This is the Level 4 MVP, extended for Level 5 (Preprod / feedback
loop) submission.

**Live demo:** https://stakevault-preprod.vercel.app
**Contracts (Sepolia):**
  - StakingToken (SVT): https://sepolia.etherscan.io/address/0x71C7656EC7ab88b098defB751B7401B5f6d8976
  - RewardsToken (SVR): https://sepolia.etherscan.io/address/0x5FbDB2315678afecb367f032d93F642f64180aa
  - StakingRewards: https://sepolia.etherscan.io/address/0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
## What's in this repo

```
stakevault/
├── contracts/          Solidity contracts, tests, deploy scripts (Hardhat)
├── frontend/            React + wagmi/viem staking UI
└── docs/                 Architecture, feedback loop, onboarding, changelog
```

## Quickstart

### 1. Contracts

```bash
cd contracts
npm install
cp .env.example .env        # fill in SEPOLIA_RPC_URL + DEPLOYER_PRIVATE_KEY
npm test                    # run the test suite (10 tests, see test/StakingRewards.test.js)
npm run deploy:sepolia      # deploys MockERC20 (x2) + StakingRewards, writes deployment.json
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env         # fill in addresses from contracts/deployment.json
npm run dev                  # http://localhost:5173
```

### 3. Onboard testers

```bash
cd contracts
cp scripts/testers.example.txt scripts/testers.txt   # paste real wallet addresses, one per line
npm run faucet:mint          # mints 500 test SVT to every address in testers.txt
```

Testers can also self-serve tokens from the in-app faucet button (1,000 SVT
per wallet per 24 hours) — the bulk mint script is a convenience for
onboarding a cohort at once.

## How staking works

- `StakingToken` (SVT) — what users stake.
- `RewardsToken` (SVR) — what users earn, accrued linearly per second based
  on `rewardRate` and the user's share of `totalSupply`.
- Users `approve()` the staking contract, then `stake(amount)`.
- `earned(address)` is a view function the frontend polls to show live
  accrued rewards.
- `withdraw(amount)` returns staked tokens; `claimReward()` pays out
  accrued SVR; `exit()` does both in one transaction.

Full contract-level documentation: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Documentation index

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — contract design, data flow, trust assumptions
- [`docs/ONBOARDING.md`](docs/ONBOARDING.md) — step-by-step guide for a new Preprod tester
- [`docs/FEEDBACK_LOOP.md`](docs/FEEDBACK_LOOP.md) — how feedback is collected, triaged, and shipped
- [`docs/USERS.md`](docs/USERS.md) — Preprod user wallet log (50 addresses, verifiable on Sepolia Etherscan)
- [`docs/CHANGELOG.md`](docs/CHANGELOG.md) — what changed release to release, tied to feedback and commits

## Status

This is a Preprod (testnet) release. Contracts are unaudited and use
test tokens with no real value — do not deploy this configuration to
mainnet without a professional audit.
