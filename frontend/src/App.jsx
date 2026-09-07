import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import StakeCard from "./components/StakeCard";
import { CONTRACTS } from "./config/wagmi";

function shortenAddress(addr) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function App() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const contractsConfigured =
    CONTRACTS.stakingToken && CONTRACTS.rewardsToken && CONTRACTS.stakingContract;

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <p className="wordmark">
            Stake<span>Vault</span>
          </p>
          <p className="tagline">Preprod · Sepolia testnet</p>
        </div>
        {isConnected ? (
          <button className="address-chip" onClick={() => disconnect()} title="Disconnect">
            {shortenAddress(address)}
          </button>
        ) : (
          <button
            className="connect-btn"
            disabled={isPending}
            onClick={() => connect({ connector: connectors[0] })}
          >
            {isPending ? "Connecting…" : "Connect wallet"}
          </button>
        )}
      </header>

      {!contractsConfigured ? (
        <div className="empty-state">
          <p>
            Contract addresses aren't configured yet. Deploy the contracts and
            set <code>VITE_STAKING_TOKEN_ADDRESS</code>,{" "}
            <code>VITE_REWARDS_TOKEN_ADDRESS</code>, and{" "}
            <code>VITE_STAKING_CONTRACT_ADDRESS</code> in <code>frontend/.env</code>.
          </p>
        </div>
      ) : !isConnected ? (
        <div className="empty-state">
          <p>Connect a wallet on Sepolia to stake SVT and earn SVR rewards.</p>
          <button
            className="btn btn-primary"
            disabled={isPending}
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect wallet
          </button>
        </div>
      ) : (
        <StakeCard address={address} />
      )}

      <footer className="footer-note">
        StakeVault is a Preprod demo running on Sepolia testnet. Tokens have
        no real-world value.{" "}
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
        >
          View source
        </a>
        {" · "}
        <a href="/docs/FEEDBACK_LOOP.md">Report feedback</a>
      </footer>
    </div>
  );
}
