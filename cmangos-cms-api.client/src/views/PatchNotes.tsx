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
  const [repoOwner] = useState(''); // TODO: Get from settings
  const [repoName] = useState(''); // TODO: Get from settings

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
    let formatted = body
      .replace(/^### (.*$)/gim, '<h3 class="release-heading">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="release-heading">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="release-heading">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive <li> elements in <ul> tags
    formatted = formatted.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
      return `<ul>${match}</ul>`;
    });
    
    return formatted.replace(/\n/g, '<br />');
  };

  const getPreviewText = (body: string) => {
    const plain = body
      .replace(/[#>*`\-\[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!plain) {
      return 'No description provided.';
    }
    return plain.length > 280 ? `${plain.slice(0, 280)}...` : plain;
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
        <h1 className="view-title">Changelogs</h1>
        <p className="view-subtitle">Latest updates and release notes from GitHub</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
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
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{
            color: '#f6eac8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '0.9rem'
          }}>
            Changelog Entries
          </div>

          {releases.map((release) => (
            <div
              key={release.id}
              style={{
                padding: '0.95rem 0',
                borderTop: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.4rem', gap: '0.8rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h2 style={{ color: '#e8d39b', margin: 0, fontSize: '1.18rem', lineHeight: 1.2 }}>
                      {release.name || release.tag_name}
                    </h2>
                    {release.prerelease && (
                      <span style={{
                        background: 'rgba(225, 191, 107, 0.16)',
                        color: '#e8d39b',
                        padding: '0.2rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        border: '1px solid rgba(225, 191, 107, 0.3)'
                      }}>
                        PRE-RELEASE
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#9faac0', fontSize: '0.82rem', marginTop: '0.18rem' }}>
                    {formatDate(release.published_at)}
                  </div>
                </div>
                <a
                  href={release.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.72rem', padding: '0.45rem 0.65rem' }}
                >
                  Open
                </a>
              </div>

              <p style={{ color: '#c7d3ea', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                {getPreviewText(release.body || '')}
              </p>

              <details style={{ marginTop: '0.55rem' }}>
                <summary style={{ color: '#9eb4dc', cursor: 'pointer', fontSize: '0.82rem' }}>View full notes</summary>
                <div
                  style={{
                    color: '#b8c5de',
                    lineHeight: '1.75',
                    fontSize: '0.88rem',
                    marginTop: '0.5rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: formatBody(release.body || 'No description provided.') }}
                />
              </details>
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
