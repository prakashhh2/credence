// src/web3/walletConnect.js
import { BrowserProvider } from "ethers";

let provider;
let signer;

/**
 * Connect to MetaMask wallet
 * @returns {Object} wallet data
 */
export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  provider = new BrowserProvider(window.ethereum);

  // Request wallet access
  await provider.send("eth_requestAccounts", []);

  signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address,
    chainId: Number(network.chainId),
    networkName: network.name,
  };
};

/**
 * Get currently connected wallet (if any)
 */
export const getCurrentWallet = async () => {
  if (!window.ethereum) return null;

  provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);

  if (accounts.length === 0) return null;

  signer = await provider.getSigner();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    address: accounts[0],
    chainId: Number(network.chainId),
    networkName: network.name,
  };
};

/**
 * Listen for wallet changes
 */
export const walletListeners = (onAccountChange, onChainChange) => {
  if (!window.ethereum) return;

  window.ethereum.on("accountsChanged", accounts => {
    if (accounts.length > 0) {
      onAccountChange(accounts[0]);
    } else {
      onAccountChange(null);
    }
  });

  window.ethereum.on("chainChanged", chainId => {
    onChainChange(parseInt(chainId, 16));
    window.location.reload();
  });
};
