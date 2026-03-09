const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

const authController = {
    // Register new user
    register: async (req, res) => {
        const { username, password, email, role } = req.body;

        try {
            // Basic validation
            if (!username || !password || !email || !role) {
                return res.status(400).json({ message: 'Please provide all required fields.' });
            }

            // Check if user exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username is already taken.' });
            }

            const userId = await User.create({ username, password, email, role });
            res.status(201).json({ message: 'User registered successfully.', userId });
        } catch (error) {
            console.error('Registration Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Login user
    login: async (req, res) => {
        const { username, password } = req.body;

        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const isMatch = await User.comparePassword(password, user.password_hash);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid username or password.' });
            }

            const { accessToken, refreshToken } = generateTokens(user);
            res.json({
                message: 'Login successful.',
                accessToken,
                refreshToken,
                user: { id: user.id, username: user.username, role: user.role }
            });
        } catch (error) {
            console.error('Login Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Refresh token
    refresh: async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required.' });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Invalid refresh token.' });
            }

            const tokens = generateTokens(user);
            res.json(tokens);
        } catch (error) {
            res.status(403).json({ message: 'Invalid or expired refresh token.' });
        }
    }
};

module.exports = authController;
