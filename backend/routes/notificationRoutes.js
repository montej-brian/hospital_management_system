const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.get('/preferences', notificationController.getPreferences);
router.patch('/preferences', notificationController.updatePreferences);

// Admin route to broadcast bulk notifications (optional but requested)
// router.post('/broadcast', authorizeRoles('admin'), notificationController.broadcastNotification);

module.exports = router;
