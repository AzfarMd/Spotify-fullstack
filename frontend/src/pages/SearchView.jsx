import React, { useState } from 'react';
import { Search as SearchIcon, Play, Pause, Heart, Clock } from 'lucide-react';
import { GENRES } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/TrackCard';
import AlbumCard from '../components/AlbumCard';

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function SearchView({
  tracks = [],
  albums = [],
  searchQuery,
  setSearchQuery,
  onSelectAlbum,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike } = usePlayer();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'songs' | 'albums'

  const query = searchQuery.toLowerCase().trim();

  const filteredTracks = tracks.filter((track) => {
    if (!query) return true;
    const titleMatch = track.title?.toLowerCase().includes(query);
    const artistMatch = (track.artist?.username || track.artist || '').toLowerCase().includes(query);
    const genreMatch = track.genre?.toLowerCase().includes(query);
    return titleMatch || artistMatch || genreMatch;
  });

  const filteredAlbums = albums.filter((album) => {
    if (!query) return true;
    const titleMatch = album.title?.toLowerCase().includes(query);
    const artistMatch = (album.artist?.username || album.artist || '').toLowerCase().includes(query);
    return titleMatch || artistMatch;
  });

  return (
    <div>
      {/* Search Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Search</h1>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 10 }}>
          {['all', 'songs', 'albums'].map((tab) => (
            <button
              key={tab}
              className="btn-secondary"
              style={{
                padding: '6px 16px',
                fontSize: 13,
                background: activeFilter === tab ? '#fff' : 'rgba(255, 255, 255, 0.08)',
                color: activeFilter === tab ? '#000' : '#fff',
                borderColor: activeFilter === tab ? '#fff' : 'var(--border-subtle)',
              }}
              onClick={() => setActiveFilter(tab)}
              id={`search-tab-${tab}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {query ? (
        /* Results Section */
        <div>
          {/* Top Result / Songs */}
          {(activeFilter === 'all' || activeFilter === 'songs') && filteredTracks.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Songs</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filteredTracks.slice(0, 6).map((track, idx) => {
                  const isCurrent = currentTrack?._id === track._id || currentTrack?.id === track.id;
                  const isThisPlaying = isCurrent && isPlaying;
                  const liked = isLiked(track._id || track.id);

                  return (
                    <div
                      key={track._id || track.id || idx}
                      className={`track-row ${isCurrent ? 'active' : ''}`}
                      onClick={() => {
                        if (isCurrent) togglePlay();
                        else playTrack(track, filteredTracks, idx);
                      }}
                    >
                      <div className="track-index-col">
                        <span className="track-number">{idx + 1}</span>
                        <div className="track-row-play-btn">
                          {isThisPlaying ? <Pause size={16} fill="#fff" /> : <Play size={16} fill="#fff" />}
                        </div>
                      </div>

                      <div className="track-main-col">
                        <img
                          src={track.coverImg || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'}
                          alt={track.title}
                          className="track-thumb-small"
                        />
                        <div className="track-meta">
                          <span className="track-title-text">{track.title}</span>
                          <span className="track-artist-text">
                            {track.artist?.username || track.artist || 'Artist'}
                          </span>
                        </div>
                      </div>

                      <div className="track-album-col">
                        {track.albumTitle || 'Single'}
                      </div>

                      <div className="track-duration-col">
                        {formatDuration(track.duration)}
                      </div>

                      <div className="track-action-col">
                        <button
                          className={`like-btn ${liked ? 'liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track._id || track.id);
                          }}
                        >
                          <Heart size={16} fill={liked ? 'var(--primary)' : 'none'} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {(activeFilter === 'all' || activeFilter === 'albums') && filteredAlbums.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Albums</h2>
              <div className="cards-grid">
                {filteredAlbums.map((album) => (
                  <AlbumCard
                    key={album._id || album.id}
                    album={album}
                    onSelect={onSelectAlbum}
                    onPlayAlbum={() => onSelectAlbum(album._id || album.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredTracks.length === 0 && filteredAlbums.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <SearchIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
              <h3>No results found for "{searchQuery}"</h3>
              <p style={{ fontSize: 14, marginTop: 8 }}>
                Please check your spelling, or try searching for another artist or song title.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Browse All Genres Section */
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 18 }}>Browse All</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 18,
            }}
          >
            {GENRES.map((genre) => (
              <div
                key={genre.name}
                style={{
                  background: genre.color,
                  borderRadius: 'var(--radius-md)',
                  padding: '20px 18px',
                  height: 120,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform var(--transition-fast)',
                }}
                onClick={() => setSearchQuery(genre.name)}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{genre.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
