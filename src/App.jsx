import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ThreeCanvas from './components/ThreeCanvas';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="app-container" id="app-root-container">
      {/* 3D Scroll animated background scene */}
      <ThreeCanvas />

      {/* Navigation Header */}
      <Navbar currentHash={currentHash} onNavigate={(hash) => setCurrentHash(hash)} />

      {/* Main Page Content */}
      <LandingPage />

      {/* Admin Dashboard Overlay Modal */}
      {currentHash === '#admin' && (
        <AdminDashboard onClose={() => { window.location.hash = '#'; }} />
      )}
    </div>
  );
}

export default App;
