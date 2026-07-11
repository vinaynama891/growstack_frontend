import React, { useState, useEffect } from 'react';
import {
  Phone,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Send,
  LogOut,
  FileAudio,
  Loader2,
  X,
  Mic,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Star,
  Briefcase
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const SalesmanDashboard = ({ onClose }) => {
  const callerEmail = localStorage.getItem('growstack_caller_email') || '';
  const callerName = localStorage.getItem('growstack_caller_name') || 'Salesman';
  const callerToken = localStorage.getItem('growstack_caller_token');

  const [form, setForm] = useState({
    businessName: '',
    businessmanName: '',
    contactNumber: '',
    status: '',
    notes: '',
    callRecording: ''
  });

  const [recordingFile, setRecordingFile] = useState(null);
  const [recordingName, setRecordingName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('growstack_caller_token');
    localStorage.removeItem('growstack_caller_email');
    localStorage.removeItem('growstack_caller_name');
    window.dispatchEvent(new Event('caller-auth-change'));
    onClose();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSubmitError('');
  };

  const handleRecordingChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setSubmitError('Recording file size must be less than 20MB.');
      return;
    }

    setRecordingName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, callRecording: reader.result }));
    };
    reader.onerror = () => setSubmitError('Failed to read recording file.');
    reader.readAsDataURL(file);
    setRecordingFile(file);
  };

  const removeRecording = () => {
    setRecordingFile(null);
    setRecordingName('');
    setForm(prev => ({ ...prev, callRecording: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName.trim() || !form.businessmanName.trim() || !form.contactNumber.trim() || !form.status) {
      setSubmitError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch(`${API_URL}/caller/sales-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${callerToken}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess('✅ Lead submitted successfully! Admin has been notified.');
        setForm({
          businessName: '',
          businessmanName: '',
          contactNumber: '',
          status: '',
          notes: '',
          callRecording: ''
        });
        setRecordingFile(null);
        setRecordingName('');
        // Add to local history
        setSubmissions(prev => [data.salesLead, ...prev]);
      } else {
        setSubmitError(data.message || 'Failed to submit lead.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError('Network error. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusConfig = {
    'interested': { label: 'Interested', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={14} /> },
    'not interested': { label: 'Not Interested', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={14} /> },
    'follow up': { label: 'Follow Up', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={14} /> }
  };

  const todayCount = submissions.filter(s => {
    const d = new Date(s.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a1a 100%)',
      zIndex: 9999,
      overflowY: 'auto',
      fontFamily: 'var(--font-body, "Inter", sans-serif)'
    }} id="salesman-dashboard-root">

      {/* Animated Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)'
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mic size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
                Sales Dashboard
              </div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
                Welcome, {callerName} · {callerEmail}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleLogout}
              id="salesman-logout-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: '32px 24px',
          maxWidth: '960px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {[
              { label: 'Total Submitted', value: submissions.length, color: '#3b82f6', icon: <TrendingUp size={20} /> },
              { label: 'Today\'s Leads', value: todayCount, color: '#10b981', icon: <Star size={20} /> },
              { label: 'Interested', value: submissions.filter(s => s.status === 'interested').length, color: '#f59e0b', icon: <CheckCircle2 size={20} /> }
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `rgba(${stat.color === '#3b82f6' ? '59,130,246' : stat.color === '#10b981' ? '16,185,129' : '245,158,11'},0.15)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                  flexShrink: 0
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '32px',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Briefcase size={22} color="#10b981" />
                Submit New Sales Lead
              </h2>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>
                Fill in the details after your sales call
              </p>
            </div>

            {submitError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444',
                marginBottom: '20px',
                fontSize: '0.88rem'
              }}>
                <AlertCircle size={16} />
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                color: '#10b981',
                marginBottom: '20px',
                fontSize: '0.88rem'
              }}>
                <CheckCircle2 size={16} />
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} id="salesman-lead-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Business Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.6)',
                    marginBottom: '8px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Business Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={16} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255,255,255,0.3)',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      name="businessName"
                      id="salesman-business-name"
                      value={form.businessName}
                      onChange={handleFormChange}
                      placeholder="Enter business name"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Businessman Name */}
                <div>
                  <label style={labelStyle}>
                    Businessman Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={iconStyle} />
                    <input
                      type="text"
                      name="businessmanName"
                      id="salesman-businessman-name"
                      value={form.businessmanName}
                      onChange={handleFormChange}
                      placeholder="Contact person's name"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label style={labelStyle}>
                    Contact Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={iconStyle} />
                    <input
                      type="tel"
                      name="contactNumber"
                      id="salesman-contact-number"
                      value={form.contactNumber}
                      onChange={handleFormChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={labelStyle}>
                    Status <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <ChevronDown size={16} style={{ ...iconStyle, left: 'auto', right: '14px' }} />
                    <select
                      name="status"
                      id="salesman-status"
                      value={form.status}
                      onChange={handleFormChange}
                      required
                      style={{
                        ...inputStyle,
                        paddingLeft: '16px',
                        appearance: 'none',
                        cursor: 'pointer',
                        color: form.status ? '#fff' : 'rgba(255,255,255,0.3)'
                      }}
                    >
                      <option value="" disabled>Select status...</option>
                      <option value="interested">✅ Interested</option>
                      <option value="not interested">❌ Not Interested</option>
                      <option value="follow up">🔄 Follow Up</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Call Notes (Optional)</label>
                <textarea
                  name="notes"
                  id="salesman-notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  placeholder="Write key points from the call, client requirements, budget discussed, next steps..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border-color 0.2s',
                    minHeight: '100px'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Call Recording Upload */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>
                  Call Recording
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400, textTransform: 'none', fontSize: '0.78rem', marginLeft: '6px' }}>
                    (Optional · MP3, M4A, WAV · Max 20MB)
                  </span>
                </label>

                {!recordingFile ? (
                  <label
                    htmlFor="recording-upload"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '28px',
                      borderRadius: '14px',
                      border: '2px dashed rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                      e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(16,185,129,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <FileAudio size={22} />
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                        Click to upload recording
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '3px' }}>
                        MP3, M4A, WAV, OGG supported
                      </div>
                    </div>
                    <input
                      type="file"
                      id="recording-upload"
                      accept="audio/*"
                      onChange={handleRecordingChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(16,185,129,0.3)',
                    background: 'rgba(16,185,129,0.08)'
                  }}>
                    <FileAudio size={20} color="#10b981" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {recordingName}
                      </div>
                      <div style={{ color: '#10b981', fontSize: '0.78rem' }}>
                        {(recordingFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeRecording}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="salesman-submit-btn"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  background: submitting
                    ? 'rgba(16,185,129,0.5)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  letterSpacing: '0.01em',
                  boxShadow: submitting ? 'none' : '0 8px 24px rgba(16,185,129,0.3)'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting Lead...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Sales Lead
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Submission History */}
          {submissions.length > 0 && (
            <div>
              <h3 style={{
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Upload size={18} color="#3b82f6" />
                This Session's Submissions ({submissions.length})
              </h3>

              <div style={{ display: 'grid', gap: '12px' }}>
                {submissions.map((lead, i) => {
                  const sc = statusConfig[lead.status] || statusConfig['follow up'];
                  return (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: sc.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: sc.color,
                        flexShrink: 0
                      }}>
                        <Building2 size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{lead.businessName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
                          {lead.businessmanName} · {lead.contactNumber}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 12px',
                        borderRadius: '100px',
                        background: sc.bg,
                        color: sc.color,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {sc.icon}
                        {sc.label}
                      </div>
                      {lead.callRecording && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(59,130,246,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#3b82f6',
                          flexShrink: 0
                        }}>
                          <Mic size={14} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        #salesman-lead-form input::placeholder,
        #salesman-lead-form textarea::placeholder { color: rgba(255,255,255,0.25); }
        #salesman-lead-form select option { background: #1a1a2e; color: #fff; }
      `}</style>
    </div>
  );
};

// Shared input styling
const inputStyle = {
  width: '100%',
  padding: '13px 16px 13px 42px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

const labelStyle = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.6)',
  marginBottom: '8px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
};

const iconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(255,255,255,0.3)',
  pointerEvents: 'none'
};

export default SalesmanDashboard;
