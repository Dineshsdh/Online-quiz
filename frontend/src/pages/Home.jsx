import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="page-center">
            <div className="text-center slide-up">
                <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>
                    <span className="gradient-text">Think Clash</span>
                </h1>
                <p className="text-secondary" style={{ fontSize: '1.5rem', marginBottom: '3rem' }}>
                    Real-time competitive quizzes for everyone
                </p>

                <div className="flex gap-lg justify-center" style={{ marginBottom: '4rem' }}>
                    <Link to="/join" className="btn btn-primary btn-lg">
                        🎯 Join a Quiz
                    </Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">
                        🚀 Host a Contest
                    </Link>
                </div>

                <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>How it works</h3>
                    <div style={{ display: 'grid', gap: '1.5rem', textAlign: 'left' }}>
                        <div className="flex gap-md items-center">
                            <span style={{ fontSize: '2rem' }}>📝</span>
                            <div>
                                <strong>Hosts create contests</strong>
                                <p className="text-secondary">Add questions, set duration, get a room code</p>
                            </div>
                        </div>
                        <div className="flex gap-md items-center">
                            <span style={{ fontSize: '2rem' }}>🎮</span>
                            <div>
                                <strong>Participants join with a code</strong>
                                <p className="text-secondary">Enter the room code and your name</p>
                            </div>
                        </div>
                        <div className="flex gap-md items-center">
                            <span style={{ fontSize: '2rem' }}>⏱️</span>
                            <div>
                                <strong>Race against the clock</strong>
                                <p className="text-secondary">Answer all questions before time runs out</p>
                            </div>
                        </div>
                        <div className="flex gap-md items-center">
                            <span style={{ fontSize: '2rem' }}>🏆</span>
                            <div>
                                <strong>See instant results</strong>
                                <p className="text-secondary">Leaderboard updates in real-time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
