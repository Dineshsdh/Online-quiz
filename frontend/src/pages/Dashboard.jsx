import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const response = await api.get('/contests');
            setContests(response.data.data);
        } catch (err) {
            setError('Failed to load contests');
        } finally {
            setLoading(false);
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

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page container">
            <div className="flex justify-between items-center mb-xl">
                <h1>My Contests</h1>
                <Link to="/create" className="btn btn-primary">
                    + Create Contest
                </Link>
            </div>

            {error && (
                <div className="text-danger text-center mb-lg">{error}</div>
            )}

            {contests.length === 0 ? (
                <div className="card text-center" style={{ padding: '4rem' }}>
                    <h3 className="text-secondary mb-md">No contests yet</h3>
                    <p className="text-muted mb-xl">Create your first quiz contest to get started!</p>
                    <Link to="/create" className="btn btn-primary">
                        Create Your First Contest
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {contests.map((contest) => (
                        <Link
                            key={contest._id}
                            to={`/manage/${contest._id}`}
                            className="card"
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-md mb-sm">
                                        <h3 style={{ marginBottom: 0 }}>{contest.title}</h3>
                                        <span className={getStatusBadge(contest.status)}>
                                            {contest.status}
                                        </span>
                                    </div>
                                    <p className="text-secondary">
                                        Room Code: <span className="room-code" style={{
                                            fontSize: '1rem',
                                            padding: '0.25rem 0.5rem',
                                            letterSpacing: '0.15em'
                                        }}>
                                            {contest.roomCode}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-right text-secondary">
                                    <p>Duration: {Math.floor(contest.duration / 60)} min</p>
                                    <p className="text-muted">{formatDate(contest.createdAt)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
