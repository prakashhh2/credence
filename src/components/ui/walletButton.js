// src/components/ui/WalletButton.jsx
import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWallet,
  walletListeners
} from "../../web3/walletconnect";
import "./WalletButton.css";

const WalletButton = () => {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    getCurrentWallet().then(wallet => {
      if (wallet) setAddress(wallet.address);
    });

    walletListeners(
      acc => setAddress(acc),
      () => {}
    );
  }, []);

  const handleConnect = async () => {
    try {
      const wallet = await connectWallet();
      setAddress(wallet.address);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="wallet-wrapper">
      <button
        onClick={handleConnect}
        className={`wallet-btn ${address ? "connected" : ""}`}
      >
        {address ? (
          <>
            <span className="wallet-dot" />
            <span className="wallet-address">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
    </div>
  );
};

export default WalletButton;
