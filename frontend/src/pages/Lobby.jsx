import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Lobby = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();

    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if we have participant data
        const participantId = sessionStorage.getItem('participantId');
        if (!participantId) {
            navigate(`/join`);
            return;
        }

        fetchContestStatus();

        // Poll for status changes every 2 seconds
        const interval = setInterval(fetchContestStatus, 2000);

        return () => clearInterval(interval);
    }, [roomCode]);

    const fetchContestStatus = async () => {
        try {
            const response = await api.get(`/contests/${roomCode}`);
            const data = response.data.data;
            setContest(data);

            // If contest is now live, redirect to quiz
            if (data.status === 'live') {
                // Refresh contest data in session
                const contestData = JSON.parse(sessionStorage.getItem('contestData') || '{}');
                sessionStorage.setItem('contestData', JSON.stringify({
                    ...contestData,
                    ...data
                }));
                navigate(`/quiz/${roomCode}`);
            }

            // If contest is completed, redirect to results
            if (data.status === 'completed') {
                navigate(`/results/${roomCode}`);
            }
        } catch (err) {
            setError('Failed to load contest');
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
                </div>
            </div>
        );
    }

    const participantName = sessionStorage.getItem('participantName');

    return (
        <div className="page-center">
            <div className="card slide-up text-center" style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 2rem' }}></div>
                    <h2>Waiting for Host</h2>
                    <p className="text-secondary">
                        The contest will start soon...
                    </p>
                </div>

                <div style={{
                    padding: '1.5rem',
                    background: 'var(--bg-glass)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>{contest?.title}</h3>
                    <div className="flex justify-center gap-lg text-secondary">
                        <div>
                            <strong>{Math.floor((contest?.duration || 0) / 60)}</strong>
                            <p className="text-muted">Minutes</p>
                        </div>
                        <div>
                            <strong>{contest?.questionCount || 0}</strong>
                            <p className="text-muted">Questions</p>
                        </div>
                        <div>
                            <strong>{contest?.participantCount || 0}</strong>
                            <p className="text-muted">Participants</p>
                        </div>
                    </div>
                </div>

                <p className="text-secondary">
                    Joined as <strong>{participantName}</strong>
                </p>

                <p className="text-muted mt-lg" style={{ fontSize: '0.875rem' }}>
                    Stay on this page. The quiz will automatically start when the host begins.
                </p>
            </div>
        </div>
    );
};

export default Lobby;
