const pool = require('../config/db');

// Mock external services
const EmailService = {
    send: (email, subject, body) => {
        console.log(`[EmailService] Sending email to ${email}`);
        console.log(`[EmailService] Subject: ${subject}`);
        console.log(`[EmailService] Body: ${body}`);
    }
};

const SMSService = {
    send: (phone, message) => {
        console.log(`[SMSService] Sending SMS to ${phone}`);
        console.log(`[SMSService] Message: ${message}`);
    }
};

class NotificationModel {
    static async createNotification({ userId, type, title, message, actionUrl }) {
        const conn = await pool.getConnection();
        try {
            const result = await conn.query(
                `INSERT INTO notifications (user_id, type, title, message, action_url) 
                VALUES (?, ?, ?, ?, ?) RETURNING *`,
                [userId, type, title, message, actionUrl]
            );
            return result[0];
        } finally {
            if (conn) conn.release();
        }
    }

    static async getNotificationsForUser(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const notifications = await conn.query(
                `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
                [userId]
            );
            return notifications;
        } finally {
            if (conn) conn.release();
        }
    }

    static async markAsRead(notificationId, userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const result = await conn.query(
                `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
                [notificationId, userId]
            );
            return result.affectedRows > 0;
        } finally {
            if (conn) conn.release();
        }
    }

    static async getPreferences(userId) {
        let conn;
        try {
            conn = await pool.getConnection();
            const prefs = await conn.query(`SELECT * FROM notification_preferences WHERE user_id = ?`, [userId]);
            if (prefs.length === 0) {
                // Return default preferences
                return { email_enabled: 1, sms_enabled: 0, in_app_enabled: 1 };
            }
            return prefs[0];
        } finally {
            if (conn) conn.release();
        }
    }

    static async updatePreferences(userId, prefs) {
        let conn;
        try {
            conn = await pool.getConnection();
            await conn.query(
                `INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, in_app_enabled) 
                 VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 email_enabled = VALUES(email_enabled), 
                 sms_enabled = VALUES(sms_enabled), 
                 in_app_enabled = VALUES(in_app_enabled)`,
                [userId, prefs.email_enabled, prefs.sms_enabled, prefs.in_app_enabled]
            );
            return true;
        } finally {
            if (conn) conn.release();
        }
    }
}

// Controller
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await NotificationModel.getNotificationsForUser(req.user.id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await NotificationModel.markAsRead(id, req.user.id);
        if (success) {
            res.status(200).json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};

exports.getPreferences = async (req, res) => {
    try {
        const prefs = await NotificationModel.getPreferences(req.user.id);
        res.status(200).json(prefs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving preferences', error: error.message });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { email_enabled, sms_enabled, in_app_enabled } = req.body;
        await NotificationModel.updatePreferences(req.user.id, {
            email_enabled: email_enabled ? 1 : 0,
            sms_enabled: sms_enabled ? 1 : 0,
            in_app_enabled: in_app_enabled ? 1 : 0
        });
        res.status(200).json({ message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
};

// Utility to send notifications from other controllers
exports.dispatchNotification = async (req, { userId, type, title, message, actionUrl }) => {
    try {
        const prefs = await NotificationModel.getPreferences(userId);
        
        // 1. In-App Notification (Database & WebSocket)
        if (prefs.in_app_enabled) {
            const notif = await NotificationModel.createNotification({ userId, type, title, message, actionUrl });
            
            // Emit via WebSocket
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${userId}`).emit('new_notification', notif);
            }
        }
        
        // Let's get the user info to send Email/SMS
        const conn = await pool.getConnection();
        const userRows = await conn.query('SELECT email, username FROM users WHERE id = ?', [userId]);
        const patientRows = await conn.query('SELECT phone FROM patients WHERE user_id = ?', [userId]);
        conn.release();

        const user = userRows.length > 0 ? userRows[0] : null;
        const patient = patientRows.length > 0 ? patientRows[0] : null;

        // 2. Email Notification
        if (prefs.email_enabled && user) {
            EmailService.send(user.email, title, message);
        }

        // 3. SMS Notification
        if (prefs.sms_enabled && patient && patient.phone) {
            SMSService.send(patient.phone, `Hospital System: ${title} - ${message}`);
        }

        return true;
    } catch (error) {
        console.error('Failed to dispatch notification:', error);
        return false;
    }
};
