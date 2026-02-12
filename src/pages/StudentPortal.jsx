import React, { useEffect, useState } from 'react';
import { getTransactionsForCertificate } from '../web3/transactionTracker';
import './StudentPortal.css';

const StudentPortal = () => {
  const [studentAddress, setStudentAddress] = useState('');
  const [certificateInput, setCertificateInput] = useState('');
  const [claimedCerts, setClaimedCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const address = localStorage.getItem('walletAddress');
    if (address) {
      setStudentAddress(address);
    }
  }, []);

  // When student connects or on mount, load indexed certificates and filter by claimedBy
  useEffect(() => {
    const loadClaimed = async () => {
      if (!studentAddress) return;
      try {
        setLoading(true);
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4001';
        const res = await fetch(`${backendUrl}/indexed`);
        const data = await res.json();
        const items = data.issued || [];
        const { getCertificateFromChain } = await import('../web3/web3Service');
        const matched = [];
        for (const it of items) {
          try {
            const cert = await getCertificateFromChain(it.certHash);
            if (cert.claimedBy && cert.claimedBy.toLowerCase() === studentAddress.toLowerCase()) {
              matched.push({
                hash: it.certHash,
                claimedAt: cert.claimedAt ? new Date(cert.claimedAt * 1000) : new Date(),
                txHash: it.txHash,
                issuer: cert.issuer,
                ipfs: cert.ipfsHash,
              });
            }
          } catch (err) {
            // ignore individual cert errors
            console.warn('error checking cert', it.certHash, err.message);
          }
        }
        setClaimedCerts(matched);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadClaimed();
  }, [studentAddress]);

  const handleClaimCertificate = async (e) => {
    e.preventDefault();
    
    if (!certificateInput.trim()) {
      setError('Please enter a certificate hash');
      return;
    }

    if (!studentAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Import claimCertificateOnChain from web3Service
      const { claimCertificateOnChain } = await import('../web3/web3Service');
      
      const result = await claimCertificateOnChain(certificateInput);
      
      // Add to claimed certificates
      setClaimedCerts([
        ...claimedCerts,
        {
          hash: certificateInput,
          claimedAt: new Date(),
          transactionHash: result.transactionHash,
        },
      ]);

      setSuccess(`Certificate claimed successfully! Tx: ${result.transactionHash.slice(0, 10)}...`);
      setCertificateInput('');
    } catch (err) {
      setError(err.message || 'Failed to claim certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      const { connectWallet } = await import('../web3/web3Service');
      const { address } = await connectWallet();
      setStudentAddress(address);
      localStorage.setItem('walletAddress', address);
      setSuccess(`Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`);
    } catch (err) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  return (
    <div className="student-portal">
      <div className="portal-container">
        <div className="portal-header">
          <h1>Student Certificate Portal</h1>
          <p>Claim and manage your academic certificates</p>
        </div>

        {/* Wallet Connection */}
        <div className="wallet-section">
          <div className="wallet-info">
            {studentAddress ? (
              <div className="wallet-connected">
                <span className="status-badge">✓ Connected</span>
                <p className="wallet-address">
                  {studentAddress.slice(0, 6)}...{studentAddress.slice(-4)}
                </p>
              </div>
            ) : (
              <p className="wallet-disconnected">Wallet not connected</p>
            )}
          </div>
          {!studentAddress && (
            <button className="btn-connect" onClick={handleConnectWallet}>
              Connect MetaMask
            </button>
          )}
        </div>

        {/* Messages */}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Claim Certificate */}
        <div className="claim-section">
          <h2>Claim Your Certificate</h2>
          <p className="section-hint">
            Enter the certificate hash you received from your university
          </p>

          <form onSubmit={handleClaimCertificate} className="claim-form">
            <div className="form-group">
              <label htmlFor="certHash">Certificate Hash</label>
              <input
                type="text"
                id="certHash"
                value={certificateInput}
                onChange={(e) => setCertificateInput(e.target.value)}
                placeholder="0x... or certificate hash"
                disabled={loading || !studentAddress}
              />
            </div>

            <button 
              type="submit" 
              className="btn-claim"
              disabled={loading || !studentAddress}
            >
              {loading ? 'Claiming...' : 'Claim Certificate'}
            </button>
          </form>
        </div>

        {/* Claimed Certificates */}
        {claimedCerts.length > 0 && (
          <div className="certificates-section">
            <h2>Your Certificates ({claimedCerts.length})</h2>
            <div className="certificates-grid">
              {claimedCerts.map((cert, idx) => (
                <div key={idx} className="certificate-card">
                  <div className="cert-header">
                    <span className="cert-badge">✓ Claimed</span>
                    <span className="cert-date">
                      {cert.claimedAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="cert-content">
                    <p className="cert-hash">
                      <strong>Hash:</strong><br/>
                      <code>{cert.hash.slice(0, 32)}...</code>
                    </p>
                    <p className="cert-tx">
                      <strong>Transaction:</strong><br/>
                      <code>{cert.transactionHash.slice(0, 20)}...</code>
                    </p>
                  </div>

                  <div className="cert-actions">
                    <a 
                      href={`/verify/${cert.hash}`}
                      className="btn-view"
                    >
                      View Details
                    </a>
                    <button 
                      className="btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(cert.hash);
                        alert('Hash copied!');
                      }}
                    >
                      Copy Hash
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="info-box">
          <h3>What is Certificate Claiming?</h3>
          <ul>
            <li>🎓 You receive a certificate hash from your university</li>
            <li>🔐 You claim it with your wallet to prove ownership</li>
            <li>✓ Once claimed, only you can access it</li>
            <li>🌐 Certificate is stored on blockchain forever</li>
            <li>📲 Generate QR code to share with employers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
