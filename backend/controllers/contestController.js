import ContestRoom from '../models/ContestRoom.js';
import Question from '../models/Question.js';
import generateRoomCode from '../utils/generateRoomCode.js';
import { getServerTime } from '../utils/timeAuthority.js';

/**
 * @desc    Create a new contest room
 * @route   POST /api/contests
 * @access  Private (Host)
 */
export const createContest = async (req, res, next) => {
    try {
        const { title, description, duration, maxParticipants } = req.body;

        // Generate unique room code
        let roomCode;
        let isUnique = false;
        while (!isUnique) {
            roomCode = generateRoomCode();
            const existing = await ContestRoom.findOne({ roomCode });
            if (!existing) isUnique = true;
        }

        const contest = await ContestRoom.create({
            roomCode,
            hostId: req.user._id,
            title,
            description,
            duration,
            maxParticipants: maxParticipants || 100,
            status: 'draft'
        });

        res.status(201).json({
            success: true,
            data: contest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all contests for current host
 * @route   GET /api/contests
 * @access  Private (Host)
 */
export const getMyContests = async (req, res, next) => {
    try {
        const contests = await ContestRoom.find({ hostId: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: contests.length,
            data: contests
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get contest by room code (public for participants)
 * @route   GET /api/contests/:roomCode
 * @access  Public
 */
export const getContestByCode = async (req, res, next) => {
    try {
        const { roomCode } = req.params;

        const contest = await ContestRoom.findOne({
            roomCode: roomCode.toUpperCase()
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        // Get question count
        const questionCount = await Question.countDocuments({ contestId: contest._id });

        res.json({
            success: true,
            data: {
                ...contest.toObject(),
                questionCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get contest by ID (for host management)
 * @route   GET /api/contests/id/:id
 * @access  Private (Host)
 */
export const getContestById = async (req, res, next) => {
    try {
        const contest = await ContestRoom.findOne({
            _id: req.params.id,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        const questionCount = await Question.countDocuments({ contestId: contest._id });

        res.json({
            success: true,
            data: {
                ...contest.toObject(),
                questionCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Open contest lobby
 * @route   PATCH /api/contests/:id/lobby
 * @access  Private (Host)
 */
export const openLobby = async (req, res, next) => {
    try {
        const contest = await ContestRoom.findOne({
            _id: req.params.id,
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
                message: 'Contest can only be opened from draft status'
            });
        }

        // Check if questions exist
        const questionCount = await Question.countDocuments({ contestId: contest._id });
        if (questionCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot open lobby without questions'
            });
        }

        contest.status = 'lobby';
        await contest.save();

        res.json({
            success: true,
            data: contest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Start contest
 * @route   PATCH /api/contests/:id/start
 * @access  Private (Host)
 */
export const startContest = async (req, res, next) => {
    try {
        const contest = await ContestRoom.findOne({
            _id: req.params.id,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        if (contest.status !== 'lobby') {
            return res.status(400).json({
                success: false,
                message: 'Contest must be in lobby status to start'
            });
        }

        const now = getServerTime();
        const endTime = new Date(now.getTime() + (contest.duration * 1000));

        contest.status = 'live';
        contest.startTimestamp = now;
        contest.endTimestamp = endTime;
        await contest.save();

        res.json({
            success: true,
            data: contest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    End contest (force end)
 * @route   PATCH /api/contests/:id/end
 * @access  Private (Host)
 */
export const endContest = async (req, res, next) => {
    try {
        const contest = await ContestRoom.findOne({
            _id: req.params.id,
            hostId: req.user._id
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: 'Contest not found'
            });
        }

        if (contest.status !== 'live') {
            return res.status(400).json({
                success: false,
                message: 'Contest is not live'
            });
        }

        contest.status = 'completed';
        contest.endTimestamp = getServerTime();
        await contest.save();

        res.json({
            success: true,
            data: contest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get server time for sync
 * @route   GET /api/time/sync
 * @access  Public
 */
export const syncTime = async (req, res) => {
    res.json({
        success: true,
        serverTime: getServerTime().toISOString(),
        timestamp: Date.now()
    });
};
