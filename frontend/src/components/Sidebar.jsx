import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, CalendarDays, FileText, Pill,
    Receipt, Settings, LogOut, ChevronLeft, ChevronRight,
    Activity, Stethoscope, ClipboardList, UserCog
} from 'lucide-react';

const menuConfig = {
    admin: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { section: 'Management' },
        { label: 'Users', icon: UserCog, path: '/admin/users' },
        { label: 'Patients', icon: Users, path: '/admin/patients' },
        { label: 'Doctors', icon: Stethoscope, path: '/admin/doctors' },
        { section: 'Operations' },
        { label: 'Appointments', icon: CalendarDays, path: '/admin/appointments' },
        { label: 'Medical Records', icon: FileText, path: '/admin/records' },
        { label: 'Medicines', icon: Pill, path: '/admin/medicines' },
        { label: 'Billing', icon: Receipt, path: '/admin/billing' },
        { section: 'System' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
    doctor: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
        { section: 'My Work' },
        { label: 'Appointments', icon: CalendarDays, path: '/doctor/appointments' },
        { label: 'My Patients', icon: Users, path: '/doctor/patients' },
        { label: 'Medical Records', icon: FileText, path: '/doctor/records' },
        { section: 'Other' },
        { label: 'Prescriptions', icon: ClipboardList, path: '/doctor/prescriptions' },
        { label: 'Settings', icon: Settings, path: '/doctor/settings' },
    ],
    nurse: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/nurse' },
        { label: 'Patients', icon: Users, path: '/nurse/patients' },
        { label: 'Appointments', icon: CalendarDays, path: '/nurse/appointments' },
        { label: 'Vitals', icon: Activity, path: '/nurse/vitals' },
    ],
    patient: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/patient' },
        { label: 'My Appointments', icon: CalendarDays, path: '/patient/appointments' },
        { label: 'Medical Records', icon: FileText, path: '/patient/records' },
        { label: 'Prescriptions', icon: ClipboardList, path: '/patient/prescriptions' },
        { label: 'Billing', icon: Receipt, path: '/patient/billing' },
    ],
};

const Sidebar = ({ collapsed, onToggle, mobileOpen, onCloseMobile }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const items = menuConfig[user?.role] || menuConfig.patient;

    return (
        <>
            {mobileOpen && <div className="sidebar-overlay show" onClick={onCloseMobile} />}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-brand">
                    <Activity size={24} />
                    <span>HMS</span>
                </div>

                <nav className="sidebar-nav">
                    {items.map((item, i) => {
                        if (item.section) {
                            return <div key={i} className="nav-label">{item.section}</div>;
                        }
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={i}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={onCloseMobile}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item" onClick={logout} style={{ width: '100%', border: 'none', background: 'none' }}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                    <button className="sidebar-toggle" onClick={onToggle}>
                        {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /> <span>Collapse</span></>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
