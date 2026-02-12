import React from 'react';
import { useCertificateSession } from '../../hooks/useCertificateSession';
import './CertificateProof.css';

const CertificateProof = () => {
  const { certificateData } = useCertificateSession();

  if (!certificateData || !certificateData.blockchainHash) {
    return (
      <div className="certificate-proof empty">
        <p>No certificate uploaded yet.</p>
      </div>
    );
  }

  const handleDownloadProof = () => {
    const proofData = {
      studentName: certificateData.studentName,
      degree: certificateData.degree,
      issueDate: certificateData.issueDate,
      blockchainHash: certificateData.blockchainHash,
      uploadedAt: certificateData.uploadedAt,
    };

    const dataStr = JSON.stringify(proofData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-proof-${certificateData.blockchainHash.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificateData.blockchainHash);
    alert('Hash copied to clipboard!');
  };

  return (
    <div className="certificate-proof">
      <div className="proof-header">
        <h2>Certificate Proof</h2>
        <span className="success-badge">✓ Uploaded</span>
      </div>

      <div className="proof-content">
        <div className="proof-section">
          <h3>Student Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <p>{certificateData.studentName}</p>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <p>{certificateData.studentEmail || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Degree:</label>
              <p>{certificateData.degree}</p>
            </div>
            <div className="info-item">
              <label>Issue Date:</label>
              <p>{new Date(certificateData.issueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="proof-section">
          <h3>Blockchain Proof</h3>
          <div className="hash-container">
            <label>Certificate Hash:</label>
            <div className="hash-box">
              <code>{certificateData.blockchainHash}</code>
              <button 
                className="btn-copy"
                onClick={handleCopyHash}
                title="Copy hash"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {certificateData.qrCode && (
          <div className="proof-section">
            <h3>QR Code</h3>
            <div className="qr-container">
              <img 
                src={certificateData.qrCode} 
                alt="Certificate QR Code"
                className="qr-code"
              />
              <p className="qr-hint">
                Students can scan this QR code to verify the certificate
              </p>
            </div>
          </div>
        )}

        <div className="proof-section">
          <h3>Upload Details</h3>
          <div className="info-item">
            <label>Uploaded At:</label>
            <p>
              {certificateData.uploadedAt 
                ? new Date(certificateData.uploadedAt).toLocaleString()
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="proof-actions">
        <button 
          className="btn-download"
          onClick={handleDownloadProof}
        >
          📥 Download Proof
        </button>
        <button 
          className="btn-share"
          onClick={() => {
            const shareText = `Certificate verified on blockchain!\nHash: ${certificateData.blockchainHash}\nStudent: ${certificateData.studentName}`;
            navigator.share?.({
              title: 'Certificate Proof',
              text: shareText,
            });
          }}
        >
          🔗 Share Proof
        </button>
      </div>
    </div>
  );
};

export default CertificateProof;
