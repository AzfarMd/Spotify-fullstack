import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    togglePlay,
    seek,
    setVolumeLevel,
    toggleMute,
    nextTrack,
    prevTrack,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    isLiked,
  } = usePlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeekClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, clickX / width));
    seek(ratio * duration);
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const ratio = Math.max(0, Math.min(1, clickX / width));
    setVolumeLevel(ratio);
  };

  const liked = isLiked(currentTrack._id || currentTrack.id);

  return (
    <footer className="player-bar">
      {/* Left: Track Details */}
      <div className="player-left">
        <img
          src={
            currentTrack.coverImg ||
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200'
          }
          alt={currentTrack.title}
          className="player-cover-art"
        />

        <div className="player-track-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="player-track-title">{currentTrack.title}</span>
            {isPlaying && (
              <div className="equalizer-anim" title="Playing">
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
                <div className="eq-bar" />
              </div>
            )}
          </div>
          <span className="player-track-artist">
            {currentTrack.artist?.username || currentTrack.artist || 'Unknown Artist'}
          </span>
        </div>

        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(currentTrack._id || currentTrack.id)}
          title={liked ? 'Remove from Liked' : 'Save to Liked'}
          id="player-like-btn"
        >
          <Heart size={18} fill={liked ? 'var(--primary)' : 'none'} />
        </button>
      </div>

      {/* Center: Playback Controls & Progress Scrubber */}
      <div className="player-center">
        <div className="player-controls">
          {/* Shuffle */}
          <button
            className={`ctrl-btn ${isShuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            id="player-shuffle-btn"
          >
            <Shuffle size={18} />
          </button>

          {/* Prev */}
          <button
            className="ctrl-btn"
            onClick={prevTrack}
            title="Previous track"
            id="player-prev-btn"
          >
            <SkipBack size={20} />
          </button>

          {/* Play / Pause */}
          <button
            className="ctrl-play-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            id="player-play-toggle-btn"
          >
            {isPlaying ? (
              <Pause size={20} fill="#000" color="#000" />
            ) : (
              <Play size={20} fill="#000" color="#000" style={{ marginLeft: 2 }} />
            )}
          </button>

          {/* Next */}
          <button
            className="ctrl-btn"
            onClick={nextTrack}
            title="Next track"
            id="player-next-btn"
          >
            <SkipForward size={20} />
          </button>

          {/* Repeat */}
          <button
            className={`ctrl-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode}`}
            id="player-repeat-btn"
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="player-progress-row">
          <span className="time-stamp">{formatTime(currentTime)}</span>
          <div className="progress-track" onClick={handleSeekClick} id="player-progress-bar">
            <div
              className="progress-filled"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="progress-thumb" />
            </div>
          </div>
          <span className="time-stamp">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra Utilities */}
      <div className="player-right">
        <div className="volume-container">
          <button
            className="ctrl-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            id="player-mute-btn"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <div
            className="volume-slider"
            onClick={handleVolumeClick}
            id="player-volume-slider"
          >
            <div
              className="volume-filled"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
