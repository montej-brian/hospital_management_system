import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, breadcrumb }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    return (
        <div className="dashboard">
            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />
            <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
                <Navbar
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
                    breadcrumb={breadcrumb}
                />
                <div className="page-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
