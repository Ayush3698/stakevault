import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(
      import.meta.env.VITE_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    ),
  },
});

// Deployed contract addresses — filled in after running
// `npm run deploy:sepolia` in /contracts (see contracts/deployment.json).
export const CONTRACTS = {
  stakingToken: import.meta.env.VITE_STAKING_TOKEN_ADDRESS || "",
  rewardsToken: import.meta.env.VITE_REWARDS_TOKEN_ADDRESS || "",
  stakingContract: import.meta.env.VITE_STAKING_CONTRACT_ADDRESS || "",
};
