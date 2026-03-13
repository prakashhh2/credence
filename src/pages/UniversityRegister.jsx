import React, { useState } from 'react';
import './UniversityRegister.css';

export default function UniversityRegister() {
  const [uniName, setUniName] = useState('');
  const [error, setError]     = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = uniName.trim();

    if (!trimmed) {
      setError('Please enter your university or college name.');
      return;
    }

    const lower = trimmed.toLowerCase();
    if (!lower.includes('university') && !lower.includes('college')) {
      setError('Institution name must contain "University" or "College".');
      return;
    }

    // Save to localStorage
    localStorage.setItem('credence_uni_name', trimmed);
    console.log('✅ University registered:', trimmed);
    
    // Reload page to admin section
    window.location.hash = '#admin';
    window.location.reload();
  };

  return (
    <div className="ur-page">

      {/* Header */}
      <div className="ur-header">
        <div className="ur-header-inner">
          <div className="ur-icon">🏛️</div>
          <div>
            <h1>University Registration</h1>
            <p>Register your institution to start issuing blockchain-verified certificates</p>
          </div>
        </div>
      </div>

      <div className="ur-content">
        <div className="ur-card">

          <h2 className="ur-title">
            <span className="ur-accent" />
            Get Started
          </h2>

          <p className="ur-desc">
            Enter your university or college name to register. This is a one-time step —
            after registering you'll be taken directly to the certificate issuance dashboard.
          </p>

          <form onSubmit={handleSubmit} className="ur-form">
            <div className="ur-field">
              <label htmlFor="uniName">
                University / College Name <span className="ur-required">*</span>
              </label>
              <input
                id="uniName"
                type="text"
                value={uniName}
                onChange={(e) => { setUniName(e.target.value); setError(''); }}
                placeholder="e.g. Harvard University or MIT College"
                autoComplete="organization"
                autoFocus
              />
              <span className="ur-hint">Name must contain "University" or "College"</span>
            </div>

            {error && <div className="ur-error">{error}</div>}

            <button type="submit" className="ur-btn">
              🏛️ Register &amp; Continue to Dashboard
            </button>
          </form>
        </div>

        {/* Info cards */}
        <div className="ur-info-grid">
          {[
            { icon: '✍️', title: 'One-Time Setup', desc: 'Register once with your institution name and jump straight to issuing certificates every time after.' },
            { icon: '🔒', title: 'Wallet-Secured', desc: 'Connect your Phantom wallet on the dashboard to sign and issue certificates on Solana Devnet.' },
            { icon: '⛓️', title: 'Blockchain Verified', desc: 'Every certificate issued gets a SHA-256 hash and simulated Solana Devnet transaction signature.' },
          ].map((item) => (
            <div className="ur-info-card" key={item.title}>
              <div className="ur-info-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
