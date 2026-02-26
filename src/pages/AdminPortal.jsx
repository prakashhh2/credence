import React, { useState } from 'react';
import './AdminPortal.css';

export default function AdminPortal() {
  const [studentName, setStudentName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [degreeTitle, setDegreeTitle] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    setStatus('✅ Certificate created successfully!');
    setResult({
      certificateId: `CERT-${Date.now()}`,
      studentName,
      universityName,
      degreeTitle,
      issueDate,
    });

    setStudentName('');
    setUniversityName('');
    setDegreeTitle('');
    setIssueDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="admin-portal">
      <div className="admin-header">
        <h1>🎓 University Portal — Issue Certificate</h1>
        <p>Create and manage academic certificates</p>
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
              required
            />
          </div>
        </div>

        <button type="submit" className="btn-submit">
          📝 Create Certificate
        </button>
      </form>

      {status && (
        <div className={`status-message ${status.startsWith('✅') ? 'success' : status.startsWith('❌') ? 'error' : 'info'}`}>
          {status}
        </div>
      )}

      {result && (
        <div className="result-card">
          <h2>✅ Certificate Created Successfully!</h2>

          <div className="result-detail">
            <div className="label">Certificate ID:</div>
            <div className="value">{result.certificateId}</div>
          </div>

          <div className="result-detail">
            <div className="label">Student Name:</div>
            <div className="value">{result.studentName}</div>
          </div>

          <div className="result-detail">
            <div className="label">University:</div>
            <div className="value">{result.universityName}</div>
          </div>

          <div className="result-detail">
            <div className="label">Degree:</div>
            <div className="value">{result.degreeTitle}</div>
          </div>

          <div className="result-detail">
            <div className="label">Issue Date:</div>
            <div className="value">{result.issueDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}
