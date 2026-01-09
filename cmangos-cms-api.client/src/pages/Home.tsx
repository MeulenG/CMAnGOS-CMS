import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <>
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Journey to Azeroth</h1>
          <p className="hero-subtitle">Experience Classic World of Warcraft Like Never Before</p>
          <div className="hero-buttons">
            <Link to="/account" className="btn-primary">Create Account</Link>
            <Link to="/access" className="btn-secondary">How to Connect</Link>
          </div>
        </div>
      </div>

      <PageContainer>
        <section className="server-info">
          <h2 className="section-title">Welcome to CMAnGOS</h2>
          <p className="section-description">
            Embark on an epic adventure in our meticulously crafted Classic WoW realm. 
            We pride ourselves on delivering an authentic vanilla experience with enhanced 
            stability and dedicated support. Join thousands of adventurers exploring Azeroth!
          </p>

          <div className="info-cards">
            <div className="info-card">
              <div className="card-icon">⚔️</div>
              <h3>Blizzlike Experience</h3>
              <p>Authentic 1.12.1 patch gameplay with retail-accurate mechanics and content progression.</p>
            </div>
            <div className="info-card">
              <div className="card-icon">🛡️</div>
              <h3>Active Community</h3>
              <p>Join our thriving community of players, participate in events, and make lasting friendships.</p>
            </div>
            <div className="info-card">
              <div className="card-icon">⚡</div>
              <h3>Stable Performance</h3>
              <p>Powered by CMaNGOS core with 99.9% uptime and dedicated server infrastructure.</p>
            </div>
          </div>
        </section>

        <section className="news-section">
          <h2 className="section-title">Latest News</h2>
          
          <div className="news-grid">
            <article className="news-card">
              <div className="news-header">
                <span className="news-date">January 9, 2026</span>
                <span className="news-category">Update</span>
              </div>
              <h3 className="news-title">Server Launch Announcement</h3>
              <p className="news-excerpt">
                We are excited to announce the official launch of our Classic WoW server! 
                Join us on our journey through Azeroth with pre-raid BiS content available at launch.
              </p>
              <a href="#" className="news-link">Read More →</a>
            </article>

            <article className="news-card">
              <div className="news-header">
                <span className="news-date">January 5, 2026</span>
                <span className="news-category">Event</span>
              </div>
              <h3 className="news-title">World PvP Tournament</h3>
              <p className="news-excerpt">
                Sign up for our first cross-faction World PvP tournament in Stranglethorn Vale. 
                Epic prizes await the victors including rare mounts and exclusive titles!
              </p>
              <a href="#" className="news-link">Read More →</a>
            </article>

            <article className="news-card">
              <div className="news-header">
                <span className="news-date">January 1, 2026</span>
                <span className="news-category">Patch</span>
              </div>
              <h3 className="news-title">Quality of Life Updates</h3>
              <p className="news-excerpt">
                Latest patch includes bug fixes for quest chains, improved mob pathing in 
                Blackrock Depths, and enhanced anti-cheat measures for fair gameplay.
              </p>
              <a href="#" className="news-link">Read More →</a>
            </article>
          </div>
        </section>

        <section className="patch-info">
          <h2 className="section-title">Current Patch Information</h2>
          <div className="patch-details">
            <div className="patch-item">
              <strong>Version:</strong> 1.12.1 (Classic)
            </div>
            <div className="patch-item">
              <strong>Realm Type:</strong> PvP
            </div>
            <div className="patch-item">
              <strong>Experience Rate:</strong> 1x Blizzlike
            </div>
            <div className="patch-item">
              <strong>Max Level:</strong> 60
            </div>
            <div className="patch-item">
              <strong>Available Content:</strong> All Dungeons, Molten Core, Onyxia's Lair, Blackwing Lair
            </div>
            <div className="patch-item">
              <strong>Upcoming:</strong> Zul'Gurub, Ahn'Qiraj (Q2 2026)
            </div>
          </div>
        </section>
      </PageContainer>
    </>
  );
};

export default Home;
