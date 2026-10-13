import React from 'react';
import { Sparkles, Play, Flame, Disc, Radio } from 'lucide-react';
import TrackCard from '../components/TrackCard';
import AlbumCard from '../components/AlbumCard';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeView({ tracks = [], albums = [], onSelectAlbum, setCurrentView }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const { isArtist, openAuth, user } = useAuth();
  const greeting = getGreeting();

  const quickTracks = tracks.slice(0, 6);
  const trendingTracks = tracks.slice(0, 8);
  const featuredAlbums = albums.slice(0, 6);

  return (
    <div>
      {/* Hero Welcome Banner */}
      <div className="hero-banner">
        <div>
          <h1 className="hero-greeting">{greeting}</h1>
          <p className="hero-subtitle">
            Welcome to the Spotify Web Player. Stream high-fidelity music, explore curated albums,
            or head to Artist Studio to upload your original creations.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            if (quickTracks[0]) playTrack(quickTracks[0], tracks);
          }}
          id="hero-play-trending-btn"
        >
          <Play size={18} fill="#000" color="#000" />
          <span>Quick Play</span>
        </button>
      </div>

      {/* Quick Access Cards */}
      <div className="quick-play-grid">
        {quickTracks.map((track, idx) => {
          const isThis = currentTrack?._id === track._id || currentTrack?.id === track.id;
          return (
            <div
              key={track._id || track.id || idx}
              className="quick-play-card"
              onClick={() => playTrack(track, tracks, idx)}
            >
              <img
                src={track.coverImg || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                alt={track.title}
                className="quick-play-thumb"
              />
              <div className="quick-play-content">
                <span className="quick-play-title">{track.title}</span>
                <button
                  className="quick-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThis) togglePlay();
                    else playTrack(track, tracks, idx);
                  }}
                  title="Play"
                >
                  <Play size={20} fill="#000" color="#000" style={{ marginLeft: 2 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Artist Studio Spotlight Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #3b0764 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 32px',
          marginBottom: 40,
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Sparkles size={20} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#c4b5fd' }}>
              Creator Hub
            </span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: '#fff' }}>
            Are you a Musician or Producer?
          </h2>
          <p style={{ fontSize: 14, color: '#cbd5e1' }}>
            Publish your tracks directly to the backend database and build albums.
          </p>
        </div>

        <button
          className="btn-secondary"
          style={{ borderColor: 'rgba(139, 92, 246, 0.5)', background: 'rgba(255, 255, 255, 0.1)' }}
          onClick={() => {
            if (!user) openAuth('register');
            else setCurrentView('studio');
          }}
          id="home-cta-studio-btn"
        >
          {isArtist ? 'Open Artist Studio' : 'Upload Track & Album'}
        </button>
      </div>

      {/* Trending Tracks Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <Flame size={22} color="var(--primary)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Trending Tracks
          </h2>
          <span className="section-link" onClick={() => setCurrentView('search')} style={{ cursor: 'pointer' }}>
            Show all
          </span>
        </div>

        <div className="cards-grid">
          {trendingTracks.map((track, idx) => (
            <TrackCard
              key={track._id || track.id || idx}
              track={track}
              queue={tracks}
              index={idx}
            />
          ))}
        </div>
      </section>

      {/* Featured Albums Section */}
      <section className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <Disc size={22} color="var(--accent-purple)" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
            Featured Albums
          </h2>
          <span className="section-link" onClick={() => setCurrentView('albums')} style={{ cursor: 'pointer' }}>
            Show all
          </span>
        </div>

        <div className="cards-grid">
          {featuredAlbums.map((album) => (
            <AlbumCard
              key={album._id || album.id}
              album={album}
              onSelect={onSelectAlbum}
              onPlayAlbum={() => onSelectAlbum(album._id || album.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
