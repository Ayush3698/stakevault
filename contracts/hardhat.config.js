require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { subtask } = require("hardhat/config");
const {
  TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD,
} = require("hardhat/builtin-tasks/task-names");

// Sandboxed CI/dev environments sometimes block binaries.soliditylang.org.
// If a matching solc-js compiler is available locally (installed via npm,
// e.g. `npm i solc@0.8.24`), use it instead of downloading the native
// binary. This has no effect when network access to soliditylang.org is
// available — Hardhat's default downloader is used as normal.
subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD).setAction(
  async (args, hre, runSuper) => {
    try {
      const path = require("path");
      const solcPkgPath = require.resolve("solc/package.json");
      const solcVersion = require(solcPkgPath).version.split("+")[0];
      if (args.solcVersion === solcVersion || args.solcVersion.startsWith(solcVersion)) {
        return {
          compilerPath: path.join(path.dirname(solcPkgPath), "soljson.js"),
          isSolcJs: true,
          version: args.solcVersion,
          longVersion: args.solcVersion,
        };
      }
    } catch (e) {
      // solc not installed locally — fall through to default behavior
    }
    return runSuper(args);
  }
);

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
