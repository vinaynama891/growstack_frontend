import React, { useState, useEffect } from 'react';
import { Shield, LayoutDashboard, Home, LogOut, Menu, X } from 'lucide-react';

const Navbar = ({ currentHash, onNavigate }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    setIsMobileMenuOpen(false);
    localStorage.removeItem('growstack_admin_token');
    window.dispatchEvent(new Event('admin-auth-change'));
    window.location.hash = '#';
    if (onNavigate) onNavigate('#');
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar" id="app-nav">
      <a 
        href="#" 
        className="nav-brand" 
        onClick={(e) => { 
          e.preventDefault(); 
          setIsMobileMenuOpen(false); 
          window.location.hash = '#'; 
          if (onNavigate) onNavigate('#'); 
        }}
      >
        <img src="/logo.jpg" alt="GrowStack Logo" className="nav-logo" />
        <span>GrowStack</span>
      </a>

      {/* Hamburger Icon for Mobile */}
      <button 
        className="nav-mobile-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        id="nav-mobile-toggle-btn"
      >
        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {currentHash === '#admin' ? (
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a
            href="#"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
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
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#about" className="nav-link" onClick={handleCloseMobileMenu} id="nav-about">About</a>
          <a href="#services" className="nav-link" onClick={handleCloseMobileMenu} id="nav-services">Services</a>
          <a href="#work" className="nav-link" onClick={handleCloseMobileMenu} id="nav-work">My Work</a>
          <a href="#contact" className="nav-link" onClick={handleCloseMobileMenu} id="nav-contact">Work Together</a>
          
          {isAdminLoggedIn ? (
            <a
              href="#admin"
              className="btn-admin"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
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
                setIsMobileMenuOpen(false);
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
