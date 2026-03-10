import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import contestRoutes from './routes/contestRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';

// Load env vars
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parser
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Think Clash API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
app.use('/api/auth', authRoutes);
// IMPORTANT: submissionRoutes must come BEFORE contestRoutes so that
// POST /api/contests/:roomCode/join, /submit, GET /results match here.
// contestRoutes only has GET /:roomCode (same path, different method).
app.use('/api/contests', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api', questionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after DB connection
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`
╔════════════════════════════════════════╗
║     Think Clash Backend Running        ║
║     Port: ${PORT}                          ║
║     Mode: ${process.env.NODE_ENV || 'development'}                 ║
╚════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
