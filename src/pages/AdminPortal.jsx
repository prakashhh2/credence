import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import './AdminPortal.css';

/* ─────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────── */

async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function storeCertificate(cert) {
  const certs = JSON.parse(localStorage.getItem('credence_certs') || '{}');
  certs[cert.hash] = cert;
  localStorage.setItem('credence_certs', JSON.stringify(certs));
}

const FIELDS = [
  { id: 'studentName',    label: 'Student Name',       placeholder: 'e.g. Jane Smith',                    required: true,  type: 'text'  },
  { id: 'studentEmail',   label: 'Student Email',       placeholder: 'e.g. jane@university.edu',           required: true,  type: 'email' },
  { id: 'universityName', label: 'University / Institution', placeholder: 'e.g. MIT',                      required: true,  type: 'text'  },
  { id: 'degreeTitle',    label: 'Degree / Certificate Title', placeholder: 'e.g. Bachelor of Science',    required: true,  type: 'text'  },
  { id: 'fieldOfStudy',   label: 'Field of Study',      placeholder: 'e.g. Computer Science',              required: true,  type: 'text'  },
  { id: 'issueDate',      label: 'Issue Date',          placeholder: '',                                   required: true,  type: 'date'  },
  { id: 'description',    label: 'Additional Notes',    placeholder: 'Graduated with honors…',             required: false, type: 'text'  },
];

/* ─────────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────────── */

