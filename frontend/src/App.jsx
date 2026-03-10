import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateContest from './pages/CreateContest';
import ManageContest from './pages/ManageContest';
import JoinRoom from './pages/JoinRoom';
import Lobby from './pages/Lobby';
import Quiz from './pages/Quiz';
import Results from './pages/Results';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: '70px' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/join" element={<JoinRoom />} />
                    <Route path="/lobby/:roomCode" element={<Lobby />} />
                    <Route path="/quiz/:roomCode" element={<Quiz />} />
                    <Route path="/results/:roomCode" element={<Results />} />

                    {/* Protected Routes (Host) */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard /></ProtectedRoute>
                    } />
                    <Route path="/create" element={
                        <ProtectedRoute><CreateContest /></ProtectedRoute>
                    } />
                    <Route path="/manage/:id" element={
                        <ProtectedRoute><ManageContest /></ProtectedRoute>
                    } />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
        </>
    );
}

export default App;
