import Question from '../models/Question.js';
import ContestRoom from '../models/ContestRoom.js';

/**
 * @desc    Add questions to a contest (bulk)
 * @route   POST /api/contests/:id/questions
 * @access  Private (Host)
 */
export const addQuestions = async (req, res, next) => {
    try {
        const { questions } = req.body;
        const contestId = req.params.id;

        // Verify contest ownership
        const contest = await ContestRoom.findOne({
            _id: contestId,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        if (contest.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot add questions after contest is opened'
            });
        }

        // Get current max order
        const lastQuestion = await Question.findOne({ contestId })
            .sort({ order: -1 });
        let currentOrder = lastQuestion ? lastQuestion.order + 1 : 1;

        // Create questions
        const questionsToCreate = questions.map((q, index) => ({
            contestId,
            prompt: q.prompt,
            options: q.options,
            correctOption: q.correctOption,
            points: q.points || 10,
            order: currentOrder + index
        }));

        const createdQuestions = await Question.insertMany(questionsToCreate);

        res.status(201).json({
            success: true,
            count: createdQuestions.length,
            data: createdQuestions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get questions for a contest
 * @route   GET /api/contests/:id/questions
 * @access  Mixed (Host sees answers, participants don't)
 */
export const getQuestions = async (req, res, next) => {
    try {
        const contestId = req.params.id;
        const includeAnswers = req.query.includeAnswers === 'true';

        const contest = await ContestRoom.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Only host can see answers
        const isHost = req.user && req.user._id.toString() === contest.hostId.toString();

        let questions = await Question.find({ contestId }).sort({ order: 1 });

        // Strip answers if not host or if contest is live and includeAnswers is false
        if (!isHost && !includeAnswers) {
            questions = questions.map(q => ({
                _id: q._id,
                prompt: q.prompt,
                options: q.options,
                points: q.points,
                order: q.order
            }));
        }

        res.json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private (Host)
 */
export const deleteQuestion = async (req, res, next) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Question not found'
            });
        }

        // Verify contest ownership
        const contest = await ContestRoom.findOne({
            _id: question.contestId,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
        }

        if (contest.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete questions after contest is opened'
            });
        }

        await question.deleteOne();

        res.json({
            success: true,
            message: 'Question deleted'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Clear all questions for a contest
 * @route   DELETE /api/contests/:id/questions
 * @access  Private (Host)
 */
export const clearQuestions = async (req, res, next) => {
    try {
        const contestId = req.params.id;

        // Verify contest ownership
        const contest = await ContestRoom.findOne({
            _id: contestId,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        if (contest.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Cannot clear questions after contest is opened'
            });
        }

        await Question.deleteMany({ contestId });

        res.json({
            success: true,
            message: 'All questions cleared'
        });
    } catch (error) {
        next(error);
    }
};
