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
  Menu,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart2,
  ArrowUpCircle,
  ArrowDownCircle,
  IndianRupee,
  Filter
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

  // Finance States
  const [financeEntries, setFinanceEntries] = useState([]);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeFilter, setFinanceFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeModalMode, setFinanceModalMode] = useState('create');
  const [editingFinanceId, setEditingFinanceId] = useState(null);
  const [financeForm, setFinanceForm] = useState({
    type: 'income',
    title: '',
    description: '',
    amount: '',
    discount: '',
    paid: '',
    category: 'General',
    date: new Date().toISOString().split('T')[0]
  });
  const [submittingFinance, setSubmittingFinance] = useState(false);
  const [financeError, setFinanceError] = useState('');
  // Installment form (shown in edit modal)
  const [instForm, setInstForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
  const [submittingInst, setSubmittingInst] = useState(false);
  const [instError, setInstError] = useState('');

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
    } else if (activeTab === 'finance') {
      fetchFinance();
      fetchFinanceSummary();
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

  // --- Finance Handlers ---
  const fetchFinance = async () => {
    setLoadingFinance(true);
    try {
      const response = await fetch(`${API_URL}/admin/finance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFinanceEntries(data);
      } else {
        handleApiError(response.status, 'Failed to fetch finance.');
      }
    } catch (err) {
      console.error('Fetch finance error:', err);
    } finally {
      setLoadingFinance(false);
    }
  };

  const fetchFinanceSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/finance/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFinanceSummary(data);
      }
    } catch (err) {
      console.error('Finance summary error:', err);
    }
  };

  const handleOpenFinanceCreateModal = () => {
    setFinanceModalMode('create');
    setEditingFinanceId(null);
    setFinanceForm({
      type: 'income',
      title: '',
      description: '',
      amount: '',
      discount: '',
      paid: '',
      category: 'General',
      date: new Date().toISOString().split('T')[0]
    });
    setFinanceError('');
    setShowFinanceModal(true);
  };

  const handleOpenFinanceEditModal = (entry) => {
    setFinanceModalMode('edit');
    setEditingFinanceId(entry._id);
    setFinanceForm({
      type: entry.type,
      title: entry.title,
      description: entry.description || '',
      amount: entry.amount.toString(),
      discount: entry.discount != null ? entry.discount.toString() : '0',
      paid: entry.paid != null ? entry.paid.toString() : '0',
      category: entry.category || 'General',
      date: new Date(entry.date).toISOString().split('T')[0]
    });
    setFinanceError('');
    setInstForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
    setInstError('');
    setShowFinanceModal(true);
  };

  const handleFinanceFormChange = (e) => {
    const { name, value } = e.target;
    setFinanceForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFinanceSubmit = async (e) => {
    e.preventDefault();
    if (!financeForm.title.trim() || !financeForm.amount) {
      setFinanceError('Title and amount are required.');
      return;
    }
    if (parseFloat(financeForm.amount) < 0) {
      setFinanceError('Amount cannot be negative.');
      return;
    }

    setSubmittingFinance(true);
    setFinanceError('');

    const url = financeModalMode === 'create'
      ? `${API_URL}/admin/finance`
      : `${API_URL}/admin/finance/${editingFinanceId}`;
    const method = financeModalMode === 'create' ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(financeForm)
      });
      let resData;
      try { resData = await response.json(); } catch { resData = {}; }
      if (response.ok) {
        setShowFinanceModal(false);
        fetchFinance();
        fetchFinanceSummary();
      } else if (response.status === 404) {
        setFinanceError('Finance API not found. Please redeploy the server with the latest code.');
      } else {
        const msg = handleApiError(response.status, resData.message || 'Failed to save entry.');
        setFinanceError(msg);
      }
    } catch (err) {
      console.error('Finance submit error:', err);
      setFinanceError('Cannot reach server. Check your internet connection or if the server is running.');
    } finally {
      setSubmittingFinance(false);
    }
  };

  const handleDeleteFinance = async (id) => {
    if (!window.confirm('Delete this finance entry?')) return;
    try {
      const response = await fetch(`${API_URL}/admin/finance/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchFinance();
        fetchFinanceSummary();
      } else {
        const resData = await response.json();
        alert(handleApiError(response.status, resData.message || 'Failed to delete entry.'));
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // Add installment to an income entry
  const handleAddInstallment = async (entryId) => {
    if (!instForm.amount || parseFloat(instForm.amount) <= 0) {
      setInstError('Amount must be greater than 0.');
      return;
    }
    setSubmittingInst(true);
    setInstError('');
    try {
      const response = await fetch(`${API_URL}/admin/finance/${entryId}/installment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(instForm)
      });
      let resData;
      try { resData = await response.json(); } catch { resData = {}; }
      if (response.ok) {
        // Update the entry in local state with recalculated values
        setFinanceEntries(prev => prev.map(e => e._id === entryId ? resData.entry : e));
        fetchFinanceSummary();
        setInstForm({ amount: '', date: new Date().toISOString().split('T')[0], note: '' });
        // Refresh edit modal data
        handleOpenFinanceEditModal(resData.entry);
      } else {
        setInstError(resData.message || 'Failed to add installment.');
      }
    } catch (err) {
      setInstError('Network error.');
    } finally {
      setSubmittingInst(false);
    }
  };

  // Delete installment from an income entry
  const handleDeleteInstallment = async (entryId, instId) => {
    if (!window.confirm('Remove this payment installment?')) return;
    try {
      const response = await fetch(`${API_URL}/admin/finance/${entryId}/installment/${instId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let resData;
      try { resData = await response.json(); } catch { resData = {}; }
      if (response.ok) {
        setFinanceEntries(prev => prev.map(e => e._id === entryId ? resData.entry : e));
        fetchFinanceSummary();
        handleOpenFinanceEditModal(resData.entry);
      } else {
        alert(resData.message || 'Failed to remove installment.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Compute total pending from all income entries
  const getTotalPending = () => {
    return financeEntries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + (e.pending || 0), 0);
  };

  const getFilteredFinance = () => {
    if (financeFilter === 'all') return financeEntries;
    return financeEntries.filter(e => e.type === financeFilter);
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
          <button 
            onClick={() => { setActiveTab('finance'); setIsSidebarOpen(false); }}
            className={`sidebar-btn ${activeTab === 'finance' ? 'active' : ''}`}
            id="sidebar-tab-finance"
          >
            <IndianRupee size={18} />
            <span>Finance</span>
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

        {/* --- FINANCE PANEL --- */}
        {activeTab === 'finance' && (
          <div className="dashboard-panel" id="finance-manager-panel">
            <div className="services-manager-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IndianRupee style={{ color: 'var(--primary)' }} /> Finance Manager
              </h2>
              <button
                onClick={handleOpenFinanceCreateModal}
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                id="btn-add-finance-entry"
              >
                <Plus size={16} /> Add Entry
              </button>
            </div>

            {loadingFinance ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader2 size={36} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* ── ANALYTICS CARDS ── */}
                <div className="finance-analytics-row">
                  <div className="finance-card income">
                    <div className="finance-card-icon">
                      <ArrowUpCircle size={28} />
                    </div>
                    <div className="finance-card-info">
                      <span className="finance-card-label">Total Income</span>
                      <span className="finance-card-value">{formatCurrency(financeSummary?.totalIncome)}</span>
                    </div>
                  </div>

                  <div className="finance-card expense">
                    <div className="finance-card-icon">
                      <ArrowDownCircle size={28} />
                    </div>
                    <div className="finance-card-info">
                      <span className="finance-card-label">Total Expenses</span>
                      <span className="finance-card-value">{formatCurrency(financeSummary?.totalExpense)}</span>
                    </div>
                  </div>

                  <div className={`finance-card profit-loss ${(financeSummary?.netPL ?? 0) >= 0 ? 'profit' : 'loss'}`}>
                    <div className="finance-card-icon">
                      {(financeSummary?.netPL ?? 0) >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
                    </div>
                    <div className="finance-card-info">
                      <span className="finance-card-label">{(financeSummary?.netPL ?? 0) >= 0 ? 'Net Profit' : 'Net Loss'}</span>
                      <span className="finance-card-value">{formatCurrency(Math.abs(financeSummary?.netPL ?? 0))}</span>
                    </div>
                  </div>

                  <div className="finance-card pending">
                    <div className="finance-card-icon">
                      <Clock size={28} />
                    </div>
                    <div className="finance-card-info">
                      <span className="finance-card-label">Total Pending</span>
                      <span className="finance-card-value">{formatCurrency(getTotalPending())}</span>
                    </div>
                  </div>
                </div>

                {/* ── MONTHLY CHART ── */}
                {financeSummary?.monthly?.length > 0 && (
                  <div className="finance-chart-section">
                    <h3 className="finance-section-title"><BarChart2 size={18} /> Monthly Breakdown</h3>
                    <div className="finance-bar-chart">
                      {(() => {
                        const allAmounts = financeSummary.monthly.flatMap(m => [m.income, m.expense]);
                        const maxVal = Math.max(...allAmounts, 1);
                        return financeSummary.monthly.map((m, i) => (
                          <div className="finance-bar-group" key={i}>
                            <div className="finance-bars">
                              <div className="finance-bar-wrap">
                                <span className="finance-bar-amount" style={{ color: '#10b981' }}>{formatCurrency(m.income)}</span>
                                <div
                                  className="finance-bar income-bar"
                                  style={{ height: `${Math.round((m.income / maxVal) * 140)}px` }}
                                  title={`Income: ${formatCurrency(m.income)}`}
                                />
                              </div>
                              <div className="finance-bar-wrap">
                                <span className="finance-bar-amount" style={{ color: '#ef4444' }}>{formatCurrency(m.expense)}</span>
                                <div
                                  className="finance-bar expense-bar"
                                  style={{ height: `${Math.round((m.expense / maxVal) * 140)}px` }}
                                  title={`Expense: ${formatCurrency(m.expense)}`}
                                />
                              </div>
                            </div>
                            <span className="finance-bar-label">{m.month}</span>
                          </div>
                        ));
                      })()}
                    </div>
                    <div className="finance-chart-legend">
                      <span className="legend-dot income" /> Income
                      <span className="legend-dot expense" style={{ marginLeft: '16px' }} /> Expense
                    </div>
                  </div>
                )}

                {/* ── CATEGORY BREAKDOWN ── */}
                {financeSummary?.categories?.length > 0 && (
                  <div className="finance-chart-section">
                    <h3 className="finance-section-title"><Filter size={18} /> Category Breakdown</h3>
                    <div className="finance-categories-grid">
                      {financeSummary.categories.map((cat, i) => {
                        const net = cat.income - cat.expense;
                        return (
                          <div className="finance-category-card" key={i}>
                            <div className="finance-category-name">{cat.name}</div>
                            <div className="finance-category-row">
                              <span style={{ color: '#10b981' }}>↑ {formatCurrency(cat.income)}</span>
                              <span style={{ color: '#ef4444' }}>↓ {formatCurrency(cat.expense)}</span>
                            </div>
                            <div className={`finance-category-net ${net >= 0 ? 'positive' : 'negative'}`}>
                              Net: {net >= 0 ? '+' : ''}{formatCurrency(net)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TRANSACTIONS TABLE ── */}
                <div className="finance-chart-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 className="finance-section-title" style={{ margin: 0 }}><FileText size={18} /> Transactions</h3>
                    <div className="finance-filter-tabs">
                      {['all', 'income', 'expense'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFinanceFilter(f)}
                          className={`finance-filter-btn ${financeFilter === f ? 'active' : ''} ${f}`}
                        >
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {getFilteredFinance().length === 0 ? (
                    <div className="leads-empty">
                      <DollarSign size={48} className="leads-empty-icon" />
                      <p>No {financeFilter !== 'all' ? financeFilter : ''} entries found. Click "Add Entry" to begin.</p>
                    </div>
                  ) : (
                    <div className="finance-table-wrapper">
                      <table className="finance-table">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Title & Description</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Discount</th>
                            <th>Paid</th>
                            <th>Pending</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredFinance().map((entry, idx) => (
                            <tr key={entry._id} id={`finance-row-${idx}`}>
                              <td>
                                <span className={`finance-type-badge ${entry.type}`}>
                                  {entry.type === 'income' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                                  {entry.type}
                                </span>
                              </td>
                              <td>
                                <div className="finance-title-cell">
                                  <strong>{entry.title}</strong>
                                  {entry.description && <span className="finance-desc">{entry.description}</span>}
                                </div>
                              </td>
                              <td><span className="finance-category-badge">{entry.category || 'General'}</span></td>
                              <td style={{ color: 'var(--text-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                              <td>
                                <span className={`finance-amount-cell ${entry.type}`}>
                                  {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                                </span>
                              </td>
                              {/* Income-specific columns */}
                              <td>
                                {entry.type === 'income'
                                  ? <span className="finance-pill discount">{formatCurrency(entry.discount || 0)}</span>
                                  : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                                }
                              </td>
                              <td>
                                {entry.type === 'income'
                                  ? <span className="finance-pill paid">{formatCurrency(entry.paid || 0)}</span>
                                  : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                                }
                              </td>
                              <td>
                                {entry.type === 'income'
                                  ? <span className={`finance-pill ${(entry.pending || 0) > 0 ? 'pending-warn' : 'paid'}`}>
                                      {formatCurrency(entry.pending || 0)}
                                    </span>
                                  : <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>—</span>
                                }
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => handleOpenFinanceEditModal(entry)}
                                    className="btn-icon edit"
                                    title="Edit"
                                    id={`btn-edit-finance-${idx}`}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFinance(entry._id)}
                                    className="btn-icon delete"
                                    title="Delete"
                                    id={`btn-delete-finance-${idx}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
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
      {/* --- ADD / EDIT FINANCE MODAL --- */}
      {showFinanceModal && (
        <div className="modal-overlay" onClick={() => setShowFinanceModal(false)} id="finance-form-modal-overlay">
          <div className="modal-content" onClick={e => e.stopPropagation()} id="finance-form-modal">
            <button
              onClick={() => setShowFinanceModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              id="btn-close-finance-modal"
            >
              <X size={20} />
            </button>
            <h3 className="modal-title" id="finance-modal-heading">
              {financeModalMode === 'create' ? 'Add Finance Entry' : 'Edit Finance Entry'}
            </h3>

            {financeError && (
              <div className="form-alert error" style={{ marginBottom: '20px' }}>
                <Lock size={16} />
                <span>{financeError}</span>
              </div>
            )}

            <form onSubmit={handleFinanceSubmit} id="finance-crud-form">
              {/* Type Toggle */}
              <div className="form-group">
                <label className="form-label">Entry Type</label>
                <div className="finance-type-toggle">
                  <button
                    type="button"
                    className={`finance-type-btn income ${financeForm.type === 'income' ? 'active' : ''}`}
                    onClick={() => setFinanceForm(p => ({ ...p, type: 'income' }))}
                  >
                    <ArrowUpCircle size={16} /> Income
                  </button>
                  <button
                    type="button"
                    className={`finance-type-btn expense ${financeForm.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setFinanceForm(p => ({ ...p, type: 'expense' }))}
                  >
                    <ArrowDownCircle size={16} /> Expense
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="finance-title-input" className="form-label">Title *</label>
                <input
                  type="text"
                  id="finance-title-input"
                  name="title"
                  value={financeForm.title}
                  onChange={handleFinanceFormChange}
                  placeholder={financeForm.type === 'income' ? 'e.g. Client Payment — ABC Corp' : 'e.g. Office Rent July'}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="finance-desc-input" className="form-label">Description</label>
                <textarea
                  id="finance-desc-input"
                  name="description"
                  value={financeForm.description}
                  onChange={handleFinanceFormChange}
                  placeholder="Additional details, invoice number, notes..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="finance-amount-input" className="form-label">Total Amount (₹) *</label>
                  <input
                    type="number"
                    id="finance-amount-input"
                    name="amount"
                    value={financeForm.amount}
                    onChange={handleFinanceFormChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="finance-date-input" className="form-label">Date *</label>
                  <input
                    type="date"
                    id="finance-date-input"
                    name="date"
                    value={financeForm.date}
                    onChange={handleFinanceFormChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Income-only: Discount / Paid / Pending */}
              {financeForm.type === 'income' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label htmlFor="finance-discount-input" className="form-label">Discount (₹)</label>
                      <input
                        type="number"
                        id="finance-discount-input"
                        name="discount"
                        value={financeForm.discount}
                        onChange={handleFinanceFormChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="finance-paid-input" className="form-label">Paid Amount (₹)</label>
                      <input
                        type="number"
                        id="finance-paid-input"
                        name="paid"
                        value={financeForm.paid}
                        onChange={handleFinanceFormChange}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                  </div>
                  {/* Auto-calculated Pending */}
                  <div className="finance-pending-preview">
                    <span className="finance-pending-label">⏳ Pending Amount (auto-calculated)</span>
                    <span className={`finance-pending-value ${
                      Math.max(0,
                        parseFloat(financeForm.amount || 0) -
                        parseFloat(financeForm.discount || 0) -
                        parseFloat(financeForm.paid || 0)
                      ) > 0 ? 'warn' : 'clear'
                    }`}>
                      {formatCurrency(
                        Math.max(0,
                          parseFloat(financeForm.amount || 0) -
                          parseFloat(financeForm.discount || 0) -
                          parseFloat(financeForm.paid || 0)
                        )
                      )}
                    </span>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="finance-category-select" className="form-label">Category</label>
                <select
                  id="finance-category-select"
                  name="category"
                  value={financeForm.category}
                  onChange={handleFinanceFormChange}
                  className="form-input"
                  style={{ background: 'var(--bg-deep)' }}
                >
                  <option value="General">General</option>
                  <option value="Client Payment">Client Payment</option>
                  <option value="Project Revenue">Project Revenue</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Office Rent">Office Rent</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Travel">Travel</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-form-actions">
                <button
                  type="button"
                  onClick={() => setShowFinanceModal(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  id="btn-finance-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn-primary ${financeForm.type === 'expense' ? 'btn-danger' : ''}`}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                  disabled={submittingFinance}
                  id="btn-finance-modal-submit"
                >
                  {submittingFinance ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> Saving...</>
                  ) : (
                    financeModalMode === 'create'
                      ? `Add ${financeForm.type === 'income' ? 'Income' : 'Expense'}`
                      : 'Save Changes'
                  )}
                </button>
              </div>
            </form>

            {/* ── INSTALLMENT SECTION (only in edit mode for income) ── */}
            {financeModalMode === 'edit' && financeForm.type === 'income' && (() => {
              const currentEntry = financeEntries.find(e => e._id === editingFinanceId);
              const installments = currentEntry?.installments || [];
              return (
                <div className="installment-section">
                  <div className="installment-section-header">
                    <IndianRupee size={16} />
                    <span>Payment Installments</span>
                    <span className="installment-count">{installments.length} payment{installments.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Existing installments timeline */}
                  {installments.length > 0 ? (
                    <div className="installment-timeline">
                      {installments.map((inst, idx) => (
                        <div className="installment-item" key={inst._id || idx}>
                          <div className="installment-dot" />
                          <div className="installment-info">
                            <div className="installment-row">
                              <span className="installment-amount">{formatCurrency(inst.amount)}</span>
                              <span className="installment-date">
                                {new Date(inst.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <button
                                type="button"
                                className="btn-icon delete"
                                style={{ width: '24px', height: '24px', padding: '0', flexShrink: 0 }}
                                title="Remove installment"
                                onClick={() => handleDeleteInstallment(editingFinanceId, inst._id)}
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                            {inst.note && <span className="installment-note">{inst.note}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textAlign: 'center', padding: '12px 0' }}>
                      No payments recorded yet.
                    </p>
                  )}

                  {/* Add new installment form */}
                  <div className="installment-add-form">
                    <div className="installment-add-title">
                      <Plus size={14} /> Add New Payment
                    </div>
                    {instError && (
                      <div className="form-alert error" style={{ marginBottom: '12px', padding: '8px 12px', fontSize: '0.82rem' }}>
                        <span>{instError}</span>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Amount (₹) *</label>
                        <input
                          type="number"
                          value={instForm.amount}
                          onChange={e => setInstForm(p => ({ ...p, amount: e.target.value }))}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.78rem' }}>Payment Date *</label>
                        <input
                          type="date"
                          value={instForm.date}
                          onChange={e => setInstForm(p => ({ ...p, date: e.target.value }))}
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '10px', marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '0.78rem' }}>Note (optional)</label>
                      <input
                        type="text"
                        value={instForm.note}
                        onChange={e => setInstForm(p => ({ ...p, note: e.target.value }))}
                        placeholder="e.g. 2nd installment via UPI"
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ width: '100%', padding: '9px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleAddInstallment(editingFinanceId)}
                      disabled={submittingInst}
                      id="btn-add-installment"
                    >
                      {submittingInst
                        ? <><Loader2 size={14} style={{ animation: 'spin 1.5s linear infinite' }} /> Adding...</>
                        : <><Plus size={14} /> Add Payment</>
                      }
                    </button>
                  </div>
                </div>
              );
            })()}
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