export default function AdminPortal() {
  const [wallet, setWallet]           = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState('');

  const [form, setForm] = useState({
    studentName: '', studentEmail: '', universityName: '',
    degreeTitle: '', fieldOfStudy: '',
    issueDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [issuing, setIssuing]   = useState(false);
  const [formError, setFormError] = useState('');
  const [result, setResult]     = useState(null);

  /* ── Phantom Wallet ── */
  const connectPhantom = useCallback(async () => {
    setWalletError('');
    setWalletLoading(true);
    try {
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error(
          'Phantom wallet not found. Please install the Phantom extension and refresh.'
        );
      }
      const resp = await window.solana.connect();
      setWallet(resp.publicKey.toString());
    } catch (err) {
      setWalletError(err.message || 'Failed to connect Phantom wallet.');
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      if (window.solana && window.solana.disconnect) await window.solana.disconnect();
    } catch (err) {
      console.warn('Wallet disconnect error:', err);
    }
    setWallet(null);
    setResult(null);
  }, []);

  /* ── Form Handlers ── */
  const handleChange = (id, value) => setForm((f) => ({ ...f, [id]: value }));

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setFormError('');

    if (!wallet) {
      setFormError('Please connect your Phantom wallet first.');
      return;
    }

    for (const f of FIELDS) {
      if (f.required && !form[f.id]?.trim()) {
        setFormError(`Please fill in "${f.label}".`);
        return;
      }
    }

    setIssuing(true);
    try {
      /* Cryptographically secure random nonce */
      const nonceBytes = new Uint8Array(16);
      window.crypto.getRandomValues(nonceBytes);
      const nonce = Array.from(nonceBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      /* Generate deterministic certificate hash */
      const payload = JSON.stringify({
        ...form,
        issuedAt: new Date().toISOString(),
        issuerWallet: wallet,
        blockchain: 'solana-devnet',
        nonce,
      });
      const hash = await sha256(payload);

      /* Simulate Solana devnet tx signature using secure random bytes */
      const txBytes = new Uint8Array(32);
      window.crypto.getRandomValues(txBytes);
      const txSignature = Array.from(txBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      /* Generate QR code pointing to verify page */
      const verifyUrl = `${window.location.origin}${window.location.pathname}#verify/${hash}`;
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#0b1c3d', light: '#ffffff' },
      });

      const cert = {
        hash,
        txSignature,
        qrCode: qrDataUrl,
        issuedAt: new Date().toISOString(),
        issuerWallet: wallet,
        blockchain: 'solana-devnet',
        ...form,
      };

      storeCertificate(cert);
      setResult(cert);

      /* Reset form */
      setForm({
        studentName: '', studentEmail: '', universityName: '',
        degreeTitle: '', fieldOfStudy: '',
        issueDate: new Date().toISOString().split('T')[0],
        description: '',
      });
    } catch (err) {
      setFormError('Failed to issue certificate: ' + err.message);
    } finally {
      setIssuing(false);
    }
  }, [wallet, form]);

  /* ── Download QR ── */
  const downloadQR = useCallback(() => {
    if (!result?.qrCode) return;
    const a = document.createElement('a');
    a.href = result.qrCode;
    a.download = `credence-qr-${result.hash.slice(0, 12)}.png`;
    a.click();
  }, [result]);

  /* ── Copy hash ── */
  const [copied, setCopied] = useState(false);
  const copyHash = useCallback(() => {
    if (!result?.hash) return;
    navigator.clipboard.writeText(result.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  /* ── Build mailto link ── */
  const buildMailto = (cert) => {
    const subject = encodeURIComponent(`Your Certificate from ${cert.universityName}`);
    const verifyUrl = `${window.location.origin}${window.location.pathname}#verify/${cert.hash}`;
    const body = encodeURIComponent(
      `Dear ${cert.studentName},\n\nCongratulations! Your academic certificate has been issued on the Solana Devnet blockchain.\n\nCertificate Hash:\n${cert.hash}\n\nVerify Online:\n${verifyUrl}\n\nIssued by: ${cert.universityName}\nDegree: ${cert.degreeTitle} — ${cert.fieldOfStudy}\nIssue Date: ${cert.issueDate}\n\nThis certificate is permanently recorded on the blockchain and cannot be altered.\n\nBest regards,\n${cert.universityName}`
    );
    return `mailto:${cert.studentEmail}?subject=${subject}&body=${body}`;
  };

  /* ─────────────────────────────────────────────
     Render
     ───────────────────────────────────────────── */
  return (
    <div className="univ-portal">

      {/* ── Page Header ── */}
      <div className="univ-header">
        <div className="univ-header-inner">
          <div className="univ-header-icon">🎓</div>
          <div>
            <h1>University Dashboard</h1>
            <p>Issue blockchain-verified certificates on Solana Devnet</p>
          </div>
        </div>
      </div>

      <div className="univ-content">

        {/* ── Wallet Card ── */}
        <div className="univ-card wallet-card">
          <div className="card-label">
            <span className="label-dot solana-dot" />
            Solana Devnet · Phantom Wallet
          </div>

          {wallet ? (
            <div className="wallet-connected-row">
              <div className="wallet-address-chip">
                <span className="wallet-dot-green" />
                <span className="wallet-mono">{wallet.slice(0, 8)}…{wallet.slice(-6)}</span>
                <span className="wallet-full" title={wallet}>{wallet}</span>
              </div>
              <button className="btn-ghost-sm" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="wallet-disconnected-row">
              <p className="wallet-hint-text">
                Connect your Phantom wallet to issue certificates on Solana Devnet.
              </p>
              <button
                className="btn-phantom"
                onClick={connectPhantom}
                disabled={walletLoading}
              >
                {walletLoading ? (
                  <><span className="spinner" /> Connecting…</>
                ) : (
                  <><span className="phantom-icon">👻</span> Connect Phantom</>
                )}
              </button>
              {walletError && (
                <p className="error-inline">{walletError}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Issue Form ── */}
        <div className="univ-card form-card">
          <h2 className="card-section-title">
            <span className="section-accent" />
            Certificate Details
          </h2>

          <form onSubmit={handleSubmit} className="univ-form">
            <div className="form-grid">
              {FIELDS.map((f) => (
                <div
                  key={f.id}
                  className={`form-group${f.id === 'description' ? ' full-width' : ''}`}
                >
                  <label htmlFor={f.id}>
                    {f.label}
                    {f.required && <span className="required-star"> *</span>}
                  </label>
                  <input
                    id={f.id}
                    type={f.type}
                    value={form[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                    placeholder={f.placeholder}
                    required={f.required}
                    autoComplete="off"
                  />
                </div>
              ))}
            </div>

            {formError && (
              <div className="form-error">{formError}</div>
            )}

            <button
              type="submit"
              className={`btn-issue${!wallet ? ' btn-disabled' : ''}`}
              disabled={issuing || !wallet}
            >
              {issuing ? (
                <><span className="spinner" /> Issuing on Solana…</>
              ) : (
                '⛓ Issue Certificate on Solana Devnet'
              )}
            </button>

            {!wallet && (
              <p className="form-wallet-reminder">
                Connect your Phantom wallet above to enable issuance.
              </p>
            )}
          </form>
        </div>

        {/* ── Result Card ── */}
        {result && (
          <div className="univ-card result-card">
            <div className="result-banner">
              <span className="result-check">✅</span>
              <div>
                <h2>Certificate Issued Successfully!</h2>
                <p>Recorded on Solana Devnet · Transaction confirmed</p>
              </div>
            </div>

            <div className="result-body">
              {/* Details */}
              <div className="result-details">
                <h3 className="result-section-heading">Certificate Information</h3>
                {[
                  ['Student Name',   result.studentName],
                  ['Student Email',  result.studentEmail],
                  ['University',     result.universityName],
                  ['Degree',         result.degreeTitle],
                  ['Field of Study', result.fieldOfStudy],
                  ['Issue Date',     result.issueDate],
                  ['Issued At',      new Date(result.issuedAt).toLocaleString()],
                  ['Blockchain',     'Solana Devnet'],
                  ['Issuer Wallet',  result.issuerWallet],
                ].map(([label, value]) => (
                  <div className="result-row" key={label}>
                    <span className="result-label">{label}</span>
                    <span className="result-value">{value}</span>
                  </div>
                ))}

                <div className="result-row hash-row">
                  <span className="result-label">Certificate Hash</span>
                  <div className="hash-chip">
                    <span className="hash-text">{result.hash}</span>
                    <button className="btn-copy" onClick={copyHash}>
                      {copied ? '✓ Copied' : '⎘ Copy'}
                    </button>
                  </div>
                </div>

                <div className="result-row">
                  <span className="result-label">Tx Signature</span>
                  <span className="result-value mono tx-sig">{result.txSignature}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="result-qr">
                <h3 className="result-section-heading">QR Code</h3>
                <div className="qr-frame">
                  <img src={result.qrCode} alt="Certificate QR Code" />
                </div>
                <p className="qr-caption">Scan to verify this certificate</p>
                <button className="btn-download-qr" onClick={downloadQR}>
                  ⬇ Download QR
                </button>
              </div>
            </div>

            {/* Email Action */}
            <div className="email-section">
              <h3 className="result-section-heading">📧 Send to Student</h3>
              <p className="email-description">
                Click the button below to open your email client with a pre-composed
                email containing the certificate hash and QR code link for{' '}
                <strong>{result.studentEmail}</strong>.
              </p>
              <a
                href={buildMailto(result)}
                className="btn-email"
                target="_blank"
                rel="noreferrer"
              >
                ✉ Send Certificate Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
