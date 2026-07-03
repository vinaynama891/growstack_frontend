import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Home, LogOut } from 'lucide-react';

const Navbar = ({ currentHash, onNavigate }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check if token exists
    const checkLogin = () => {
      const token = localStorage.getItem('growstack_admin_token');
      setIsAdminLoggedIn(!!token);
    };

    checkLogin();
    // Listen for custom login changes
    window.addEventListener('admin-auth-change', checkLogin);
    return () => {
      window.removeEventListener('admin-auth-change', checkLogin);
    };
  }, [currentHash]);

  const handleLogout = () => {
    localStorage.removeItem('growstack_admin_token');
    window.dispatchEvent(new Event('admin-auth-change'));
    window.location.hash = '#';
    if (onNavigate) onNavigate('#');
  };

  return (
    <nav className="navbar" id="app-nav">
      <a href="#" className="nav-brand" onClick={(e) => { e.preventDefault(); window.location.hash = '#'; if (onNavigate) onNavigate('#'); }}>
        <img src="/logo.jpg" alt="GrowStack Logo" className="nav-logo" />
        <span>GrowStack</span>
      </a>

      {currentHash === '#admin' ? (
        <div className="nav-links">
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '#';
              if (onNavigate) onNavigate('#');
            }}
            id="nav-home-btn"
          >
            <Home size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            Back to Site
          </a>
          {isAdminLoggedIn && (
            <button
              onClick={handleLogout}
              className="btn-admin"
              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
              id="nav-logout-btn"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      ) : (
        <div className="nav-links">
          <a href="#about" className="nav-link" id="nav-about">About</a>
          <a href="#services" className="nav-link" id="nav-services">Services</a>
          <a href="#work" className="nav-link" id="nav-work">My Work</a>
          <a href="#contact" className="nav-link" id="nav-contact">Work Together</a>
          
          {isAdminLoggedIn ? (
            <a
              href="#admin"
              className="btn-admin"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#admin';
                if (onNavigate) onNavigate('#admin');
              }}
              id="nav-admin-dashboard"
            >
              <LayoutDashboard size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Dashboard
            </a>
          ) : (
            <a
              href="#admin"
              className="btn-admin"
              onClick={(e) => {
                e.preventDefault();
                window.location.hash = '#admin';
                if (onNavigate) onNavigate('#admin');
              }}
              id="nav-admin-login"
            >
              <Shield size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Admin Portal
            </a>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
