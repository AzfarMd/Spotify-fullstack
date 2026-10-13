import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function TrackCard({ track, queue = null, index = null }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const isCurrent = (currentTrack?._id === track._id || currentTrack?.id === track.id);
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queue, index);
    }
  };

  return (
    <div
      className="music-card"
      onClick={() => {
        if (!isCurrent) playTrack(track, queue, index);
      }}
      id={`track-card-${track._id || track.id}`}
    >
      <div className="card-image-wrap">
        <img
          src={
            track.coverImg ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'
          }
          alt={track.title}
          className="card-image"
        />

        <button
          className="card-play-btn"
          style={{ opacity: isThisPlaying ? 1 : undefined, transform: isThisPlaying ? 'translateY(0)' : undefined }}
          onClick={handlePlayClick}
          title={isThisPlaying ? 'Pause' : 'Play'}
          id={`play-btn-${track._id || track.id}`}
        >
          {isThisPlaying ? (
            <Pause size={22} fill="#000" color="#000" />
          ) : (
            <Play size={22} fill="#000" color="#000" style={{ marginLeft: 2 }} />
          )}
        </button>
      </div>

      <div className="card-info">
        <span
          className="card-title"
          style={{ color: isCurrent ? 'var(--primary)' : undefined }}
        >
          {track.title}
        </span>
        <span className="card-subtitle">
          {track.artist?.username || track.artist || 'Artist'}
        </span>
      </div>
    </div>
  );
}
