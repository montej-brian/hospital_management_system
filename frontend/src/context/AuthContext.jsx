import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await axios.post('/auth/login', credentials);
            const { user, accessToken, refreshToken } = response.data;
            
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            
            return { success: true };
        } catch (error) {
            console.error('Login Error:', error.response?.data?.message || error.message);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    };

    const register = async (userData) => {
        try {
            await axios.post('/auth/register', { ...userData, role: 'patient' });
            return { success: true };
        } catch (error) {
            console.error('Registration Error:', error.response?.data?.message || error.message);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed.' 
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
