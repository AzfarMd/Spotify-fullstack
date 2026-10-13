import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { INITIAL_TRACKS } from '../data/mockData';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0]?.duration || 180);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState(INITIAL_TRACKS);
  const [queueIndex, setQueueIndex] = useState(0);
  const [likedTrackIds, setLikedTrackIds] = useState(() => {
    try {
      const stored = localStorage.getItem('spotify_liked');
      return stored ? JSON.parse(stored) : ['track-1'];
    } catch {
      return ['track-1'];
    }
  });

  // Keep audio instance updated with volume & mute
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Sync liked tracks to storage
  useEffect(() => {
    localStorage.setItem('spotify_liked', JSON.stringify(likedTrackIds));
  }, [likedTrackIds]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      handleTrackEnded();
    };

    const onError = (e) => {
      console.warn('[Audio] Playback error or stream issue:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [queue, queueIndex, repeatMode, isShuffle]);

  // Handle song ending
  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
      setIsPlaying(true);
      return;
    }

    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }

    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    playTrack(queue[nextIdx], queue, nextIdx);
  };

  const playTrack = (track, newQueue = null, index = null) => {
    if (!track) return;

    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue);
      const idx = index !== null ? index : newQueue.findIndex((t) => (t._id === track._id || t.id === track.id));
      setQueueIndex(idx !== -1 ? idx : 0);
    } else if (index !== null) {
      setQueueIndex(index);
    } else {
      const idx = queue.findIndex((t) => (t._id === track._id || t.id === track.id));
      if (idx !== -1) {
        setQueueIndex(idx);
      }
    }

    setCurrentTrack(track);

    const audio = audioRef.current;
    const src = track.uri || track.url;

    if (src) {
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
        setIsPlaying(false);
      });
    } else {
      // If no valid audio URL, still simulate playing for UI feedback
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src && (currentTrack.uri || currentTrack.url)) {
        audio.src = currentTrack.uri || currentTrack.url;
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback resume issue:', err);
        setIsPlaying(true);
      });
    }
  };

  const seek = (timeInSeconds) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }
  };

  const setVolumeLevel = (newVolume) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const nextTrack = () => {
    if (!queue || queue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }
    playTrack(queue[nextIdx], queue, nextIdx);
  };

  const prevTrack = () => {
    if (!queue || queue.length === 0) return;
    // If more than 3 seconds into current track, restart it
    if (currentTime > 3) {
      seek(0);
      return;
    }
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    playTrack(queue[prevIdx], queue, prevIdx);
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    setRepeatMode(next);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleLike = (trackId) => {
    setLikedTrackIds((prev) => {
      if (prev.includes(trackId)) {
        return prev.filter((id) => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const isLiked = (trackId) => likedTrackIds.includes(trackId);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        playTrack,
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
