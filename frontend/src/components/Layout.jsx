import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Upload, List, FileText, LogOut, Menu, X, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-toastify';

const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/upload', icon: <Upload size={18} />, label: 'Upload NICs' },
    { to: '/records', icon: <List size={18} />, label: 'NIC Records' },
    { to: '/reports', icon: <FileText size={18} />, label: 'Reports' },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location]);

    const handleLogout = async () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="app-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <Menu size={24} />
                </button>
                <div className="mobile-logo">
                    <h3>mobiOs</h3>
                </div>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </header>

            {/* Sidebar Overlay */}
            <div 
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} 
                onClick={() => setSidebarOpen(false)} 
            />

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h2>mobiOs</h2>
                    <span>NIC Validator</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            {icon}
                            {label}
                        </NavLink>
                    ))}
                    {user?.role === 'ADMIN' && (
                        <NavLink
                            to="/users"
                            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                        >
                            <UsersIcon size={18} />
                            Users
                        </NavLink>
                    )}
                </nav>

                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.username}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
