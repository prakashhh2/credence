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
            We design tech that works — no noise, no shortcuts, just
            secure and verifiable credentials.
          </p>
        </div>

        {/* EXPLORE LINKS */}
        <div className="footer-section">
          <h3>Explore</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/docs">Documentation</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* CONNECT / SOCIAL */}
        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="https://github.com">GitHub</a></li>
            <li><a href="https://linkedin.com">LinkedIn</a></li>
            <li><a href="https://x.com">X (Twitter)</a></li>
            <li><a href="https://discord.com">Discord</a></li>
          </ul>
        </div>

        {/* NEWSLETTER */}
        <div className="footer-section">
          <h3>Stay Updated</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed!");
            }}
            className="footer-newsletter"
          >
            <input
              type="email"
              placeholder="Your email"
              required
              className="footer-input"
            />
            <button type="submit" className="footer-btn">Subscribe</button>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: <a href="mailto:support@credence.com">support@credence.com</a></p>
          <p>Phone: +1 234 567 890</p>
          <p>Address: 123 Tech Street, Silicon Valley</p>
        </div>

        {/* THEME TOGGLE */}
        <div className="footer-section">
          <h3>Appearance</h3>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Credence. Built with intent.</p>
        <ul className="footer-legal">
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/cookies">Cookie Policy</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
