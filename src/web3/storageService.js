/**
 * Storage Service - Metadata Management
 * ======================================
 * Handles uploading certificate metadata and files
 * For demo: uses simple JSON storage (stub for Arweave/IPFS)
 * Can be extended to use actual decentralized storage
 */

/**
 * Generate SHA-256 hash from file in browser
 * @param {File} file - File to hash
 * @returns {Promise<string>} - Hex string of SHA-256 hash
 */
export const hashFile = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Error hashing file:', error);
    throw error;
  }
};

/**
 * Create certificate metadata JSON
 * @param {Object} params - Metadata parameters
 * @returns {Object} - Metadata JSON object
 */
export const createMetadataJSON = (params) => {
  const {
    certificateId,
    studentName,
    degreeTitle,
    universityName,
    issueDate,
    certificateHash,
    certificateFileUrl,
    studentPhotoUrl,
  } = params;

  return {
    name: `Certificate - ${studentName}`,
    symbol: 'CERT',
    description: `Academic Certificate for ${studentName} - ${degreeTitle} from ${universityName}`,
    image: studentPhotoUrl || 'https://example.com/default-cert-image.png',
    external_url: `https://credence.example.com/verify/${certificateId}`,
    attributes: [
      {
        trait_type: 'Certificate ID',
        value: certificateId,
      },
      {
        trait_type: 'Student Name',
        value: studentName,
      },
      {
        trait_type: 'Degree Title',
        value: degreeTitle,
      },
      {
        trait_type: 'University',
        value: universityName,
      },
      {
        trait_type: 'Issue Date',
        value: issueDate,
      },
      {
        trait_type: 'Certificate Hash',
        value: certificateHash,
      },
    ],
    properties: {
      files: [
        {
          uri: certificateFileUrl || 'https://example.com/certificate.pdf',
          type: 'application/pdf',
          cdn: true,
        },
      ],
      category: 'image',
      creators: [
        {
          address: universityName,
          share: 100,
        },
      ],
    },
    collection: {
      name: `${universityName} Certificates`,
      family: 'certificate',
    },
  };
};

/**
 * Upload metadata JSON (stub implementation)
 * In production, upload to Arweave, Bundlr, or traditional CDN
 * @param {Object} metadata - Metadata JSON object
 * @returns {Promise<string>} - URL to metadata JSON
 */
export const uploadMetadataJSON = async (metadata) => {
  try {
    console.log('Uploading metadata...', metadata);

    // STUB IMPLEMENTATION: Store in localStorage for demo
    // In production, use Arweave, Bundlr, or S3
    const metadataId = `metadata-${Date.now()}`;
    const metadataUrl = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    
    // Store in localStorage as backup
    localStorage.setItem(metadataId, JSON.stringify(metadata));

    console.log('Metadata stored with ID:', metadataId);
    
    // Return data URL (works for testing)
    return metadataUrl;

    // PRODUCTION EXAMPLE - Arweave:
    // const data = JSON.stringify(metadata);
    // const response = await fetch('https://arweave.net/tx', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: data,
    // });
    // const { success, id } = await response.json();
    // return `https://arweave.net/${id}`;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw error;
  }
};

/**
 * Upload certificate file (stub implementation)
 * For demo, creates a data URL; in production use IPFS/Arweave
 * @param {File} file - Certificate file to upload
 * @returns {Promise<string>} - URL to uploaded file
 */
export const uploadCertificateFile = async (file) => {
  try {
    console.log('Uploading certificate file...');

    // STUB: Create data URL for small files (works for demo)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        console.log('File converted to data URL');
        resolve(dataUrl);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });

    // PRODUCTION EXAMPLE - IPFS via Pinata:
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    //   method: 'POST',
    //   headers: {
    //     pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
    //     pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
    //   },
    //   body: formData,
    // });
    // const { IpfsHash } = await response.json();
    // return `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
  } catch (error) {
    console.error('Error uploading certificate file:', error);
    throw error;
  }
};

/**
 * Upload student photo
 * @param {File} file - Photo file
 * @returns {Promise<string>} - URL to uploaded photo
 */
export const uploadStudentPhoto = async (file) => {
  try {
    console.log('Uploading student photo...');

    // STUB: Create data URL for small files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error uploading student photo:', error);
    throw error;
  }
};

/**
 * Retrieve metadata from storage
 * @param {string} url - Metadata URL
 * @returns {Promise<Object>} - Metadata object
 */
export const fetchMetadata = async (url) => {
  try {
    // Handle data URLs
    if (url.startsWith('data:')) {
      const base64 = url.split(',')[1];
      const json = atob(base64);
      return JSON.parse(json);
    }

    // Handle regular URLs
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
};

export default {
  hashFile,
  createMetadataJSON,
  uploadMetadataJSON,
  uploadCertificateFile,
  uploadStudentPhoto,
  fetchMetadata,
};
