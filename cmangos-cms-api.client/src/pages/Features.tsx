import React from 'react';
import PageContainer from '../components/PageContainer';
import './Features.css';

const Features: React.FC = () => {
  return (
    <PageContainer>
      <div className="features-page">
        <h1 className="page-title">Server Features</h1>
        <p className="page-intro">
          Discover what makes our Classic WoW server the premier destination for vanilla enthusiasts.
        </p>

        <div className="features-grid">
          <div className="feature-card highlight">
            <div className="feature-icon">⚔️</div>
            <h2 className="feature-title">Blizzlike Content</h2>
            <p className="feature-description">
              Experience World of Warcraft exactly as it was in 2006. All content is scripted to match 
              retail 1.12.1 mechanics, spawn times, and drop rates. No custom modifications or pay-to-win features.
            </p>
            <ul className="feature-list">
              <li>Retail-accurate quest scripting</li>
              <li>Authentic dungeon & raid mechanics</li>
              <li>Original itemization</li>
              <li>Proper mob pathing & behavior</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h2 className="feature-title">Progressive Content</h2>
            <p className="feature-description">
              Content is released in phases matching the original WoW timeline. Start with Molten Core 
              and progress through to Naxxramas over time.
            </p>
            <ul className="feature-list">
              <li>Phase 1: MC, Onyxia (Current)</li>
              <li>Phase 2: BWL, World Bosses</li>
              <li>Phase 3: ZG, AQ20</li>
              <li>Phase 4: AQ40</li>
              <li>Phase 5: Naxxramas</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h2 className="feature-title">High Performance</h2>
            <p className="feature-description">
              Powered by CMaNGOS core running on dedicated enterprise hardware. Experience exceptional 
              stability with 99.9% uptime and minimal lag.
            </p>
            <ul className="feature-list">
              <li>Dedicated server infrastructure</li>
              <li>Regular performance optimization</li>
              <li>DDoS protection</li>
              <li>Daily automated backups</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h2 className="feature-title">Active Community</h2>
            <p className="feature-description">
              Join thousands of active players in our thriving community. Participate in events, 
              join guilds, and make lasting friendships.
            </p>
            <ul className="feature-list">
              <li>3000+ registered accounts</li>
              <li>500+ peak concurrent players</li>
              <li>Active Discord community</li>
              <li>Regular GM-hosted events</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h2 className="feature-title">Competitive PvP</h2>
            <p className="feature-description">
              Engage in epic battles with our PvP ranking system. Climb the ranks to earn prestigious 
              titles and powerful rewards.
            </p>
            <ul className="feature-list">
              <li>Full Honor system</li>
              <li>Battlegrounds: WSG, AB, AV</li>
              <li>World PvP objectives</li>
              <li>Seasonal tournaments</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h2 className="feature-title">Fair Gameplay</h2>
            <p className="feature-description">
              We have zero tolerance for cheating. Advanced anti-cheat systems and active GM monitoring 
              ensure a fair environment for all players.
            </p>
            <ul className="feature-list">
              <li>Automated anti-cheat detection</li>
              <li>Active GM team</li>
              <li>Player reporting system</li>
              <li>Swift ban enforcement</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎪</div>
            <h2 className="feature-title">Custom Events</h2>
            <p className="feature-description">
              Participate in unique server events with special rewards. From world boss hunts to 
              holiday celebrations, there's always something happening.
            </p>
            <ul className="feature-list">
              <li>Monthly world events</li>
              <li>Holiday celebrations</li>
              <li>PvP tournaments</li>
              <li>Rare mount drops</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h2 className="feature-title">Balanced Economy</h2>
            <p className="feature-description">
              No pay-to-win or gold selling allowed. Our economy is purely player-driven with active 
              measures to prevent inflation and market manipulation.
            </p>
            <ul className="feature-list">
              <li>No donor advantages</li>
              <li>Gold seller ban enforcement</li>
              <li>Active auction house</li>
              <li>Natural economy growth</li>
            </ul>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h2 className="feature-title">Quality Assurance</h2>
            <p className="feature-description">
              Our dedicated team continuously works on bug fixes and improvements. Regular updates 
              ensure the best possible gameplay experience.
            </p>
            <ul className="feature-list">
              <li>Weekly maintenance windows</li>
              <li>Bug tracking system</li>
              <li>Player feedback integration</li>
              <li>Continuous core updates</li>
            </ul>
          </div>
        </div>

        <section className="rates-section">
          <h2 className="section-title">Server Rates</h2>
          <div className="rates-grid">
            <div className="rate-card">
              <h3>Experience</h3>
              <div className="rate-value">1x</div>
              <p>Blizzlike</p>
            </div>
            <div className="rate-card">
              <h3>Quest XP</h3>
              <div className="rate-value">1x</div>
              <p>Blizzlike</p>
            </div>
            <div className="rate-card">
              <h3>Drop Rate</h3>
              <div className="rate-value">1x</div>
              <p>Blizzlike</p>
            </div>
            <div className="rate-card">
              <h3>Profession</h3>
              <div className="rate-value">1x</div>
              <p>Blizzlike</p>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default Features;
