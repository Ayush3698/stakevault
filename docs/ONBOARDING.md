# Onboarding a Preprod tester

This is the exact flow to send to a new tester (used to acquire the 50
Preprod users for this submission).

## What you need before starting

- A wallet with the MetaMask (or any injected-wallet-compatible) browser
  extension installed.
- Some Sepolia ETH for gas. Free from any public faucet, e.g.:
  - https://sepoliafaucet.com
  - https://www.alchemy.com/faucets/ethereum-sepolia

## Steps

1. **Open the live demo link** (see root `README.md`).
2. **Switch your wallet to the Sepolia test network.** Most wallets prompt
   automatically when the app requests it; if not, add it manually
   (chain ID `11155111`).
3. **Click "Connect wallet"** in the top right and approve the connection.
4. **Claim test tokens.** If your balance is 0, an in-app faucet button
   appears — click it to receive 1,000 SVT (once per 24h per wallet).
5. **Stake.** Enter an amount, click **Approve SVT** (one-time per
   allowance), then **Stake**.
6. **Watch rewards accrue.** The "Rewards earned" line updates roughly
   every 5 seconds as SVR accrues.
7. **Withdraw or claim** whenever you like — both are independent actions,
   or use **Claim rewards** to collect SVR without unstaking.

## Recording a tester for this submission

Each tester's connected wallet address is logged in
[`docs/USERS.md`](USERS.md) once they've completed at least one on-chain
action (faucet claim or stake), so the list is verifiable on Sepolia
Etherscan rather than just self-reported.

## Collecting feedback from a tester

After a tester has tried the app, they're asked the 4 questions in
[`docs/FEEDBACK_LOOP.md`](FEEDBACK_LOOP.md#feedback-form) — takes under
2 minutes. Every response is logged and triaged there.
