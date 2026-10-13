import React, { useState } from 'react';
import { X, Headphones, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { authModalOpen, authMode, closeAuth, login, register, openAuth } = useAuth();

  const [mode, setMode] = useState(authMode || 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'artist'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    setMode(authMode);
    setError('');
  }, [authMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login({
          username: username.trim(),
          email: email.trim(),
          password,
        });
      } else {
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          role,
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoRole) => {
    setSubmitting(true);
    setError('');
    try {
      await register({
        username: demoRole === 'artist' ? `Artist_${Math.floor(Math.random() * 900 + 100)}` : `Listener_${Math.floor(Math.random() * 900 + 100)}`,
        email: `${demoRole}${Date.now()}@spotify.demo`,
        password: 'password123',
        role: demoRole,
      });
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuth}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeAuth} id="auth-modal-close-btn">
          <X size={22} />
        </button>

        {/* Header Tabs */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#fff' }}>
            {mode === 'login' ? 'Log in to Spotify' : 'Sign up to start listening'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <span
              style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? 'Sign up free' : 'Log in here'}
            </span>
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              {/* Role Picker */}
              <label className="form-label">I want to join as</label>
              <div className="role-selector">
                <div
                  className={`role-card ${role === 'user' ? 'active' : ''}`}
                  onClick={() => setRole('user')}
                  id="role-select-listener"
                >
                  <Headphones size={22} color={role === 'user' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                  <div className="role-card-title">Listener</div>
                  <div className="role-card-desc">Stream unlimited tracks & albums</div>
                </div>

                <div
                  className={`role-card ${role === 'artist' ? 'active' : ''}`}
                  onClick={() => setRole('artist')}
                  id="role-select-artist"
                >
                  <Sparkles size={22} color={role === 'artist' ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 6px' }} />
                  <div className="role-card-title">Artist</div>
                  <div className="role-card-desc">Upload tracks & release albums</div>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. alexmusic"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id="auth-input-username"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="auth-input-email"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="auth-input-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }}
            disabled={submitting}
            id="auth-submit-btn"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Instant Testing (No setup needed):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '8px 12px' }}
              onClick={() => handleDemoLogin('user')}
              id="demo-listener-btn"
            >
              Test as Listener
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: 12, padding: '8px 12px', borderColor: 'rgba(139, 92, 246, 0.4)' }}
              onClick={() => handleDemoLogin('artist')}
              id="demo-artist-btn"
            >
              Test as Artist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
