import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ManageContest = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    // New question form
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        prompt: '',
        options: ['', '', '', ''],
        correctOption: 0,
        points: 10
    });

    useEffect(() => {
        fetchContest();
        fetchQuestions();
    }, [id]);

    const fetchContest = async () => {
        try {
            const response = await api.get(`/contests/id/${id}`);
            setContest(response.data.data);
        } catch (err) {
            setError('Failed to load contest');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await api.get(`/contests/${id}/questions?includeAnswers=true`);
            setQuestions(response.data.data);
        } catch (err) {
            console.error('Failed to load questions');
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            await api.post(`/contests/${id}/questions`, {
                questions: [newQuestion]
            });

            setNewQuestion({
                prompt: '',
                options: ['', '', '', ''],
                correctOption: 0,
                points: 10
            });
            setShowAddQuestion(false);
            fetchQuestions();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add question');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!confirm('Delete this question?')) return;

        try {
            await api.delete(`/questions/${questionId}`);
            fetchQuestions();
        } catch (err) {
            setError('Failed to delete question');
        }
    };

    const handleOpenLobby = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/contests/${id}/lobby`);
            fetchContest();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to open lobby');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartContest = async () => {
        if (!confirm('Start the contest now? Participants will begin answering immediately.')) return;

        setActionLoading(true);
        try {
            await api.patch(`/contests/${id}/start`);
            fetchContest();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start contest');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEndContest = async () => {
        if (!confirm('End the contest? All participants will be forced to submit.')) return;

        setActionLoading(true);
        try {
            await api.patch(`/contests/${id}/end`);
            fetchContest();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to end contest');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'badge badge-draft',
            lobby: 'badge badge-lobby',
            live: 'badge badge-live',
            completed: 'badge badge-completed'
        };
        return badges[status] || 'badge';
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="page-center">
                <p className="text-danger">Contest not found</p>
            </div>
        );
    }

    return (
        <div className="page container">
            {error && (
                <div className="text-danger text-center mb-lg" style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '0.5rem'
                }}>
                    {error}
                    <button onClick={() => setError('')} style={{ marginLeft: '1rem' }}>×</button>
                </div>
            )}

            {/* Contest Header */}
            <div className="card mb-xl">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-md mb-sm">
                            <h1 style={{ marginBottom: 0 }}>{contest.title}</h1>
                            <span className={getStatusBadge(contest.status)}>
                                {contest.status}
                            </span>
                        </div>
                        <p className="text-secondary">{contest.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted mb-sm">Room Code</p>
                        <div className="room-code">{contest.roomCode}</div>
                    </div>
                </div>

                <div className="flex gap-md mt-xl">
                    {contest.status === 'draft' && (
                        <button
                            className="btn btn-primary"
                            onClick={handleOpenLobby}
                            disabled={actionLoading || questions.length === 0}
                        >
                            {questions.length === 0 ? 'Add Questions First' : 'Open Lobby'}
                        </button>
                    )}

                    {contest.status === 'lobby' && (
                        <button
                            className="btn btn-success"
                            onClick={handleStartContest}
                            disabled={actionLoading}
                        >
                            🚀 Start Contest
                        </button>
                    )}

                    {contest.status === 'live' && (
                        <button
                            className="btn btn-danger"
                            onClick={handleEndContest}
                            disabled={actionLoading}
                        >
                            End Contest
                        </button>
                    )}

                    {contest.status === 'completed' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate(`/results/${contest.roomCode}`)}
                        >
                            View Results
                        </button>
                    )}
                </div>
            </div>

            {/* Questions Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-xl">
                    <h2 style={{ marginBottom: 0 }}>Questions ({questions.length})</h2>
                    {contest.status === 'draft' && (
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowAddQuestion(!showAddQuestion)}
                        >
                            {showAddQuestion ? 'Cancel' : '+ Add Question'}
                        </button>
                    )}
                </div>

                {/* Add Question Form */}
                {showAddQuestion && (
                    <form onSubmit={handleAddQuestion} className="card mb-xl" style={{ background: 'var(--bg-glass)' }}>
                        <div className="form-group">
                            <label className="form-label">Question</label>
                            <textarea
                                className="form-input"
                                placeholder="Enter your question..."
                                value={newQuestion.prompt}
                                onChange={(e) => setNewQuestion({ ...newQuestion, prompt: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Options</label>
                            {newQuestion.options.map((opt, idx) => (
                                <div key={idx} className="flex gap-md items-center mb-sm">
                                    <input
                                        type="radio"
                                        name="correctOption"
                                        checked={newQuestion.correctOption === idx}
                                        onChange={() => setNewQuestion({ ...newQuestion, correctOption: idx })}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const opts = [...newQuestion.options];
                                            opts[idx] = e.target.value;
                                            setNewQuestion({ ...newQuestion, options: opts });
                                        }}
                                        required
                                    />
                                </div>
                            ))}
                            <small className="text-muted">Select the radio button for the correct answer</small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Points</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newQuestion.points}
                                onChange={(e) => setNewQuestion({ ...newQuestion, points: Number(e.target.value) })}
                                min={1}
                                max={100}
                                style={{ maxWidth: '120px' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                            {actionLoading ? 'Adding...' : 'Add Question'}
                        </button>
                    </form>
                )}

                {/* Questions List */}
                {questions.length === 0 ? (
                    <p className="text-muted text-center" style={{ padding: '2rem' }}>
                        No questions added yet
                    </p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {questions.map((q, idx) => (
                            <div key={q._id} className="question-card">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <strong>Q{idx + 1}.</strong> {q.prompt}
                                        <div className="options-grid mt-md">
                                            {q.options.map((opt, optIdx) => (
                                                <div
                                                    key={optIdx}
                                                    className={`option-btn ${optIdx === q.correctOption ? 'correct' : ''}`}
                                                    style={{ cursor: 'default' }}
                                                >
                                                    <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                                                    {opt}
                                                    {optIdx === q.correctOption && <span className="text-success">✓</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {contest.status === 'draft' && (
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => handleDeleteQuestion(q._id)}
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <p className="text-muted mt-md">Points: {q.points}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageContest;
