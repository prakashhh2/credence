/**
 * Credence – Main Application Entry
 * --------------------------------
 * This component renders the public-facing landing experience
 * for Credence, a blockchain-powered academic certificate
 * verification platform.
 *
 * Audience:
 * - Students verifying credentials
 * - Universities issuing certificates
 * - Employers validating authenticity
 */

import "./App.css";
import Navbar from "./components/layout/Navbar";
import logo from "./assets/transparent-logo.png";

function App() {
  return (
    <div className="app">
      {/* Global Navigation */}
      <Navbar />

      {/* Hero / Landing Section */}
      <header className="hero">
        {/* Brand Logo */}
        <img
          src={logo}
          className="hero-logo"
          alt="Credence shield logo"
        />

        {/* Primary Value Proposition */}
        <h1 className="hero-title">
          Trust Academic Credentials.
        </h1>

        {/* Supporting Statement */}
        <p className="hero-subtitle">
          Credence leverages blockchain technology to provide
          secure, tamper-proof academic certificate verification
          for students, universities, and employers worldwide.
        </p>

        {/* Call-to-Action Buttons */}
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
      </header>
    </div>
  );
}

export default App;
