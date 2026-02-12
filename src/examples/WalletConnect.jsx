import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import CredenceABI from '../../artifacts/contracts/CredenceCertificateV2.sol/CredenceCertificateV2.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export default function WalletConnectExample() {
  const [account, setAccount] = useState(null);
  const [isIssuer, setIsIssuer] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) setProvider(new ethers.BrowserProvider(window.ethereum));
  }, []);

  const connect = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      checkIssuer(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIssuer = async (address) => {
    if (!CONTRACT_ADDRESS) return;
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CredenceABI.abi, signer);
    const res = await contract.isIssuer(address);
    setIsIssuer(res);
  };

  return (
    <div>
      <h3>Wallet Connect (example)</h3>
      {account ? (
        <div>
          <div>Connected: {account}</div>
          <div>Issuer: {isIssuer ? 'Yes' : 'No'}</div>
        </div>
      ) : (
        <button onClick={connect}>Connect MetaMask</button>
      )}
    </div>
  );
}
