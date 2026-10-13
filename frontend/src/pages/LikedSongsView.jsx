import React from 'react';
import { Heart, Play, Pause, Clock } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '3:20';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function LikedSongsView({ allTracks = [] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay, isLiked, toggleLike } = usePlayer();

  const likedTracks = allTracks.filter((t) => isLiked(t._id || t.id));

  const isLikedQueuePlaying =
    isPlaying && likedTracks.some((t) => (t._id === currentTrack?._id || t.id === currentTrack?.id));

  const handlePlayLiked = () => {
    if (likedTracks.length === 0) return;
    if (isLikedQueuePlaying) {
      togglePlay();
    } else {
      playTrack(likedTracks[0], likedTracks, 0);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="album-header-banner">
        <div
          className="album-big-cover"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart size={80} fill="#fff" color="#fff" />
        </div>

        <div className="album-header-info">
          <span className="album-type-pill">Playlist</span>
          <h1 className="album-hero-title">Liked Songs</h1>
          <div className="album-meta-row">
            <span style={{ fontWeight: 700, color: '#fff' }}>Your Library</span>
            <span className="album-meta-dot" />
            <span>{likedTracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {likedTracks.length > 0 && (
        <div className="album-action-bar">
          <button
            className="album-play-hero-btn"
            onClick={handlePlayLiked}
            title={isLikedQueuePlaying ? 'Pause' : 'Play Liked Songs'}
            id="liked-hero-play-btn"
          >
            {isLikedQueuePlaying ? (
              <Pause size={24} fill="#000" color="#000" />
            ) : (
              <Play size={24} fill="#000" color="#000" style={{ marginLeft: 3 }} />
            )}
          </button>
        </div>
      )}

      {/* Track table */}
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '44px 3fr 2fr 1fr 50px',
            padding: '8px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
          }}
        >
          <span style={{ textAlign: 'center' }}>#</span>
          <span>Title</span>
          <span>Artist</span>
          <span style={{ textAlign: 'right' }}>
            <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </span>
          <span />
        </div>

        {likedTracks.map((track, idx) => {
          const isCurrent = currentTrack?._id === track._id || currentTrack?.id === track.id;
          const isThisPlaying = isCurrent && isPlaying;

          return (
            <div
              key={track._id || track.id || idx}
              className={`track-row ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playTrack(track, likedTracks, idx);
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

              <div className="track-album-col">{track.albumTitle || 'Single'}</div>
              <div className="track-duration-col">{formatDuration(track.duration)}</div>

              <div className="track-action-col">
                <button
                  className="like-btn liked"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track._id || track.id);
                  }}
                  title="Remove from Liked"
                >
                  <Heart size={16} fill="var(--primary)" />
                </button>
              </div>
            </div>
          );
        })}

        {likedTracks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <h3>No liked songs yet</h3>
            <p style={{ fontSize: 14, marginTop: 8 }}>
              Click the heart icon on any song to save it to your Liked Songs collection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
