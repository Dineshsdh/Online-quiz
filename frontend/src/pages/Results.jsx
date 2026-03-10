import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const Results = () => {
    const { roomCode } = useParams();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResults();
    }, [roomCode]);

    const fetchResults = async () => {
        try {
            const participantId = sessionStorage.getItem('participantId');
            const url = participantId
                ? `/contests/${roomCode}/results?participantId=${participantId}`
                : `/contests/${roomCode}/results`;

            const response = await api.get(url);
            setResults(response.data.data);
        } catch (err) {
            setError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-center">
                <div className="card text-center">
                    <p className="text-danger">{error}</p>
                    <Link to="/" className="btn btn-primary mt-lg">Go Home</Link>
                </div>
            </div>
        );
    }

    const { contest, leaderboard, myResult } = results || {};

    const getRankColor = (rank) => {
        if (rank === 1) return 'gold';
        if (rank === 2) return 'silver';
        if (rank === 3) return 'bronze';
        return '';
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
    };

    return (
        <div className="page container" style={{ maxWidth: '800px' }}>
            <h1 className="text-center mb-xl">
                <span className="gradient-text">Results</span>
            </h1>

            <h2 className="text-center text-secondary mb-xl">{contest?.title}</h2>

            {/* Personal Result Card */}
            {myResult && (
                <div className="card mb-xl slide-up" style={{ textAlign: 'center' }}>
                    <h3 className="text-secondary mb-md">Your Score</h3>
                    <div style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '1rem' }}>
                        <span className="gradient-text">{myResult.score}</span>
                    </div>
                    <p className="text-secondary mb-lg">
                        {myResult.correctAnswers} / {myResult.totalQuestions} correct
                    </p>

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem 2rem',
                        background: 'var(--bg-glass)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        <span style={{ fontSize: '2rem' }}>{getRankEmoji(myResult.rank)}</span>
                        <div>
                            <p className="text-muted">Your Rank</p>
                            <strong style={{ fontSize: '1.5rem' }}>
                                #{myResult.rank} of {myResult.totalParticipants}
                            </strong>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="card">
                <h3 className="mb-lg">Leaderboard</h3>

                {leaderboard && leaderboard.length > 0 ? (
                    <div className="leaderboard">
                        <div className="leaderboard-header">
                            <span>Rank</span>
                            <span>Name</span>
                            <span style={{ textAlign: 'right' }}>Score</span>
                        </div>

                        {leaderboard.map((entry, idx) => {
                            const participantId = sessionStorage.getItem('participantId');
                            const isMe = myResult && entry.participantName === sessionStorage.getItem('participantName');

                            return (
                                <div
                                    key={idx}
                                    className={`leaderboard-row ${isMe ? 'highlight' : ''}`}
                                >
                                    <span className={`rank ${getRankColor(idx + 1)}`}>
                                        {getRankEmoji(idx + 1)}
                                    </span>
                                    <span>
                                        {entry.participantName}
                                        {isMe && <span className="text-muted"> (You)</span>}
                                    </span>
                                    <span style={{ textAlign: 'right', fontWeight: '600' }}>
                                        {entry.score}
                                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                                            {' '}({entry.correctAnswers}/{entry.totalQuestions})
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted text-center" style={{ padding: '2rem' }}>
                        No submissions yet
                    </p>
                )}
            </div>

            <div className="text-center mt-xl">
                <Link to="/" className="btn btn-primary">
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default Results;
