const jwt = require('jsonwebtoken');

const authMiddleware = {
    // Verify JWT Token
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(403).json({ message: 'Invalid or expired token.' });
        }
    },

    // Role-based authorization
    authorize: (roles = []) => {
        if (typeof roles === 'string') {
            roles = [roles];
        }

        return (req, res, next) => {
            if (!req.user || (roles.length && !roles.includes(req.user.role))) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }
            next();
        };
    }
};

module.exports = authMiddleware;
