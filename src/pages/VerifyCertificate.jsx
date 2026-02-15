import React, { useEffect, useState } from 'react';
import { verifyCertificateOnSolana, getCertificateDetails } from '../Services/solanaBlockchainServices';
import { isValidSolanaAddress } from '../web3/solanaService';
import './VerifyCertificate.css';

const VerifyCertificate = ({ mint: initialMint }) => {
  // Get mint address from URL query parameter or prop
  const urlParams = new URLSearchParams(window.location.search);
  const queryMint = urlParams.get('mint');
  const initialAddress = initialMint || queryMint || '';

  const [mintAddress, setMintAddress] = useState(initialAddress);
  const [verification, setVerification] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    e?.preventDefault?.();

    if (!mintAddress.trim()) {
      setError('❌ Please enter a mint address');
      return;
    }

    if (!isValidSolanaAddress(mintAddress)) {
      setError('❌ Invalid Solana mint address');
      return;
    }

    setLoading(true);
    setError(null);
    setVerification(null);
    setCertificate(null);

    try {
      // Verify certificate on Solana
      const verifyResult = await verifyCertificateOnSolana(mintAddress);
      setVerification(verifyResult);

      if (verifyResult.verified) {
        // Get full certificate details
        try {
          const certDetails = await getCertificateDetails(mintAddress);
          setCertificate(certDetails);
        } catch (err) {
          console.warn('Could not fetch full certificate details:', err);
        }
      }
    } catch (err) {
      setError(`❌ ${err.message || 'Failed to verify certificate'}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify if mint address provided
  useEffect(() => {
    if (initialAddress && isValidSolanaAddress(initialAddress)) {
      handleVerify();
    }
  }, []);

  return (
    <div className="verify-page">
      <div className="verify-container">
        <div className="verify-header">
          <h1>🔐 Verify Certificate</h1>
          <p>Check the authenticity of any academic certificate minted on Solana Devnet</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleVerify} className="verify-form">
          <div className="form-group">
            <label htmlFor="mintInput">NFT Mint Address</label>
            <input
              type="text"
              id="mintInput"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="Enter mint address (e.g., 6XxjjxJ...)"
              disabled={loading}
            />
            <p className="form-hint">Enter the Solana mint address of the certificate NFT</p>
          </div>

          <button
            type="submit"
            className="btn-verify"
            disabled={loading || !mintAddress.trim()}
          >
            {loading ? '⏳ Verifying...' : '🔍 Verify Certificate'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Verification Result */}
        {verification && (
          <div className={`verification-result ${verification.verified ? 'valid' : 'invalid'}`}>
            <div className="result-status">
              {verification.verified ? (
                <>
                  <span className="status-icon">✓</span>
                  <h2>Certificate Verified</h2>
                  <p>This certificate is authentic and minted on Solana Devnet</p>
                </>
              ) : (
                <>
                  <span className="status-icon invalid">✗</span>
                  <h2>Certificate Not Found</h2>
                  <p>This mint address does not exist on the blockchain</p>
                </>
              )}
            </div>

            {verification.verified && (
              <div className="verification-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Verification Status</label>
                    <p>
                      <span className="status-badge verified">✓ On-Chain</span>
                    </p>
                  </div>

                  <div className="detail-item">
                    <label>Verified At</label>
                    <p>{new Date(verification.verifiedAt).toLocaleString()}</p>
                  </div>

                  <div className="detail-item">
                    <label>Mint Address</label>
                    <code className="address">{mintAddress.slice(0, 15)}...{mintAddress.slice(-4)}</code>
                  </div>
                </div>

                <div className="explorer-links">
                  <a
                    href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                    className="btn-explorer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📊 View on Solana Explorer
                  </a>
                  <a
                    href={`https://explorer.solana.com/token/${mintAddress}?cluster=devnet`}
                    className="btn-explorer"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🪙 View Token Details
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Metadata */}
        {certificate && (
          <div className="certificate-details">
            <h2>Certificate Information</h2>

            <div className="details-section">
              {certificate.metadata && (
                <>
                  <div className="detail-box">
                    <h3>Certificate Attributes</h3>
                    <div className="attributes-list">
                      {certificate.metadata.attributes?.map((attr, idx) => (
                        <div key={idx} className="attribute-item">
                          <span className="attr-label">{attr.trait_type}:</span>
                          <span className="attr-value">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {certificate.metadata.description && (
                    <div className="detail-box">
                      <h3>Description</h3>
                      <p>{certificate.metadata.description}</p>
                    </div>
                  )}

                  {certificate.metadata.image && (
                    <div className="detail-box">
                      <h3>Certificate Image</h3>
                      <img
                        src={certificate.metadata.image}
                        alt="Certificate"
                        className="cert-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="detail-box">
                <h3>On-Chain Metadata</h3>
                <div className="detail-row">
                  <span className="label">Mint Address:</span>
                  <code className="hash">{mintAddress}</code>
                </div>
                <div className="detail-row">
                  <span className="label">Metadata Address:</span>
                  <code className="hash">{certificate?.metadataAddress || 'N/A'}</code>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className="status-badge">On-Chain</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="info-section">
          <h3>How Solana Certificate Verification Works</h3>
          <ul>
            <li>🪙 Each certificate is minted as a unique NFT on Solana</li>
            <li>⛓️ The NFT metadata is stored permanently on-chain</li>
            <li>🔐 Certificate hash ensures document integrity</li>
            <li>🌐 Metadata includes student info, issuer, and issue date</li>
            <li>✓ Anyone can verify on public Solana Devnet</li>
            <li>📊 Full transaction history available on Solana Explorer</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
