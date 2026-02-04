import { useEffect, useState } from "react";
import "./Footer.css";

const Footer = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <footer className="footer">
      <div className="footer-container">

        {/* ABOUT */}
        <div className="footer-section">
          <h3>About Credence</h3>
          <p>
            Credence is built on trust, transparency, and clean systems.
            We design tech that actually works — no noise, no shortcuts,
            just truth written in code.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-section">
          <h3>Explore</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">LinkedIn</a></li>
            <li><a href="#">X (Twitter)</a></li>
          </ul>
        </div>

        {/* THEME TOGGLE */}
        <div className="footer-section">
          <h3>Appearance</h3>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Credence. Built with intent.
      </div>
    </footer>
  );
};

export default Footer;
