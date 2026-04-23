import { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';

function Portfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    portfolioApi.getAll()
      .then(({ data }) => setItems(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.techStack.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Portfolio Projects</h1>
        <input
          type="text"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.9rem', width: '220px' }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>
      ) : (
        <div className="portfolio-grid">
          {filtered.map((item) => (
            <div key={item.id} className="portfolio-card">
              {item.featured && <span className="featured-badge">⭐ Featured</span>}
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.75rem' }}
                />
              )}
              <h3>{item.title}</h3>
              <p style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                by {item.user?.name}
              </p>
              <p>{item.description}</p>
              <div className="tech-tags">
                {item.techStack.map((t) => <span key={t} className="tech-tag">{t}</span>)}
              </div>
              <div className="card-links">
                {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noopener noreferrer">GitHub →</a>}
                {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">Live Demo →</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Portfolio;
