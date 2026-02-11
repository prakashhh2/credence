/**
 * Navbar Component
 * ----------------
 * Global navigation bar for the Credence platform.
 * Uses standard anchor (<a>) tags for navigation.
 *
 * Note:
 * - Triggers full page reloads
 * - Suitable for static or multi-page setups
 */
import React from "react";
import "./Navbar.css";
import logo from "../../assets/ChatGPT Image Feb 4, 2026, 02_25_21 PM.png";

function Navbar() {
  return (
    <nav className="navbar">
      {/* Left section: Brand */}
      <div className="nav-left">
        <img
          src={logo}
          alt="Credence shield logo"
          className="nav-logo"
        />
        <span className="nav-title">Credence</span>
      </div>
      

      {/* Right section: Navigation */}
      <div className="nav-right">
        <a href="/students" className="nav-link">
          Students
        </a>

        <a href="/universities" className="nav-link">
          Universities
        </a>

        <a href="/verify" className="nav-link">
          Verify
        </a>

        <a href="/login" className="nav-btn">
          Login
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
