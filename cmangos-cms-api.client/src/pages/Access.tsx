import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import './Access.css';

const Access: React.FC = () => {
  return (
    <PageContainer>
      <div className="access-page">
        <h1 className="page-title">How to Access the Server</h1>
        <p className="page-intro">
          Follow these simple steps to begin your adventure on our Classic WoW server. 
          Join thousands of players already exploring Azeroth!
        </p>

        <section className="step-section">
          <div className="step-card">
            <div className="step-number">1</div>
            <h2 className="step-title">Download the Client</h2>
            <p className="step-description">
              You'll need the World of Warcraft Classic 1.12.1 client. We recommend the English version for best compatibility.
            </p>
            <div className="step-details">
              <ul>
                <li>Required Version: 1.12.1 (5875)</li>
                <li>File Size: Approximately 4.5 GB</li>
                <li>Languages: English, German, French supported</li>
              </ul>
              <button className="action-btn">Download Client</button>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h2 className="step-title">Create an Account</h2>
            <p className="step-description">
              Register your account on our website. This will be your login credentials for the game.
            </p>
            <div className="step-details">
              <ul>
                <li>Use a valid email address</li>
                <li>Choose a secure password</li>
                <li>Verify your email address</li>
              </ul>
              <Link to="/account" className="action-btn">Go to Sign Up</Link>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h2 className="step-title">Configure Connection</h2>
            <p className="step-description">
              Modify your realmlist file to connect to our server. This tells your client where to find us.
            </p>
            <div className="step-details">
              <div className="code-box">
                <code>set realmlist login.cmangos-server.com</code>
              </div>
              <p className="step-note">
                Location: <strong>Data\enUS\realmlist.wtf</strong> or <strong>Data\enGB\realmlist.wtf</strong>
              </p>
              <p className="step-warning">
                ⚠️ Make sure to backup your original realmlist before editing!
              </p>
            </div>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h2 className="step-title">Launch and Play</h2>
            <p className="step-description">
              Start WoW.exe and login with your account credentials. Welcome to Azeroth!
            </p>
            <div className="step-details">
              <ul>
                <li>Username: Your registered account name</li>
                <li>Password: Your account password</li>
                <li>Select realm: CMAnGOS Classic</li>
              </ul>
              <p className="step-note">
                Having trouble? Check our <Link to="/support">Support page</Link> for help.
              </p>
            </div>
          </div>
        </section>

        <section className="troubleshooting">
          <h2 className="section-title">Troubleshooting</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">Connection Failed?</h3>
              <p className="faq-answer">
                Verify your realmlist is correct and that your firewall isn't blocking the connection. 
                Try temporarily disabling antivirus software.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Wrong Client Version?</h3>
              <p className="faq-answer">
                Ensure you have version 1.12.1 (5875). Check the login screen - it should display this version number.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can't Find realmlist.wtf?</h3>
              <p className="faq-answer">
                Look in your WoW installation folder under Data\enUS\ or Data\enGB\. If missing, create a new text file 
                named "realmlist.wtf" with the server address.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Authentication Failed?</h3>
              <p className="faq-answer">
                Double-check your username and password. Remember that usernames are case-sensitive. 
                Try resetting your password on the website.
              </p>
            </div>
          </div>
        </section>

        <section className="system-requirements">
          <h2 className="section-title">System Requirements</h2>
          <div className="requirements-grid">
            <div className="requirements-box">
              <h3>Minimum</h3>
              <ul>
                <li><strong>OS:</strong> Windows XP / Vista / 7 / 10</li>
                <li><strong>Processor:</strong> Intel Pentium 4 1.3 GHz</li>
                <li><strong>Memory:</strong> 512 MB RAM</li>
                <li><strong>Graphics:</strong> 32 MB 3D card</li>
                <li><strong>Storage:</strong> 5 GB available space</li>
              </ul>
            </div>
            <div className="requirements-box">
              <h3>Recommended</h3>
              <ul>
                <li><strong>OS:</strong> Windows 7 / 10 / 11</li>
                <li><strong>Processor:</strong> Intel Core 2 Duo 2.0 GHz</li>
                <li><strong>Memory:</strong> 2 GB RAM</li>
                <li><strong>Graphics:</strong> 128 MB 3D card</li>
                <li><strong>Storage:</strong> 5 GB SSD</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default Access;
