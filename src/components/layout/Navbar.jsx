
import React, { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/ChatGPT Image Feb 4, 2026, 02_25_21 PM.png";

function Navbar({ onHome }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogoClick = () => {
    window.location.hash = "#";
    setIsMenuOpen(false);
  };

  const handleNavClick = (hash) => {
    window.location.hash = hash;
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const navItems = [
    { label: "Home", hash: "#" },
    { label: "For Students", hash: "#student" },
    { label: "For Universities", hash: "#admin" },
    { label: "Verify", hash: "#verify" },
  ];

  return (
    <nav className={`navbar${isMenuOpen ? ' menu-open' : ''}`}>
      {/* Left section: Brand */}
      <div className="nav-brand" onClick={handleLogoClick}>
        <img
          src={logo}
          alt="Credence shield logo"
          className="nav-logo"
        />
        <span className="nav-title">Credence</span>
      </div>

      {/* Center: Navigation Links */}
      <div className={`nav-center ${isMenuOpen ? "active" : ""}`}>
        {navItems.map((item) => (
          <button
            key={item.hash}
            className="nav-link"
            onClick={() => handleNavClick(item.hash)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right section: CTA + Mobile Toggle */}
      <div className="nav-right">
        <button
          className="nav-cta"
          onClick={() => handleNavClick("#student")}
        >
          Get Started
        </button>

        {/* Hamburger */}
        <button
          className={`nav-toggle${isMenuOpen ? ' is-open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className="hamburger" />
          <span className="hamburger" />
          <span className="hamburger" />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
