const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security headers ──
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://api.fontsource.org"],
            fontSrc: ["'self'", "https://api.fontsource.org"],
            imgSrc: ["'self'", "data:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
}));

// ── Serve static files from /public only ──
app.use(express.static(path.join(__dirname, 'public')));

// ── Fallback: serve 404.html for unknown routes ──
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
