import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContestRoom',
        required: true,
        index: true
    },
    prompt: {
        type: String,
        required: [true, 'Question prompt is required'],
        trim: true,
        maxlength: 1000
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 4;
            },
            message: 'Questions must have exactly 4 options'
        }
    },
    correctOption: {
        type: Number,
        required: true,
        min: 0,
        max: 3
    },
    points: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
    },
    order: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Compound index for efficient contest question retrieval
questionSchema.index({ contestId: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
