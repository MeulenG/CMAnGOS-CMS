import React from 'react';
import PageContainer from '../components/PageContainer';
import './Community.css';

const Community: React.FC = () => {
  return (
    <PageContainer>
      <div className="community-page">
        <h1 className="page-title">Community</h1>
        <p className="page-intro">
          Join our thriving community of adventurers! Connect with fellow players, join guilds, 
          and participate in server-wide events.
        </p>

        <section className="community-platforms">
          <h2 className="section-title">Connect With Us</h2>
          <div className="platforms-grid">
            <div className="platform-card featured">
              <div className="platform-icon">💬</div>
              <h3 className="platform-title">Discord Server</h3>
              <p className="platform-description">
                Our primary hub for real-time communication. Join 5,000+ members discussing 
                strategies, organizing raids, and sharing adventures.
              </p>
              <div className="platform-stats">
                <div className="stat">
                  <span className="stat-value">5,000+</span>
                  <span className="stat-label">Members</span>
                </div>
                <div className="stat">
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Active</span>
                </div>
              </div>
              <a href="#discord" className="platform-btn">Join Discord</a>
            </div>

            <div className="platform-card">
              <div className="platform-icon">📖</div>
              <h3 className="platform-title">Forums</h3>
              <p className="platform-description">
                Browse guides, share stories, and discuss game mechanics with the community.
              </p>
              <a href="#forums" className="platform-btn">Visit Forums</a>
            </div>

            <div className="platform-card">
              <div className="platform-icon">📺</div>
              <h3 className="platform-title">Twitch</h3>
              <p className="platform-description">
                Watch live streams from our community members and official server events.
              </p>
              <a href="#twitch" className="platform-btn">Watch Streams</a>
            </div>

            <div className="platform-card">
              <div className="platform-icon">🐦</div>
              <h3 className="platform-title">Twitter</h3>
              <p className="platform-description">
                Follow us for news, updates, and community highlights.
              </p>
              <a href="#twitter" className="platform-btn">Follow Us</a>
            </div>
          </div>
        </section>

        <section className="guild-finder">
          <h2 className="section-title">Guild Finder</h2>
          <p className="section-description">
            Looking for a guild? Check out these active guilds recruiting new members!
          </p>
          
          <div className="guilds-grid">
            <div className="guild-card alliance">
              <div className="guild-header">
                <h3 className="guild-name">&lt;Defenders of Stormwind&gt;</h3>
                <span className="guild-faction">Alliance</span>
              </div>
              <div className="guild-body">
                <p className="guild-focus">PvE / Raiding</p>
                <div className="guild-details">
                  <span className="detail">👥 60 Members</span>
                  <span className="detail">📅 Raid: Wed/Sun 8PM</span>
                  <span className="detail">🎯 Progression: BWL</span>
                </div>
                <p className="guild-description">
                  Hardcore raiding guild seeking experienced DPS and healers. 
                  Loot council, Discord required.
                </p>
                <button className="contact-btn">Contact Guild</button>
              </div>
            </div>

            <div className="guild-card horde">
              <div className="guild-header">
                <h3 className="guild-name">&lt;For the Horde&gt;</h3>
                <span className="guild-faction">Horde</span>
              </div>
              <div className="guild-body">
                <p className="guild-focus">PvP / World PvP</p>
                <div className="guild-details">
                  <span className="detail">👥 85 Members</span>
                  <span className="detail">⚔️ Rank 10+ Players</span>
                  <span className="detail">🏆 Tournament Winners</span>
                </div>
                <p className="guild-description">
                  Competitive PvP guild focused on ranking and world PvP. 
                  Looking for skilled players of all classes.
                </p>
                <button className="contact-btn">Contact Guild</button>
              </div>
            </div>

            <div className="guild-card alliance">
              <div className="guild-header">
                <h3 className="guild-name">&lt;Casual Explorers&gt;</h3>
                <span className="guild-faction">Alliance</span>
              </div>
              <div className="guild-body">
                <p className="guild-focus">Social / Casual</p>
                <div className="guild-details">
                  <span className="detail">👥 120 Members</span>
                  <span className="detail">🎮 All Levels Welcome</span>
                  <span className="detail">🌟 Friendly Community</span>
                </div>
                <p className="guild-description">
                  Casual friendly guild for players who enjoy the journey. 
                  Dungeons, world events, and good times!
                </p>
                <button className="contact-btn">Contact Guild</button>
              </div>
            </div>

            <div className="guild-card horde">
              <div className="guild-header">
                <h3 className="guild-name">&lt;Orcish Warriors&gt;</h3>
                <span className="guild-faction">Horde</span>
              </div>
              <div className="guild-body">
                <p className="guild-focus">PvE / Semi-Hardcore</p>
                <div className="guild-details">
                  <span className="detail">👥 45 Members</span>
                  <span className="detail">📅 Raid: Fri/Sat 7PM</span>
                  <span className="detail">🎯 Progression: MC/Ony</span>
                </div>
                <p className="guild-description">
                  Semi-hardcore raiding with a relaxed atmosphere. 
                  Need tanks and ranged DPS. DKP system.
                </p>
                <button className="contact-btn">Contact Guild</button>
              </div>
            </div>
          </div>
        </section>

        <section className="events-section">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-list">
            <div className="event-card">
              <div className="event-date">
                <span className="event-day">15</span>
                <span className="event-month">JAN</span>
              </div>
              <div className="event-info">
                <h3 className="event-title">World PvP Tournament</h3>
                <p className="event-description">
                  Join us for an epic cross-faction tournament in Stranglethorn Vale! 
                  Sign up your team of 5 for glory and prizes.
                </p>
                <div className="event-meta">
                  <span>🏆 Prizes: Epic Mount + Gold</span>
                  <span>📍 Location: STV Arena</span>
                  <span>⏰ Time: 8:00 PM Server Time</span>
                </div>
              </div>
            </div>

            <div className="event-card">
              <div className="event-date">
                <span className="event-day">22</span>
                <span className="event-month">JAN</span>
              </div>
              <div className="event-info">
                <h3 className="event-title">Guild Recruitment Fair</h3>
                <p className="event-description">
                  All guilds are invited to set up recruitment booths in Ironforge and Orgrimmar. 
                  Meet guild leaders and find your perfect home!
                </p>
                <div className="event-meta">
                  <span>👥 Open to All Players</span>
                  <span>📍 IF & Org Main Cities</span>
                  <span>⏰ Time: 6:00 PM Server Time</span>
                </div>
              </div>
            </div>

            <div className="event-card">
              <div className="event-date">
                <span className="event-day">01</span>
                <span className="event-month">FEB</span>
              </div>
              <div className="event-info">
                <h3 className="event-title">Molten Core Speed Run</h3>
                <p className="event-description">
                  Community speed run competition! Register your guild for a chance to set the server record. 
                  Fastest clear time wins exclusive rewards.
                </p>
                <div className="event-meta">
                  <span>🏆 Prizes: Unique Titles + Mounts</span>
                  <span>📍 Location: Molten Core</span>
                  <span>⏰ Time: All Day Event</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="community-guidelines">
          <h2 className="section-title">Community Guidelines</h2>
          <div className="guidelines-grid">
            <div className="guideline-card">
              <div className="guideline-icon">🤝</div>
              <h3>Be Respectful</h3>
              <p>Treat all players with respect. No harassment, discrimination, or hate speech.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">🎮</div>
              <h3>Play Fair</h3>
              <p>No cheating, exploiting, or using unauthorized third-party software.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">💬</div>
              <h3>Keep it Clean</h3>
              <p>Use appropriate language. Keep global channels family-friendly.</p>
            </div>
            <div className="guideline-card">
              <div className="guideline-icon">🛡️</div>
              <h3>Help Others</h3>
              <p>We're all here to have fun. Help new players and foster a positive environment.</p>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default Community;
