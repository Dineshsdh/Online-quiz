import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Public paths where we should not redirect to login on 401 (e.g. user joined as participant after host logout)
const isPublicPath = (path) => {
    if (!path) return false;
    return path === '/' || path === '/login' || path === '/register' || path === '/join' ||
        path.startsWith('/lobby/') || path.startsWith('/quiz/') || path.startsWith('/results/');
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect to login when on a protected page (dashboard, create, manage)
            if (!isPublicPath(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
