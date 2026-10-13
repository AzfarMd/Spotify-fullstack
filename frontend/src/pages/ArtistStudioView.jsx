import React, { useState } from 'react';
import { UploadCloud, Disc, Plus, Check, Music, Sparkles, AlertCircle, Play } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

export default function ArtistStudioView({ tracks = [], onRefreshData }) {
  const { user, isArtist, switchRole } = useAuth();
  const { playTrack } = usePlayer();

  // Track upload form state
  const [trackTitle, setTrackTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [trackMessage, setTrackMessage] = useState(null);

  // Album creation form state
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [creatingAlbum, setCreatingAlbum] = useState(false);
  const [albumMessage, setAlbumMessage] = useState(null);

  // Handle Audio File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!trackTitle) {
        setTrackTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Upload track to backend (/api/music/upload)
  const handleUploadTrack = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setTrackMessage({ type: 'error', text: 'Please choose an audio file to upload.' });
      return;
    }

    setUploadingTrack(true);
    setTrackMessage(null);

    try {
      const createdTrack = await api.music.uploadMusic({
        title: trackTitle,
        file: audioFile,
      });

      setTrackMessage({
        type: 'success',
        text: `Track "${createdTrack.title}" published successfully!`,
      });

      setTrackTitle('');
      setAudioFile(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setTrackMessage({
        type: 'error',
        text: err.message || 'Failed to upload track to server.',
      });
    } finally {
      setUploadingTrack(false);
    }
  };

  // Toggle track selection for album creation
  const toggleTrackSelect = (id) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Create album in backend (/api/music/album)
  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (selectedTrackIds.length === 0) {
      setAlbumMessage({ type: 'error', text: 'Select at least one track for this album.' });
      return;
    }

    setCreatingAlbum(true);
    setAlbumMessage(null);

    try {
      const createdAlbum = await api.music.createAlbum({
        title: albumTitle,
        musics: selectedTrackIds,
      });

      setAlbumMessage({
        type: 'success',
        text: `Album "${createdAlbum.title}" created successfully with ${selectedTrackIds.length} tracks!`,
      });

      setAlbumTitle('');
      setSelectedTrackIds([]);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      setAlbumMessage({
        type: 'error',
        text: err.message || 'Failed to create album on server.',
      });
    } finally {
      setCreatingAlbum(false);
    }
  };

  return (
    <div>
      {/* Studio Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2e1065 0%, #172554 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: 32,
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                background: 'var(--primary)',
                color: '#000',
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                textTransform: 'uppercase',
              }}
            >
              Artist Studio
            </span>
            <span style={{ fontSize: 13, color: '#c4b5fd' }}>
              Connected Artist: <strong>{user?.username || 'Guest Artist'}</strong>
            </span>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
            Creator Studio & Release Hub
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: 14, maxWidth: '640px' }}>
            Upload new tracks to the backend audio storage, organize tracks into albums,
            and publish for listeners worldwide.
          </p>
        </div>

        {/* If user is not artist role, provide 1-click elevation */}
        {!isArtist && (
          <div style={{ textAlign: 'right' }}>
            <button
              className="btn-primary"
              onClick={() => switchRole('artist')}
              id="elevate-artist-btn"
            >
              <Sparkles size={16} />
              <span>Switch to Artist Role</span>
            </button>
          </div>
        )}
      </div>

      <div className="artist-dashboard-grid">
        {/* Panel 1: Upload Track (/api/music/upload) */}
        <div className="studio-card">
          <h2 className="studio-card-title">
            <UploadCloud size={24} color="var(--primary)" />
            <span>Upload New Music</span>
          </h2>
          <p className="studio-card-desc">
            Sends an audio file and title to <code>POST /api/music/upload</code>.
          </p>

          {trackMessage && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16,
                fontSize: 13,
                background:
                  trackMessage.type === 'success'
                    ? 'rgba(30, 215, 96, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${
                  trackMessage.type === 'success'
                    ? 'rgba(30, 215, 96, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                }`,
                color: trackMessage.type === 'success' ? '#86efac' : '#fca5a5',
              }}
            >
              {trackMessage.text}
            </div>
          )}

          <form onSubmit={handleUploadTrack}>
            <div className="form-group">
              <label className="form-label">Track Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Celestial Horizon"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                id="track-title-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Audio File (.mp3, .wav, .ogg, .m4a)</label>
              <label className={`file-dropzone ${audioFile ? 'has-file' : ''}`}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="track-file-input"
                />
                <Music size={32} color={audioFile ? 'var(--primary)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                {audioFile ? (
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                      {audioFile.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>
                      Click to choose an audio file
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Supports MP3, WAV, FLAC, M4A
                    </div>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '13px' }}
              disabled={uploadingTrack}
              id="upload-track-submit-btn"
            >
              {uploadingTrack ? 'Uploading to Server...' : 'Publish Track'}
            </button>
          </form>
        </div>

        {/* Panel 2: Create Album (/api/music/album) */}
        <div className="studio-card">
          <h2 className="studio-card-title">
            <Disc size={24} color="var(--accent-purple)" />
            <span>Create Album</span>
          </h2>
          <p className="studio-card-desc">
            Bundles tracks into a release via <code>POST /api/music/album</code>.
          </p>

          {albumMessage && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 16,
                fontSize: 13,
                background:
                  albumMessage.type === 'success'
                    ? 'rgba(30, 215, 96, 0.15)'
                    : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${
                  albumMessage.type === 'success'
                    ? 'rgba(30, 215, 96, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                }`,
                color: albumMessage.type === 'success' ? '#86efac' : '#fca5a5',
              }}
            >
              {albumMessage.text}
            </div>
          )}

          <form onSubmit={handleCreateAlbum}>
            <div className="form-group">
              <label className="form-label">Album Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Starlight Symphony"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
                id="album-title-input"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Select Tracks for this Album
                </label>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                  {selectedTrackIds.length} Selected
                </span>
              </div>

              {/* Track Checkbox Selector */}
              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  background: 'rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {tracks.map((track) => {
                  const id = track._id || track.id;
                  const isChecked = selectedTrackIds.includes(id);

                  return (
                    <div
                      key={id}
                      onClick={() => toggleTrackSelect(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: isChecked ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                        border: isChecked ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            border: `2px solid ${isChecked ? 'var(--accent-purple)' : 'var(--text-muted)'}`,
                            background: isChecked ? 'var(--accent-purple)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {track.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                        style={{ color: 'var(--text-muted)', padding: 4 }}
                        title="Preview audio"
                      >
                        <Play size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                background: 'var(--accent-purple)',
                color: '#fff',
              }}
              disabled={creatingAlbum}
              id="create-album-submit-btn"
            >
              {creatingAlbum ? 'Publishing Album...' : 'Create Album Release'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
