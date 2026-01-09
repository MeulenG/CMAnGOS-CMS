import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import './Account.css';

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signup' | 'login' | 'marketplace'>('signup');

  return (
    <PageContainer>
      <div className="account-page">
        <h1 className="page-title">Account Management</h1>

        <div className="account-tabs">
          <button 
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
          <button 
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveTab('marketplace')}
          >
            Character Marketplace
          </button>
        </div>

        {activeTab === 'signup' && (
          <div className="tab-content">
            <h2 className="content-title">Create Your Account</h2>
            <p className="content-description">
              Join thousands of adventurers in our Classic WoW realm. Create your account to begin your journey!
            </p>
            
            <form className="account-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" placeholder="Enter your username" />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" placeholder="Enter your email" />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm your password" />
              </div>
              
              <div className="form-group checkbox-group">
                <input type="checkbox" id="terms" />
                <label htmlFor="terms">I agree to the Terms of Service and Server Rules</label>
              </div>
              
              <button type="submit" className="submit-btn">Create Account</button>
            </form>
          </div>
        )}

        {activeTab === 'login' && (
          <div className="tab-content">
            <h2 className="content-title">Login to Your Account</h2>
            <p className="content-description">
              Welcome back, adventurer! Login to manage your characters and account settings.
            </p>
            
            <form className="account-form">
              <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input type="text" id="login-username" placeholder="Enter your username" />
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input type="password" id="login-password" placeholder="Enter your password" />
              </div>
              
              <div className="form-group checkbox-group">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              
              <button type="submit" className="submit-btn">Login</button>
              
              <div className="form-links">
                <a href="#">Forgot Password?</a>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="tab-content">
            <h2 className="content-title">Character Marketplace</h2>
            <p className="content-description">
              Browse and trade high-level characters. All trades are secure and verified by our staff.
            </p>

            <div className="marketplace-filters">
              <select className="filter-select">
                <option>All Classes</option>
                <option>Warrior</option>
                <option>Paladin</option>
                <option>Hunter</option>
                <option>Rogue</option>
                <option>Priest</option>
                <option>Shaman</option>
                <option>Mage</option>
                <option>Warlock</option>
                <option>Druid</option>
              </select>
              
              <select className="filter-select">
                <option>All Levels</option>
                <option>Level 60</option>
                <option>Level 50-59</option>
                <option>Level 40-49</option>
              </select>
              
              <select className="filter-select">
                <option>All Factions</option>
                <option>Alliance</option>
                <option>Horde</option>
              </select>
            </div>

            <div className="marketplace-grid">
              <div className="character-card">
                <div className="character-header alliance">
                  <span className="character-level">60</span>
                  <span className="character-class">Human Warrior</span>
                </div>
                <div className="character-body">
                  <h3 className="character-name">Battlemaster</h3>
                  <div className="character-details">
                    <div className="detail-item">
                      <span className="detail-label">Spec:</span>
                      <span className="detail-value">Arms/Fury</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gear Score:</span>
                      <span className="detail-value">Epic (T2 Set)</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">PvP Rank:</span>
                      <span className="detail-value">High Warlord</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gold:</span>
                      <span className="detail-value">1,500g</span>
                    </div>
                  </div>
                  <div className="character-price">2,500 Credits</div>
                  <button className="view-btn">View Details</button>
                </div>
              </div>

              <div className="character-card">
                <div className="character-header horde">
                  <span className="character-level">60</span>
                  <span className="character-class">Undead Priest</span>
                </div>
                <div className="character-body">
                  <h3 className="character-name">Shadowmend</h3>
                  <div className="character-details">
                    <div className="detail-item">
                      <span className="detail-label">Spec:</span>
                      <span className="detail-value">Shadow/Disc</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gear Score:</span>
                      <span className="detail-value">Epic (T1 Set)</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Professions:</span>
                      <span className="detail-value">Ench 300/Tail 300</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gold:</span>
                      <span className="detail-value">800g</span>
                    </div>
                  </div>
                  <div className="character-price">1,800 Credits</div>
                  <button className="view-btn">View Details</button>
                </div>
              </div>

              <div className="character-card">
                <div className="character-header alliance">
                  <span className="character-level">60</span>
                  <span className="character-class">Night Elf Rogue</span>
                </div>
                <div className="character-body">
                  <h3 className="character-name">Nightblade</h3>
                  <div className="character-details">
                    <div className="detail-item">
                      <span className="detail-label">Spec:</span>
                      <span className="detail-value">Combat Daggers</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gear Score:</span>
                      <span className="detail-value">Epic (BiS)</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Mounts:</span>
                      <span className="detail-value">Epic + Rare</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gold:</span>
                      <span className="detail-value">2,200g</span>
                    </div>
                  </div>
                  <div className="character-price">3,000 Credits</div>
                  <button className="view-btn">View Details</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default Account;
