import React, { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { issueCertificateOnSolana } from '../Services/solanaBlockchainServices';
import './AdminPortal.css';

export default function AdminPortal() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [studentName, setStudentName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [certificateFile, setCertificateFile] = useState(null);
  const [studentPhotoFile, setStudentPhotoFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCertificateFile = useCallback((e) => {
    setCertificateFile(e.target.files?.[0] || null);
  }, []);

  const handlePhotoFile = useCallback((e) => {
    setStudentPhotoFile(e.target.files?.[0] || null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!publicKey) {
      setStatus('❌ Please connect your wallet first');
      return;
    }

    if (!studentName.trim()) {
      setStatus('❌ Please enter student name');
      return;
    }

    if (!universityName.trim()) {
      setStatus('❌ Please enter university name');
      return;
    }

    if (!degreeTitle.trim()) {
      setStatus('❌ Please enter degree title');
      return;
    }

    if (!certificateFile) {
      setStatus('❌ Please select a certificate file');
      return;
    }

    setLoading(true);
    setStatus('Processing...');
    setResult(null);

    try {
      // Generate unique certificate ID
      const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      setStatus('📄 Issuing certificate on Solana Devnet...');

      // Create wallet adapter object for the service
      const walletAdapter = {
        publicKey,
        signTransaction,
      };

      // Issue certificate
      const issueResult = await issueCertificateOnSolana({
        wallet: walletAdapter,
        certificateId,
        studentName,
        degreeTitle,
        universityName,
        issueDate,
        certificateFile,
        studentPhotoFile,
      });

      setStatus('✅ Certificate issued successfully!');
      setResult({
        mintAddress: issueResult.mintAddress,
        txSignature: issueResult.txSignature,
        certificateHash: issueResult.certificateHash,
        qrCode: issueResult.qrCode,
        certificateId,
      });

      // Reset form
      setStudentName('');
      setUniversityName('');
      setDegreeTitle('');
      setIssueDate(new Date().toISOString().split('T')[0]);
      setCertificateFile(null);
      setStudentPhotoFile(null);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-portal">
      <div className="admin-header">
        <h1>🎓 University Portal — Issue Certificate</h1>
        <p>Mint digital certificates as NFTs on Solana Devnet</p>
      </div>

      <div className="wallet-section">
        <div className="wallet-status">
          {publicKey ? (
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

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-section">
          <h2>Certificate Details</h2>

          <div className="form-group">
            <label htmlFor="studentName">Student Name *</label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="universityName">University Name *</label>
            <input
              id="universityName"
              type="text"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="Stanford University"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="degreeTitle">Degree/Certification Title *</label>
            <input
              id="degreeTitle"
              type="text"
              value={degreeTitle}
              onChange={(e) => setDegreeTitle(e.target.value)}
              placeholder="Bachelor of Science in Computer Science"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="issueDate">Issue Date *</label>
            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Files</h2>

          <div className="form-group">
            <label htmlFor="certificateFile">Certificate File (PDF/Image) *</label>
            <input
              id="certificateFile"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif"
              onChange={handleCertificateFile}
              disabled={loading}
              required
            />
            {certificateFile && <p className="file-info">📄 {certificateFile.name} ({(certificateFile.size / 1024).toFixed(2)} KB)</p>}
          </div>

          <div className="form-group">
            <label htmlFor="studentPhotoFile">Student Photo (Optional)</label>
            <input
              id="studentPhotoFile"
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              onChange={handlePhotoFile}
              disabled={loading}
            />
            {studentPhotoFile && <p className="file-info">📷 {studentPhotoFile.name} ({(studentPhotoFile.size / 1024).toFixed(2)} KB)</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !publicKey}
          className={`btn-submit ${loading ? 'loading' : ''}`}
        >
          {loading ? '⏳ Processing...' : '🚀 Mint Certificate NFT'}
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.startsWith('✅') ? 'success' : status.startsWith('❌') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {result && (
        <div className="result-card">
          <h2>✅ Certificate Issued Successfully!</h2>

          <div className="result-detail">
            <div className="label">Certificate ID:</div>
            <div className="value">{result.certificateId}</div>
          </div>

          <div className="result-detail">
            <div className="label">Mint Address:</div>
            <div className="value copy-able" title={result.mintAddress}>
              {result.mintAddress}
              <button
                type="button"
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(result.mintAddress)}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>

          <div className="result-detail">
            <div className="label">Transaction Signature:</div>
            <div className="value copy-able" title={result.txSignature}>
              {result.txSignature.slice(0, 20)}...
              <button
                type="button"
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(result.txSignature)}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>

          <div className="result-detail">
            <div className="label">Certificate Hash (SHA-256):</div>
            <div className="value copy-able" title={result.certificateHash}>
              {result.certificateHash.slice(0, 20)}...
              <button
                type="button"
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(result.certificateHash)}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>

          <div className="result-qr">
            <h3>Verification QR Code</h3>
            <img src={result.qrCode} alt="Certificate verification QR code" />
            <p className="qr-hint">Share this QR with the certificate holder for easy verification</p>
          </div>

          <div className="result-links">
            <a
              href={`/#verify?mint=${result.mintAddress}&sig=${result.txSignature}`}
              className="btn-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              🔍 View Certificate
            </a>
            <a
              href={`https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`}
              className="btn-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              📊 View on Solana Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
