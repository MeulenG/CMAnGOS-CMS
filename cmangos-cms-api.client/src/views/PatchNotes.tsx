import React, { useState, useEffect } from 'react';
import '../components/AppLayout.css';

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
}

const PatchNotes: React.FC = () => {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoOwner, setRepoOwner] = useState(''); // TODO: Get from settings
  const [repoName, setRepoName] = useState(''); // TODO: Get from settings

  useEffect(() => {
    loadPatchNotes();
  }, []);

  const loadPatchNotes = async () => {
    // TODO: Get repository from app settings
    // For now, using placeholder
    const owner = repoOwner || 'cmangos';
    const repo = repoName || 'mangos-classic';

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch releases: ${response.statusText}`);
      }

      const data = await response.json();
      setReleases(data.slice(0, 10)); // Show latest 10 releases
    } catch (err) {
      console.error('Failed to load patch notes:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatBody = (body: string) => {
    // Basic markdown to HTML conversion (simplified)
    return body
      .replace(/^### (.*$)/gim, '<h3 class="release-heading">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="release-heading">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="release-heading">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br />');
  };

  if (loading) {
    return (
      <div className="app-content">
        <div className="view-header">
          <h1 className="view-title">Patch Notes</h1>
          <p className="view-subtitle">Latest updates and changes</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#d4a234' }}>Loading patch notes from GitHub...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-content">
        <div className="view-header">
          <h1 className="view-title">Patch Notes</h1>
          <p className="view-subtitle">Latest updates and changes</p>
        </div>
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem', color: '#d4a234' }}>
            <h3 style={{ color: '#ff6666', marginBottom: '0.5rem' }}>Failed to Load Patch Notes</h3>
            <p style={{ color: '#b89968', marginBottom: '1.5rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={loadPatchNotes}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-content">
      <div className="view-header">
        <h1 className="view-title">Patch Notes</h1>
        <p className="view-subtitle">Latest updates and changes from GitHub</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={loadPatchNotes}>
          Refresh
        </button>
      </div>

      {releases.length === 0 ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '3rem', color: '#b89968' }}>
            <p style={{ fontSize: '1.1rem', opacity: 0.7 }}>No releases found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {releases.map((release) => (
            <div key={release.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ color: '#d4a234', margin: 0, fontSize: '1.5rem' }}>
                      {release.name || release.tag_name}
                    </h2>
                    {release.prerelease && (
                      <span style={{
                        background: 'rgba(212, 162, 52, 0.2)',
                        color: '#d4a234',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: '1px solid rgba(212, 162, 52, 0.3)'
                      }}>
                        PRE-RELEASE
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#b89968', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    {formatDate(release.published_at)}
                  </div>
                </div>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  View on GitHub →
                </a>
              </div>

              <div
                style={{
                  color: '#b89968',
                  lineHeight: '1.8',
                  fontSize: '0.95rem'
                }}
                dangerouslySetInnerHTML={{ __html: formatBody(release.body || 'No description provided.') }}
              />
            </div>
          ))}
        </div>
      )}

      <style>{`
        .release-heading {
          color: #d4a234;
          margin: 1.5rem 0 0.75rem;
        }
        .release-heading:first-child {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default PatchNotes;
