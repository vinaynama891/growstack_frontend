import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ThreeCanvas from './components/ThreeCanvas';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import SalesmanDashboard from './components/SalesmanDashboard';

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#');
  const [callerToken, setCallerToken] = useState(localStorage.getItem('growstack_caller_token'));

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#');
    };
    const handleCallerAuthChange = () => {
      setCallerToken(localStorage.getItem('growstack_caller_token'));
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('caller-auth-change', handleCallerAuthChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('caller-auth-change', handleCallerAuthChange);
    };
  }, []);

  const handleClose = () => { window.location.hash = '#'; };

  return (
    <div className="app-container" id="app-root-container">
      {/* 3D Scroll animated background scene */}
      <ThreeCanvas />

      {/* Navigation Header */}
      <Navbar currentHash={currentHash} onNavigate={(hash) => setCurrentHash(hash)} />

      {/* Main Page Content */}
      <LandingPage />

      {/* Caller / Salesman Dashboard */}
      {currentHash === '#admin' && callerToken && (
        <SalesmanDashboard onClose={handleClose} />
      )}

      {/* Admin Dashboard Overlay Modal (only shown if no caller token) */}
      {currentHash === '#admin' && !callerToken && (
        <AdminDashboard onClose={handleClose} />
      )}
    </div>
  );
}

export default App;
