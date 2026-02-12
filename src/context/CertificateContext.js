import React, { createContext, useState, useCallback } from 'react';

export const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [certificateData, setCertificateData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Start a new university session
  const startSession = useCallback((universityId, universityName) => {
    const newSession = {
      id: Date.now().toString(),
      universityId,
      universityName,
      startTime: new Date(),
      status: 'active',
    };
    setSession(newSession);
    setCertificateData(null);
    setError(null);
    setUploadProgress(0);
    return newSession;
  }, []);

  // Update session with certificate metadata
  const updateSession = useCallback((certificateMetadata) => {
    if (session) {
      setCertificateData({
        ...certificateMetadata,
        sessionId: session.id,
      });
    }
  }, [session]);

  // Store blockchain result (hash and QR)
  const setBlockchainResult = useCallback((hash, qrCode) => {
    setCertificateData((prev) => ({
      ...prev,
      blockchainHash: hash,
      qrCode: qrCode,
      uploadedAt: new Date(),
    }));
  }, []);

  // End session
  const endSession = useCallback(() => {
    setSession(null);
    setCertificateData(null);
    setUploadProgress(0);
    setError(null);
  }, []);

  const value = {
    session,
    certificateData,
    uploadProgress,
    error,
    loading,
    startSession,
    updateSession,
    setBlockchainResult,
    endSession,
    setUploadProgress,
    setError,
    setLoading,
  };

  return (
    <CertificateContext.Provider value={value}>
      {children}
    </CertificateContext.Provider>
  );
};
