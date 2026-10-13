import React, { useEffect, useState } from 'react';
import { Play, Pause, Clock, Heart, ArrowLeft, Disc } from 'lucide-react';
import { api } from '../api/api';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return '3:15';
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function AlbumDetailView({ albumId, onBack }) {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { playTrack, currentTrack, isPlaying, togglePlay, isLiked, toggleLike } = usePlayer();

  useEffect(() => {
    let isMounted = true;
    async function loadAlbum() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.music.getAlbumById(albumId);
        if (isMounted) setAlbum(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load album');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (albumId) {
      loadAlbum();
    }
    return () => {
      isMounted = false;
    };
  }, [albumId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 16 }}>Loading album details...</div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div style={{ padding: '40px 0' }}>
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ color: '#f87171' }}>{error || 'Album not found'}</div>
      </div>
    );
  }

  const tracks = album.musics || [];
  const isThisAlbumPlaying =
    isPlaying && tracks.some((t) => (t._id === currentTrack?._id || t.id === currentTrack?.id));

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    if (isThisAlbumPlaying) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const totalDurationSeconds = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  return (
    <div>
      {/* Back button */}
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: 24, padding: '6px 14px', fontSize: 13 }}
        id="album-back-btn"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Album Banner */}
      <div className="album-header-banner">
        <img
          src={
            album.coverImg ||
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600'
          }
          alt={album.title}
          className="album-big-cover"
        />

        <div className="album-header-info">
          <span className="album-type-pill">Album</span>
          <h1 className="album-hero-title">{album.title}</h1>

          <div className="album-meta-row">
            <span style={{ fontWeight: 700, color: '#fff' }}>
              {album.artist?.username || 'Artist'}
            </span>
            <span className="album-meta-dot" />
            <span>{album.year || '2025'}</span>
            <span className="album-meta-dot" />
            <span>{tracks.length} songs, approx. {totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="album-action-bar">
        <button
          className="album-play-hero-btn"
          onClick={handlePlayAlbum}
          title={isThisAlbumPlaying ? 'Pause' : 'Play Album'}
          id="album-hero-play-btn"
        >
          {isThisAlbumPlaying ? (
            <Pause size={24} fill="#000" color="#000" />
          ) : (
            <Play size={24} fill="#000" color="#000" style={{ marginLeft: 3 }} />
          )}
        </button>
      </div>

      {/* Tracklist Table */}
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

        {tracks.map((track, idx) => {
          const isCurrent = currentTrack?._id === track._id || currentTrack?.id === track.id;
          const isThisPlaying = isCurrent && isPlaying;
          const liked = isLiked(track._id || track.id);

          return (
            <div
              key={track._id || track.id || idx}
              className={`track-row ${isCurrent ? 'active' : ''}`}
              onClick={() => {
                if (isCurrent) togglePlay();
                else playTrack(track, tracks, idx);
              }}
              id={`album-track-row-${idx}`}
            >
              <div className="track-index-col">
                <span className="track-number">{idx + 1}</span>
                <div className="track-row-play-btn">
                  {isThisPlaying ? (
                    <Pause size={16} fill="#fff" />
                  ) : (
                    <Play size={16} fill="#fff" />
                  )}
                </div>
              </div>

              <div className="track-main-col">
                <div className="track-meta">
                  <span className="track-title-text">{track.title}</span>
                </div>
              </div>

              <div className="track-album-col">
                {album.artist?.username || 'Artist'}
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
                  title={liked ? 'Remove like' : 'Save'}
                >
                  <Heart size={16} fill={liked ? 'var(--primary)' : 'none'} />
                </button>
              </div>
            </div>
          );
        })}

        {tracks.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tracks in this album yet.
          </div>
        )}
      </div>
    </div>
  );
}
