import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Calendar, Settings, Activity, FileText } from 'lucide-react';
import { io } from 'socket.io-client';
import { 
    fetchNotifications, 
    markAsRead, 
    addRealtimeNotification,
    selectAllNotifications,
    selectUnreadCount 
} from '../store/slices/notificationSlice';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import '../styles/header.css'; // Make sure this CSS exists
import { Link } from 'react-router-dom';

const getIconForType = (type) => {
    switch (type) {
        case 'appointment': return <Calendar size={20} />;
        case 'lab_result': return <Activity size={20} />;
        case 'message': return <FileText size={20} />;
        default: return <Settings size={20} />;
    }
};

const NotificationCenter = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const notifications = useSelector(selectAllNotifications);
    const unreadCount = useSelector(selectUnreadCount);

    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Close panel on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial Fetch & Socket Setup
    useEffect(() => {
        if (!isAuthenticated || !user?.id) return;

        // Fetch history
        dispatch(fetchNotifications());

        // Setup Socket
        const socket = io('http://localhost:5000');
        
        socket.on('connect', () => {
            socket.emit('join', user.id);
        });

        socket.on('new_notification', (notification) => {
            // New Notification arrived via WS
            dispatch(addRealtimeNotification(notification));
            toast.info(`New Alert: ${notification.title}`);
        });

        return () => {
            socket.disconnect();
        };
    }, [dispatch, isAuthenticated, user]);

    const handleMarkAsRead = (id, e) => {
        e.stopPropagation();
        dispatch(markAsRead(id));
    };

    if (!isAuthenticated) return null;

    return (
        <div ref={panelRef} style={{ position: 'relative' }}>
            <button className="notification-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-panel">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <Link to="/admin/notifications/settings" style={{ color: 'var(--text-muted)' }} onClick={() => setIsOpen(false)}>
                            <Settings size={18} />
                        </Link>
                    </div>

                    <div className="notification-list">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className={`notification-item ${!notif.is_read ? 'unread' : ''}`}>
                                    <div className={`notification-icon ${notif.type}`}>
                                        {getIconForType(notif.type)}
                                    </div>
                                    <div className="notification-content" style={{ flex: 1 }}>
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <span className="notification-time">
                                            {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                    {!notif.is_read && (
                                        <button 
                                            className="btn-icon" 
                                            title="Mark as read" 
                                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                                            style={{ alignSelf: 'center', color: 'var(--success)' }}
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="notification-empty">
                                <Bell size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <div>You're all caught up!</div>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="notification-footer">
                            <Link to="/notifications" onClick={() => setIsOpen(false)}>View All History</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
