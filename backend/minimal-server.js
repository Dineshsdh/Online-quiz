// Minimal server test - bypass all routes
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';

const log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    console.log(line);
    fs.appendFileSync('minimal-server.log', line + '\n');
};

// Clear previous log
fs.writeFileSync('minimal-server.log', '');

log('Starting minimal server...');

dotenv.config();
log('Loaded .env file');
log(`MONGODB_URI: ${process.env.MONGODB_URI ? 'SET (' + process.env.MONGODB_URI.substring(0, 30) + '...)' : 'MISSING'}`);
log(`PORT: ${process.env.PORT}`);

const app = express();

app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;

// Start without MongoDB first
app.listen(PORT, () => {
    log(`Server running on port ${PORT} (no DB connection)`);
    log('Test URL: http://localhost:' + PORT + '/test');
});

// Keep process alive for testing
process.on('uncaughtException', (err) => {
    log(`Uncaught Exception: ${err.message}`);
    log(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled Rejection: ${reason}`);
});
