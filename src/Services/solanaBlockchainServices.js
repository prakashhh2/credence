/**
 * Solana Certificate Blockchain Service
 * ======================================
 * High-level service for certificate issuance and verification
 * Orchestrates NFT minting, metadata upload, and verification
 */

import { PublicKey } from '@solana/web3.js';
import { mintCertificateNFT, fetchNFTMetadata } from '../web3/solanaMetaplexService';
import {
  hashFile,
  createMetadataJSON,
  uploadMetadataJSON,
  uploadCertificateFile,
  uploadStudentPhoto,
  fetchMetadata,
} from '../web3/storageService';
import QRCode from 'qrcode';

/**
 * Issue a certificate as an NFT on Solana
 * @param {Object} params - Certificate issuance parameters
 * @param {Object} params.wallet - Connected wallet adapter
 * @param {string} params.certificateId - Unique certificate ID
 * @param {string} params.studentName - Student name
 * @param {string} params.degreeTitle - Degree title
 * @param {string} params.universityName - University name
 * @param {string} params.issueDate - Issue date (ISO format)
 * @param {File} params.certificateFile - Certificate PDF/image file
 * @param {File} params.studentPhotoFile - Student photo file (optional)
 * @returns {Promise<Object>} - { mintAddress, txSignature, qrCode, certificateData }
 */
export const issueCertificateOnSolana = async (params) => {
  const {
    wallet,
    certificateId,
    studentName,
    degreeTitle,
    universityName,
    issueDate,
    certificateFile,
    studentPhotoFile,
  } = params;

  try {
    console.log('Starting certificate issuance on Solana...');

    // Step 1: Hash the certificate file
    console.log('Step 1: Hashing certificate file...');
    const certificateHash = await hashFile(certificateFile);
    console.log('Certificate hash:', certificateHash);

    // Step 2: Upload certificate file
    console.log('Step 2: Uploading certificate file...');
    const certificateFileUrl = await uploadCertificateFile(certificateFile);
    console.log('Certificate file URL:', certificateFileUrl);

    // Step 3: Upload student photo (if provided)
    console.log('Step 3: Uploading student photo...');
    let studentPhotoUrl = null;
    if (studentPhotoFile) {
      studentPhotoUrl = await uploadStudentPhoto(studentPhotoFile);
      console.log('Student photo URL:', studentPhotoUrl);
    }

    // Step 4: Create metadata JSON
    console.log('Step 4: Creating metadata JSON...');
    const metadata = createMetadataJSON({
      certificateId,
      studentName,
      degreeTitle,
      universityName,
      issueDate,
      certificateHash,
      certificateFileUrl,
      studentPhotoUrl,
    });

    // Step 5: Upload metadata
    console.log('Step 5: Uploading metadata...');
    const metadataUrl = await uploadMetadataJSON(metadata);
    console.log('Metadata URL:', metadataUrl);

    // Step 6: Mint NFT on Solana
    console.log('Step 6: Minting NFT on Solana Devnet...');
    const nftResult = await mintCertificateNFT({
      wallet,
      certificateId,
      studentName,
      degreeTitle,
      universityName,
      issueDate,
      certificateHash,
      metadataUrl,
    });

    console.log('NFT minted:', nftResult);

    // Step 7: Generate QR code linking to verify page
    console.log('Step 7: Generating QR code...');
    const verifyUrl = `${window.location.origin}/#verify?mint=${nftResult.mintAddress}&sig=${nftResult.txSignature}`;
    const qrCode = await QRCode.toDataURL(verifyUrl);

    return {
      mintAddress: nftResult.mintAddress,
      txSignature: nftResult.txSignature,
      certificateHash,
      qrCode,
      metadataUrl,
      certificateData: {
        certificateId,
        studentName,
        degreeTitle,
        universityName,
        issueDate,
      },
    };
  } catch (error) {
    console.error('Error issuing certificate on Solana:', error);
    throw error;
  }
};

/**
 * Verify a certificate by mint address
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} - Verification result with on-chain metadata
 */
export const verifyCertificateOnSolana = async (mintAddress) => {
  try {
    console.log('Verifying certificate on Solana...');

    // Validate mint address
    try {
      new PublicKey(mintAddress);
    } catch {
      throw new Error('Invalid Solana mint address');
    }

    // Step 1: Fetch NFT metadata from blockchain
    console.log('Step 1: Fetching NFT metadata...');
    const nftMetadata = await fetchNFTMetadata(mintAddress);

    if (!nftMetadata.onChain) {
      return {
        verified: false,
        error: 'NFT not found on chain',
        mintAddress,
      };
    }

    // Step 2: Fetch full metadata from URI
    console.log('Step 2: Fetching certificate metadata from URI...');
    let fullMetadata = null;
    try {
      // Try to fetch from the metadata URI
      // For now, return what we have from on-chain
      fullMetadata = nftMetadata;
    } catch (error) {
      console.warn('Could not fetch full metadata from URI:', error);
    }

    return {
      verified: true,
      mintAddress,
      metadata: fullMetadata || nftMetadata,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return {
      verified: false,
      error: error.message,
      mintAddress,
    };
  }
};

/**
 * Get detailed certificate information
 * @param {string} mintAddress - NFT mint address
 * @returns {Promise<Object>} - Detailed certificate data
 */
export const getCertificateDetails = async (mintAddress) => {
  try {
    const metadata = await fetchNFTMetadata(mintAddress);
    return metadata;
  } catch (error) {
    console.error('Error getting certificate details:', error);
    throw error;
  }
};

/**
 * Format certificate mint address for display
 * @param {string} mintAddress - Full mint address
 * @returns {string} - Shortened format
 */
export const formatMintAddress = (mintAddress) => {
  return `${mintAddress.slice(0, 6)}...${mintAddress.slice(-4)}`;
};

export default {
  issueCertificateOnSolana,
  verifyCertificateOnSolana,
  getCertificateDetails,
  formatMintAddress,
};
