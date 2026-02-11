/**
 * Credence – Main Application Entry
 * --------------------------------
 * Public-facing landing experience for Credence,
 * a blockchain-powered academic certificate
 * verification platform.
 */

import "./App.css";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import WalletButton from "./components/ui/walletButton.js";
import logo from "./assets/transparent-logo.png";

function App() {
  return (
    <div className="app">
      {/* Global Navigation */}
      <Navbar />

      {/* Hero Section */}
      <header className="hero hero-grid">

        {/* LEFT — Wallet Identity */}
        <div className="hero-wallet">
          <WalletButton />
          <p className="wallet-hint">
            Connect your wallet to verify or issue academic
            credentials securely on the blockchain.
          </p>
        </div>

        {/* CENTER — Brand & Value */}
        <div className="hero-main">
          <img
            src={logo}
            className="hero-logo"
            alt="Credence shield logo"
          />

          <h1 className="hero-title">
            Trust Academic Credentials.
          </h1>

          <p className="hero-subtitle">
            Credence leverages blockchain technology to deliver
            secure, tamper-proof academic certificate verification
            for students, universities, and employers worldwide.
          </p>

          <div className="hero-actions">
            <button className="btn-primary">
              Student Portal
            </button>

            <button className="btn-secondary">
              University Portal
            </button>

            <button className="btn-outline">
              Verify Certificate
            </button>
          </div>
        </div>

      </header>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
