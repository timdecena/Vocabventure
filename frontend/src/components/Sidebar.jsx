import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SupportCard from './SupportCard';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Notification', to: '/notifications' },
    { label: 'Stats', to: '/stats' },
    { label: "Teacher's Feedback", to: '/feedback' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="logo">
          <div className="logo-icon" />
          <span className="logo-text">VocabVenture</span>
        </div>
        <nav>
          {navItems.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item${isActive(to) ? ' active' : ''}`}
            >
              <div className="nav-icon" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <SupportCard />

        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
