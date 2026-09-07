# Feedback loop

How feedback gets from a Preprod tester into a shipped change.

## 1. Collection

Every tester is asked the same short form after their first session
(in person, in a Telegram/Discord DM, or via a shared form — pick one
channel and use it consistently). Keeping the questions identical across
all 50 users is what makes the responses comparable and prioritizable.

### Feedback form

1. What were you trying to do, and did you manage to do it? (Y/N + notes)
2. Where did you hesitate or get confused, if anywhere?
3. What's the one thing you'd change first?
4. Would you use this again? (Y/N/Maybe)

Raw responses are logged as they come in — one row per response — in the
table below. Do not edit or summarize responses when logging them; keep
triage as a separate step so the raw signal isn't lost.

| # | Wallet (short) | Date | Q1: Task completed? | Q2: Friction point | Q3: Requested change | Q4: Would return? |
|---|---|---|---|---|---|---|
| 1 | 0x1a2b…c3d4 | 2026-09-01 | Y | Didn't realize approve() was a separate tx | Combine approve+stake into one click | Y |
| 2 | 0x9f8e…7a6b | 2026-09-01 | Y | Wasn't sure faucet had a cooldown | Show cooldown timer on faucet button | Maybe |
| 3 | 0x55dd…11ee | 2026-09-02 | N | Gas estimation failed, unclear why (no Sepolia ETH) | Show a clear "you need Sepolia ETH" message | Y |

_(Replace with your real responses as they come in — this table should grow
to reflect all 50+ users' feedback, not just a sample.)_

## 2. Triage

Every 3–5 days, raw responses are reviewed and each distinct issue is
converted into a backlog item with a severity:

- **Blocker** — prevents a user from completing the core flow (stake →
  earn → withdraw). Fixed before onboarding more users.
- **Friction** — task completes but confusingly. Fixed same week.
- **Nice-to-have** — cosmetic or feature request. Queued, not blocking.

### Current backlog

| Priority | Item | Source | Status |
|---|---|---|---|
| Blocker | Clear error message when wallet has no Sepolia ETH for gas | User #3 | Open |
| Friction | Combine approve + stake into a single guided flow | User #1 | Open |
| Friction | Add a visible cooldown countdown on the faucet button | User #2 | Open |
| Nice-to-have | Show USD-equivalent value of staked balance (test only) | — | Backlog |
| Nice-to-have | Add a rewards APY estimate on the ledger | — | Backlog |

## 3. Prioritization

Order of work is: **Blockers → Friction → Nice-to-have**, and within a tier,
whichever issue the most distinct users independently reported. A single
loud request from one user does not jump the queue ahead of a quieter issue
five users hit.

## 4. Shipping the fix

Each fix is:
1. Committed with a message referencing the backlog item, e.g.
   `fix: show Sepolia ETH warning when gas estimation fails (#3)`.
2. Noted in [`docs/CHANGELOG.md`](CHANGELOG.md) under the next version,
   with a one-line "why" that traces back to the feedback that caused it.
3. Backlog table above updated: status → `Shipped (vX.X)`.

This keeps a clean, auditable line from **user said X → backlog item →
commit → changelog entry**, which is what "feedback loop documented" means
for this submission — not just a form, but a visible trail from complaint
to fix.

## 5. Closing the loop with users

Where practical, testers whose feedback led to a shipped change are told
what changed and why (a short message: "you mentioned X — we shipped Y").
This is what turns one-off feedback into testers who keep coming back for
future rounds.
