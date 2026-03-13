import React, { useCallback, useState } from 'react';
import './Certificate.css';

/**
 * Certificate Component
 * ─────────────────────────────────────────────────────────────
 * Displays a blockchain-verified certificate with all details,
 * QR code, hash, and email sharing functionality.
 * 
 * Props:
 *   - cert: Certificate object with all student & degree info
 *   - onEmailClick: Handler for email sharing
 *   - onIPFSDownload: Handler for IPFS file download
 */
export default function Certificate({ cert, onEmailClick, onIPFSDownload }) {
  const [copied, setCopied] = useState(false);

  const copyHash = useCallback(() => {
    if (!cert?.hash) return;
    navigator.clipboard.writeText(cert.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cert]);

  const downloadQR = useCallback(() => {
    if (!cert?.qrCode) return;
    const a = document.createElement('a');
    a.href = cert.qrCode;
    a.download = `credence-qr-${cert.hash.slice(0, 12)}.png`;
    a.click();
  }, [cert]);

  if (!cert) return null;

  return (
    <div className="cert-container">
      {/* Success Banner */}
      <div className="cert-banner">
        <span className="cert-check-icon">✅</span>
        <div className="cert-banner-text">
          <h2>Certificate Issued ✓</h2>
          <p>Recorded on Solana Devnet via Anchor · Transaction confirmed</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="cert-grid">
        {/* Left: Certificate Details */}
        <div className="cert-details-section">
          <h3 className="cert-section-title">Certificate Information</h3>

          <div className="cert-info-list">
            {[
              { label: 'Student Name', value: cert.studentName },
              { label: 'Student Email', value: cert.studentEmail },
              { label: 'Student ID', value: cert.studentId },
              { label: 'Date of Birth', value: cert.dateOfBirth },
              { label: 'University', value: cert.universityName },
              { label: 'Degree', value: cert.degreeTitle },
              { label: 'Degree Level', value: cert.degreeLevel },
              { label: 'Field of Study', value: cert.fieldOfStudy },
              { label: 'Department', value: cert.department },
              { label: 'Enrollment Date', value: cert.enrollmentDate },
              { label: 'Graduation Date', value: cert.graduationDate },
              { label: 'Issue Date', value: cert.issueDate },
              { label: 'GPA', value: cert.gpa || '—' },
              { label: 'Honors', value: cert.honors || '—' },
              { label: 'Certificate #', value: cert.certificateNumber },
              { label: 'Issued At', value: new Date(cert.issuedAt).toLocaleString() },
              cert.blockchainStatus && { label: 'Blockchain Status', value: cert.blockchainStatus },
              cert.certificatePda && { label: 'Certificate PDA', value: cert.certificatePda.slice(0, 20) + '…' },
            ].filter(Boolean).map(({ label, value }) => (
              <div className="cert-info-row" key={label}>
                <span className="cert-info-label">{label}</span>
                <span className="cert-info-value">{value}</span>
              </div>
            ))}

            {/* IPFS CID (if available) */}
            {cert.certificateDocCid && (
              <div className="cert-info-row">
                <span className="cert-info-label">IPFS CID</span>
                <span className="cert-info-value mono">{cert.certificateDocCid}</span>
              </div>
            )}

            {/* Certificate Hash */}
            <div className="cert-info-row hash-row">
              <span className="cert-info-label">Certificate Hash</span>
              <div className="cert-hash-container">
                <span className="cert-hash-text">{cert.hash}</span>
                <button className="cert-copy-btn" onClick={copyHash} title="Copy hash to clipboard">
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
            </div>

            {/* Tx Signature */}
            <div className="cert-info-row">
              <span className="cert-info-label">Tx Signature</span>
              <span className="cert-info-value mono">{cert.txSignature}</span>
            </div>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="cert-qr-section">
          <h3 className="cert-section-title">QR Code</h3>
          <div className="cert-qr-wrapper">
            <img src={cert.qrCode} alt="Certificate QR Code" className="cert-qr-image" />
          </div>
          <p className="cert-qr-caption">Scan to verify this certificate</p>
          <button className="cert-download-qr-btn" onClick={downloadQR}>
            ⬇ Download QR
          </button>
        </div>
      </div>

      {/* Email Section */}
      <div className="cert-email-section">
        <h3 className="cert-section-title">📧 Send to Student</h3>
        <p className="cert-email-description">
          Click the button below to open your email client with a pre-composed message for{' '}
          <strong>{cert.studentEmail}</strong>.
        </p>
        <button className="cert-email-btn" onClick={onEmailClick}>
          ✉ Send Certificate Email
        </button>
      </div>

      {/* IPFS Download Section (if callback provided) */}
      {onIPFSDownload && cert.certificateDocCid && (
        <div className="cert-ipfs-section">
          <h3 className="cert-section-title">📥 Download Certificate File</h3>
          <p className="cert-ipfs-description">
            Download the original certificate file from IPFS storage.
          </p>
          <button className="cert-ipfs-download-btn" onClick={onIPFSDownload}>
            📄 Download from IPFS
          </button>
        </div>
      )}
    </div>
  );
}
