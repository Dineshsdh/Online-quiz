import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand gradient-text">
                    ⚡ Think Clash
                </Link>

                <div className="navbar-links">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="btn btn-secondary">
                                Dashboard
                            </Link>
                            <span className="text-secondary">Hi, {user?.name}</span>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/join" className="btn btn-secondary">
                                Join Quiz
                            </Link>
                            <Link to="/login" className="btn btn-primary">
                                Host Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
