import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api'
});

// Add a request interceptor to include the JWT token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Do not attempt to refresh token if the error is from the login endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post('http://localhost:5000/api/auth/refresh', { refreshToken });
                const { accessToken } = response.data;
                
                localStorage.setItem('token', accessToken);
                instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                return instance(originalRequest);
            } catch (err) {
                // Refresh token expired, logout user
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
