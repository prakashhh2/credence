import React, { useState, useCallback, useEffect } from 'react';
import './VerifyCertificate.css';

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

function getCertificate(hash) {
  if (!hash) return null;
  const certs = JSON.parse(localStorage.getItem('credence_certs') || '{}');
  return certs[hash.trim()] || null;
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */

const VerifyCertificate = ({ hash: propHash }) => {
  const [hashInput, setHashInput]     = useState(propHash || '');
  const [certificate, setCertificate] = useState(null);
  const [status, setStatus]           = useState('idle'); // idle | verified | invalid
  const [error, setError]             = useState('');

  /* Auto-verify if hash comes via URL */
  useEffect(() => {
    if (propHash) {
      verifyHash(propHash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propHash]);

  const verifyHash = useCallback((hash) => {
    const trimmed = (hash || '').trim();
    if (!trimmed) {
      setError('Please enter a certificate hash.');
      setStatus('idle');
      setCertificate(null);
      return;
    }

    setError('');
    const cert = getCertificate(trimmed);

    if (cert) {
      setCertificate(cert);
      setStatus('verified');
    } else {
      setCertificate(null);
      setStatus('invalid');
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e?.preventDefault();
    verifyHash(hashInput);
  }, [hashInput, verifyHash]);

  /* ─────────────────────────────────────────────────────────
     Render
     ───────────────────────────────────────────────────────── */
  return (
    <div className="vp-page">

      {/* Header */}
      <div className="vp-header">
        <div className="vp-header-inner">
          <div className="vp-header-icon">🔍</div>
          <div>
            <h1>Verify Certificate</h1>
            <p>Instantly verify the authenticity of any academic credential</p>
          </div>
        </div>
      </div>

      <div className="vp-content">

        {/* Search Card */}
        <div className="vp-card search-card">
          <h2 className="vp-card-title">
            <span className="vp-section-accent" />
            Enter Certificate Hash
          </h2>
          <p className="vp-card-desc">
            Paste the SHA-256 certificate hash to verify its authenticity on the
            Solana Devnet blockchain. No login required.
          </p>

          <form onSubmit={handleSubmit} className="vp-form">
            <div className="vp-input-row">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter certificate hash (SHA-256)…"
                className="vp-hash-input"
                autoComplete="off"
                spellCheck="false"
              />
              <button type="submit" className="btn-verify">
                ✓ Verify
              </button>
            </div>
          </form>

          {error && <div className="vp-error">{error}</div>}
        </div>

        {/* Result — Verified */}
        {status === 'verified' && certificate && (
          <div className="vp-card result-card-verified">
            <div className="vp-result-banner verified-banner">
              <div className="result-status-icon">✅</div>
              <div>
                <h2>Certificate is Valid</h2>
                <p>This certificate is authentic and recorded on Solana Devnet</p>
              </div>
              <div className="vp-blockchain-badge">
                ⛓ Solana Devnet
              </div>
            </div>

            <div className="vp-cert-grid">
              {[
                ['Student Name',    certificate.studentName],
                ['University',      certificate.universityName],
                ['Degree',          certificate.degreeTitle],
                ['Field of Study',  certificate.fieldOfStudy],
                ['Issue Date',      certificate.issueDate],
                ['Issued At',       new Date(certificate.issuedAt).toLocaleString()],
                ['Issuer Wallet',   certificate.issuerWallet],
                ['Blockchain',      'Solana Devnet'],
              ].map(([label, value]) => (
                <div className="vp-cert-row" key={label}>
                  <span className="vp-cert-label">{label}</span>
                  <span className="vp-cert-value">{value}</span>
                </div>
              ))}
            </div>

            {/* Hash */}
            <div className="vp-hash-section">
              <div className="vp-hash-label">Certificate Hash (SHA-256)</div>
              <div className="vp-hash-value">{certificate.hash}</div>
            </div>

            {/* QR */}
            {certificate.qrCode && (
              <div className="vp-qr-section">
                <div className="vp-qr-frame">
                  <img src={certificate.qrCode} alt="Certificate QR Code" />
                </div>
                <p className="vp-qr-caption">QR Code — scan to re-verify</p>
              </div>
            )}
          </div>
        )}

        {/* Result — Invalid */}
        {status === 'invalid' && (
          <div className="vp-card result-card-invalid">
            <div className="vp-result-banner invalid-banner">
              <div className="result-status-icon">❌</div>
              <div>
                <h2>Certificate Not Found</h2>
                <p>No matching certificate was found for this hash.</p>
              </div>
            </div>
            <ul className="vp-invalid-hints">
              <li>Check that you copied the full hash without extra spaces.</li>
              <li>The certificate may not have been issued through this platform.</li>
              <li>Contact the issuing university to confirm the hash.</li>
            </ul>
          </div>
        )}

        {/* How it works — idle state */}
        {status === 'idle' && (
          <div className="vp-how-grid">
            {[
              { step: '1', title: 'Obtain the Hash',  desc: 'Get the SHA-256 certificate hash from your university or from the student.' },
              { step: '2', title: 'Enter & Verify',   desc: 'Paste the hash above and click "Verify" for an instant authenticity check.' },
              { step: '3', title: 'View Results',     desc: 'See full certificate details, blockchain record, and the unique QR code.' },
            ].map((item) => (
              <div className="vp-how-card" key={item.step}>
                <div className="vp-step-circle">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyCertificate;
