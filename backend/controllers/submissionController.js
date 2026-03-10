import { v4 as uuidv4 } from 'uuid';
import Submission from '../models/Submission.js';
import ContestRoom from '../models/ContestRoom.js';
import Question from '../models/Question.js';
import { isSubmissionValid, getTimeRemaining, getServerTime } from '../utils/timeAuthority.js';

/**
 * @desc    Join a contest as participant
 * @route   POST /api/contests/:roomCode/join
 * @access  Public
 */
export const joinContest = async (req, res, next) => {
    try {
        const { roomCode } = req.params;
        // Accept either participantName or name from body (normalize to string)
        const rawName = req.body?.participantName ?? req.body?.name;
        const participantName = typeof rawName === 'string' ? rawName.trim() : '';

        if (!participantName || participantName.length < 2) {
            return res.status(400).json({
                success: false,
                code: 'PARTICIPANT_NAME_INVALID',
                message: 'Participant name must be at least 2 characters'
            });
        }

        const contest = await ContestRoom.findOne({
            roomCode: (roomCode || '').toUpperCase()
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                code: 'CONTEST_NOT_FOUND',
                message: 'Contest not found'
            });
        }

        if (contest.status === 'draft') {
            return res.status(400).json({
                success: false,
                code: 'CONTEST_NOT_OPEN',
                message: 'Contest is not open yet'
            });
        }

        if (contest.status === 'completed') {
            return res.status(400).json({
                success: false,
                code: 'CONTEST_ENDED',
                message: 'Contest has ended'
            });
        }

        // Check participant limit
        if (contest.participantCount >= contest.maxParticipants) {
            return res.status(400).json({
                success: false,
                code: 'CONTEST_FULL',
                message: 'Contest is full'
            });
        }

        // Generate participant ID
        const participantId = uuidv4();

        // Create initial submission record
        const questions = await Question.find({ contestId: contest._id }).sort({ order: 1 });

        const submission = await Submission.create({
            contestId: contest._id,
            participantId,
            participantName,
            responses: questions.map(q => ({
                questionId: q._id,
                selectedOption: -1 // -1 means unanswered
            })),
            totalQuestions: questions.length
        });

        // Increment participant count
        await ContestRoom.findByIdAndUpdate(contest._id, {
            $inc: { participantCount: 1 }
        });

        // Return contest info and questions (without answers)
        const questionsForParticipant = questions.map(q => ({
            _id: q._id,
            prompt: q.prompt,
            options: q.options,
            points: q.points,
            order: q.order
        }));

        res.status(201).json({
            success: true,
            data: {
                participantId,
                contestId: contest._id,
                roomCode: contest.roomCode,
                title: contest.title,
                status: contest.status,
                duration: contest.duration,
                startTimestamp: contest.startTimestamp,
                endTimestamp: contest.endTimestamp,
                timeRemaining: contest.status === 'live' ? getTimeRemaining(contest.endTimestamp) : null,
                serverTime: getServerTime().toISOString(),
                questions: questionsForParticipant
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit answers
 * @route   POST /api/contests/:roomCode/submit
 * @access  Public (with participantId)
 */
export const submitAnswers = async (req, res, next) => {
    try {
        const { roomCode } = req.params;
        const { participantId, responses, isAutoSubmit } = req.body;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Participant ID is required'
            });
        }

        const contest = await ContestRoom.findOne({
            roomCode: roomCode.toUpperCase()
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Check if submission is valid (within time + grace period)
        if (!isSubmissionValid(contest)) {
            return res.status(400).json({
                success: false,
                message: 'Contest has ended, submission rejected'
            });
        }

        // Find existing submission
        const submission = await Submission.findOne({
            contestId: contest._id,
            participantId
        });

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission record not found'
            });
        }

        if (submission.submittedAt) {
            return res.status(400).json({
                success: false,
                message: 'Already submitted'
            });
        }

        // Get questions for scoring
        const questions = await Question.find({ contestId: contest._id });
        const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

        // Update responses and calculate score
        let score = 0;
        let correctAnswers = 0;

        submission.responses = submission.responses.map(existingResponse => {
            const newResponse = responses?.find(
                r => r.questionId === existingResponse.questionId.toString()
            );

            if (newResponse && newResponse.selectedOption >= 0) {
                const question = questionMap.get(existingResponse.questionId.toString());
                const isCorrect = question && newResponse.selectedOption === question.correctOption;

                if (isCorrect) {
                    score += question.points;
                    correctAnswers++;
                }

                return {
                    questionId: existingResponse.questionId,
                    selectedOption: newResponse.selectedOption,
                    answeredAt: new Date()
                };
            }
            return existingResponse;
        });

        submission.score = score;
        submission.correctAnswers = correctAnswers;
        submission.submittedAt = getServerTime();
        submission.isAutoSubmitted = isAutoSubmit || false;

        await submission.save();

        // Get rank
        const rank = await Submission.countDocuments({
            contestId: contest._id,
            submittedAt: { $ne: null },
            score: { $gt: score }
        }) + 1;

        res.json({
            success: true,
            data: {
                score,
                correctAnswers,
                totalQuestions: submission.totalQuestions,
                rank,
                isAutoSubmitted: submission.isAutoSubmitted
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get contest results/leaderboard
 * @route   GET /api/contests/:roomCode/results
 * @access  Public
 */
export const getResults = async (req, res, next) => {
    try {
        const { roomCode } = req.params;
        const { participantId } = req.query;

        const contest = await ContestRoom.findOne({
            roomCode: roomCode.toUpperCase()
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get leaderboard
        const leaderboard = await Submission.find({
            contestId: contest._id,
            submittedAt: { $ne: null }
        })
            .select('participantName score correctAnswers totalQuestions submittedAt')
            .sort({ score: -1, submittedAt: 1 })
            .limit(100);

        // Get participant's own result if participantId provided
        let myResult = null;
        if (participantId) {
            const mySubmission = await Submission.findOne({
                contestId: contest._id,
                participantId
            });

            if (mySubmission && mySubmission.submittedAt) {
                const rank = await Submission.countDocuments({
                    contestId: contest._id,
                    submittedAt: { $ne: null },
                    score: { $gt: mySubmission.score }
                }) + 1;

                myResult = {
                    score: mySubmission.score,
                    correctAnswers: mySubmission.correctAnswers,
                    totalQuestions: mySubmission.totalQuestions,
                    rank,
                    totalParticipants: await Submission.countDocuments({
                        contestId: contest._id,
                        submittedAt: { $ne: null }
                    })
                };
            }
        }

        res.json({
            success: true,
            data: {
                contest: {
                    title: contest.title,
                    status: contest.status,
                    participantCount: contest.participantCount
                },
                leaderboard,
                myResult
            }
        });
    } catch (error) {
        next(error);
    }
};
