/**
 * IPFS Service - File Storage Integration
 * Handles certificate file uploads to IPFS via Pinata
 */

const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.REACT_APP_PINATA_SECRET_KEY;
const PINATA_API_URL = 'https://api.pinata.cloud';

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - File to upload
 * @param {string} certificateHash - Certificate hash for naming
 * @returns {Promise<Object>} - { ipfsHash, size, url }
 */
export const uploadCertificateToIPFS = async (file, certificateHash) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Pin to IPFS with metadata
    const metadata = {
      name: `certificate-${certificateHash.slice(0, 8)}.pdf`,
      keyvalues: {
        certificateHash,
        uploadDate: new Date().toISOString(),
      },
    };

    formData.append('pinataMetadata', JSON.stringify(metadata));

    const options = {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    };

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: options.headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload to IPFS');
    }

    const result = await response.json();

    return {
      ipfsHash: result.IpfsHash,
      size: result.PinSize,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
      timestamp: result.Timestamp,
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get file from IPFS
 * @param {string} ipfsHash - IPFS hash
 * @returns {string} - File URL
 */
export const getIPFSUrl = (ipfsHash) => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};

/**
 * Verify file on IPFS
 * @param {string} ipfsHash - Hash to verify
 * @returns {Promise<Object>} - File metadata
 */
export const verifyIPFSFile = async (ipfsHash) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      // Fallback: Try to fetch the file directly
      const response = await fetch(getIPFSUrl(ipfsHash), { method: 'HEAD' });
      return {
        exists: response.ok,
        url: getIPFSUrl(ipfsHash),
      };
    }

    // Get pin details from Pinata
    const response = await fetch(
      `${PINATA_API_URL}/data/pinList?hashContains=${ipfsHash}`,
      {
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify file');
    }

    const data = await response.json();
    const fileFound = data.rows && data.rows.length > 0;

    return {
      exists: fileFound,
      url: getIPFSUrl(ipfsHash),
      metadata: fileFound ? data.rows[0] : null,
    };
  } catch (error) {
    console.error('Error verifying IPFS file:', error);
    throw error;
  }
};

/**
 * Unpin file from IPFS (remove)
 * @param {string} ipfsHash - Hash to unpin
 * @returns {Promise<void>}
 */
export const unpinFromIPFS = async (ipfsHash) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Pinata credentials not configured');
    }

    const response = await fetch(`${PINATA_API_URL}/pinning/unpin/${ipfsHash}`, {
      method: 'DELETE',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unpin file');
    }

    return true;
  } catch (error) {
    console.error('Error unpinning from IPFS:', error);
    throw error;
  }
};

/**
 * Calculate SHA256 hash of file
 * @param {File} file - File to hash
 * @returns {Promise<string>} - Hex hash
 */
export const hashFile = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error hashing file:', error);
    throw error;
  }
};
