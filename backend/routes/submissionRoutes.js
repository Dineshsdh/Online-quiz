import express from 'express';
import {
    joinContest,
    submitAnswers,
    getResults
} from '../controllers/submissionController.js';

const router = express.Router();

// All public routes (participant access)
router.post('/:roomCode/join', joinContest);
router.post('/:roomCode/submit', submitAnswers);
router.get('/:roomCode/results', getResults);

export default router;
