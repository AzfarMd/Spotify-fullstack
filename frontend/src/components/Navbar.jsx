import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, User, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  goBack,
  goForward,
  canGoBack,
  canGoForward,
}) {
  const { user, isAuthenticated, isArtist, logout, openAuth, switchRole, backendOnline } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="top-navbar">
      {/* Navigation history & search */}
      <div className="nav-controls">
        <button
          className="nav-arrow-btn"
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          className="nav-arrow-btn"
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <ChevronRight size={20} />
        </button>

        {/* Search input in navbar */}
        <div className="nav-search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            className="nav-search-input"
            placeholder="What do you want to play?"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search') {
                setCurrentView('search');
              }
            }}
            onFocus={() => {
              if (currentView !== 'search') setCurrentView('search');
            }}
            id="global-search-input"
          />
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="nav-actions">
        {/* Backend Connectivity Status */}
        <div
          className="status-pill"
          title={
            backendOnline
              ? 'Connected to Express backend (localhost:3000)'
              : 'Express backend currently offline. Playing with instant local audio streams.'
          }
        >
          <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
          <span>{backendOnline ? 'API Connected' : 'Offline / Standalone'}</span>
        </div>

        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              className="user-menu-trigger"
              onClick={() => setMenuOpen(!menuOpen)}
              id="user-profile-menu-btn"
            >
              <div className="user-avatar">
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {user.username || 'User'}
              </span>
              <span className={`user-badge-role ${isArtist ? 'artist' : 'user'}`}>
                {isArtist ? 'Artist' : 'Listener'}
              </span>
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: 220,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hover)',
                  borderRadius: 'var(--radius-md)',
                  padding: 8,
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{user.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                </div>

                {/* Role Switcher for seamless testing */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    width: '100%',
                    background: 'transparent',
                  }}
                  onClick={() => {
                    switchRole(isArtist ? 'user' : 'artist');
                    setMenuOpen(false);
                  }}
                >
                  <Sparkles size={16} color="var(--primary)" />
                  <span>Switch to {isArtist ? 'Listener' : 'Artist'}</span>
                </button>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    color: '#f87171',
                    textAlign: 'left',
                    width: '100%',
                    background: 'transparent',
                  }}
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn-secondary"
              onClick={() => openAuth('register')}
              id="signup-btn"
            >
              Sign up
            </button>
            <button
              className="btn-primary"
              onClick={() => openAuth('login')}
              id="login-btn"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
