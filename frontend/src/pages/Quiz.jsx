import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTimer } from '../hooks/useTimer';

const Quiz = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [endTimestamp, setEndTimestamp] = useState(null);
    const [contestTitle, setContestTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Auto-submit handler
    const handleAutoSubmit = useCallback(async () => {
        if (hasSubmitted) return;
        await submitAnswers(true);
    }, [hasSubmitted, answers]);

    const { formattedTime, isWarning, isDanger } = useTimer(endTimestamp, handleAutoSubmit);

    useEffect(() => {
        // Load contest data from session
        const contestData = JSON.parse(sessionStorage.getItem('contestData') || '{}');
        const participantId = sessionStorage.getItem('participantId');

        if (!participantId || !contestData.questions) {
            // Need to rejoin
            navigate(`/join`);
            return;
        }

        setQuestions(contestData.questions || []);
        setEndTimestamp(contestData.endTimestamp);
        setContestTitle(contestData.title);

        // Initialize answers
        const initialAnswers = {};
        contestData.questions.forEach(q => {
            initialAnswers[q._id] = -1; // -1 = unanswered
        });
        setAnswers(initialAnswers);
    }, [roomCode, navigate]);

    const handleSelectOption = (questionId, optionIndex) => {
        if (hasSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const submitAnswers = async (isAutoSubmit = false) => {
        if (hasSubmitted || submitting) return;

        setSubmitting(true);
        setHasSubmitted(true);

        const participantId = sessionStorage.getItem('participantId');

        try {
            const responses = Object.entries(answers).map(([questionId, selectedOption]) => ({
                questionId,
                selectedOption
            }));

            const response = await api.post(`/contests/${roomCode}/submit`, {
                participantId,
                responses,
                isAutoSubmit
            });

            // Store result and navigate
            sessionStorage.setItem('quizResult', JSON.stringify(response.data.data));
            navigate(`/results/${roomCode}`);
        } catch (err) {
            console.error('Submit error:', err);
            setHasSubmitted(false);
            setSubmitting(false);
            // Still try to navigate to results
            setTimeout(() => navigate(`/results/${roomCode}`), 1000);
        }
    };

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.values(answers).filter(a => a >= 0).length;

    if (!currentQuestion) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page container" style={{ maxWidth: '800px' }}>
            {/* Header with Timer */}
            <div className="card mb-xl" style={{
                position: 'sticky',
                top: '70px',
                zIndex: 50,
                background: 'var(--bg-secondary)'
            }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>{contestTitle}</h3>
                        <p className="text-secondary">
                            Question {currentIndex + 1} of {questions.length}
                        </p>
                    </div>
                    <div className={`timer ${isWarning ? 'timer-warning' : ''} ${isDanger ? 'timer-danger' : ''}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '2.5rem' }}>
                        {formattedTime}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar mt-md">
                    <div
                        className="progress-fill"
                        style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    />
                </div>
                <p className="text-muted mt-sm" style={{ fontSize: '0.875rem' }}>
                    {answeredCount} of {questions.length} answered
                </p>
            </div>

            {/* Question */}
            <div className="question-card fade-in" key={currentQuestion._id}>
                <p className="question-prompt">{currentQuestion.prompt}</p>

                <div className="options-grid">
                    {currentQuestion.options.map((option, idx) => (
                        <button
                            key={idx}
                            className={`option-btn ${answers[currentQuestion._id] === idx ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(currentQuestion._id, idx)}
                            disabled={hasSubmitted}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-xl">
                <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                >
                    ← Previous
                </button>

                <div className="flex gap-sm">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-sm)',
                                border: idx === currentIndex ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                background: answers[questions[idx]._id] >= 0 ? 'var(--accent-primary)' : 'var(--bg-glass)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>

                {currentIndex < questions.length - 1 ? (
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                    >
                        Next →
                    </button>
                ) : (
                    <button
                        className="btn btn-success"
                        onClick={() => submitAnswers(false)}
                        disabled={submitting || hasSubmitted}
                    >
                        {submitting ? 'Submitting...' : 'Submit Answers'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz;
