import React, { useState, useEffect } from 'react';
import type { GameAccount } from '../types/app.types';
import '../components/AppLayout.css';

interface AccountAction {
  type: 'ban' | 'mute' | 'lock' | 'gmlevel' | 'delete';
  account: GameAccount;
}

const AccountManager: React.FC = () => {
  const backendURL = process.env.backend_port || 'http://localhost:5023';
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: '', password: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const [actionModal, setActionModal] = useState<AccountAction | null>(null);
  const [gmLevel, setGmLevel] = useState(0);
  const [muteHours, setMuteHours] = useState(24);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendURL}/api/Account?limit=50`); 
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch(`${backendURL}/api/Account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newAccount.username,
          password: newAccount.password,
          email: newAccount.email || null
        })
      });

      if (response.ok) {
        await fetchAccounts();
        setShowCreateForm(false);
        setNewAccount({ username: '', password: '', email: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    try {
      const response = await fetch(`${backendURL}/api/Account/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchAccounts();
        setActionModal(null);
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const handleBanAccount = async (id: number) => {
    try {
      const response = await fetch(`${backendURL}/api/Account/${id}/ban`, { method: 'PATCH' });
      if (response.ok) {
        await fetchAccounts();
        setActionModal(null);
      }
    } catch (error) {
      console.error('Failed to ban account:', error);
    }
  };

  const handleMuteAccount = async (id: number) => {
    try {
      const response = await fetch(`${backendURL}/api/Account/${id}/mute`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: muteHours })
      });
      if (response.ok) {
        await fetchAccounts();
        setActionModal(null);
      }
    } catch (error) {
      console.error('Failed to mute account:', error);
    }
  };

  const handleLockAccount = async (id: number) => {
    try {
      const response = await fetch(`${backendURL}/api/Account/${id}/lock`, { method: 'PATCH' });
      if (response.ok) {
        await fetchAccounts();
        setActionModal(null);
      }
    } catch (error) {
      console.error('Failed to lock account:', error);
    }
  };

  const handleChangeGmLevel = async (id: number) => {
    try {
      const response = await fetch(`${backendURL}/api/Account/${id}/gmlevel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: gmLevel })
      });
      if (response.ok) {
        await fetchAccounts();
        setActionModal(null);
      }
    } catch (error) {
      console.error('Failed to change GM level:', error);
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Account Manager</h1>
        <p className="view-subtitle">Create and manage game accounts</p>
      </div>

      {!showCreateForm ? (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="card-title" style={{ margin: 0 }}>Accounts</div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '250px', margin: 0 }}
                />
                <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                  + Create Account
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#b89968' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
                <p>Loading accounts...</p>
              </div>
            ) : currentAccounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#b89968' }}>
                <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.7 }}>
                  {searchTerm ? 'No accounts found' : 'No accounts configured'}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {searchTerm ? 'Try a different search term' : 'Create your first game account to get started'}
                </p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #2a2116', color: '#d4a234' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Username</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>GM Level</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Join Date</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAccounts.map(account => (
                        <tr key={account.id} style={{ borderBottom: '1px solid #2a2116' }}>
                          <td style={{ padding: '0.75rem', color: '#b89968' }}>{account.id}</td>
                          <td style={{ padding: '0.75rem', color: '#d4a234', fontWeight: 500 }}>{account.username}</td>
                          <td style={{ padding: '0.75rem', color: '#b89968', fontSize: '0.9rem' }}>{account.email || '-'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              color: account.gmlevel > 0 ? '#ff4444' : '#b89968',
                              fontWeight: account.gmlevel > 0 ? 'bold' : 'normal'
                            }}>
                              {account.gmlevel > 0 ? `GM ${account.gmlevel}` : 'Player'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {account.locked > 0 && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '3px',
                                  background: '#ff4444',
                                  color: '#0a0603'
                                }}>LOCKED</span>
                              )}
                              {account.mutetime > Date.now() / 1000 && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '3px',
                                  background: '#ff9944',
                                  color: '#0a0603'
                                }}>MUTED</span>
                              )}
                              {account.locked === 0 && account.mutetime <= Date.now() / 1000 && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '3px',
                                  background: '#44ff44',
                                  color: '#0a0603'
                                }}>ACTIVE</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', color: '#b89968', fontSize: '0.9rem' }}>
                            {new Date(account.joindate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                onClick={() => setActionModal({ type: 'gmlevel', account })}
                              >
                                GM Level
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                onClick={() => setActionModal({ type: 'ban', account })}
                              >
                                Ban
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                onClick={() => setActionModal({ type: 'mute', account })}
                              >
                                Mute
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                onClick={() => setActionModal({ type: 'lock', account })}
                              >
                                Lock
                              </button>
                              <button
                                className="btn"
                                style={{ 
                                  padding: '0.25rem 0.5rem', 
                                  fontSize: '0.8rem',
                                  background: '#ff4444',
                                  border: '1px solid #ff4444'
                                }}
                                onClick={() => setActionModal({ type: 'delete', account })}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #2a2116'
                  }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Previous
                    </button>
                    <span style={{ color: '#b89968', fontSize: '0.9rem' }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card">
            <div className="card-title">Account Information</div>
            <div style={{ color: '#b89968', fontSize: '0.9rem', lineHeight: 1.8 }}>
              <p>
                <strong style={{ color: '#d4a234' }}>Account Management:</strong><br />
                Create and manage World of Warcraft game accounts. Each account can log into your server.
              </p>
              <p>
                <strong style={{ color: '#d4a234' }}>Password Requirements:</strong><br />
                • Minimum 8 characters<br />
                • Mix of letters and numbers recommended<br />
                • Stored securely in your database
              </p>
              <p>
                <strong style={{ color: '#d4a234' }}>Account Permissions:</strong><br />
                You can set account levels and permissions after creation via the database or in-game GM commands.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <div className="card-title">Create New Account</div>
          <form onSubmit={handleCreateAccount}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Enter username"
                value={newAccount.username}
                onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                required
                minLength={3}
                maxLength={32}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={newAccount.password}
                onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                required
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email (Optional)</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="user@example.com"
                value={newAccount.email}
                onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
              />
            </div>

            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <span className="loading-spinner" style={{ marginRight: '0.5rem' }} />
                    Creating...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {actionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 6, 3, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="card-title">
              {actionModal.type === 'delete' && 'Delete Account'}
              {actionModal.type === 'ban' && 'Ban Account'}
              {actionModal.type === 'mute' && 'Mute Account'}
              {actionModal.type === 'lock' && 'Lock Account'}
              {actionModal.type === 'gmlevel' && 'Change GM Level'}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#b89968', marginBottom: '1rem' }}>
                <strong style={{ color: '#d4a234' }}>Account:</strong> {actionModal.account.username}
              </p>

              {actionModal.type === 'delete' && (
                <p style={{ color: '#ff4444', fontSize: '0.9rem' }}>
                  Warning: This action cannot be undone. All characters and data associated with this account will be permanently deleted.
                </p>
              )}

              {actionModal.type === 'ban' && (
                <p style={{ color: '#b89968', fontSize: '0.9rem' }}>
                  This will permanently ban the account. The player will not be able to log in.
                </p>
              )}

              {actionModal.type === 'mute' && (
                <div>
                  <p style={{ color: '#b89968', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Prevent this account from using chat channels.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Mute Duration (hours)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={muteHours}
                      onChange={(e) => setMuteHours(Number(e.target.value))}
                      min={1}
                      max={8760}
                    />
                  </div>
                </div>
              )}

              {actionModal.type === 'lock' && (
                <p style={{ color: '#b89968', fontSize: '0.9rem' }}>
                  Lock this account to prevent login. This can be reversed later.
                </p>
              )}

              {actionModal.type === 'gmlevel' && (
                <div>
                  <p style={{ color: '#b89968', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    Set the GM permission level for this account.
                  </p>
                  <div className="form-group">
                    <label className="form-label">GM Level</label>
                    <select
                      className="form-input"
                      value={gmLevel}
                      onChange={(e) => setGmLevel(Number(e.target.value))}
                    >
                      <option value={0}>0 - Player</option>
                      <option value={1}>1 - Moderator</option>
                      <option value={2}>2 - Game Master</option>
                      <option value={3}>3 - Administrator</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                className="btn btn-secondary"
                onClick={() => setActionModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={actionModal.type === 'delete' ? {
                  background: '#ff4444',
                  borderColor: '#ff4444'
                } : {}}
                onClick={() => {
                  if (actionModal.type === 'delete') {
                    handleDeleteAccount(actionModal.account.id);
                  } else if (actionModal.type === 'ban') {
                    handleBanAccount(actionModal.account.id);
                  } else if (actionModal.type === 'mute') {
                    handleMuteAccount(actionModal.account.id);
                  } else if (actionModal.type === 'lock') {
                    handleLockAccount(actionModal.account.id);
                  } else if (actionModal.type === 'gmlevel') {
                    handleChangeGmLevel(actionModal.account.id);
                  }
                }}
              >
                {actionModal.type === 'delete' && 'Delete Account'}
                {actionModal.type === 'ban' && 'Ban Account'}
                {actionModal.type === 'mute' && 'Mute Account'}
                {actionModal.type === 'lock' && 'Lock Account'}
                {actionModal.type === 'gmlevel' && 'Update GM Level'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;
