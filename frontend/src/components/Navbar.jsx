import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, ChevronRight } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ theme, onToggleTheme, onMobileMenuToggle, breadcrumb }) => {
    const { user } = useAuth();
    const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'U';

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button className="mobile-menu-btn" onClick={onMobileMenuToggle}>
                    <Menu size={22} />
                </button>
                <div className="breadcrumb">
                    Home <ChevronRight size={14} /> <span>{breadcrumb || 'Dashboard'}</span>
                </div>
            </div>

            <div className="navbar-right">
                <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <NotificationCenter />

                <div className="user-menu">
                    <div className="user-avatar">{initials}</div>
                    <div className="user-info">
                        <div className="name">{user?.username || 'User'}</div>
                        <div className="role">{user?.role || 'patient'}</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
