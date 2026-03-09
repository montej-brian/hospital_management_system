import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPreferences, updatePreferences, selectNotificationPrefs } from '../../store/slices/notificationSlice';
import DashboardLayout from '../../components/DashboardLayout';
import { Bell, Mail, Smartphone, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationSettings = () => {
    const dispatch = useDispatch();
    const prefs = useSelector(selectNotificationPrefs);
    
    // Local state for optimistic updates
    const [localPrefs, setLocalPrefs] = React.useState(prefs);

    useEffect(() => {
        dispatch(fetchPreferences());
    }, [dispatch]);

    useEffect(() => {
        setLocalPrefs(prefs);
    }, [prefs]);

    const handleToggle = (key) => {
        setLocalPrefs(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await dispatch(updatePreferences(localPrefs)).unwrap();
            toast.success('Notification preferences updated!');
        } catch (error) {
            toast.error('Failed to update preferences');
            // Revert on failure
            setLocalPrefs(prefs);
        }
    };

    return (
        <DashboardLayout breadcrumb="Notification Settings">
            <div className="billing-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="page-header">
                    <h1>Alert Preferences</h1>
                </div>

                <div className="auth-card" style={{ padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Control how and when you want to receive alerts for appointments, stock warnings, and lab results.
                    </p>

                    <form onSubmit={handleSave}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Bell size={24} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>In-App Notifications</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time alerts in the application dashboard.</div>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={!!localPrefs.in_app_enabled} onChange={() => handleToggle('in_app_enabled')} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Mail size={24} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>Email Summaries</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Daily digests and important schedule updates.</div>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={!!localPrefs.email_enabled} onChange={() => handleToggle('email_enabled')} />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg)', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Smartphone size={24} color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: '600' }}>SMS Reminders</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Immediate text alerts for urgent matters.</div>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input type="checkbox" checked={!!localPrefs.sms_enabled} onChange={() => handleToggle('sms_enabled')} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn btn-primary">
                                <Save size={16} /> Save Preferences
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <style>{`
                /* Simple Toggle Switch CSS */
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--primary); }
                input:checked + .slider:before { transform: translateX(20px); }
            `}</style>
        </DashboardLayout>
    );
};

export default NotificationSettings;
