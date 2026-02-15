/**
 * Solana Wallet Button Component
 * Uses wallet adapter for multi-wallet support
 */
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import './WalletButton.css';

const WalletButton = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="wallet-wrapper">
      {connected && publicKey && (
        <div className="wallet-info">
          <span className="wallet-indicator">🟢</span>
          <span className="wallet-address-label">
            {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton className="wallet-btn" />
    </div>
  );
};

export default WalletButton;
