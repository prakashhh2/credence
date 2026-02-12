import React, { useEffect, useState } from 'react';
import { verifyCertificateOnBlockchain, getCertificateDetails } from '../Services/blockchainServices';
import './VerifyCertificate.css';

const VerifyCertificate = ({ hash: initialHash }) => {
  const hash = initialHash || window.location.hash.split('/')[1] || '';
  const [certificateHash, setCertificateHash] = useState(hash || '');
  const [certificate, setCertificate] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!certificateHash.trim()) {
      setError('Please enter a certificate hash');
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);
    setVerification(null);

    try {
      // Verify certificate exists on blockchain
      const verifyResult = await verifyCertificateOnBlockchain(certificateHash);
      setVerification(verifyResult);

      if (verifyResult.exists) {
        // Get full certificate details
        const certDetails = await getCertificateDetails(certificateHash);
        setCertificate(certDetails);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hash) {
      handleVerify({ preventDefault: () => {} });
    }
  }, [hash]);

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-header">
          <h1>Verify Certificate</h1>
          <p>Check the authenticity of any academic certificate on the blockchain</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="verify-form">
          <div className="form-group">
            <label htmlFor="hashInput">Certificate Hash</label>
            <input
              type="text"
              id="hashInput"
              value={certificateHash}
              onChange={(e) => setCertificateHash(e.target.value)}
              placeholder="Enter certificate hash..."
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-verify"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Certificate'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Verification Result */}
        {verification && (
          <div className={`verification-result ${verification.exists ? 'valid' : 'invalid'}`}>
            <div className="result-status">
              {verification.exists ? (
                <>
                  <span className="status-icon">✓</span>
                  <h2>Certificate Verified</h2>
                  <p>This certificate is authentic and stored on blockchain</p>
                </>
              ) : (
                <>
                  <span className="status-icon invalid">✗</span>
                  <h2>Certificate Not Found</h2>
                  <p>This certificate hash does not exist on blockchain</p>
                </>
              )}
            </div>

            {verification.exists && (
              <div className="verification-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Student Name</label>
                    <p>{verification.studentName || 'N/A'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Degree</label>
                    <p>{verification.degree || 'N/A'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Claimed Status</label>
                    <p>
                      {verification.isClaimed ? (
                        <span className="status-badge claimed">✓ Claimed</span>
                      ) : (
                        <span className="status-badge unclaimed">◯ Unclaimed</span>
                      )}
                    </p>
                  </div>

                  <div className="detail-item">
                    <label>Revoked Status</label>
                    <p>
                      {verification.isRevoked ? (
                        <span className="status-badge revoked">✗ Revoked</span>
                      ) : (
                        <span className="status-badge active">✓ Active</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Certificate Details */}
        {certificate && (
          <div className="certificate-details">
            <h2>Certificate Details</h2>

            <div className="details-section">
              <div className="section-column">
                <div className="detail-box">
                  <h3>Student Information</h3>
                  <div className="detail-row">
                    <span className="label">Name:</span>
                    <span className="value">{certificate.studentName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Degree:</span>
                    <span className="value">{certificate.degree}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Issue Date:</span>
                    <span className="value">{certificate.issueDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">University:</span>
                    <span className="value">{certificate.universityName}</span>
                  </div>
                </div>

                <div className="detail-box">
                  <h3>Blockchain Information</h3>
                  <div className="detail-row">
                    <span className="label">Certificate Hash:</span>
                    <code className="hash">{certificate.certificateHash}</code>
                  </div>
                  <div className="detail-row">
                    <span className="label">IPFS Hash:</span>
                    <code className="hash">{certificate.ipfsHash}</code>
                  </div>
                  <div className="detail-row">
                    <span className="label">Issued By:</span>
                    <code className="hash">{certificate.issuedBy}</code>
                  </div>
                  {certificate.claimedBy && (
                    <div className="detail-row">
                      <span className="label">Claimed By:</span>
                      <code className="hash">{certificate.claimedBy}</code>
                    </div>
                  )}
                </div>
              </div>

              <div className="section-column">
                <div className="detail-box">
                  <h3>Dates</h3>
                  <div className="detail-row">
                    <span className="label">Issued At:</span>
                    <span className="value">{certificate.issuedAt?.toLocaleString()}</span>
                  </div>
                  {certificate.claimedAt && (
                    <div className="detail-row">
                      <span className="label">Claimed At:</span>
                      <span className="value">{certificate.claimedAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="detail-box">
                  <h3>Document</h3>
                  {certificate.ipfsUrl && (
                    <a 
                      href={certificate.ipfsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-view-document"
                    >
                      📄 View Certificate File
                    </a>
                  )}
                  {certificate.metadataURI && (
                    <p className="metadata-uri">{certificate.metadataURI}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="info-section">
          <h3>How Verification Works</h3>
          <ul>
            <li>🔐 Every certificate has a unique SHA-256 hash</li>
            <li>⛓️ The hash is stored permanently on blockchain</li>
            <li>📁 The actual certificate file is stored on IPFS</li>
            <li>✓ Verification checks both blockchain and IPFS</li>
            <li>🔍 Anyone can verify without login or registration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
