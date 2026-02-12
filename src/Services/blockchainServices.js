/**
 * Blockchain Services
 * -------------------
 * Handles all blockchain interactions for certificate management:
 * - Certificate uploads to blockchain
 * - Hash generation
 * - QR code creation
 * - IPFS file storage
 */

import { issueCertificateOnChain, verifyCertificateOnChain, getCertificateFromChain } from '../web3/web3Service';
import { uploadCertificateToIPFS, getIPFSUrl, hashFile } from '../web3/ipfsService';
import { saveTransaction, updateTransaction } from '../web3/transactionTracker';
import QRCode from 'qrcode';

/**
 * Generate QR code from data
 * @param {string} data - Data to encode
 * @returns {Promise<string>} - QR code data URL
 */
const generateQRCodeImage = async (data) => {
  try {
    return await QRCode.toDataURL(data);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Upload certificate to blockchain with IPFS storage
 * @param {Object} certificateData - Certificate metadata
 * @param {string} certificateData.studentName - Student name
 * @param {string} certificateData.degree - Degree/certification
 * @param {string} certificateData.issueDate - Issue date
 * @param {string} certificateData.universityName - University name
 * @param {File} certificateFile - Certificate file
 * @param {string} walletAddress - User's wallet address
 * @returns {Promise<Object>} - { hash, qrCode, transactionId, ipfsHash }
 */
export const uploadCertificateToBlockchain = async (
  certificateData,
  certificateFile,
  walletAddress
) => {
  let txRecord = null;

  try {
    // Create initial transaction record
    txRecord = saveTransaction({
      certificateHash: 'pending',
      type: 'issue',
      status: 'pending',
      error: null,
    });

    console.log('Starting certificate upload process...');

    // Step 1: Calculate file hash
    console.log('Step 1: Calculating file hash...');
    const fileHash = await hashFile(certificateFile);

    // Step 2: Upload to IPFS
    console.log('Step 2: Uploading to IPFS...');
    const ipfsResult = await uploadCertificateToIPFS(certificateFile, fileHash);

    // Step 3: Issue on blockchain
    console.log('Step 3: Issuing certificate on blockchain...');
    const blockchainResult = await issueCertificateOnChain({
      studentName: certificateData.studentName,
      degree: certificateData.degree,
      issueDate: certificateData.issueDate,
      universityName: certificateData.universityName,
      ipfsHash: ipfsResult.ipfsHash,
      certificateHash: fileHash,
      metadataURI: ipfsResult.url,
    });

    // Step 4: Generate QR code
    console.log('Step 4: Generating QR code...');
    const qrData = {
      certificateHash: fileHash,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber,
      ipfsHash: ipfsResult.ipfsHash,
      verifyUrl: `${window.location.origin}/verify/${fileHash}`,
    };
    const qrCode = await generateQRCodeImage(JSON.stringify(qrData));

    // Update transaction record
    updateTransaction(txRecord.id, {
      certificateHash: fileHash,
      transactionHash: blockchainResult.transactionHash,
      blockNumber: blockchainResult.blockNumber,
      status: 'success',
      gasUsed: blockchainResult.gasUsed,
    });

    return {
      hash: fileHash,
      qrCode,
      transactionId: blockchainResult.transactionHash,
      certificateId: blockchainResult.certificateHash,
      ipfsHash: ipfsResult.ipfsHash,
      ipfsUrl: ipfsResult.url,
      blockNumber: blockchainResult.blockNumber,
    };
  } catch (error) {
    console.error('Error uploading certificate:', error);

    if (txRecord) {
      updateTransaction(txRecord.id, {
        status: 'failed',
        error: error.message,
      });
    }

    throw error;
  }
};

/**
 * Verify certificate on blockchain
 * @param {string} certificateHash - Certificate hash to verify
 * @returns {Promise<Object>} - Certificate verification data
 */
export const verifyCertificateOnBlockchain = async (certificateHash) => {
  try {
    const txRecord = saveTransaction({
      certificateHash,
      type: 'verify',
      status: 'pending',
    });

    const result = await verifyCertificateOnChain(certificateHash);

    updateTransaction(txRecord.id, {
      status: 'success',
      transactionHash: 'verified',
    });

    return {
      ...result,
      verified: result.exists,
      verifiedAt: new Date(),
    };
  } catch (error) {
    console.error('Error verifying certificate:', error);
    throw error;
  }
};

/**
 * Get complete certificate details
 * @param {string} certificateHash - Certificate hash
 * @returns {Promise<Object>} - Full certificate details
 */
export const getCertificateDetails = async (certificateHash) => {
  try {
    const certDetails = await getCertificateFromChain(certificateHash);
    const ipfsUrl = getIPFSUrl(certDetails.ipfsHash);

    return {
      ...certDetails,
      ipfsUrl,
      verified: true,
      verifiedAt: new Date(),
    };
  } catch (error) {
    console.error('Error fetching certificate details:', error);
    throw error;
  }
};

/**
 * Generate shareable certificate proof
 * @param {Object} certificateData - Certificate data
 * @returns {Object} - Shareable proof
 */
export const generateCertificateProof = (certificateData) => {
  return {
    studentName: certificateData.studentName,
    degree: certificateData.degree,
    issueDate: certificateData.issueDate,
    certificateHash: certificateData.blockchainHash,
    blockNumber: certificateData.blockNumber,
    verifyUrl: `${window.location.origin}/verify/${certificateData.blockchainHash}`,
    ipfsUrl: certificateData.ipfsUrl,
  };
};
