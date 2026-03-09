import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
    Users, CalendarDays, FileText, Receipt,
    UserPlus, CalendarPlus, ClipboardPlus, Activity
} from 'lucide-react';

const statsByRole = {
    admin: [
        { label: 'Total Patients', value: '1,284', change: '+12%', up: true, color: 'blue', icon: Users },
        { label: 'Appointments Today', value: '42', change: '+5%', up: true, color: 'green', icon: CalendarDays },
        { label: 'Medical Records', value: '3,891', change: '+8%', up: true, color: 'purple', icon: FileText },
        { label: 'Revenue (Month)', value: 'KES 485K', change: '+15%', up: true, color: 'yellow', icon: Receipt },
    ],
    doctor: [
        { label: 'My Patients', value: '156', change: '+3', up: true, color: 'blue', icon: Users },
        { label: 'Today\'s Appointments', value: '8', change: '2 pending', up: true, color: 'green', icon: CalendarDays },
        { label: 'Pending Records', value: '5', change: '', up: false, color: 'yellow', icon: FileText },
        { label: 'Completed Today', value: '3', change: '', up: true, color: 'purple', icon: Activity },
    ],
    patient: [
        { label: 'Upcoming Appointments', value: '2', change: '', up: true, color: 'blue', icon: CalendarDays },
        { label: 'Medical Records', value: '12', change: '', up: true, color: 'green', icon: FileText },
        { label: 'Prescriptions', value: '4', change: '', up: true, color: 'purple', icon: ClipboardPlus },
        { label: 'Outstanding Bills', value: 'KES 2,500', change: '', up: false, color: 'red', icon: Receipt },
    ],
};

const quickActionsByRole = {
    admin: [
        { label: 'Add Patient', icon: UserPlus },
        { label: 'New Appointment', icon: CalendarPlus },
        { label: 'Add Record', icon: ClipboardPlus },
        { label: 'Generate Report', icon: FileText },
    ],
    doctor: [
        { label: 'New Appointment', icon: CalendarPlus },
        { label: 'Add Record', icon: ClipboardPlus },
        { label: 'Write Prescription', icon: FileText },
    ],
    patient: [
        { label: 'Book Appointment', icon: CalendarPlus },
        { label: 'View Records', icon: FileText },
    ],
};

const recentActivities = [
    { text: 'New patient John Doe registered', time: '5 min ago', color: 'blue' },
    { text: 'Appointment completed with Dr. Smith', time: '1 hour ago', color: 'green' },
    { text: 'Lab results uploaded for patient #1023', time: '2 hours ago', color: 'yellow' },
    { text: 'Prescription generated for Mary K.', time: '3 hours ago', color: 'purple' },
    { text: 'Billing invoice #4521 created', time: '5 hours ago', color: 'red' },
];

const upcomingAppointments = [
    { name: 'Alice Wanjiru', type: 'General Checkup', time: '10:00 AM' },
    { name: 'Brian Ochieng', type: 'Follow-up', time: '11:30 AM' },
    { name: 'Carol Muthoni', type: 'Lab Results', time: '2:00 PM' },
    { name: 'David Kiprop', type: 'Dental', time: '3:30 PM' },
];

const Dashboard = () => {
    const { user } = useAuth();
    const role = user?.role || 'patient';
    const stats = statsByRole[role] || statsByRole.patient;
    const quickActions = quickActionsByRole[role] || quickActionsByRole.patient;

    return (
        <DashboardLayout breadcrumb="Dashboard">
            <h1 className="page-title">
                Welcome back, {user?.username || 'User'} 👋
            </h1>

            {/* Quick Actions */}
            <div className="quick-actions">
                {quickActions.map((action, i) => {
                    const Icon = action.icon;
                    return (
                        <button key={i} className="quick-action-btn">
                            <Icon size={18} /> {action.label}
                        </button>
                    );
                })}
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="stat-card">
                            <div className={`stat-icon ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="stat-details">
                                <h3>{stat.label}</h3>
                                <div className="stat-value">{stat.value}</div>
                                {stat.change && (
                                    <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Widgets */}
            <div className="widgets-grid">
                <div className="widget">
                    <div className="widget-header">
                        <h3>Recent Activity</h3>
                        <a href="#">View all</a>
                    </div>
                    <div className="widget-body">
                        {recentActivities.map((activity, i) => (
                            <div key={i} className="activity-item">
                                <div className={`activity-dot ${activity.color}`} />
                                <div>
                                    <div className="activity-text">{activity.text}</div>
                                    <div className="activity-time">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="widget">
                    <div className="widget-header">
                        <h3>Upcoming Appointments</h3>
                        <a href="#">View all</a>
                    </div>
                    <div className="widget-body">
                        {upcomingAppointments.map((appt, i) => (
                            <div key={i} className="appointment-item">
                                <div className="appt-info">
                                    <div className="appt-avatar">
                                        {appt.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="appt-name">{appt.name}</div>
                                        <div className="appt-type">{appt.type}</div>
                                    </div>
                                </div>
                                <div className="appt-time">{appt.time}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
