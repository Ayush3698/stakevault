# Preprod users

50 wallet addresses that connected to StakeVault Preprod and completed at
least one on-chain action (faucet claim, stake, or both), verifiable on
[Sepolia Etherscan](https://sepolia.etherscan.io).

**This file must contain real addresses before submission.** The rows
below are placeholders — replace every one. Do not submit this file
unedited; a reviewer will spot-check addresses on Etherscan.

How to fill this in:
1. As each tester connects and takes an action, copy their wallet address
   here along with the tx hash of their first on-chain action (faucet claim
   or stake) — this is what makes the list independently verifiable rather
   than just a list of addresses you typed in.
2. Alternatively, if you used `contracts/scripts/mint-faucet.js` to bulk
   onboard testers, every mint tx is logged to the console — paste those
   tx hashes here.

| # | Wallet address | First on-chain action | Tx hash | Date |
|---|---|---|---|---|
| 1 | 0x0000000000000000000000000000000000000001 | Faucet claim | 0x... | 2026-09-01 |
| 2 | 0x0000000000000000000000000000000000000002 | Stake | 0x... | 2026-09-01 |
| ... | ... | ... | ... | ... |
| 50 | 0x0000000000000000000000000000000000000032 | Faucet claim | 0x... | 2026-09-05 |

## Verifying this list

Any address above can be checked at:
`https://sepolia.etherscan.io/address/<wallet_address>`

Any tx hash above can be checked at:
`https://sepolia.etherscan.io/tx/<tx_hash>`
