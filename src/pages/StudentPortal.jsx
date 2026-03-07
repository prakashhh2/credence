import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import './StudentPortal.css';

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

function getCertificate(hash) {
  if (!hash) return null;
  const certs = JSON.parse(localStorage.getItem('credence_certs') || '{}');
  return certs[hash.trim()] || null;
}

function downloadCertificateHTML(cert) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Certificate — ${cert.studentName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', sans-serif;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .cert {
    background: white;
    border: 3px solid #0b1c3d;
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    padding: 3rem 4rem;
    text-align: center;
    box-shadow: 0 20px 60px rgba(11,28,61,0.15);
    position: relative;
  }
  .cert::before {
    content: '';
    position: absolute;
    inset: 12px;
    border: 1px solid #1e88e5;
    border-radius: 8px;
    pointer-events: none;
  }
  .org { font-size: 0.9rem; letter-spacing: 0.15em; text-transform: uppercase; color: #64748b; margin-bottom: 1.5rem; }
  .title { font-size: 2.5rem; font-weight: 700; color: #0b1c3d; letter-spacing: -0.03em; margin-bottom: 1rem; }
  .subtitle { font-size: 1.05rem; color: #64748b; margin-bottom: 2.5rem; }
  .name { font-size: 2rem; font-weight: 700; color: #1e88e5; margin-bottom: 0.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; display: inline-block; }
  .degree-block { margin: 2rem 0; }
  .degree { font-size: 1.3rem; font-weight: 600; color: #0b1c3d; }
  .field { font-size: 1rem; color: #64748b; margin-top: 0.3rem; }
  .meta { margin-top: 2rem; display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; flex-wrap: wrap; gap: 1rem; }
  .hash-section { margin-top: 2rem; background: #f0f5fb; border-radius: 8px; padding: 1rem; font-family: monospace; font-size: 0.72rem; color: #0b1c3d; word-break: break-all; }
  .hash-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 0.4rem; font-family: sans-serif; }
  .blockchain-badge { display: inline-block; background: linear-gradient(135deg,#9945ff,#14f195); color: white; border-radius: 999px; padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; margin-bottom: 1.5rem; }
  @media print { body { padding: 0; background: white; } .cert { border-radius: 0; box-shadow: none; } }
</style>
</head>
<body>
<div class="cert">
  <div class="blockchain-badge">⛓ Solana Devnet · Verified</div>
  <div class="org">${cert.universityName}</div>
  <div class="title">Certificate of Achievement</div>
  <div class="subtitle">This is to certify that</div>
  <div class="name">${cert.studentName}</div>
  <div class="degree-block">
    <div class="subtitle">has successfully completed the requirements for</div>
    <div class="degree">${cert.degreeTitle}</div>
    <div class="field">${cert.fieldOfStudy}</div>
  </div>
  <div class="meta">
    <span>Issue Date: <strong>${cert.issueDate}</strong></span>
    <span>Issued: <strong>${new Date(cert.issuedAt).toLocaleDateString()}</strong></span>
  </div>
  <div class="hash-section">
    <div class="hash-label">Blockchain Certificate Hash (SHA-256)</div>
    ${cert.hash}
  </div>
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${cert.studentName.replace(/\s+/g, '-')}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */

const StudentPortal = () => {
  const [hashInput, setHashInput]       = useState('');
  const [certificate, setCertificate]   = useState(null);
  const [error, setError]               = useState('');
  const [qrDataUrl, setQrDataUrl]       = useState('');
  const [searched, setSearched]         = useState(false);

  const handleView = useCallback(async (e) => {
    e?.preventDefault();
    const trimmed = hashInput.trim();

    if (!trimmed) {
      setError('Please enter a certificate hash.');
      return;
    }

    setError('');
    setSearched(true);

    const cert = getCertificate(trimmed);

    if (!cert) {
      setCertificate(null);
      setQrDataUrl('');
      setError('No certificate found for this hash. Please check the hash and try again.');
      return;
    }

    setCertificate(cert);

    /* Generate or reuse QR */
    if (cert.qrCode) {
      setQrDataUrl(cert.qrCode);
    } else {
      try {
        const verifyUrl = `${window.location.origin}${window.location.pathname}#verify/${cert.hash}`;
        const qr = await QRCode.toDataURL(verifyUrl, {
          width: 220,
          margin: 2,
          color: { dark: '#0b1c3d', light: '#ffffff' },
        });
        setQrDataUrl(qr);
      } catch (qrErr) {
        console.warn('QR code generation failed:', qrErr);
      }
    }
  }, [hashInput]);

  const handleDownload = useCallback(() => {
    if (!certificate) return;
    downloadCertificateHTML(certificate);
  }, [certificate]);

  const downloadQR = useCallback(() => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${certificate?.hash?.slice(0, 12)}.png`;
    a.click();
  }, [qrDataUrl, certificate]);

  /* ─────────────────────────────────────────────────────────
     Render
     ───────────────────────────────────────────────────────── */
  return (
    <div className="student-portal-v2">

      {/* Header */}
      <div className="sp-header">
        <div className="sp-header-inner">
          <div className="sp-header-icon">👨‍🎓</div>
          <div>
            <h1>Student Portal</h1>
            <p>View and download your blockchain-verified certificate</p>
          </div>
        </div>
      </div>

      <div className="sp-content">

        {/* Search Card */}
        <div className="sp-card">
          <h2 className="sp-card-title">
            <span className="section-accent-sp" />
            Find Your Certificate
          </h2>
          <p className="sp-card-desc">
            Enter the certificate hash you received from your university to view and
            download your verified academic credential.
          </p>

          <form onSubmit={handleView} className="sp-form">
            <div className="sp-input-row">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Paste your certificate hash here…"
                className="sp-hash-input"
                autoComplete="off"
                spellCheck="false"
              />
              <button type="submit" className="btn-view-cert">
                🔍 View Certificate
              </button>
            </div>
          </form>

          {error && <div className="sp-error">{error}</div>}
        </div>

        {/* Certificate Display */}
        {certificate && (
          <div className="sp-card cert-display-card">

            {/* Banner */}
            <div className="cert-verified-banner">
              <span className="cv-icon">✅</span>
              <div>
                <h2>Certificate Verified</h2>
                <p>Recorded on Solana Devnet · Tamper-proof</p>
              </div>
            </div>

            <div className="cert-display-body">

              {/* Certificate Details */}
              <div className="cert-details-col">
                <h3 className="cert-detail-heading">Certificate Details</h3>

                {[
                  ['Student Name',   certificate.studentName],
                  ['University',     certificate.universityName],
                  ['Degree',         certificate.degreeTitle],
                  ['Field of Study', certificate.fieldOfStudy],
                  ['Issue Date',     certificate.issueDate],
                  ['Issued At',      new Date(certificate.issuedAt).toLocaleString()],
                  ['Blockchain',     'Solana Devnet'],
                ].map(([label, value]) => (
                  <div className="cert-detail-row" key={label}>
                    <span className="cert-detail-label">{label}</span>
                    <span className="cert-detail-value">{value}</span>
                  </div>
                ))}

                {/* Hash */}
                <div className="cert-detail-row hash-detail-row">
                  <span className="cert-detail-label">Certificate Hash</span>
                  <div className="cert-hash-block">
                    <span className="cert-hash-text">{certificate.hash}</span>
                  </div>
                </div>
              </div>

              {/* QR & Actions */}
              <div className="cert-actions-col">
                {qrDataUrl && (
                  <div className="cert-qr-wrapper">
                    <h3 className="cert-detail-heading">QR Code</h3>
                    <div className="cert-qr-frame">
                      <img src={qrDataUrl} alt="Certificate QR" />
                    </div>
                    <p className="qr-scan-hint">Scan to verify online</p>
                  </div>
                )}

                <div className="cert-download-section">
                  <button className="btn-download-cert" onClick={handleDownload}>
                    ⬇ Download Certificate
                  </button>
                  {qrDataUrl && (
                    <button className="btn-download-qr-sp" onClick={downloadQR}>
                      ⬇ Download QR Code
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Info Section */}
        {!certificate && !searched && (
          <div className="sp-info-cards">
            {[
              { icon: '🔑', title: 'Enter Your Hash', desc: 'Use the unique certificate hash provided by your university to look up your credential.' },
              { icon: '📋', title: 'View Details',    desc: 'See all certificate information including degree, institution, and blockchain verification.' },
              { icon: '⬇',  title: 'Download',        desc: 'Download a printable HTML certificate and QR code to share with employers.' },
            ].map((item) => (
              <div className="sp-info-card" key={item.title}>
                <div className="sp-info-icon">{item.icon}</div>
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

export default StudentPortal;
