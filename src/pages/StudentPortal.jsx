import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getCertificateDetails } from '../Services/solanaBlockchainServices';
import { isValidSolanaAddress } from '../web3/solanaService';
import './StudentPortal.css';

const StudentPortal = () => {
  const { publicKey, connected } = useWallet();
  
  const [mintAddress, setMintAddress] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleViewCertificate = useCallback(async (e) => {
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
    setSuccess(null);
    setCertificate(null);

    try {
      console.log('Fetching certificate details for:', mintAddress);
      const certDetails = await getCertificateDetails(mintAddress);
      setCertificate(certDetails);
      setSuccess('✅ Certificate found!');
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setError(`❌ ${err.message || 'Failed to fetch certificate'}`);
    } finally {
      setLoading(false);
    }
  }, [mintAddress]);

  return (
    <div className="student-portal">
      <div className="student-header">
        <h1>📜 Student Portal</h1>
        <p>View your issued certificates minted on Solana Devnet</p>
      </div>

      <div className="wallet-section">
        <div className="wallet-status">
          {connected && publicKey ? (
            <div className="wallet-connected">
              <span className="wallet-indicator">🟢</span>
              <div>
                <div className="wallet-label">Connected Wallet</div>
                <div className="wallet-address">{publicKey.toBase58().slice(0, 10)}...{publicKey.toBase58().slice(-4)}</div>
              </div>
            </div>
          ) : (
            <div className="wallet-disconnected">
              <span className="wallet-indicator">🔴</span>
              <span>Wallet not connected</span>
            </div>
          )}
        </div>
        <WalletMultiButton className="wallet-button" />
      </div>

      <form onSubmit={handleViewCertificate} className="search-form">
        <div className="form-group">
          <label htmlFor="mintAddressInput">Certificate Mint Address</label>
          <input
            id="mintAddressInput"
            type="text"
            value={mintAddress}
            onChange={(e) => setMintAddress(e.target.value)}
            placeholder="Enter the mint address of your certificate NFT..."
            disabled={loading}
          />
          <p className="form-hint">Enter the Solana mint address of your certificate NFT</p>
        </div>

        <button
          type="submit"
          disabled={loading || !mintAddress.trim()}
          className={`btn-view ${loading ? 'loading' : ''}`}
        >
          {loading ? '⏳ Loading...' : '📖 View Certificate'}
        </button>
      </form>

      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="message success-message">
          {success}
        </div>
      )}

      {certificate && (
        <div className="certificate-card">
          <div className="cert-header">
            <h2>🎓 Certificate Details</h2>
            <span className="cert-status">On-Chain NFT</span>
          </div>

          {certificate.metadata && (
            <>
              {certificate.metadata.name && (
                <div className="cert-detail">
                  <div className="label">Certificate Name</div>
                  <div className="value">{certificate.metadata.name}</div>
                </div>
              )}

              {certificate.metadata.description && (
                <div className="cert-detail">
                  <div className="label">Description</div>
                  <div className="value">{certificate.metadata.description}</div>
                </div>
              )}

              {certificate.metadata.attributes && (
                <div className="attributes-section">
                  <h3>Certificate Attributes</h3>
                  <div className="attributes-grid">
                    {certificate.metadata.attributes.map((attr, idx) => (
                      <div key={idx} className="attribute-item">
                        <div className="attr-label">{attr.trait_type}</div>
                        <div className="attr-value">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {certificate.metadata.image && (
                <div className="certificate-image-section">
                  <h3>Certificate Image</h3>
                  <img
                    src={certificate.metadata.image}
                    alt="Certificate"
                    className="certificate-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </>
          )}

          <div className="blockchain-info">
            <h3>Blockchain Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <div className="label">Mint Address</div>
                <code className="value">{mintAddress.slice(0, 15)}...{mintAddress.slice(-4)}</code>
              </div>

              {certificate.metadataAddress && (
                <div className="info-item">
                  <div className="label">Metadata Address</div>
                  <code className="value">{certificate.metadataAddress.slice(0, 15)}...{certificate.metadataAddress.slice(-4)}</code>
                </div>
              )}
            </div>

            <div className="explorer-links">
              <a
                href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                className="btn-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                📊 View on Solana Explorer
              </a>
              <a
                href={`https://explorer.solana.com/token/${mintAddress}?cluster=devnet`}
                className="btn-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                🪙 View Token Details
              </a>
            </div>
          </div>

          {certificate.metadata?.external_url && (
            <div className="action-buttons">
              <a
                href={certificate.metadata.external_url}
                className="btn-action"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 Certificate Link
              </a>
            </div>
          )}
        </div>
      )}

      <div className="info-section">
        <h3>About Your Certificate</h3>
        <ul>
          <li>🪙 Your certificate is minted as a unique NFT on Solana</li>
          <li>💼 The NFT contains your certificate metadata and student information</li>
          <li>🔐 You can prove ownership by controlling the wallet that received the NFT</li>
          <li>⛓️ All certificate data is stored permanently on the Solana blockchain</li>
          <li>📊 View all transactions on Solana Explorer for full transparency</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentPortal;
