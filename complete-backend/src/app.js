const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');

const app = express();
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Spotify Backend API Server is running successfully!',
        version: '1.0.0',
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);


module.exports = app;