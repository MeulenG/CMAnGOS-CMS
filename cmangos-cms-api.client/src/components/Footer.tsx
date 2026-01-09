import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="wow-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>CMAnGOS Server</h3>
          <p>Experience Classic World of Warcraft as it was meant to be played.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#rules">Server Rules</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Connect</h3>
          <ul>
            <li><a href="#discord">Discord</a></li>
            <li><a href="#forums">Forums</a></li>
            <li><a href="#github">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CMAnGOS. World of Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc.</p>
        <p className="footer-disclaimer">This is a fan-made private server. Not affiliated with Blizzard Entertainment.</p>
      </div>
    </footer>
  );
};

export default Footer;
