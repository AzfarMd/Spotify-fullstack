import React from 'react';
import { Disc3 } from 'lucide-react';
import AlbumCard from '../components/AlbumCard';

export default function AlbumsView({ albums = [], onSelectAlbum }) {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Disc3 size={32} color="var(--primary)" />
          Albums Collection
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Discover full-length studio releases, EPs, and creator compilations.
        </p>
      </div>

      <div className="cards-grid">
        {albums.map((album) => (
          <AlbumCard
            key={album._id || album.id}
            album={album}
            onSelect={onSelectAlbum}
            onPlayAlbum={() => onSelectAlbum(album._id || album.id)}
          />
        ))}
      </div>

      {albums.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <h3>No albums found</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>
            Create the first album using the Artist Studio!
          </p>
        </div>
      )}
    </div>
  );
}
