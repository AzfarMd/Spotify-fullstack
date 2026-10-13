import { INITIAL_TRACKS, INITIAL_ALBUMS } from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '';

// Local storage keys
const TOKEN_KEY = 'spotify_token';
const USER_KEY = 'spotify_user';
const CUSTOM_TRACKS_KEY = 'spotify_custom_tracks';
const CUSTOM_ALBUMS_KEY = 'spotify_custom_albums';

// Helper to get auth token
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

// Custom tracks & albums stored locally for fallback/demo
export function getCustomTracks() {
  try {
    const raw = localStorage.getItem(CUSTOM_TRACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTrack(track) {
  const existing = getCustomTracks();
  const updated = [track, ...existing];
  localStorage.setItem(CUSTOM_TRACKS_KEY, JSON.stringify(updated));
  return updated;
}

export function getCustomAlbums() {
  try {
    const raw = localStorage.getItem(CUSTOM_ALBUMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomAlbum(album) {
  const existing = getCustomAlbums();
  const updated = [album, ...existing];
  localStorage.setItem(CUSTOM_ALBUMS_KEY, JSON.stringify(updated));
  return updated;
}

// Universal fetch wrapper
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type if FormData is used
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // sends cookies
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (typeof data === 'object' && data?.message) ? data.message : `HTTP error: ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

function getMockUsers() {
  try {
    const raw = localStorage.getItem('spotify_mock_users_db');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMockUser(userRecord) {
  const users = getMockUsers();
  const existingIdx = users.findIndex(
    (u) =>
      (userRecord.username && u.username?.toLowerCase() === userRecord.username.toLowerCase()) ||
      (userRecord.email && u.email?.toLowerCase() === userRecord.email.toLowerCase())
  );
  if (existingIdx !== -1) {
    users[existingIdx] = { ...users[existingIdx], ...userRecord };
  } else {
    users.push(userRecord);
  }
  localStorage.setItem('spotify_mock_users_db', JSON.stringify(users));
}

export const api = {
  // Auth API
  auth: {
    async register({ username, email, password, role = 'user' }) {
      try {
        const res = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password, role }),
        });
        if (res.token) setToken(res.token);
        if (res.user) setStoredUser(res.user);
        return { success: true, user: res.user, token: res.token };
      } catch (err) {
        // Propagate backend errors (e.g. 409 User already exists, 400 Bad Request)
        if (err.status) {
          throw err;
        }
        // Offline / network failure fallback
        console.warn('[API] Network offline, saving to local store:', err.message);
        const users = getMockUsers();
        if (users.some((u) => u.username?.toLowerCase() === username.toLowerCase())) {
          throw new Error('User already exists');
        }
        const mockUser = {
          id: `usr_${Date.now()}`,
          username: username.trim(),
          email: (email || `${username}@spotify.demo`).trim(),
          password,
          role: role || 'user',
        };
        saveMockUser(mockUser);
        const mockToken = `jwt_mock_${Date.now()}`;
        setToken(mockToken);
        setStoredUser(mockUser);
        return { success: true, user: mockUser, token: mockToken, isMock: true };
      }
    },

    async login({ username, email, password }) {
      try {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });
        if (res.token) setToken(res.token);
        if (res.user) setStoredUser(res.user);
        return { success: true, user: res.user, token: res.token };
      } catch (err) {
        // If server returned 401 or any standard auth error, strictly reject!
        if (err.status === 401 || err.status === 400) {
          throw new Error(err.message || 'Invalid credentials');
        }
        if (err.status && err.status !== 502 && err.status !== 503 && err.status !== 504) {
          throw err;
        }

        // Offline / network fallback: STRICT password verification
        console.warn('[API] Checking local user database');
        const users = getMockUsers();
        const searchVal = (username || email || '').toLowerCase().trim();
        const matched = users.find(
          (u) =>
            u.username?.toLowerCase() === searchVal ||
            u.email?.toLowerCase() === searchVal
        );

        if (!matched) {
          throw new Error('Invalid credentials: user not found');
        }

        if (matched.password && matched.password !== password) {
          throw new Error('Invalid credentials: wrong password');
        }

        const mockToken = `jwt_mock_${Date.now()}`;
        setToken(mockToken);
        setStoredUser(matched);
        return { success: true, user: matched, token: mockToken, isMock: true };
      }
    },

    async logout() {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.warn('Backend logout notice (safe):', err);
      } finally {
        setToken(null);
        setStoredUser(null);
      }
      return { success: true };
    },
  },

  // Music API
  music: {
    async getAllMusics() {
      try {
        const res = await apiFetch('/api/music/');
        const serverMusics = res.musics || [];
        // Combine server musics with custom tracks and starter tracks
        const custom = getCustomTracks();
        return [...serverMusics, ...custom, ...INITIAL_TRACKS];
      } catch (err) {
        // Fallback to custom and initial tracks
        const custom = getCustomTracks();
        return [...custom, ...INITIAL_TRACKS];
      }
    },

    async getAllAlbums() {
      try {
        const res = await apiFetch('/api/music/albums');
        const serverAlbums = res.albums || [];
        const custom = getCustomAlbums();
        return [...serverAlbums, ...custom, ...INITIAL_ALBUMS];
      } catch (err) {
        const custom = getCustomAlbums();
        return [...custom, ...INITIAL_ALBUMS];
      }
    },

    async getAlbumById(albumId) {
      try {
        const res = await apiFetch(`/api/music/albums/${albumId}`);
        return res.album;
      } catch (err) {
        // Look up in custom or initial albums
        const all = [...getCustomAlbums(), ...INITIAL_ALBUMS];
        const found = all.find((a) => (a._id === albumId || a.id === albumId));
        if (found) {
          // Resolve track objects if musics are IDs
          const allTracks = [...getCustomTracks(), ...INITIAL_TRACKS];
          const resolvedTracks = (found.musics || []).map((m) => {
            if (typeof m === 'object' && m !== null) return m;
            return allTracks.find((t) => t._id === m || t.id === m) || {
              _id: m,
              title: 'Unknown Track',
              uri: '',
            };
          });
          return { ...found, musics: resolvedTracks };
        }
        throw new Error('Album not found');
      }
    },

    async uploadMusic({ title, file }) {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('music', file);

      try {
        const res = await apiFetch('/api/music/upload', {
          method: 'POST',
          body: formData,
        });
        return res.music;
      } catch (err) {
        // If offline or storage error, save locally with object URL so artist can play immediately!
        console.warn('[API] Upload to server failed or backend offline. Saving track locally.', err);
        const currentUser = getStoredUser() || { username: 'Current Artist', email: 'artist@demo.com', id: 'artist-local' };
        const localUri = URL.createObjectURL(file);
        const newTrack = {
          _id: `trk_${Date.now()}`,
          id: `trk_${Date.now()}`,
          title: title || file.name.replace(/\.[^/.]+$/, ""),
          uri: localUri,
          artist: {
            _id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
          },
          coverColor: 'linear-gradient(135deg, #10b981 0%, #1e3a8a 100%)',
          coverImg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
          duration: 200,
        };
        saveCustomTrack(newTrack);
        return newTrack;
      }
    },

    async createAlbum({ title, musics }) {
      try {
        const res = await apiFetch('/api/music/album', {
          method: 'POST',
          body: JSON.stringify({ title, musics }),
        });
        return res.album;
      } catch (err) {
        console.warn('[API] Create album on server failed. Saving album locally.', err);
        const currentUser = getStoredUser() || { username: 'Current Artist', email: 'artist@demo.com', id: 'artist-local' };
        const newAlbum = {
          _id: `alb_${Date.now()}`,
          id: `alb_${Date.now()}`,
          title,
          artist: {
            _id: currentUser.id || currentUser._id,
            username: currentUser.username,
            email: currentUser.email,
          },
          musics: musics || [],
          coverColor: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          coverImg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=70',
          year: new Date().getFullYear().toString(),
        };
        saveCustomAlbum(newAlbum);
        return newAlbum;
      }
    },

    async checkHealth() {
      try {
        const res = await fetch(`${BASE_URL}/api/music/`, { method: 'GET' });
        // 401 means server is running and route exists!
        return res.status === 401 || res.status === 200;
      } catch {
        return false;
      }
    }
  },
};
