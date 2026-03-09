import axios from 'axios';
import { toast } from 'react-toastify';

// Create a configured axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Cache map
const cache = new Map();

// Helper to determine if a request should be cached
const isCacheable = (config) => {
    return config.method.toLowerCase() === 'get' && config.cache;
};

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Token Injection
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Cache Handling
        if (isCacheable(config)) {
            const cacheKey = `${config.url}?${new URLSearchParams(config.params).toString()}`;
            const cachedResponse = cache.get(cacheKey);

            if (cachedResponse && (Date.now() - cachedResponse.timestamp) < (config.cacheTime || 60000)) {
                // Return cached data by rejecting the request with a custom object
                // The response interceptor error handler will catch this
                return Promise.reject({
                    isCached: true,
                    data: cachedResponse.data
                });
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        // Cache successful GET responses if requested
        if (isCacheable(response.config)) {
            const cacheKey = `${response.config.url}?${new URLSearchParams(response.config.params).toString()}`;
            cache.set(cacheKey, {
                data: response,
                timestamp: Date.now()
            });
        }
        return response;
    },
    async (error) => {
        // Handle custom cached response "error"
        if (error.isCached) {
            return Promise.resolve(error.data);
        }

        const originalRequest = error.config;

        // Global Error Handling & Toast Notifications
        if (!error.response) {
            // Network Error or Cancellation
            if (axios.isCancel(error)) {
                console.log('Request canceled', error.message);
            } else {
                toast.error('Network Error. Please check your connection.');
            }
        } else {
            const status = error.response.status;
            const message = error.response.data?.message || 'An error occurred';

            // Auto-Retry Logic (e.g. for 500 Server Errors, 502 Bad Gateway)
            const shouldRetry = (status >= 500 && status <= 599) || status === 408;
            originalRequest._retryCount = originalRequest._retryCount || 0;

            if (shouldRetry && originalRequest._retryCount < 2) {
                originalRequest._retryCount++;
                const delayRetryRequest = new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 1000 * originalRequest._retryCount); // Exponential backoff
                });
                return delayRetryRequest.then(() => api(originalRequest));
            }

            // Handle specific status codes
            if (status === 401 && !originalRequest._isRetry) {
                // Token Expired / Unauthorized - Trigger logout or redirect
                // (In a real app, you might attempt to use a refresh token here first)
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (status === 403) {
                toast.error('You do not have permission to perform this action.');
            } else if (status === 404) {
                toast.warning('Requested resource not found.');
            } else if (status >= 500) {
                toast.error(`Server Error: ${message}`);
            } else if (status === 400) {
                 toast.error(`Bad Request: ${message}`);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
