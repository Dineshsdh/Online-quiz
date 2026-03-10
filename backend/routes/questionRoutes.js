import express from 'express';
import {
    addQuestions,
    getQuestions,
    deleteQuestion,
    clearQuestions
} from '../controllers/questionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Contest question routes
router.post('/contests/:id/questions', protect, addQuestions);
router.get('/contests/:id/questions', getQuestions);
router.delete('/contests/:id/questions', protect, clearQuestions);
router.delete('/questions/:id', protect, deleteQuestion);

export default router;
