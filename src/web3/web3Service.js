/**
 * Web3 Service - Polygon/Ethereum Integration
 * Handles wallet connection and blockchain interactions using ethers.js
 */

import { ethers } from 'ethers';

// Minimal ABI for CredenceCertificateV2 (bytes32-based)
const CONTRACT_ABI = [
  "function issueCertificate(bytes32 certHash, string ipfsHash, string metadataURI)",
  "function claimCertificate(bytes32 certHash)",
  "function getCertificate(bytes32 certHash) view returns (address issuer, uint64 issuedAt, string ipfsHash, bool revoked, address claimedBy, uint64 claimedAt, string metadataURI)",
  "function exists(bytes32 certHash) view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function isIssuer(address account) view returns (bool)",
  "event CertificateIssued(bytes32 indexed certHash, address indexed issuer, uint64 issuedAt, string ipfsHash, string metadataURI)",
  "event CertificateClaimed(bytes32 indexed certHash, address indexed claimer, uint64 claimedAt)",
];

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';
const POLYGON_RPC_URL = process.env.REACT_APP_POLYGON_RPC_URL || 'https://rpc-mumbai.maticvigil.com';

/**
 * Connect to wallet (MetaMask)
 * @returns {Promise<Object>} - { provider, signer, address }
 */
export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask extension.');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = accounts[0];

    // Store in localStorage
    localStorage.setItem('walletAddress', address);

    return {
      provider,
      signer,
      address,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

/**
 * Check if account is DEFAULT_ADMIN_ROLE on contract
 */
export const isAdmin = async (address) => {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const defaultAdmin = '0x' + '00'.repeat(32);
    return await contract.hasRole(defaultAdmin, address);
  } catch (err) {
    console.error('isAdmin error', err);
    return false;
  }
};

/**
 * Get contract instance
 * @param {Object} signer - Ethers signer
 * @returns {Object} - Contract instance
 */
export const getContract = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Switch to Polygon Mumbai network
 * @returns {Promise<void>}
 */
export const switchToPolygon = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x13881' }], // Polygon Mumbai testnet
    });
  } catch (error) {
    if (error.code === 4902) {
      // Network not added, add it
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13881',
            chainName: 'Polygon Mumbai',
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
            nativeCurrency: {
              name: 'Matic',
              symbol: 'MATIC',
              decimals: 18,
            },
            blockExplorerUrls: ['https://mumbai.polygonscan.com'],
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

/**
 * Issue certificate on blockchain
 * @param {Object} params - Certificate data
 * @returns {Promise<Object>} - { transactionHash, certificateHash }
 */
export const issueCertificateOnChain = async (params) => {
  try {
    const { signer } = await connectWallet();
    const contract = getContract(signer);

    const { ipfsHash, certificateHash, metadataURI } = params;
    // normalize hex string to bytes32
    const certHex = normalizeToBytes32Hex(certificateHash);
    const tx = await contract.issueCertificate(certHex, ipfsHash || '', metadataURI || '');

    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      certificateHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error('Error issuing certificate:', error);
    throw error;
  }
};

/**
 * Verify certificate on blockchain
 * @param {string} certificateHash - Hash to verify
 * @returns {Promise<Object>} - Verification result
 */
export const verifyCertificateOnChain = async (certificateHash) => {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const certHex = normalizeToBytes32Hex(certificateHash);
    const exists = await contract.exists(certHex);
    return { exists, certificateHash };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

/**
 * Get certificate details from blockchain
 * @param {string} certificateHash - Hash to retrieve
 * @returns {Promise<Object>} - Certificate details
 */
export const getCertificateFromChain = async (certificateHash) => {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const certHex = normalizeToBytes32Hex(certificateHash);
    const cert = await contract.getCertificate(certHex);
    return {
      issuer: cert[0],
      issuedAt: Number(cert[1]),
      ipfsHash: cert[2],
      revoked: cert[3],
      claimedBy: cert[4],
      claimedAt: Number(cert[5]),
      metadataURI: cert[6],
      certificateHash: certHex,
    };
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
};

/**
 * Claim certificate as student
 * @param {string} certificateHash - Certificate to claim
 * @returns {Promise<Object>} - Transaction details
 */
export const claimCertificateOnChain = async (certificateHash) => {
  try {
    const { signer } = await connectWallet();
    const contract = getContract(signer);

    const certHex = normalizeToBytes32Hex(certificateHash);
    const tx = await contract.claimCertificate(certHex);
    const receipt = await tx.wait();

    return {
      transactionHash: receipt.hash,
      certificateHash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error claiming certificate:', error);
    throw error;
  }
};

/**
 * Normalize a hex or raw hash string to 0x-prefixed 32-byte hex string
 */
function normalizeToBytes32Hex(input) {
  if (!input) throw new Error('certificate hash missing');
  let hex = input.toString();
  if (hex.startsWith('0x')) hex = hex.slice(2);
  if (hex.length !== 64) {
    throw new Error('certificate hash must be 32 bytes (64 hex chars)');
  }
  return '0x' + hex.toLowerCase();
}

/**
 * Get current connected wallet
 * @returns {Promise<string|null>} - Wallet address or null
 */
export const getCurrentWallet = async () => {
  try {
    if (!window.ethereum) return null;

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current wallet:', error);
    return null;
  }
};

/**
 * Listen for wallet changes
 * @param {Function} callback - Called when account changes
 */
export const onWalletChange = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', callback);
  }
};
