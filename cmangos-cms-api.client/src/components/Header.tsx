import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="wow-header">
      <div className="header-banner">
        <div className="logo-container">
          <h1 className="site-title">CMAnGOS</h1>
          <p className="site-subtitle">Classic WoW Private Server</p>
        </div>
      </div>
      <nav className="main-nav">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/account">Account & Signup</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/access">How to Access</Link></li>
          <li><Link to="/features">Server Features</Link></li>
          <li><Link to="/support">Support</Link></li>
          <li><Link to="/community">Community</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
