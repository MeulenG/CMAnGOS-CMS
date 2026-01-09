import React from 'react';
import PageContainer from '../components/PageContainer';
import './Support.css';

const Support: React.FC = () => {
  return (
    <PageContainer>
      <div className="support-page">
        <h1 className="page-title">Support Center</h1>
        <p className="page-intro">
          Need help? Our support team and community are here to assist you on your journey through Azeroth.
        </p>

        <section className="support-channels">
          <h2 className="section-title">Contact Us</h2>
          <div className="channels-grid">
            <div className="channel-card">
              <div className="channel-icon">💬</div>
              <h3 className="channel-title">Discord</h3>
              <p className="channel-description">
                Join our Discord server for real-time support and community interaction.
              </p>
              <a href="#discord" className="channel-btn">Join Discord</a>
            </div>

            <div className="channel-card">
              <div className="channel-icon">📧</div>
              <h3 className="channel-title">Email Support</h3>
              <p className="channel-description">
                Send us an email for account issues or detailed technical problems.
              </p>
              <a href="mailto:support@cmangos.com" className="channel-btn">Email Us</a>
            </div>

            <div className="channel-card">
              <div className="channel-icon">🎫</div>
              <h3 className="channel-title">Ticket System</h3>
              <p className="channel-description">
                Submit a support ticket for in-game issues or rule violations.
              </p>
              <a href="#ticket" className="channel-btn">Create Ticket</a>
            </div>

            <div className="channel-card">
              <div className="channel-icon">📖</div>
              <h3 className="channel-title">Forums</h3>
              <p className="channel-description">
                Browse our forums for guides, discussions, and community support.
              </p>
              <a href="#forums" className="channel-btn">Visit Forums</a>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="faq-category">
            <h3 className="category-title">Account & Login</h3>
            <div className="faq-items">
              <details className="faq-item">
                <summary className="faq-question">How do I create an account?</summary>
                <div className="faq-answer">
                  Visit our <a href="/account">Account page</a> and click on the Sign Up tab. 
                  Fill out the registration form with your desired username, email, and password. 
                  You'll receive a confirmation email to verify your account.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">I forgot my password. How do I reset it?</summary>
                <div className="faq-answer">
                  On the login page, click "Forgot Password" and enter your registered email address. 
                  We'll send you a password reset link. If you don't receive it, check your spam folder 
                  or contact support.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">Can I change my account name?</summary>
                <div className="faq-answer">
                  Account names cannot be changed once created. However, character names can be changed 
                  through an in-game service. Contact a GM for assistance with character name changes.
                </div>
              </details>
            </div>
          </div>

          <div className="faq-category">
            <h3 className="category-title">Technical Issues</h3>
            <div className="faq-items">
              <details className="faq-item">
                <summary className="faq-question">I can't connect to the server. What should I do?</summary>
                <div className="faq-answer">
                  First, verify your realmlist is correct (set realmlist login.cmangos-server.com). 
                  Check that you're using client version 1.12.1. Disable your firewall temporarily 
                  to see if it's blocking the connection. If issues persist, visit our 
                  <a href="/access">How to Access</a> page for detailed troubleshooting.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">The game keeps crashing. Help!</summary>
                <div className="faq-answer">
                  Try these steps: 1) Delete your WDB folder (in your WoW directory), 2) Disable all addons, 
                  3) Run the game in windowed mode, 4) Update your graphics drivers, 5) Run as administrator. 
                  If crashes continue, join our Discord for technical support.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">I'm experiencing lag or high latency.</summary>
                <div className="faq-answer">
                  Lag can be caused by your internet connection, background applications, or distance 
                  from the server. Try: closing bandwidth-heavy programs, using a wired connection instead 
                  of WiFi, and checking your network during off-peak hours. Run a traceroute to diagnose 
                  connection issues.
                </div>
              </details>
            </div>
          </div>

          <div className="faq-category">
            <h3 className="category-title">Gameplay & Rules</h3>
            <div className="faq-items">
              <details className="faq-item">
                <summary className="faq-question">What are the server rules?</summary>
                <div className="faq-answer">
                  Main rules: No cheating/hacking, no gold buying/selling, no exploiting bugs, 
                  respect other players, English in global channels. Full rules are available on 
                  our forums. Rule violations result in warnings, temporary bans, or permanent bans 
                  depending on severity.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">Are multiboxing and addons allowed?</summary>
                <div className="faq-answer">
                  Multiboxing is allowed as long as you're not using automation software. Each action 
                  must be manually performed. Most vanilla-era addons are permitted, but any addon 
                  that automates gameplay or provides unfair advantages is forbidden.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">How do I report a player for breaking rules?</summary>
                <div className="faq-answer">
                  Take screenshots/video evidence and submit a ticket through our website or Discord. 
                  Include player name, realm, date/time, and detailed description of the violation. 
                  Our GM team will investigate and take appropriate action.
                </div>
              </details>
            </div>
          </div>

          <div className="faq-category">
            <h3 className="category-title">Character & Items</h3>
            <div className="faq-items">
              <details className="faq-item">
                <summary className="faq-question">I deleted my character by accident. Can it be restored?</summary>
                <div className="faq-answer">
                  Characters can be restored within 30 days of deletion. Contact a GM through our 
                  ticket system with your account name and character details. Note that restoration 
                  is only available once per character.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">I lost items due to a bug. Will they be restored?</summary>
                <div className="faq-answer">
                  If you lost items due to a confirmed server bug or error, submit a detailed ticket 
                  with information about what was lost and when. Our team will investigate and restore 
                  items if the loss was due to a server issue. We cannot restore items lost to player error.
                </div>
              </details>

              <details className="faq-item">
                <summary className="faq-question">Can I transfer my character to another account?</summary>
                <div className="faq-answer">
                  Character transfers between accounts are not allowed except in special circumstances 
                  (account ownership disputes with proof). Character trading on the marketplace is the 
                  approved method for changing character ownership.
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="gm-assistance">
          <h2 className="section-title">GM Assistance</h2>
          <p className="section-description">
            Our Game Master team is available to help with urgent issues. Use the in-game ticket system 
            by typing <code>.ticket</code> in chat.
          </p>
          <div className="gm-info-grid">
            <div className="gm-info-card">
              <h3>Response Time</h3>
              <p>Average response: 2-6 hours</p>
              <p className="info-note">Peak hours may take longer</p>
            </div>
            <div className="gm-info-card">
              <h3>GM Coverage</h3>
              <p>24/7 coverage</p>
              <p className="info-note">Always a GM online</p>
            </div>
            <div className="gm-info-card">
              <h3>What GMs Can Help With</h3>
              <ul>
                <li>Stuck characters</li>
                <li>Quest bugs</li>
                <li>Rule violations</li>
                <li>Technical issues</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default Support;
