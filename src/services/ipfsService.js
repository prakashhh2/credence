/**
 * Pinata IPFS Service
 * ─────────────────────────────────────────────────────────────
 * Handles file uploads to IPFS via Pinata service.
 * Uses environment variables for secure credential storage.
 */

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - File object to upload
 * @param {string} filename - Optional custom filename
 * @returns {Promise<string>} - IPFS CID
 */
export async function uploadToPinata(file, filename) {
  try {
    if (!file) throw new Error('No file provided');

    const apiKey = process.env.REACT_APP_PINATA_API_KEY;
    const apiSecret = process.env.REACT_APP_PINATA_API_SECRET;

    console.log('📤 Pinata Upload Started');
    console.log('API Key configured:', !!apiKey);
    console.log('API Secret configured:', !!apiSecret);

    if (!apiKey || !apiSecret) {
      throw new Error(
        'Pinata credentials not found. Please set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_API_SECRET in .env.local file'
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata
    const metadata = {
      name: filename || file.name,
      keyvalues: {
        uploadedBy: 'credence',
        timestamp: new Date().toISOString(),
      },
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    // Set pinning options
    const options = {
      cidVersion: 0,
    };
    formData.append('pinataOptions', JSON.stringify(options));

    console.log('📡 Sending to Pinata API...');
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': apiSecret,
      },
      body: formData,
    });

    console.log('✅ Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Pinata API error:', errorData);
      throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Upload successful! CID:', data.IpfsHash);
    return data.IpfsHash; // Returns the CID
  } catch (err) {
    console.error('❌ IPFS upload error:', err.message);
    throw err;
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - Content ID
 * @returns {string} - Full IPFS gateway URL
 */
export function getIPFSUrl(cid) {
  const gateway = process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
  return `${gateway}/${cid}`;
}

/**
 * Download file from IPFS
 * @param {string} cid - Content ID
 * @param {string} filename - Desired filename for download
 */
export function downloadFromIPFS(cid, filename = 'file') {
  try {
    const url = getIPFSUrl(cid);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('IPFS download error:', err);
    throw err;
  }
}
