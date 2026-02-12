import React, { useState } from 'react';
import { useCertificateSession } from '../../hooks/useCertificateSession';
import { uploadCertificateToBlockchain } from '../../Services/blockchainServices';
import './CertificateUpload.css';

const CertificateUpload = () => {
  const {
    session,
    setLoading,
    loading,
    setError,
    error,
    uploadProgress,
    setUploadProgress,
    setBlockchainResult,
  } = useCertificateSession();

  const [form, setForm] = useState({
    studentName: '',
    studentEmail: '',
    degree: '',
    issueDate: '',
  });

  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type and size
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
        setError('Only PDF and image files are allowed');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !form.studentName || !form.degree || !form.issueDate) {
      setError('Please fill in all fields and select a certificate file');
      return;
    }

    if (!session) {
      setError('No active session. Please start a session first.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      const walletAddress = localStorage.getItem('walletAddress') || '';
      
      const result = await uploadCertificateToBlockchain(
        {
          ...form,
          universityId: session.universityId,
        },
        file,
        walletAddress
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Store blockchain result in context
      setBlockchainResult(result.hash, result.qrCode);

      // Reset form
      setForm({
        studentName: '',
        studentEmail: '',
        degree: '',
        issueDate: '',
      });
      setFile(null);
    } catch (err) {
      setError(err.message || 'Failed to upload certificate');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="certificate-upload">
      <h2>Upload Certificate</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="studentName">Student Name</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={form.studentName}
            onChange={handleInputChange}
            placeholder="Enter student name"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentEmail">Student Email</label>
          <input
            type="email"
            id="studentEmail"
            name="studentEmail"
            value={form.studentEmail}
            onChange={handleInputChange}
            placeholder="Enter student email"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="degree">Degree/Certification</label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={form.degree}
            onChange={handleInputChange}
            placeholder="e.g., Bachelor of Science in Computer Science"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="issueDate">Issue Date</label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={form.issueDate}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        <div className="form-group file-upload">
          <label htmlFor="certificate">Certificate File (PDF/Image)</label>
          <input
            type="file"
            id="certificate"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={loading}
          />
          {file && <p className="file-selected">✓ {file.name}</p>}
        </div>

        {loading && (
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min(uploadProgress, 100)}%` }}
            />
            <span className="progress-text">{Math.round(uploadProgress)}%</span>
          </div>
        )}

        <button 
          type="submit" 
          className="btn-submit"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload to Blockchain'}
        </button>
      </form>
    </div>
  );
};

export default CertificateUpload;
