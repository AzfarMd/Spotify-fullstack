import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { api } from './api/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import PlayerBar from './components/PlayerBar';
import AuthModal from './components/AuthModal';

import HomeView from './pages/HomeView';
import SearchView from './pages/SearchView';
import AlbumsView from './pages/AlbumsView';
import AlbumDetailView from './pages/AlbumDetailView';
import ArtistStudioView from './pages/ArtistStudioView';
import LikedSongsView from './pages/LikedSongsView';

function SpotifyApp() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // History stack for navigation arrows
  const [history, setHistory] = useState(['home']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Load musics and albums
  const loadData = useCallback(async () => {
    try {
      const [fetchedTracks, fetchedAlbums] = await Promise.all([
        api.music.getAllMusics(),
        api.music.getAllAlbums(),
      ]);
      setTracks(fetchedTracks);
      setAlbums(fetchedAlbums);
    } catch (err) {
      console.warn('Data fetching error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigate to view with history
  const navigateTo = (view) => {
    if (view === currentView) return;
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(view);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentView(view);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      setCurrentView(history[prev]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setCurrentView(history[next]);
    }
  };

  const handleSelectAlbum = (albumId) => {
    navigateTo(`album-${albumId}`);
  };

  // Render current view
  const renderView = () => {
    if (currentView.startsWith('album-')) {
      const albumId = currentView.replace('album-', '');
      return (
        <AlbumDetailView
          albumId={albumId}
          onBack={goBack}
        />
      );
    }

    switch (currentView) {
      case 'search':
        return (
          <SearchView
            tracks={tracks}
            albums={albums}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'albums':
        return (
          <AlbumsView
            albums={albums}
            onSelectAlbum={handleSelectAlbum}
          />
        );
      case 'studio':
        return (
          <ArtistStudioView
            tracks={tracks}
            onRefreshData={loadData}
          />
        );
      case 'liked':
        return (
          <LikedSongsView
            allTracks={tracks}
          />
        );
      case 'home':
      default:
        return (
          <HomeView
            tracks={tracks}
            albums={albums}
            onSelectAlbum={handleSelectAlbum}
            setCurrentView={navigateTo}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={navigateTo}
        albums={albums}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar
          currentView={currentView}
          setCurrentView={navigateTo}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          goBack={goBack}
          goForward={goForward}
          canGoBack={historyIndex > 0}
          canGoForward={historyIndex < history.length - 1}
        />

        <main className="main-content">
          {renderView()}
        </main>
      </div>

      {/* Bottom Sticky Player */}
      <PlayerBar />

      {/* Login & Register Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <SpotifyApp />
      </PlayerProvider>
    </AuthProvider>
  );
}
