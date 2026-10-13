import React from 'react';
import { Play } from 'lucide-react';

export default function AlbumCard({ album, onSelect, onPlayAlbum }) {
  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onPlayAlbum) onPlayAlbum(album);
  };

  return (
    <div
      className="music-card"
      onClick={() => onSelect(album._id || album.id)}
      id={`album-card-${album._id || album.id}`}
    >
      <div className="card-image-wrap">
        <img
          src={
            album.coverImg ||
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'
          }
          alt={album.title}
          className="card-image"
        />

        <button
          className="card-play-btn"
          onClick={handlePlayClick}
          title={`Play ${album.title}`}
          id={`play-album-${album._id || album.id}`}
        >
          <Play size={22} fill="#000" color="#000" style={{ marginLeft: 2 }} />
        </button>
      </div>

      <div className="card-info">
        <span className="card-title">{album.title}</span>
        <span className="card-subtitle">
          Album • {album.artist?.username || 'Artist'} {album.year ? `• ${album.year}` : ''}
        </span>
      </div>
    </div>
  );
}
