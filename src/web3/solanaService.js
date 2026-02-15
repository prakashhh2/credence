/**
 * Solana Web3 Service
 * -------------------
 * Handles Solana wallet connections and RPC interactions
 * Using @solana/web3.js and wallet-adapter
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Devnet configuration
export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = process.env.REACT_APP_SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK);

// Create reusable connection
let connectionInstance = null;

/**
 * Get or create Solana connection
 * @returns {Connection} Solana connection instance
 */
export const getConnection = () => {
  if (!connectionInstance) {
    connectionInstance = new Connection(SOLANA_RPC_URL, 'confirmed');
  }
  return connectionInstance;
};

/**
 * Get wallet balance
 * @param {PublicKey} publicKey - Wallet public key
 * @returns {Promise<number>} - Balance in SOL
 */
export const getBalance = async (publicKey) => {
  try {
    const connection = getConnection();
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw error;
  }
};

/**
 * Request airdrop for testing (Devnet only)
 * @param {PublicKey} publicKey - Wallet public key
 * @param {number} amount - Amount in SOL
 * @returns {Promise<string>} - Transaction signature
 */
export const requestAirdrop = async (publicKey, amount = 2) => {
  try {
    const connection = getConnection();
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Error requesting airdrop:', error);
    throw error;
  }
};

/**
 * Get transaction details
 * @param {string} signature - Transaction signature
 * @returns {Promise<Object>} - Transaction details
 */
export const getTransaction = async (signature) => {
  try {
    const connection = getConnection();
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    return tx;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

/**
 * Confirm transaction
 * @param {string} signature - Transaction signature
 * @returns {Promise<Object>} - Confirmation result
 */
export const confirmTransaction = async (signature) => {
  try {
    const connection = getConnection();
    const latestBlockHash = await connection.getLatestBlockhash();
    
    const confirmation = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });

    return confirmation;
  } catch (error) {
    console.error('Error confirming transaction:', error);
    throw error;
  }
};

/**
 * Format public key to short address
 * @param {PublicKey} publicKey - Solana public key
 * @returns {string} - Shortened address (first 6 + last 4 chars)
 */
export const formatAddress = (publicKey) => {
  const address = publicKey.toString();
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Validate Solana public key
 * @param {string} address - Address to validate
 * @returns {boolean} - True if valid
 */
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

export default {
  getConnection,
  getBalance,
  requestAirdrop,
  getTransaction,
  confirmTransaction,
  formatAddress,
  isValidSolanaAddress,
  SOLANA_NETWORK,
  SOLANA_RPC_URL,
};
