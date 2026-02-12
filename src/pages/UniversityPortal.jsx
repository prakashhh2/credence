import React, { useEffect, useState } from 'react';
import { useCertificateSession } from '../hooks/useCertificateSession';
import CertificateUpload from '../components/ui/CertificateUpload';
import CertificateProof from '../components/ui/CertificateProof';
import './UniversityPortal.css';

const UniversityPortal = () => {
  const { session, startSession, endSession, certificateData } = useCertificateSession();
  const [currentStep, setCurrentStep] = useState('session'); // 'session', 'upload', 'proof'
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Mock university data - replace with real data
  const universities = [
    { id: 'uni-001', name: 'University of Technology' },
    { id: 'uni-002', name: 'Institute of Advanced Studies' },
    { id: 'uni-003', name: 'Global University' },
  ];

  const [selectedUniversity, setSelectedUniversity] = useState('');

  const handleStartSession = () => {
    if (!selectedUniversity) {
      alert('Please select a university');
      return;
    }

    const uni = universities.find((u) => u.id === selectedUniversity);
    if (uni) {
      startSession(uni.id, uni.name);
      setCurrentStep('upload');
    }
  };

  const handleEndSession = () => {
    setShowEndConfirm(true);
  };

  const confirmEndSession = () => {
    endSession();
    setCurrentStep('session');
    setSelectedUniversity('');
    setShowEndConfirm(false);
  };

  // Navigate to proof screen after successful upload
  useEffect(() => {
    if (certificateData?.blockchainHash && currentStep === 'upload') {
      setCurrentStep('proof');
    }
  }, [certificateData?.blockchainHash, currentStep]);

  return (
    <div className="university-portal">
      <div className="portal-header">
        <h1>University Certificate Portal</h1>
        <p>Upload and verify academic certificates on blockchain</p>
      </div>

      {session && (
        <div className="session-banner">
          <div className="session-info">
            <span className="session-badge">Active Session</span>
            <h3>{session.universityName}</h3>
            <p>Session ID: {session.id}</p>
          </div>
          <button 
            className="btn-end-session"
            onClick={handleEndSession}
          >
            End Session
          </button>
        </div>
      )}

      <div className="portal-container">
        <div className="step-container">
          <div className="step-header">
            <h2>Issuance moved to Admin Portal</h2>
          </div>
          <p>
            For security and governance, certificate issuance is performed via the Admin Portal.
            Please contact your institution administrator to issue certificates or use the Admin link on the top navigation.
          </p>
          <button className="btn-primary" onClick={() => window.location.hash = '#admin'}>Go to Admin Portal</button>
        </div>
      </div>

      {session && (
        <div className="portal-footer">
          <div className="step-indicator">
            <div className={`step ${currentStep === 'upload' ? 'active' : ''}`}>
              <span>Upload</span>
            </div>
            <div className="connector" />
            <div className={`step ${currentStep === 'proof' ? 'active' : ''}`}>
              <span>Proof</span>
            </div>
          </div>
        </div>
      )}

      {showEndConfirm && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>End Session?</h3>
            <p>Are you sure you want to end this session? Any unsaved data will be lost.</p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowEndConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-end"
                onClick={confirmEndSession}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityPortal;
