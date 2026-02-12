import React, { useState } from 'react';
import { connectWallet, issueCertificateOnChain } from '../web3/web3Service';
import QRCode from 'qrcode';
import './AdminPortal.css';

export default function AdminPortal() {
  const [account, setAccount] = useState(null);
  const [file, setFile] = useState(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [status, setStatus] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [authorized, setAuthorized] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4001';

  const handleConnect = async () => {
    try {
      const { address } = await connectWallet();
      setAccount(address);
      setStatus(`Connected ${address}`);
      // check on-chain issuer/admin role
      const { isIssuer, isAdmin } = await import('../web3/web3Service');
      const issuerOk = await isIssuer(address);
      const adminOk = await isAdmin(address);
      if (issuerOk || adminOk) {
        setAuthorized(true);
        setStatus((s) => s + ' — authorized');
      } else {
        setAuthorized(false);
        setStatus((s) => s + ' — not authorized to issue');
      }
    } catch (err) {
      setStatus('Connect failed: ' + err.message);
    }
  };

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return setStatus('Connect wallet first');
    if (!file) return setStatus('Select a file');
    if (!studentEmail) return setStatus('Provide student email');

    if (!authorized) return setStatus('Wallet not authorized to issue certificates');
    setStatus('Hashing file...');
    const form = new FormData();
    form.append('file', file);
    // Compute hash via backend
    const hashRes = await fetch(`${backendUrl}/hash`, { method: 'POST', body: form });
    const hashJson = await hashRes.json();
    const certHex = hashJson.sha256; // 64 hex chars

    setStatus('Uploading file to IPFS...');
    const pinForm = new FormData();
    pinForm.append('file', file);
    const pinRes = await fetch(`${backendUrl}/pinata/pin`, { method: 'POST', body: pinForm });
    const pinJson = await pinRes.json();
    const ipfsHash = pinJson.IpfsHash || pinJson.IpfsHash || (pinJson.IpfsHash ? pinJson.IpfsHash : (pinJson.IpfsHash));

    setStatus('Issuing on-chain...');
    try {
      const issueRes = await issueCertificateOnChain({ certificateHash: certHex, ipfsHash, metadataURI: '' });
      setStatus('Transaction confirmed: ' + issueRes.transactionHash);

      // generate QR linking to verify route
      const verifyUrl = (process.env.REACT_APP_FRONTEND_URL || window.location.origin) + '/#verify/' + certHex;
      const qr = await QRCode.toDataURL(verifyUrl);
      setQrDataUrl(qr);

      // notify backend to store and email student
      // include signature from issuer to prove authenticity
      const message = `I issued certificate ${certHex} for ${studentEmail} at ${new Date().toISOString()}`;
      const provider = new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);

      await fetch(`${backendUrl}/admin/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certHash: certHex, ipfsHash, studentEmail, issuer: account, txHash: issueRes.transactionHash, metadata: {}, signature, message }),
      });

      setStatus('Issued and notified student');
    } catch (err) {
      setStatus('Issue failed: ' + (err.message || err));
    }
  };

  return (
    <div className="admin-portal">
      <h1>Admin — Issue Certificate</h1>
      <div>
        {account ? (
          <div>Connected: {account} {authorized ? '(authorized)' : '(not authorized)'}</div>
        ) : (
          <button onClick={handleConnect}>Connect MetaMask</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        <div>
          <label>Student Email</label>
          <input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.edu" />
        </div>

        <div>
          <label>Certificate PDF</label>
          <input type="file" accept="application/pdf,image/*" onChange={handleFile} />
        </div>

        <button type="submit">Upload & Issue</button>
      </form>

      <div className="status">{status}</div>

      {qrDataUrl && (
        <div className="qr">
          <h3>Certificate QR</h3>
          <img src={qrDataUrl} alt="qr" />
        </div>
      )}
    </div>
  );
}
