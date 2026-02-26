import React, { useState } from 'react';
import './StudentPortal.css';

const StudentPortal = () => {
  const [certificateId, setCertificateId] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  const handleViewCertificate = (e) => {
    e?.preventDefault?.();

    if (!certificateId.trim()) {
      setError('❌ Please enter a certificate ID');
      return;
    }

    setError(null);
    // Mock certificate data for UI demonstration
    setCertificate({
      id: certificateId,
      studentName: 'John Doe',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      issueDate: '2024-05-15',
      institution: 'University of Example',
    });
  };

  return (
    <div className="student-portal">
      <div className="portal-header">
        <h1>Student Portal</h1>
        <p>View your certificate details</p>
      </div>

      <form onSubmit={handleViewCertificate} className="search-form">
        <div className="form-group">
          <label htmlFor="certificateId">Certificate ID</label>
          <input
            id="certificateId"
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="Enter your certificate ID..."
          />
        </div>

        <button type="submit" className="btn btn-primary">
          View Certificate
        </button>
      </form>

      {error && <div className="message error-message">{error}</div>}

      {certificate && (
        <div className="certificate-card">
          <div className="cert-header">
            <h2>🎓 Certificate Details</h2>
          </div>

          <div className="cert-detail">
            <div className="label">Student Name</div>
            <div className="value">{certificate.studentName}</div>
          </div>

          <div className="cert-detail">
            <div className="label">Institution</div>
            <div className="value">{certificate.institution}</div>
          </div>

          <div className="cert-detail">
            <div className="label">Degree</div>
            <div className="value">{certificate.degree}</div>
          </div>

          <div className="cert-detail">
            <div className="label">Field of Study</div>
            <div className="value">{certificate.field}</div>
          </div>

          <div className="cert-detail">
            <div className="label">Issue Date</div>
            <div className="value">{certificate.issueDate}</div>
          </div>
        </div>
      )}

      <div className="info-section">
        <h3>About Your Certificate</h3>
        <ul>
          <li>🎓 Access your academic credentials</li>
          <li>📋 View detailed certificate information</li>
          <li>✨ Secure and verifiable</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentPortal;
