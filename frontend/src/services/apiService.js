import api from '../api/axios';
import axios from 'axios';

// --- Base Service Architecture ---

// Cancel Token Management
const pendingRequests = new Map();

const generateCancelToken = (requestKey) => {
    if (pendingRequests.has(requestKey)) {
        // Cancel the previous request
        pendingRequests.get(requestKey).cancel('Canceled by new overlapping request.');
    }
    const source = axios.CancelToken.source();
    pendingRequests.set(requestKey, source);
    return source.token;
};

// Generic Service Factory
export const createService = (resource) => {
    return {
        // Fetch all with optional caching and cancellation
        getAll: async (params = {}, options = {}) => {
            const { useCache = false, cacheTime = 60000, cancelKey } = options;
            const config = {
                params,
                cache: useCache,
                cacheTime
            };
            if (cancelKey) {
                config.cancelToken = generateCancelToken(cancelKey);
            }
            const response = await api.get(`/${resource}`, config);
            return response.data;
        },

        // Fetch by ID
        getById: async (id, options = {}) => {
            const { useCache = false } = options;
            const response = await api.get(`/${resource}/${id}`, { cache: useCache });
            return response.data;
        },

        // Create new record
        create: async (data) => {
            const response = await api.post(`/${resource}`, data);
            return response.data;
        },

        // Update record
        update: async (id, data) => {
            const response = await api.put(`/${resource}/${id}`, data);
            return response.data;
        },

        // Delete (Soft delete) record
        delete: async (id) => {
            const response = await api.delete(`/${resource}/${id}`);
            return response.data;
        },

        // Upload files with progress indicator support
        upload: async (id, file, onUploadProgress) => {
            const formData = new FormData();
            formData.append('document', file);
            
            const response = await api.post(`/${resource}/${id}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    if (onUploadProgress) {
                        onUploadProgress(percentCompleted);
                    }
                }
            });
            return response.data;
        }
    };
};

// --- Specialized Services ---
export const PatientService = createService('patients');
export const AppointmentService = createService('appointments');
export const MedicalRecordService = createService('medical-records');

// Auth Service has custom paths
export const AuthService = {
    login: async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        return res.data;
    },
    register: async (userData) => {
        const res = await api.post('/auth/register', userData);
        return res.data;
    },
    verify: async () => {
        // e.g. /auth/me or similar if implemented
        const res = await api.get('/auth/me', { cache: false });
        return res.data;
    }
};
