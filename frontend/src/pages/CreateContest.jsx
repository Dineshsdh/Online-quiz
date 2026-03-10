import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CreateContest = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(5); // minutes
    const [maxParticipants, setMaxParticipants] = useState(100);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/contests', {
                title,
                description,
                duration: duration * 60, // convert to seconds
                maxParticipants
            });

            navigate(`/manage/${response.data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create contest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center">
            <div className="card slide-up" style={{ width: '100%', maxWidth: '500px' }}>
                <h2 className="text-center">Create New Contest</h2>
                <p className="text-center text-secondary mb-xl">
                    Set up your quiz competition
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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Contest Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Weekly Trivia Challenge"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-input"
                            placeholder="Brief description of your contest..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Duration (minutes) *</label>
                        <input
                            type="number"
                            className="form-input"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min={1}
                            max={120}
                            required
                        />
                        <small className="text-muted">1 to 120 minutes</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Participants</label>
                        <input
                            type="number"
                            className="form-input"
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(Number(e.target.value))}
                            min={1}
                            max={1000}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Contest'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateContest;
