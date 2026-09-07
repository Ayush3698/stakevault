import React, { useState } from "react";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import stakingAbi from "../abi/StakingRewards.json";
import tokenAbi from "../abi/MockERC20.json";
import { CONTRACTS } from "../config/wagmi";

function fmt(value, decimals = 18, precision = 4) {
  if (value === undefined) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString(undefined, { maximumFractionDigits: precision });
}

export default function StakeCard({ address }) {
  const [amount, setAmount] = useState("");
  const [statusMsg, setStatusMsg] = useState(null);

  const stakingToken = CONTRACTS.stakingToken;
  const stakingContract = CONTRACTS.stakingContract;

  const { data: walletBalance, refetch: refetchWallet } = useReadContract({
    address: stakingToken,
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: stakedBalance, refetch: refetchStaked } = useReadContract({
    address: stakingContract,
    abi: stakingAbi,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: earned, refetch: refetchEarned } = useReadContract({
    address: stakingContract,
    abi: stakingAbi,
    functionName: "earned",
    args: [address],
    query: { refetchInterval: 5000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stakingToken,
    abi: tokenAbi,
    functionName: "allowance",
    args: [address, stakingContract],
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [pendingTx, setPendingTx] = useState(null);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: pendingTx,
    query: { enabled: !!pendingTx },
  });

  const refetchAll = () => {
    refetchWallet();
    refetchStaked();
    refetchEarned();
    refetchAllowance();
  };

  async function runTx(label, fn) {
    setStatusMsg({ type: "pending", text: `${label}…` });
    try {
      const hash = await fn();
      setPendingTx(hash);
      setStatusMsg({ type: "pending", text: `${label} submitted — confirming…` });
      // simple poll for confirmation via wagmi hook re-render; also refetch after a delay
      setTimeout(() => {
        refetchAll();
        setStatusMsg({ type: "success", text: `${label} confirmed.` });
      }, 4000);
    } catch (err) {
      setStatusMsg({
        type: "error",
        text: err?.shortMessage || err?.message || `${label} failed.`,
      });
    }
  }

  const parsedAmount = (() => {
    try {
      return amount ? parseUnits(amount, 18) : 0n;
    } catch {
      return 0n;
    }
  })();

  const needsApproval = allowance !== undefined && parsedAmount > 0n && allowance < parsedAmount;

  const handleFaucet = () =>
    runTx("Faucet claim", () =>
      writeContractAsync({
        address: stakingToken,
        abi: tokenAbi,
        functionName: "faucet",
      })
    );

  const handleApprove = () =>
    runTx("Approval", () =>
      writeContractAsync({
        address: stakingToken,
        abi: tokenAbi,
        functionName: "approve",
        args: [stakingContract, parsedAmount],
      })
    );

  const handleStake = () =>
    runTx("Stake", () =>
      writeContractAsync({
        address: stakingContract,
        abi: stakingAbi,
        functionName: "stake",
        args: [parsedAmount],
      })
    );

  const handleWithdraw = () =>
    runTx("Withdraw", () =>
      writeContractAsync({
        address: stakingContract,
        abi: stakingAbi,
        functionName: "withdraw",
        args: [parsedAmount],
      })
    );

  const handleClaim = () =>
    runTx("Claim rewards", () =>
      writeContractAsync({
        address: stakingContract,
        abi: stakingAbi,
        functionName: "claimReward",
      })
    );

  const handleMax = () => {
    if (walletBalance) setAmount(formatUnits(walletBalance, 18));
  };

  const busy = isPending || isConfirming;

  return (
    <div>
      <section className="ledger">
        <div className="ledger-row">
          <span className="ledger-label">Wallet balance</span>
          <span className="ledger-value">
            {fmt(walletBalance)} <small>SVT</small>
          </span>
        </div>
        <div className="ledger-row">
          <span className="ledger-label">Currently staked</span>
          <span className="ledger-value accent">
            {fmt(stakedBalance)} <small>SVT</small>
          </span>
        </div>
        <div className="ledger-row">
          <span className="ledger-label">Rewards earned</span>
          <span className="ledger-value green">
            {fmt(earned)} <small>SVR</small>
          </span>
        </div>
      </section>

      {(!walletBalance || walletBalance === 0n) && (
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={handleFaucet} disabled={busy}>
            Claim 1,000 test SVT from faucet
          </button>
          <p className="helper-text">
            New here? Claim free test tokens once every 24 hours to try staking.
          </p>
        </div>
      )}

      <h2 className="panel-title">Stake or withdraw</h2>
      <div className="action-panel">
        <div className="input-row">
          <input
            className="amount-input"
            type="text"
            inputMode="decimal"
            placeholder="0.0 SVT"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button className="max-btn" onClick={handleMax}>
            MAX
          </button>
        </div>
        <div className="action-row">
          {needsApproval ? (
            <button className="btn btn-primary" onClick={handleApprove} disabled={busy || parsedAmount === 0n}>
              Approve SVT
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleStake} disabled={busy || parsedAmount === 0n}>
              Stake
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleWithdraw} disabled={busy || parsedAmount === 0n}>
            Withdraw
          </button>
          <button className="btn btn-ghost" onClick={handleClaim} disabled={busy || !earned || earned === 0n}>
            Claim rewards
          </button>
        </div>
        <p className="helper-text">
          Staking requires a one-time approval per amount. Rewards accrue
          continuously while your tokens are staked.
        </p>
      </div>

      {statusMsg && (
        <p className={`status-line ${statusMsg.type}`}>{statusMsg.text}</p>
      )}
    </div>
  );
}
