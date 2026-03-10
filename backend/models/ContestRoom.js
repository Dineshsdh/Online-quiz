import mongoose from 'mongoose';

const contestRoomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        index: true
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    duration: {
        type: Number, // Duration in seconds
        required: [true, 'Contest duration is required'],
        min: [30, 'Duration must be at least 30 seconds'],
        max: [7200, 'Duration cannot exceed 2 hours']
    },
    startTimestamp: {
        type: Date,
        default: null
    },
    endTimestamp: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['draft', 'lobby', 'live', 'completed'],
        default: 'draft'
    },
    maxParticipants: {
        type: Number,
        default: 100,
        min: 1,
        max: 1000
    },
    participantCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
contestRoomSchema.index({ hostId: 1, status: 1 });
contestRoomSchema.index({ status: 1, startTimestamp: 1 });

const ContestRoom = mongoose.model('ContestRoom', contestRoomSchema);

export default ContestRoom;
