import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const JoinRoom = () => {
    const [roomCode, setRoomCode] = useState('');
    const [participantName, setParticipantName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [contestInfo, setContestInfo] = useState(null);

    const navigate = useNavigate();

    // Function to check room status
    const checkRoomStatus = useCallback(async (code) => {
        if (!code || code.length < 6) return;

        try {
            const response = await api.get(`/contests/${code.toUpperCase()}`);
            setContestInfo(response.data.data);
            setError('');
        } catch (err) {
            setError('Contest not found');
            setContestInfo(null);
        }
    }, []);

    // Poll for contest status changes when contest is in 'draft' status
    useEffect(() => {
        if (!contestInfo || contestInfo.status !== 'draft') return;

        const interval = setInterval(() => {
            checkRoomStatus(roomCode);
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [contestInfo, roomCode, checkRoomStatus]);

    const handleCheckRoom = async () => {
        if (roomCode.length < 6) return;

        setError('');
        try {
            const response = await api.get(`/contests/${roomCode.toUpperCase()}`);
            setContestInfo(response.data.data);
        } catch (err) {
            setError('Contest not found');
            setContestInfo(null);
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post(`/contests/${roomCode.toUpperCase()}/join`, {
                participantName
            });

            const { participantId, status } = response.data.data;

            // Store participant info
            sessionStorage.setItem('participantId', participantId);
            sessionStorage.setItem('participantName', participantName);
            sessionStorage.setItem('contestData', JSON.stringify(response.data.data));

            // Navigate based on status
            if (status === 'lobby') {
                navigate(`/lobby/${roomCode.toUpperCase()}`);
            } else if (status === 'live') {
                navigate(`/quiz/${roomCode.toUpperCase()}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="card slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                <h2 className="text-center">Join Quiz</h2>
                <p className="text-center text-secondary mb-xl">
                    Enter the room code to join a contest
                </p>

                {error && (
                    <div className="text-danger text-center mb-lg" style={{
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '0.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleJoin}>
                    <div className="form-group">
                        <label className="form-label">Room Code</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter 6-character code"
                            value={roomCode}
                            onChange={(e) => {
                                const value = e.target.value.toUpperCase().slice(0, 6);
                                setRoomCode(value);
                                if (value.length === 6) {
                                    setTimeout(handleCheckRoom, 300);
                                } else {
                                    setContestInfo(null);
                                }
                            }}
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                fontSize: '1.5rem',
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}
                            maxLength={6}
                            required
                        />
                    </div>

                    {contestInfo && (
                        <div className="card mb-lg" style={{
                            background: 'var(--bg-glass)',
                            padding: '1rem',
                            textAlign: 'center'
                        }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{contestInfo.title}</h4>
                            <div className="flex justify-center gap-md text-secondary">
                                <span>{Math.floor(contestInfo.duration / 60)} min</span>
                                <span>•</span>
                                <span>{contestInfo.questionCount} questions</span>
                            </div>
                            <span className={`badge badge-${contestInfo.status} mt-sm`}>
                                {contestInfo.status}
                            </span>

                            {/* Show status-specific messages */}
                            {contestInfo.status === 'draft' && (
                                <p className="text-warning mt-sm" style={{ fontSize: '0.875rem' }}>
                                    ⏳ This contest is not open yet. Please wait for the host to open it.
                                </p>
                            )}
                            {contestInfo.status === 'completed' && (
                                <p className="text-danger mt-sm" style={{ fontSize: '0.875rem' }}>
                                    ❌ This contest has ended.
                                </p>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Your Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your name"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            minLength={2}
                            required
                            disabled={contestInfo && !['lobby', 'live'].includes(contestInfo.status)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={
                            loading ||
                            roomCode.length < 6 ||
                            participantName.trim().length < 2
                        }
                    >
                        {loading ? 'Joining...' :
                            participantName.trim().length < 2 ? 'Enter Your Name (2+ characters)' :
                                roomCode.length < 6 ? 'Enter Room Code (6 characters)' :
                                    'Join Contest'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinRoom;
