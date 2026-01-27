import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import './AdminDashboard.css';

interface Account {
  id: number;
  username: string;
  email?: string;
  gmlevel: number;
  locked: number;
  mutetime: number;
}

const AdminDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [gmLevel, setGmLevel] = useState(0);
  const [muteMinutes, setMuteMinutes] = useState(0);
  const [banReason, setBanReason] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    
    if (!searchQuery.trim()) {
      setActionMessage({ type: 'error', text: 'Please enter a username or account ID' });
      return;
    }

    // Mock API call - TODO: Replace with actual backend endpoint
    // Simulating API response
    const mockAccount: Account = {
      id: 12345,
      username: searchQuery,
      email: 'user@example.com',
      gmlevel: 0,
      locked: 0,
      mutetime: 0
    };
    
    setSelectedAccount(mockAccount);
    setActionMessage({ type: 'success', text: 'Account found!' });
  };

  const handleBanAccount = async () => {
    if (!selectedAccount) return;
    
    // Mock API call - TODO: Replace with actual backend endpoint
    // POST /api/account/{id}/ban with reason
    setActionMessage({ type: 'success', text: `Account "${selectedAccount.username}" has been banned. Reason: ${banReason || 'No reason provided'}` });
    setActiveAction(null);
    setBanReason('');
  };

  const handleMuteAccount = async () => {
    if (!selectedAccount) return;
    
    if (muteMinutes <= 0) {
      setActionMessage({ type: 'error', text: 'Mute duration must be greater than 0 minutes' });
      return;
    }
    
    if (muteMinutes > 1440) { // 24 hours max
      setActionMessage({ type: 'error', text: 'Mute duration cannot exceed 24 hours (1440 minutes)' });
      return;
    }
    
    // Mock API call - TODO: Replace with actual backend endpoint
    // POST /api/account/{id}/mute with duration
    setActionMessage({ type: 'success', text: `Account "${selectedAccount.username}" has been muted for ${muteMinutes} minutes` });
    setActiveAction(null);
    setMuteMinutes(0);
  };

  const handleChangeGMLevel = async () => {
    if (!selectedAccount) return;
    
    if (gmLevel < 0 || gmLevel > 5) {
      setActionMessage({ type: 'error', text: 'GM level must be between 0 and 5' });
      return;
    }
    
    // Mock API call - TODO: Replace with actual backend endpoint
    // PUT /api/account/{id}/gmlevel
    setActionMessage({ type: 'success', text: `GM level for "${selectedAccount.username}" changed to ${gmLevel}` });
    setActiveAction(null);
    setGmLevel(0);
  };

  const handleChangePassword = async () => {
    if (!selectedAccount) return;
    
    if (!newPassword || newPassword.length < 8) {
      setActionMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    
    if (newPassword.length > 16) {
      setActionMessage({ type: 'error', text: 'Password must not exceed 16 characters' });
      return;
    }
    
    // Mock API call - TODO: Replace with actual backend endpoint
    // PUT /api/account/{id}/password
    setActionMessage({ type: 'success', text: `Password for "${selectedAccount.username}" has been changed` });
    setActiveAction(null);
    setNewPassword('');
  };

  const handleChangeUsername = async () => {
    if (!selectedAccount) return;
    
    if (!newUsername || newUsername.length < 3) {
      setActionMessage({ type: 'error', text: 'Username must be at least 3 characters' });
      return;
    }
    
    if (newUsername.length > 16) {
      setActionMessage({ type: 'error', text: 'Username must not exceed 16 characters' });
      return;
    }
    
    // Validate username format (alphanumeric only)
    if (!/^[a-zA-Z0-9]+$/.test(newUsername)) {
      setActionMessage({ type: 'error', text: 'Username must contain only letters and numbers' });
      return;
    }
    
    // Mock API call - TODO: Replace with actual backend endpoint
    // PUT /api/account/{id}/username
    setActionMessage({ type: 'success', text: `Username changed from "${selectedAccount.username}" to "${newUsername}"` });
    setActiveAction(null);
    setNewUsername('');
  };

  const renderActionPanel = () => {
    if (!activeAction || !selectedAccount) return null;

    switch (activeAction) {
      case 'ban':
        return (
          <div className="action-panel">
            <h3>Ban Account: {selectedAccount.username}</h3>
            <div className="form-group">
              <label htmlFor="ban-reason">Reason (Optional)</label>
              <textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                rows={4}
              />
            </div>
            <div className="action-buttons">
              <button className="submit-btn danger" onClick={handleBanAccount}>
                Confirm Ban
              </button>
              <button className="cancel-btn" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        );

      case 'mute':
        return (
          <div className="action-panel">
            <h3>Mute Account: {selectedAccount.username}</h3>
            <div className="form-group">
              <label htmlFor="mute-minutes">Mute Duration (Minutes)</label>
              <input
                type="number"
                id="mute-minutes"
                value={muteMinutes}
                onChange={(e) => setMuteMinutes(parseInt(e.target.value) || 0)}
                min="0"
                placeholder="Enter minutes..."
              />
            </div>
            <div className="action-buttons">
              <button className="submit-btn warning" onClick={handleMuteAccount}>
                Confirm Mute
              </button>
              <button className="cancel-btn" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        );

      case 'gmlevel':
        return (
          <div className="action-panel">
            <h3>Change GM Level: {selectedAccount.username}</h3>
            <div className="form-group">
              <label htmlFor="gm-level">GM Level (0-5)</label>
              <input
                type="number"
                id="gm-level"
                value={gmLevel}
                onChange={(e) => setGmLevel(parseInt(e.target.value) || 0)}
                min="0"
                max="5"
                placeholder="Enter GM level..."
              />
              <small className="hint">0 = Player, 1 = Moderator, 2 = GM, 3 = Admin, 4+ = Developer</small>
            </div>
            <div className="action-buttons">
              <button className="submit-btn" onClick={handleChangeGMLevel}>
                Confirm Change
              </button>
              <button className="cancel-btn" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="action-panel">
            <h3>Change Password: {selectedAccount.username}</h3>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password..."
              />
            </div>
            <div className="action-buttons">
              <button className="submit-btn" onClick={handleChangePassword}>
                Confirm Change
              </button>
              <button className="cancel-btn" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        );

      case 'username':
        return (
          <div className="action-panel">
            <h3>Change Username: {selectedAccount.username}</h3>
            <div className="form-group">
              <label htmlFor="new-username">New Username</label>
              <input
                type="text"
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username..."
              />
            </div>
            <div className="action-buttons">
              <button className="submit-btn" onClick={handleChangeUsername}>
                Confirm Change
              </button>
              <button className="cancel-btn" onClick={() => setActiveAction(null)}>
                Cancel
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className="admin-dashboard">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Quick actions for account management</p>

        {/* Search Section */}
        <div className="admin-section">
          <h2 className="section-title">Search Account</h2>
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Enter username or account ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
        </div>

        {/* Action Messages */}
        {actionMessage && (
          <div className={`action-message ${actionMessage.type}`}>
            {actionMessage.text}
          </div>
        )}

        {/* Account Info Section */}
        {selectedAccount && (
          <div className="admin-section">
            <h2 className="section-title">Account Information</h2>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">Account ID:</span>
                <span className="info-value">{selectedAccount.id}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Username:</span>
                <span className="info-value">{selectedAccount.username}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{selectedAccount.email || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">GM Level:</span>
                <span className="info-value">{selectedAccount.gmlevel}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  {selectedAccount.locked ? '🔒 Banned' : '✅ Active'}
                  {selectedAccount.mutetime > 0 && ' 🔇 Muted'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Section */}
        {selectedAccount && !activeAction && (
          <div className="admin-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <button
                className="action-btn danger"
                onClick={() => setActiveAction('ban')}
              >
                🚫 Ban Account
              </button>
              <button
                className="action-btn warning"
                onClick={() => setActiveAction('mute')}
              >
                🔇 Mute Account
              </button>
              <button
                className="action-btn primary"
                onClick={() => setActiveAction('gmlevel')}
              >
                ⭐ Change GM Level
              </button>
              <button
                className="action-btn primary"
                onClick={() => setActiveAction('password')}
              >
                🔑 Change Password
              </button>
              <button
                className="action-btn primary"
                onClick={() => setActiveAction('username')}
              >
                ✏️ Change Username
              </button>
            </div>
          </div>
        )}

        {/* Action Panel */}
        {renderActionPanel()}
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
