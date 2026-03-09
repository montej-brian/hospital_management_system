const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected route example
router.get('/profile', verifyToken, async (req, res) => {
    res.json({ message: 'Profile data retrieved.', user: req.user });
});

// Role-restricted route example
router.get('/admin-only', verifyToken, authorize('admin'), (req, res) => {
    res.json({ message: 'Welcome, Admin!' });
});

module.exports = router;
