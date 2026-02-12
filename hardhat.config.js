require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const { INFURA_API_KEY, ALCHEMY_API_KEY, SEPOLIA_RPC, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC || (`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 31337,
    }
  },
  paths: {
    sources: "contracts",
    tests: "test",
    cache: "cache",
    artifacts: "artifacts"
  }
};
