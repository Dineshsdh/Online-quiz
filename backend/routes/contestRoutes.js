import express from 'express';
import {
    createContest,
    getMyContests,
    getContestByCode,
    getContestById,
    openLobby,
    startContest,
    endContest,
    syncTime
} from '../controllers/contestController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (specific paths first; GET /:roomCode only matches GET, so POST /:roomCode/join is handled by submissionRoutes when mounted before this)
router.get('/time/sync', syncTime);
router.get('/:roomCode', getContestByCode);

// Protected routes (Host only)
router.post('/', protect, createContest);
router.get('/', protect, getMyContests);
router.get('/id/:id', protect, getContestById);
router.patch('/:id/lobby', protect, openLobby);
router.patch('/:id/start', protect, startContest);
router.patch('/:id/end', protect, endContest);

export default router;
