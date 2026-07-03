import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Layers, 
  Lock, 
  Mail, 
  X, 
  Loader2,
  Calendar,
  Phone,
  Briefcase,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Save,
  Menu
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const AdminDashboard = ({ onClose }) => {
  const [token, setToken] = useState(localStorage.getItem('growstack_admin_token'));
  const [activeTab, setActiveTab] = useState('leads_new'); // 'leads_new' | 'leads_followup' | 'leads_interested' | 'leads_not_interested' | 'services'
  
  // Gatekeeper States
  const [gatekeeperPassword, setGatekeeperPassword] = useState('');
  const [gatekeeperUnlocked, setGatekeeperUnlocked] = useState(
    sessionStorage.getItem('growstack_gatekeeper_unlocked') === 'true'
  );
  const [gatekeeperError, setGatekeeperError] = useState('');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Leads Data States
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [requirementsMap, setRequirementsMap] = useState({});
  const [savingLeads, setSavingLeads] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Services Data States
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Modal / Form States for Service Create & Update
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: 'Briefcase',
    order: 0
  });
  const [submittingService, setSubmittingService] = useState(false);
  const [serviceError, setServiceError] = useState('');

  // Projects Data States
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Modal / Form States for Project Create & Update
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState('create'); // 'create' | 'edit'
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    projectUrl: '',
    order: 0,
    imageUrl: ''
  });
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectError, setProjectError] = useState('');

  // 1. Monitor Authentication Changes
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('growstack_admin_token'));
    };
    window.addEventListener('admin-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('admin-auth-change', handleAuthChange);
    };
  }, []);

  // 2. Fetch Data when Authenticated & Active Tab Changes
  useEffect(() => {
    if (!token) return;

    if (activeTab.startsWith('leads_')) {
      fetchLeads();
    } else if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'projects') {
      fetchProjects();
    }
  }, [token, activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('growstack_admin_token');
    window.dispatchEvent(new Event('admin-auth-change'));
  };

  // Helper to handle API errors, auto-logout on authentication failure
  const handleApiError = (status, defaultMessage) => {
    if (status === 401 || status === 403) {
      handleLogout();
      return 'Session expired. Please log in again.';
    }
    return defaultMessage;
  };

  const handleGatekeeperSubmit = (e) => {
    e.preventDefault();
    if (gatekeeperPassword === 'Vinay@20') {
      setGatekeeperUnlocked(true);
      sessionStorage.setItem('growstack_gatekeeper_unlocked', 'true');
      setGatekeeperError('');
    } else {
      setGatekeeperError('Incorrect access password.');
    }
  };

  // 3. API Actions
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Email and password are required.');
      return;
    }

    setLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('growstack_admin_token', data.token);
        localStorage.setItem('growstack_admin_email', data.email);
        window.dispatchEvent(new Event('admin-auth-change'));
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setLoginError('Failed to connect to the server.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await fetch(`${API_URL}/admin/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      } else {
        const errText = await response.text();
        console.error('Fetch leads failed:', errText);
        handleApiError(response.status);
      }
    } catch (err) {
      console.error('Fetch leads error:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchLeads();
      } else {
        const resData = await response.json();
        alert(handleApiError(response.status, resData.message || 'Failed to update lead status.'));
      }
    } catch (err) {
      console.error('Update lead status error:', err);
      alert('Network connection failed.');
    }
  };

  const handleSaveRequirements = async (leadId) => {
    const reqText = requirementsMap[leadId];
    if (reqText === undefined) return;

    setSavingLeads(prev => ({ ...prev, [leadId]: true }));
    try {
      const response = await fetch(`${API_URL}/admin/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requirements: reqText })
      });

      if (response.ok) {
        fetchLeads();
      } else {
        const resData = await response.json();
        alert(handleApiError(response.status, resData.message || 'Failed to save requirements.'));
      }
    } catch (err) {
      console.error('Save requirements error:', err);
      alert('Network connection failed.');
    } finally {
      setSavingLeads(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const handleRequirementsChange = (leadId, text) => {
    setRequirementsMap(prev => ({ ...prev, [leadId]: text }));
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(`${API_URL}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error('Fetch services failed');
      }
    } catch (err) {
      console.error('Fetch services error:', err);
    } finally {
      setLoadingServices(false);
    }
  };

  // Services CRUD Actions
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingServiceId(null);
    setServiceForm({
      title: '',
      description: '',
      icon: 'Briefcase',
      order: services.length + 1
    });
    setServiceError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (service) => {
    setModalMode('edit');
    setEditingServiceId(service._id);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon || 'Briefcase',
      order: service.order || 0
    });
    setServiceError('');
    setShowModal(true);
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.description.trim()) {
      setServiceError('Title and description are required.');
      return;
    }

    setSubmittingService(true);
    setServiceError('');

    const url = modalMode === 'create' 
      ? `${API_URL}/admin/services`
      : `${API_URL}/admin/services/${editingServiceId}`;
    
    const method = modalMode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });

      const resData = await response.json();

      if (response.ok) {
        setShowModal(false);
        fetchServices();
      } else {
        const msg = handleApiError(response.status, resData.message || 'Failed to submit service.');
        setServiceError(msg);
      }
    } catch (err) {
      console.error('Service save error:', err);
      setServiceError('Network connection failed.');
    } finally {
      setSubmittingService(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchServices();
      } else {
        const resData = await response.json();
        alert(handleApiError(response.status, resData.message || 'Failed to delete service.'));
      }
    } catch (err) {
      console.error('Service delete error:', err);
      alert('Network connection failed.');
    }
  };

  // 3b. Projects Showcase Management Handlers
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch(`${API_URL}/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Fetch projects failed');
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleOpenProjectCreateModal = () => {
    setProjectModalMode('create');
    setEditingProjectId(null);
    setProjectForm({ title: '', description: '', projectUrl: '', order: 0, imageUrl: '' });
    setProjectError('');
    setShowProjectModal(true);
  };

  const handleOpenProjectEditModal = (project) => {
    setProjectModalMode('edit');
    setEditingProjectId(project._id);
    setProjectForm({
      title: project.title,
      description: project.description,
      projectUrl: project.projectUrl,
      order: project.order || 0,
      imageUrl: project.imageUrl || ''
    });
    setProjectError('');
    setShowProjectModal(true);
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProjectError('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProjectForm(prev => ({
        ...prev,
        imageUrl: reader.result
      }));
    };
    reader.onerror = () => {
      setProjectError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProject(true);
    setProjectError('');

    const url = projectModalMode === 'create' 
      ? `${API_URL}/admin/projects` 
      : `${API_URL}/admin/projects/${editingProjectId}`;
    
    const method = projectModalMode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectForm)
      });

      const resData = await response.json();

      if (response.ok) {
        setShowProjectModal(false);
        fetchProjects();
      } else {
        const msg = handleApiError(response.status, resData.message || 'Failed to submit showcase item.');
        setProjectError(msg);
      }
    } catch (err) {
      console.error('Project save error:', err);
      setProjectError('Network connection failed.');
    } finally {
      setSubmittingProject(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project showcase?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchProjects();
      } else {
        const resData = await response.json();
        alert(handleApiError(response.status, resData.message || 'Failed to delete project.'));
      }
    } catch (err) {
      console.error('Project delete error:', err);
      alert('Network connection failed.');
    }
  };

  // 4. Render Logic
  // A. IF NOT LOGGED IN - RENDER LOGIN PAGE
  if (!token) {
    return (
      <div className="modal-overlay" onClick={onClose} id="admin-login-overlay" style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <div className="modal-content admin-login-card" onClick={(e) => e.stopPropagation()} style={{ margin: 'auto', maxHeight: 'none' }}>
          <button 
            onClick={onClose}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            id="btn-close-login-modal"
          >
            <X size={20} />
          </button>

          {!gatekeeperUnlocked ? (
            // --- STEP 1: GATEKEEPER PASSCODE ---
            <div id="gatekeeper-form-container">
              <div className="admin-login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', marginBottom: '16px' }}>
                  <Lock size={32} />
                </div>
                <h2 className="admin-login-title" style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>Enter Portal Password</h2>
                <p className="admin-login-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Verification required to access admin portal</p>
              </div>

              {gatekeeperError && (
                <div className="form-alert error" style={{ marginBottom: '20px' }}>
                  <Lock size={16} />
                  <span>{gatekeeperError}</span>
                </div>
              )}

              <form onSubmit={handleGatekeeperSubmit} id="gatekeeper-form">
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="gatekeeper-password" className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                    <input
                      type="password"
                      id="gatekeeper-password"
                      value={gatekeeperPassword}
                      onChange={(e) => setGatekeeperPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-submit"
                  id="btn-gatekeeper-submit"
                  style={{ width: '100%' }}
                >
                  Verify Password
                </button>
              </form>
            </div>
          ) : (
            // --- STEP 2: ACTUAL ADMINISTRATOR CREDENTIALS ---
            <div id="admin-auth-form-container">
              <div className="admin-login-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', marginBottom: '16px' }}>
                  <Shield size={32} />
                </div>
                <h2 className="admin-login-title" style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>Admin Login</h2>
                <p className="admin-login-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Sign in to manage submissions & services</p>
              </div>

              {loginError && (
                <div className="form-alert error" style={{ marginBottom: '20px' }}>
                  <Lock size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} id="admin-login-form">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="login-email" className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                    <input
                      type="email"
                      id="login-email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label htmlFor="login-password" className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                    <input
                      type="password"
                      id="login-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={loggingIn}
                  id="btn-login-submit"
                  style={{ width: '100%' }}
                >
                  {loggingIn ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', marginRight: '8px' }} />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getFilteredLeads = () => {
    let targetStatus = 'new';
    if (activeTab === 'leads_followup') targetStatus = 'follow up';
    else if (activeTab === 'leads_interested') targetStatus = 'interested';
    else if (activeTab === 'leads_not_interested') targetStatus = 'not interested';

    return leads.filter(lead => (lead.status || 'new') === targetStatus);
  };

  const getLeadsHeaderInfo = () => {
    switch (activeTab) {
      case 'leads_followup':
        return { title: 'Follow Up Leads', icon: <Clock size={20} style={{ color: 'var(--primary)' }} /> };
      case 'leads_interested':
        return { title: 'Interested Leads', icon: <ThumbsUp size={20} style={{ color: '#10b981' }} /> };
      case 'leads_not_interested':
        return { title: 'Not Interested Leads', icon: <ThumbsDown size={20} style={{ color: '#ef4444' }} /> };
      default:
        return { title: 'Incoming Customer Leads', icon: <Users size={20} style={{ color: 'var(--primary)' }} /> };
    }
  };

  // B. IF AUTHENTICATED - RENDER SIDEBAR + DASHBOARD
  return (
    <div className="admin-container" id="admin-dashboard-root">
      
      {/* Sidebar Overlay for Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsSidebarOpen(false)} 
          id="dashboard-sidebar-overlay"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-title">Manage</div>
        <div className="sidebar-menu">
          <button 
            onClick={() => { setActiveTab('leads_new'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'leads_new' ? 'active' : ''}`}
            id="sidebar-tab-leads-new"
          >
            <Users size={18} />
            <span>Incoming Leads</span>
          </button>
          <button 
            onClick={() => { setActiveTab('leads_followup'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'leads_followup' ? 'active' : ''}`}
            id="sidebar-tab-leads-followup"
          >
            <Clock size={18} />
            <span>Follow Up</span>
          </button>
          <button 
            onClick={() => { setActiveTab('leads_interested'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'leads_interested' ? 'active' : ''}`}
            id="sidebar-tab-leads-interested"
          >
            <ThumbsUp size={18} />
            <span>Interested</span>
          </button>
          <button 
            onClick={() => { setActiveTab('leads_not_interested'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'leads_not_interested' ? 'active' : ''}`}
            id="sidebar-tab-leads-not-interested"
          >
            <ThumbsDown size={18} />
            <span>Not Interested</span>
          </button>
          <button 
            onClick={() => { setActiveTab('services'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'services' ? 'active' : ''}`}
            id="sidebar-tab-services"
          >
            <Layers size={18} />
            <span>Services Demo</span>
          </button>
          <button 
            onClick={() => { setActiveTab('projects'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'projects' ? 'active' : ''}`}
            id="sidebar-tab-projects"
          >
            <Briefcase size={18} />
            <span>My Work</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button 
            onClick={() => { onClose(); setIsSidebarOpen(false); }}
            className="sidebar-btn"
            style={{ width: '100%', marginBottom: '8px' }}
            id="sidebar-close-btn"
          >
            <X size={18} />
            <span>Close Dashboard</span>
          </button>
          <button 
            onClick={handleLogout}
            className="sidebar-btn"
            style={{ color: '#ef4444', width: '100%' }}
            id="sidebar-logout-btn"
          >
            <X size={18} style={{ transform: 'rotate(45deg)' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Panel */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="dashboard-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              id="btn-toggle-dashboard-sidebar"
            >
              <Menu size={18} />
              <span>Menu</span>
            </button>
            <div className="dashboard-title-group">
              <h1>Control Panel</h1>
              <p>Welcome back, GrowStack Administrator</p>
            </div>
          </div>
        </div>

        {/* --- LEADS LIST VIEW --- */}
        {activeTab.startsWith('leads_') && (
          <div className="dashboard-panel" id="leads-manager-panel">
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getLeadsHeaderInfo().icon} {getLeadsHeaderInfo().title}
            </h2>
            
            {loadingLeads ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            ) : getFilteredLeads().length === 0 ? (
              <div className="leads-empty" id="leads-empty-view">
                <FileText size={48} className="leads-empty-icon" />
                <p>No leads found in this section.</p>
              </div>
            ) : (
              <div className="leads-grid" id="leads-grid-container">
                {getFilteredLeads().map((lead) => {
                  const currentReqText = requirementsMap[lead._id] ?? lead.requirements ?? '';
                  const hasUnsavedChanges = currentReqText !== (lead.requirements ?? '');
                  const isSaving = savingLeads[lead._id] || false;

                  return (
                    <div className="lead-card" key={lead._id}>
                      <div className="lead-card-header">
                        <div className="lead-card-title-group">
                          <h3 className="lead-card-name">{lead.name}</h3>
                          <span className="lead-card-business">{lead.businessName}</span>
                        </div>
                        <span className={`lead-status-badge ${lead.status || 'new'}`}>
                          {(lead.status || 'new').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="lead-card-body">
                        <div className="lead-info-row">
                          <Phone size={14} style={{ color: 'var(--primary)' }} />
                          <a href={`tel:${lead.contactNumber}`} className="lead-phone-link">
                            {lead.contactNumber}
                          </a>
                        </div>
                        <div className="lead-info-row">
                          <Calendar size={14} style={{ color: 'var(--text-dim)' }} />
                          <span>{new Date(lead.createdAt).toLocaleString()}</span>
                        </div>
                        
                        <div className="lead-requirements-section">
                          <div className="lead-requirements-header">
                            <MessageSquare size={14} />
                            <span>Client Requirements & Notes</span>
                          </div>
                          <textarea
                            value={currentReqText}
                            onChange={(e) => handleRequirementsChange(lead._id, e.target.value)}
                            placeholder="Write client specifications, requirements, budget, follow-up history here..."
                            className="lead-textarea"
                            disabled={isSaving}
                          />
                          {hasUnsavedChanges && (
                            <button 
                              onClick={() => handleSaveRequirements(lead._id)}
                              className="btn-save-notes"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader2 size={12} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                              ) : (
                                <Save size={12} />
                              )}
                              <span>Save Notes</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="lead-card-actions">
                        {(lead.status || 'new') !== 'new' && (
                          <button 
                            onClick={() => handleUpdateLeadStatus(lead._id, 'new')} 
                            className="btn-status new-status"
                            title="Move back to Incoming"
                          >
                            Move to Inbox
                          </button>
                        )}
                        {(lead.status || 'new') !== 'follow up' && (
                          <button 
                            onClick={() => handleUpdateLeadStatus(lead._id, 'follow up')} 
                            className="btn-status followup-status"
                          >
                            Follow Up
                          </button>
                        )}
                        {(lead.status || 'new') !== 'interested' && (
                          <button 
                            onClick={() => handleUpdateLeadStatus(lead._id, 'interested')} 
                            className="btn-status interested-status"
                          >
                            Interested
                          </button>
                        )}
                        {(lead.status || 'new') !== 'not interested' && (
                          <button 
                            onClick={() => handleUpdateLeadStatus(lead._id, 'not interested')} 
                            className="btn-status not-interested-status"
                          >
                            Not Interested
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- SERVICES LIST / CRUD VIEW --- */}
        {activeTab === 'services' && (
          <div className="dashboard-panel" id="services-manager-panel">
            <div className="services-manager-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ color: 'var(--primary)' }} /> Services Offerings
              </h2>
              <button 
                onClick={handleOpenCreateModal}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                id="btn-add-service-modal"
              >
                <Plus size={16} /> Add Service
              </button>
            </div>

            {loadingServices ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            ) : services.length === 0 ? (
              <div className="leads-empty">
                <Briefcase size={48} className="leads-empty-icon" />
                <p>No services defined. Click "Add Service" to populate.</p>
              </div>
            ) : (
              <div className="services-list" id="services-crud-list">
                {services.map((service, index) => (
                  <div className="service-item" key={service._id} id={`service-item-${index}`}>
                    <div className="service-item-info">
                      <div className="service-item-icon">
                        <Briefcase size={20} />
                      </div>
                      <div className="service-item-details">
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          <span>Icon: <strong>{service.icon || 'Briefcase'}</strong></span>
                          <span>Sort Order: <strong>{service.order || 0}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="service-item-actions">
                      <button 
                        onClick={() => handleOpenEditModal(service)}
                        className="btn-icon edit"
                        title="Edit Service"
                        id={`btn-edit-service-${index}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="btn-icon delete"
                        title="Delete Service"
                        id={`btn-delete-service-${index}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- PORTFOLIO / PROJECTS LIST / CRUD VIEW --- */}
        {activeTab === 'projects' && (
          <div className="dashboard-panel" id="projects-manager-panel">
            <div className="services-manager-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase style={{ color: 'var(--primary)' }} /> My Work Showcase
              </h2>
              <button 
                onClick={handleOpenProjectCreateModal}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                id="btn-add-project-modal"
              >
                <Plus size={16} /> Add Work
              </button>
            </div>

            {loadingProjects ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            ) : projects.length === 0 ? (
               <div className="leads-empty">
                 <Briefcase size={48} className="leads-empty-icon" />
                 <p>No projects defined. Click "Add Work" to populate.</p>
               </div>
            ) : (
              <div className="services-list" id="projects-crud-list">
                {projects.map((project, index) => (
                  <div className="service-item" key={project._id} id={`project-item-${index}`}>
                    <div className="service-item-info">
                      <div className="service-item-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', overflow: 'hidden', padding: 0 }}>
                        {project.imageUrl ? (
                          <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Briefcase size={20} />
                        )}
                      </div>
                      <div className="service-item-details">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          <span>URL: <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{project.projectUrl}</a></span>
                          <span>Sort Order: <strong>{project.order || 0}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="service-item-actions">
                      <button 
                        onClick={() => handleOpenProjectEditModal(project)}
                        className="btn-icon edit"
                        title="Edit Project"
                        id={`btn-edit-project-${index}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project._id)}
                        className="btn-icon delete"
                        title="Delete Project"
                        id={`btn-delete-project-${index}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- ADD / EDIT SERVICE DIALOG MODAL --- */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} id="service-form-modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} id="service-form-modal">
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              id="btn-close-modal"
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" id="modal-heading">
              {modalMode === 'create' ? 'Add Service Option' : 'Edit Service Option'}
            </h3>

            {serviceError && (
              <div className="form-alert error" style={{ marginBottom: '20px' }}>
                <Lock size={16} />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleServiceSubmit} id="service-crud-form">
              <div className="form-group">
                <label htmlFor="service-title-input" className="form-label">Service Title</label>
                <input
                  type="text"
                  id="service-title-input"
                  name="title"
                  value={serviceForm.title}
                  onChange={handleServiceFormChange}
                  placeholder="e.g. 3D Web Experiences"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="service-desc-input" className="form-label">Description</label>
                <textarea
                  id="service-desc-input"
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceFormChange}
                  placeholder="Describe this service offering in detail..."
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="service-icon-select" className="form-label">Visual Icon</label>
                  <select
                    id="service-icon-select"
                    name="icon"
                    value={serviceForm.icon}
                    onChange={handleServiceFormChange}
                    className="form-input"
                    style={{ background: 'var(--bg-deep)' }}
                  >
                    <option value="Cpu">Cpu (Tech Hardware)</option>
                    <option value="Brain">Brain (AI / Learning)</option>
                    <option value="Code">Code (Full Stack Web)</option>
                    <option value="Cloud">Cloud (DevOps Scaling)</option>
                    <option value="Briefcase">Briefcase (General Business)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="service-order-input" className="form-label">Sort Order</label>
                  <input
                    type="number"
                    id="service-order-input"
                    name="order"
                    value={serviceForm.order}
                    onChange={handleServiceFormChange}
                    min="0"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  id="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  disabled={submittingService}
                  id="btn-modal-submit"
                >
                  {submittingService ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT PROJECT DIALOG MODAL --- */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)} id="project-form-modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} id="project-form-modal">
            <button 
              onClick={() => setShowProjectModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              id="btn-close-project-modal"
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" id="project-modal-heading">
              {projectModalMode === 'create' ? 'Add Showcase Item' : 'Edit Showcase Item'}
            </h3>

            {projectError && (
              <div className="form-alert error" style={{ marginBottom: '20px' }}>
                <Lock size={16} />
                <span>{projectError}</span>
              </div>
            )}

            <form onSubmit={handleProjectSubmit} id="project-crud-form">
              <div className="form-group">
                <label htmlFor="project-title-input" className="form-label">Project Title</label>
                <input
                  type="text"
                  id="project-title-input"
                  name="title"
                  value={projectForm.title}
                  onChange={handleProjectFormChange}
                  placeholder="e.g. E-Commerce Platform"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-desc-input" className="form-label">Description</label>
                <textarea
                  id="project-desc-input"
                  name="description"
                  value={projectForm.description}
                  onChange={handleProjectFormChange}
                  placeholder="Describe the project showcase in detail..."
                  className="form-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-url-input" className="form-label">Website URL</label>
                <input
                  type="url"
                  id="project-url-input"
                  name="projectUrl"
                  value={projectForm.projectUrl}
                  onChange={handleProjectFormChange}
                  placeholder="e.g. https://myproject.com"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-image-input" className="form-label">Project Image</label>
                <input
                  type="file"
                  id="project-image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                />
                {projectForm.imageUrl && (
                  <div style={{ marginTop: '16px', position: 'relative', width: '120px', height: '120px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <img 
                      src={projectForm.imageUrl} 
                      alt="Project Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setProjectForm(prev => ({ ...prev, imageUrl: '' }))}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(3, 7, 18, 0.75)', border: '1px solid var(--border-glass)', borderRadius: '50%', color: 'var(--text-white)', cursor: 'pointer', width: '24px', height: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'var(--transition-smooth)' }}
                      title="Remove Image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="project-order-input" className="form-label">Sort Order</label>
                <input
                  type="number"
                  id="project-order-input"
                  name="order"
                  value={projectForm.order}
                  onChange={handleProjectFormChange}
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="modal-form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowProjectModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  id="btn-project-modal-cancel"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  disabled={submittingProject}
                  id="btn-project-modal-submit"
                >
                  {submittingProject ? (
                    <>
                      <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
