# Spotify Full-Stack Web Platform

A full-stack Spotify clone featuring real-time audio streaming, album management, and an Artist Studio creator portal powered by an Express/MongoDB backend and a modern React/Vite frontend.

---

## Architecture Overview

```
000016-resources/
├── complete-backend/       # Express REST API, JWT auth, Multer, ImageKit, MongoDB
│   ├── server.js          # App entry point (port 3000)
│   ├── src/
│   │   ├── app.js         # Express setup, CORS, JSON/Cookie parsers, routes
│   │   ├── controllers/   # Auth & Music controllers
│   │   ├── middlewares/   # authUser & authArtist JWT middlewares
│   │   ├── models/        # User, Music, Album Mongoose schemas
│   │   └── services/      # ImageKit cloud media storage
├── frontend/               # React + Vite Spotify Web Player & Artist Studio
│   ├── src/
│   │   ├── api/api.js     # Unified API client with automatic token & proxy
│   │   ├── context/       # AuthContext & HTML5 PlayerContext
│   │   ├── components/    # Sidebar, Navbar, PlayerBar, Cards, AuthModal
│   │   ├── pages/         # HomeView, SearchView, AlbumsView, AlbumDetail, Studio
│   │   └── index.css      # Vanilla CSS Spotify dark design system
```

---

## Features

### 🎧 Web Player & Listening Experience
- **Interactive Audio Engine**: Real HTML5 audio streaming with play, pause, seek bar, duration tracking, volume slider, mute, repeat (off / all / one), and shuffle.
- **Dynamic Equalizer**: Animated sound wave visualizer bars displaying playback rhythm.
- **Liked Songs**: Save tracks to your library with instant heart toggles.
- **Albums & Tracklists**: Explore curated albums, view track numbers, artist metadata, and play entire albums with one click.
- **Search & Discovery**: Live filtering by title, artist, and genre category cards.

### 🎨 Artist Studio (Creator Portal)
- **Track Uploads (`POST /api/music/upload`)**: Select and publish `.mp3` / `.wav` audio files with track titles.
- **Album Builder (`POST /api/music/album`)**: Select multiple tracks from your catalog and release them as a new album.
- **Role Elevation**: Easily switch between Listener and Artist modes with 1-click test toggles.

### 🔐 Authentication
- **JWT & Cookie/Bearer Authentication**: Full support for both `HttpOnly` cookies and `Authorization: Bearer <token>`.
- **Role Permissions**: Seamless separation between regular listeners (`user`) and creator accounts (`artist`).
- **Instant Test Accounts**: "Test as Listener" and "Test as Artist" buttons for one-click testing without typing credentials.

---

## How to Run Locally

### 1. Run Frontend (Currently Active)
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 2. Run Backend
In a separate terminal:
```bash
cd complete-backend
npm install
```
Configure your `.env` file based on `.env.example`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spotify
JWT_SECRET=your_jwt_secret_key_here
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```
Then start the server:
```bash
npm run dev
# Or: npm start
```
The server will run on `http://localhost:3000`. The frontend Vite dev server includes a built-in proxy forwarding all `/api/*` requests to port 3000 automatically.
