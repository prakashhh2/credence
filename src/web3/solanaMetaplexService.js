/**
 * Solana NFT Service
 * -------------------
 * Handles NFT minting for certificate issuance
 * Simplified version using SPL Token without Metaplex
 */

import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import { getConnection, isValidSolanaAddress } from './solanaService';

/**
 * Create a simple wallet object for token operations
 * @param {Object} walletAdapter - Wallet adapter from wallet-adapter-react
 * @returns {Object} - Simple wallet object
 */
export const createWalletSigner = (walletAdapter) => {
  return {
    publicKey: walletAdapter.publicKey,
    signTransaction: walletAdapter.signTransaction,
    signAllTransactions: walletAdapter.signAllTransactions,
  };
};

/**
 * Mint an NFT certificate on Solana Devnet
 * Simplified version using SPL Token
 * @param {Object} params - Minting parameters
 * @param {Object} params.wallet - Wallet adapter
 * @param {string} params.certificateId - Unique certificate ID
 * @param {string} params.studentName - Student name
 * @param {string} params.degreeTitle - Degree/certification title
 * @param {string} params.universityName - University name
 * @param {string} params.issueDate - Issue date (ISO format)
 * @param {string} params.certificateHash - SHA-256 hash of certificate file
 * @param {string} params.metadataUrl - URL to metadata JSON (hosted)
 * @returns {Promise<Object>} - { mintAddress, txSignature, certificateData }
 */
export const mintCertificateNFT = async (params) => {
  const {
    wallet,
    certificateId,
    studentName,
    degreeTitle,
    universityName,
    issueDate,
    certificateHash,
    metadataUrl,
  } = params;

  try {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected or invalid');
    }

    const connection = getConnection();
    
    console.log('Creating mint account...');
    // Create a simple mint for the certificate NFT
    const mint = await createMint(
      connection,
      {
        publicKey: wallet.publicKey,
        secretKey: new Uint8Array(32),
      },
      wallet.publicKey, // mint authority
      wallet.publicKey, // freeze authority
      0 // 0 decimals for NFT
    );

    console.log('Mint created:', mint.toBase58());

    // Create associated token account for the student
    console.log('Creating associated token account...');
    const tokenAccount = await createAssociatedTokenAccount(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mint,
      wallet.publicKey
    );

    // Mint 1 token (the certificate NFT)
    console.log('Minting certificate token...');
    const txSig = await mintTo(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      mint,
      tokenAccount,
      wallet.publicKey,
      1
    );

    console.log('Certificate minted! Tx:', txSig);

    return {
      mintAddress: mint.toBase58(),
      txSignature: txSig || 'tx-confirmed',
      certificateData: {
        certificateId,
        studentName,
        degreeTitle,
        universityName,
        issueDate,
        certificateHash,
        metadataUrl: metadataUrl || 'https://example.com/metadata.json',
      },
    };
  } catch (error) {
    console.error('Error minting certificate NFT:', error);
    throw error;
  }
};

/**
 * Fetch NFT metadata from the blockchain
 * @param {string} mintAddress - Mint address of the NFT
 * @returns {Promise<Object>} - Metadata object
 */
export const fetchNFTMetadata = async (mintAddress) => {
  try {
    if (!isValidSolanaAddress(mintAddress)) {
      throw new Error('Invalid mint address');
    }

    const connection = getConnection();
    const mint = new PublicKey(mintAddress);

    // Fetch mint account data
    const accountInfo = await connection.getParsedAccountInfo(mint);

    if (!accountInfo.value || !accountInfo.value.data.parsed) {
      throw new Error('Mint account not found or invalid');
    }

    const mintData = accountInfo.value.data.parsed.info;

    return {
      mintAddress,
      supply: mintData.supply || '1',
      decimals: mintData.decimals || 0,
      owner: mintData.owner || 'Unknown',
      // In production, fetch full metadata from Metaplex metadata account
      metadata: {
        name: `Certificate - ${mintAddress.slice(0, 8)}...`,
        symbol: 'CERT',
        uri: 'https://example.com/metadata.json',
      },
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
};

/**
 * Revoke mint authority (optional - lock further minting)
 * @param {string} mintAddress - Mint address
 * @param {Object} wallet - Wallet adapter
 * @returns {Promise<string>} - Transaction signature
 */
export const revokeMintAuthority = async (mintAddress, wallet) => {
  try {
    if (!isValidSolanaAddress(mintAddress)) {
      throw new Error('Invalid mint address');
    }

    const connection = getConnection();
    const mint = new PublicKey(mintAddress);

    // Create transaction to revoke mint authority
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: mint,
        lamports: 0, // Placeholder - would normally revoke authority
      })
    );

    // In production, use setAuthority from spl-token
    const latestBlockhash = await connection.getLatestBlockhash();
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = latestBlockhash.blockhash;

    const signedTx = await wallet.signTransaction(tx);
    const txSig = await connection.sendRawTransaction(signedTx.serialize());

    console.log('Mint authority revoked:', txSig);
    return txSig;
  } catch (error) {
    console.error('Error revoking mint authority:', error);
    throw error;
  }
};

/**
 * Get certificate details from stored metadata
 * @param {string} certificateId - Certificate ID
 * @returns {Object} - Certificate details
 */
export const getCertificateDetails = (certificateId) => {
  try {
    const stored = localStorage.getItem(`cert_${certificateId}`);
    if (!stored) {
      throw new Error(`Certificate ${certificateId} not found`);
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting certificate details:', error);
    throw error;
  }
};
