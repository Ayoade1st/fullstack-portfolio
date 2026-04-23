import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioApi, userApi } from '../services/api';

function PortfolioForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        techStack: typeof form.techStack === 'string'
          ? form.techStack.split(',').map((t) => t.trim()).filter(Boolean)
          : form.techStack,
      };
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const techDisplay = Array.isArray(form.techStack) ? form.techStack.join(', ') : form.techStack;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{initial ? 'Edit Project' : 'Add New Project'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="My Awesome Project" />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={3}
              style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="A short description of the project..."
            />
          </div>
          <div className="form-group">
            <label>Tech Stack (comma-separated)</label>
            <input name="techStack" value={techDisplay} onChange={handleChange} placeholder="React, Node.js, PostgreSQL" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GitHub URL</label>
              <input name="githubUrl" value={form.githubUrl || ''} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label>Live URL</label>
              <input name="liveUrl" value={form.liveUrl || ''} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input name="imageUrl" value={form.imageUrl || ''} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="featured" name="featured" checked={form.featured} onChange={handleChange} style={{ width: 'auto' }} />
            <label htmlFor="featured" style={{ margin: 0, cursor: 'pointer' }}>Featured project</label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={saving}>
              {saving ? 'Saving…' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, usersRes] = await Promise.all([
        portfolioApi.getMyItems(),
        isAdmin ? userApi.getAllUsers() : Promise.resolve({ data: [] }),
      ]);
      setItems(itemsRes.data);
      if (isAdmin) setAllUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (payload) => {
    await portfolioApi.create(payload);
    setShowForm(false);
    loadData();
  };

  const handleUpdate = async (payload) => {
    await portfolioApi.update(editItem.id, payload);
    setEditItem(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await portfolioApi.delete(id);
    loadData();
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await userApi.deleteUser(id);
    loadData();
  };

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div>
      {showForm && <PortfolioForm onSave={handleCreate} onCancel={() => setShowForm(false)} />}
      {editItem && (
        <PortfolioForm
          initial={{ ...editItem, techStack: editItem.techStack.join(', ') }}
          onSave={handleUpdate}
          onCancel={() => setEditItem(null)}
        />
      )}

      <div className="dashboard-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>Manage your portfolio projects and account settings.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <div className="stat-value">{items.length}</div>
        </div>
        <div className="stat-card">
          <h3>Featured</h3>
          <div className="stat-value">{items.filter((i) => i.featured).length}</div>
        </div>
        {isAdmin && (
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{allUsers.length}</div>
          </div>
        )}
      </div>

      <div className="page-header">
        <h1>My Projects</h1>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowForm(true)}>
          + Add Project
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No projects yet. Add your first project!</p>
        </div>
      ) : (
        <div className="portfolio-grid">
          {items.map((item) => (
            <div key={item.id} className="portfolio-card">
              {item.featured && <span className="featured-badge">⭐ Featured</span>}
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="tech-tags">
                {item.techStack.map((t) => <span key={t} className="tech-tag">{t}</span>)}
              </div>
              <div className="card-links">
                {item.githubUrl && <a href={item.githubUrl} target="_blank" rel="noopener noreferrer">GitHub →</a>}
                {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">Live →</a>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => setEditItem(item)}>Edit</button>
                <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && allUsers.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>All Users (Admin)</h2>
          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.id !== user.id && (
                        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }} onClick={() => handleDeleteUser(u.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
