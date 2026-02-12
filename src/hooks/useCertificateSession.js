import { useContext } from 'react';
import { CertificateContext } from '../context/CertificateContext';

export const useCertificateSession = () => {
  const context = useContext(CertificateContext);
  if (!context) {
    throw new Error('useCertificateSession must be used within CertificateProvider');
  }
  return context;
};
