import React, { useCallback, useState } from 'react';
import './Certificate.css';


export default function Certificate({ cert, onIPFSDownload, onEmailClick }) {
  const [copied, setCopied] = useState(false);

  const copyHash = useCallback(() => {
    if (!cert?.hash) return;
    navigator.clipboard.writeText(cert.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cert]);

  if (!cert) return null;

  return (
    <div className="cert-container">
      {/* Success Banner */}
      <div className="cert-banner">
        <span className="cert-check-icon"></span>
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
              { label: 'Enrollment Date', value: cert.enrollmentDate },
              { label: 'Graduation Date', value: cert.graduationDate },
              { label: 'Passout Year', value: cert.passoutYear },
              { label: 'Issue Date', value: cert.issueDate },
              { label: 'GPA', value: cert.gpa || '—' },
              { label: 'Honors', value: cert.honors || '—' },
              { label: 'Certificate #', value: cert.certificateNumber },
              { label: 'Issued At', value: new Date(cert.issuedAt).toLocaleString() },
              cert.blockchainStatus && { label: 'Blockchain Status', value: cert.blockchainStatus },
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="cert-info-value mono">{cert.certificateDocCid}</span>
                  {onIPFSDownload && (
                    <button className="cert-copy-btn" onClick={onIPFSDownload} title="Download certificate file from IPFS">
                      ⬇ Download File
                    </button>
                  )}
                </div>
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
              <span className="cert-info-value mono">
                {cert.txSignature && cert.txSignature !== 'On-chain record' ? (
                  <a
                    href={`https://explorer.solana.com/tx/${cert.txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cert.txSignature.slice(0, 20)}… ↗
                  </a>
                ) : cert.txSignature}
              </span>
            </div>

            {/* Certificate PDA — searchable in Solana Explorer */}
            {cert.certificatePda && (
              <div className="cert-info-row">
                <span className="cert-info-label">On-chain Account</span>
                <span className="cert-info-value mono">
                  <a
                    href={`https://explorer.solana.com/address/${cert.certificatePda}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cert.certificatePda.slice(0, 20)}… ↗
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Student */}
      {onEmailClick && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle, #e5e7eb)' }}>
          <button className="cert-copy-btn" onClick={onEmailClick}>
             Send Certificate to Student
          </button>
        </div>
      )}
    </div>
  );
}
