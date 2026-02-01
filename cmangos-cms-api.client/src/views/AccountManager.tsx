import React, { useState } from 'react';
import '../components/AppLayout.css';

const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: '', password: '', email: '' });
  const [creating, setCreating] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // TODO: Implement account creation via backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Account creation will be implemented with backend API integration');
      setShowCreateForm(false);
      setNewAccount({ username: '', password: '', email: '' });
    } catch (error) {
      console.error('Failed to create account:', error);
      alert('Failed to create account: ' + (error as Error).message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Account Manager</h1>
        <p className="view-subtitle">Create and manage game accounts</p>
      </div>

      {!showCreateForm ? (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="card-title" style={{ margin: 0 }}>Accounts</div>
              <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                + Create Account
              </button>
            </div>

            {accounts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#b89968' }}>
                <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.7 }}>No accounts configured</p>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Create your first game account to get started
                </p>
              </div>
            ) : (
              <div>
                {/* Account list will go here */}
                <p style={{ color: '#b89968' }}>Account list coming soon...</p>
              </div>
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
    </div>
  );
};

export default AccountManager;
