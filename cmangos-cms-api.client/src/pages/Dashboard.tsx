import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import './Dashboard.css';

// Type definitions
interface Character {
  id: number;
  name: string;
  level: number;
  race: string;
  class: string;
  faction: 'alliance' | 'horde';
}

interface MarketplaceCharacter extends Character {
  price: number;
  status: 'listed' | 'sold' | 'expired';
  listedDate: string;
}

interface Bid {
  id: number;
  character: Character;
  bidAmount: number;
  timestamp: string;
  status: 'active' | 'closed';
  bidderName: string;
}

interface Trade {
  id: number;
  character: Character;
  tradedWith: Character;
  tradeDate: string;
}

const Dashboard = () => {
  // TODO: Replace with actual authentication check
  // For now, set to false to show login/signup by default
  const [isLoggedIn] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'characters' | 'marketplace' | 'bids' | 'trades'>('characters');
  
  // Mock data - will be replaced with actual API call
  // Backend Integration:
  // 1. Query username from 'realmd' database, 'account' table (usernames are unique)
  // 2. Get account ID from that table
  // 3. Query 'classiccharacters' database, 'characters' table using account ID
  // 4. Fetch all characters for that account
  const mockCharactersData: Character[] = [
    { id: 1, name: 'Thunderstrike', level: 60, race: 'Human', class: 'Warrior', faction: 'alliance' },
    { id: 2, name: 'Shadowmend', level: 58, race: 'Night Elf', class: 'Priest', faction: 'alliance' },
    { id: 3, name: 'Frostblade', level: 55, race: 'Undead', class: 'Mage', faction: 'horde' },
  ];

  const mockMarketplaceData: MarketplaceCharacter[] = [
    { 
      id: 4, 
      name: 'Battlemaster', 
      level: 60, 
      race: 'Human', 
      class: 'Paladin', 
      faction: 'alliance',
      price: 2500,
      status: 'listed',
      listedDate: '2026-01-20'
    },
    { 
      id: 5, 
      name: 'Darkspell', 
      level: 60, 
      race: 'Undead', 
      class: 'Warlock', 
      faction: 'horde',
      price: 1800,
      status: 'sold',
      listedDate: '2026-01-15'
    },
  ];

  const mockBidsData: Bid[] = [
    {
      id: 1,
      character: mockMarketplaceData[0],
      bidAmount: 2700,
      timestamp: '2026-01-25T14:30:00Z',
      status: 'active',
      bidderName: 'PlayerOne'
    },
    {
      id: 2,
      character: mockMarketplaceData[0],
      bidAmount: 2600,
      timestamp: '2026-01-24T10:15:00Z',
      status: 'active',
      bidderName: 'PlayerTwo'
    },
    {
      id: 3,
      character: mockMarketplaceData[1],
      bidAmount: 1900,
      timestamp: '2026-01-22T16:45:00Z',
      status: 'closed',
      bidderName: 'PlayerThree'
    },
  ];

  const mockTradesData: Trade[] = [
    {
      id: 1,
      character: { id: 6, name: 'Ironforge', level: 60, race: 'Dwarf', class: 'Hunter', faction: 'alliance' },
      tradedWith: { id: 7, name: 'Stormrage', level: 60, race: 'Night Elf', class: 'Druid', faction: 'alliance' },
      tradeDate: '2026-01-10'
    },
    {
      id: 2,
      character: { id: 8, name: 'Bloodfury', level: 58, race: 'Orc', class: 'Warrior', faction: 'horde' },
      tradedWith: { id: 9, name: 'Frostmourne', level: 60, race: 'Human', class: 'Paladin', faction: 'alliance' },
      tradeDate: '2025-12-28'
    },
  ];

  const characters = mockCharactersData;
  const marketplaceCharacters = mockMarketplaceData;
  const bids = mockBidsData;
  const trades = mockTradesData;

  const getCharacterIcon = (race: string, classType: string) => {
    // Return race/class combination as text for now
    // In production, this would return actual icon URLs
    return `${race} ${classType}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer>
      <div className="dashboard-page">
        <h1 className="page-title">My Account</h1>

        {!isLoggedIn ? (
          // Show Login/Signup when user is not logged in
          <>
            <div className="account-tabs">
              <button 
                className={`tab-button ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
              >
                Login
              </button>
              <button 
                className={`tab-button ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthTab('signup')}
              >
                Sign Up
              </button>
            </div>

            {authTab === 'login' && (
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

            {authTab === 'signup' && (
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
          </>
        ) : (
          // Show Account Dashboard when user is logged in
          <>
            <div className="dashboard-tabs">
              <button 
                className={`tab-button ${activeTab === 'characters' ? 'active' : ''}`}
                onClick={() => setActiveTab('characters')}
              >
                My Characters
              </button>
              <button 
                className={`tab-button ${activeTab === 'marketplace' ? 'active' : ''}`}
                onClick={() => setActiveTab('marketplace')}
              >
                Marketplace Listings
              </button>
              <button 
                className={`tab-button ${activeTab === 'bids' ? 'active' : ''}`}
                onClick={() => setActiveTab('bids')}
              >
                Bids
              </button>
              <button 
                className={`tab-button ${activeTab === 'trades' ? 'active' : ''}`}
                onClick={() => setActiveTab('trades')}
              >
                Trade History
              </button>
            </div>

        {activeTab === 'characters' && (
          <div className="tab-content">
            <h2 className="content-title">My Characters</h2>
            <p className="content-description">
              All characters owned by your account. These characters are fetched from the Account Controller.
            </p>
            
            {characters.length === 0 ? (
              <div className="empty-state">
                <p>No characters found. Create a character in-game to see it here!</p>
              </div>
            ) : (
              <div className="characters-grid">
                {characters.map((character) => (
                  <div key={character.id} className={`character-card ${character.faction}`}>
                    <div className={`character-header ${character.faction}`}>
                      <span className="character-level">{character.level}</span>
                      <span className="character-icon">{getCharacterIcon(character.race, character.class)}</span>
                    </div>
                    <div className="character-body">
                      <h3 className="character-name">{character.name}</h3>
                      <div className="character-info">
                        <div className="info-row">
                          <span className="info-label">Race:</span>
                          <span className="info-value">{character.race}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Class:</span>
                          <span className="info-value">{character.class}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Faction:</span>
                          <span className="info-value capitalize">{character.faction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="tab-content">
            <h2 className="content-title">My Marketplace Listings</h2>
            <p className="content-description">
              Characters you've listed on the marketplace with their current status and pricing.
            </p>
            
            {marketplaceCharacters.length === 0 ? (
              <div className="empty-state">
                <p>You haven't listed any characters on the marketplace yet.</p>
              </div>
            ) : (
              <div className="marketplace-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Character</th>
                      <th>Level</th>
                      <th>Race/Class</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Listed Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketplaceCharacters.map((character) => (
                      <tr key={character.id}>
                        <td className="character-cell">
                          <div className={`faction-badge ${character.faction}`}></div>
                          <span className="character-name-text">{character.name}</span>
                        </td>
                        <td className="level-cell">{character.level}</td>
                        <td>{getCharacterIcon(character.race, character.class)}</td>
                        <td className="price-cell">{character.price} Credits</td>
                        <td>
                          <span className={`status-badge ${character.status}`}>
                            {character.status}
                          </span>
                        </td>
                        <td>{formatDate(character.listedDate)}</td>
                        <td>
                          <button className="action-btn">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="tab-content">
            <h2 className="content-title">Bids on My Characters</h2>
            <p className="content-description">
              Active and closed bids made by other users on your marketplace listings.
            </p>
            
            {bids.length === 0 ? (
              <div className="empty-state">
                <p>No bids have been placed on your characters yet.</p>
              </div>
            ) : (
              <div className="bids-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Character</th>
                      <th>Level</th>
                      <th>Race/Class</th>
                      <th>Bidder</th>
                      <th>Bid Amount</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid) => (
                      <tr key={bid.id}>
                        <td className="character-cell">
                          <div className={`faction-badge ${bid.character.faction}`}></div>
                          <span className="character-name-text">{bid.character.name}</span>
                        </td>
                        <td className="level-cell">{bid.character.level}</td>
                        <td>{getCharacterIcon(bid.character.race, bid.character.class)}</td>
                        <td>{bid.bidderName}</td>
                        <td className="price-cell">{bid.bidAmount} Credits</td>
                        <td>{formatDateTime(bid.timestamp)}</td>
                        <td>
                          <span className={`status-badge ${bid.status}`}>
                            {bid.status}
                          </span>
                        </td>
                        <td>
                          {bid.status === 'active' && (
                            <button className="action-btn">Accept</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="tab-content">
            <h2 className="content-title">Trade History</h2>
            <p className="content-description">
              Record of all past character trades you've completed.
            </p>
            
            {trades.length === 0 ? (
              <div className="empty-state">
                <p>You haven't completed any trades yet.</p>
              </div>
            ) : (
              <div className="trades-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Your Character</th>
                      <th>Level</th>
                      <th>Race/Class</th>
                      <th>Traded With</th>
                      <th>Level</th>
                      <th>Race/Class</th>
                      <th>Trade Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id}>
                        <td className="character-cell">
                          <div className={`faction-badge ${trade.character.faction}`}></div>
                          <span className="character-name-text">{trade.character.name}</span>
                        </td>
                        <td className="level-cell">{trade.character.level}</td>
                        <td>{getCharacterIcon(trade.character.race, trade.character.class)}</td>
                        <td className="character-cell">
                          <div className={`faction-badge ${trade.tradedWith.faction}`}></div>
                          <span className="character-name-text">{trade.tradedWith.name}</span>
                        </td>
                        <td className="level-cell">{trade.tradedWith.level}</td>
                        <td>{getCharacterIcon(trade.tradedWith.race, trade.tradedWith.class)}</td>
                        <td>{formatDate(trade.tradeDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </PageContainer>
  );
};

export default Dashboard;
