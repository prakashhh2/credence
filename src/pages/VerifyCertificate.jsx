import React, { useState } from 'react';
import './VerifyCertificate.css';

const VerifyCertificate = ({ hash }) => {
  const [certificateId, setCertificateId] = useState(hash || '');
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = (e) => {
    e?.preventDefault?.();

    if (!certificateId.trim()) {
      setError('❌ Please enter a certificate ID');
      return;
    }

    setError(null);
    // Mock certificate data for verification UI
    setCertificate({
      id: certificateId,
      isVerified: true,
      studentName: 'John Doe',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      issueDate: '2024-05-15',
      institution: 'University of Example',
      status: 'Valid',
    });
  };

  return (
    <div className="verify-certificate">
      <div className="verify-header">
        <h1>🔍 Verify Certificate</h1>
        <p>Enter a certificate ID to verify its authenticity</p>
      </div>

      <form onSubmit={handleVerify} className="verify-form">
        <div className="form-group">
          <label htmlFor="certificateId">Certificate ID</label>
          <input
            id="certificateId"
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Enter certificate ID or hash..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Verify Certificate
        </button>
      </form>

      {error && <div className="message error-message">{error}</div>}

      {certificate && (
        <div className="verification-card">
          <div className="verification-status">
            {certificate.isVerified ? (
              <div className="status-verified">
                <span className="status-icon">✅</span>
                <span className="status-text">Certificate Verified</span>
              </div>
            ) : (
              <div className="status-invalid">
                <span className="status-icon">❌</span>
                <span className="status-text">Certificate Invalid</span>
              </div>
            )}
          </div>

          <div className="certificate-info">
            <div className="info-item">
              <div className="label">Student Name</div>
              <div className="value">{certificate.studentName}</div>
            </div>

            <div className="info-item">
              <div className="label">Institution</div>
              <div className="value">{certificate.institution}</div>
            </div>

            <div className="info-item">
              <div className="label">Degree</div>
              <div className="value">{certificate.degree}</div>
            </div>

            <div className="info-item">
              <div className="label">Field of Study</div>
              <div className="value">{certificate.field}</div>
            </div>

            <div className="info-item">
              <div className="label">Issue Date</div>
              <div className="value">{certificate.issueDate}</div>
            </div>

            <div className="info-item">
              <div className="label">Status</div>
              <div className="value">{certificate.status}</div>
            </div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>How to Verify</h3>
        <ul>
          <li>Enter the certificate ID or hash in the field above</li>
          <li>The system will verify the certificate authenticity</li>
          <li>View detailed certificate information and status</li>
          <li>Share verification results with employers or institutions</li>
        </ul>
      </div>
    </div>
  );
};

export default VerifyCertificate;
