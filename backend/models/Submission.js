import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    selectedOption: {
        type: Number,
        min: -1, // -1 means unanswered
        max: 3
    },
    answeredAt: {
        type: Date
    }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContestRoom',
        required: true,
        index: true
    },
    participantId: {
        type: String,
        required: true
    },
    participantName: {
        type: String,
        required: [true, 'Participant name is required'],
        trim: true
    },
    responses: [responseSchema],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    submittedAt: {
        type: Date
    },
    isAutoSubmitted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
submissionSchema.index({ contestId: 1, score: -1 }); // For leaderboard
submissionSchema.index({ contestId: 1, participantId: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
