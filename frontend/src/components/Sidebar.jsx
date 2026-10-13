import React from 'react';
import { Home, Search, Disc3, Mic2, Heart, Plus, Music2, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentView, setCurrentView, albums = [] }) {
  const { isArtist, user, openAuth } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand-header">
        <div className="brand-icon-box">
          <Music2 size={24} strokeWidth={2.5} />
        </div>
        <span className="brand-title">Spotify</span>
      </div>

      {/* Main Nav Panel */}
      <nav className="sidebar-panel">
        <ul className="sidebar-nav-list">
          <li
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
            id="nav-home-btn"
          >
            <Home size={22} />
            <span>Home</span>
          </li>

          <li
            className={`nav-link ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentView('search')}
            id="nav-search-btn"
          >
            <Search size={22} />
            <span>Search</span>
          </li>

          <li
            className={`nav-link ${currentView === 'albums' ? 'active' : ''}`}
            onClick={() => setCurrentView('albums')}
            id="nav-albums-btn"
          >
            <Disc3 size={22} />
            <span>Albums</span>
          </li>

          <li
            className={`nav-link ${currentView === 'studio' ? 'active' : ''}`}
            onClick={() => {
              if (!user) {
                openAuth('login');
              } else {
                setCurrentView('studio');
              }
            }}
            id="nav-studio-btn"
          >
            <Mic2 size={22} />
            <span>Artist Studio</span>
            <span className="nav-tag">Creator</span>
          </li>
        </ul>
      </nav>

      {/* Library Panel */}
      <div className="sidebar-panel library-section">
        <div className="library-header">
          <span>Your Library</span>
        </div>

        <div className="library-items-scroll">
          {/* Liked Songs Quick Link */}
          <div
            className="library-item"
            onClick={() => setCurrentView('liked')}
            id="lib-liked-songs"
          >
            <div
              className="library-item-thumb"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              }}
            >
              <Heart size={20} fill="#fff" color="#fff" />
            </div>
            <div className="library-item-info">
              <span className="library-item-title">Liked Songs</span>
              <span className="library-item-sub">Auto Playlist</span>
            </div>
          </div>

          {/* Quick Album Shortcuts */}
          {albums.slice(0, 5).map((album) => (
            <div
              key={album._id || album.id}
              className="library-item"
              onClick={() => setCurrentView(`album-${album._id || album.id}`)}
              title={album.title}
            >
              <img
                src={album.coverImg || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                alt={album.title}
                className="library-item-thumb"
              />
              <div className="library-item-info">
                <span className="library-item-title">{album.title}</span>
                <span className="library-item-sub">
                  Album • {album.artist?.username || 'Artist'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
