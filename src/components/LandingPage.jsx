import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Brain, 
  Code, 
  Cloud, 
  Briefcase, 
  Phone, 
  Building, 
  User, 
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// API base URL configuration (can use env or fallback to relative /api)
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Map icon names to Lucide icons
const iconMap = {
  Cpu: Cpu,
  Brain: Brain,
  Code: Code,
  Cloud: Cloud,
  Briefcase: Briefcase
};

const LandingPage = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  // Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    businessName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success'|'error', message: '' }

  // Intersection Observer for scroll-driven 3D entrance animations
  const aboutRef = useRef(null);
  const aboutLeftRef = useRef(null);
  const aboutRightRef = useRef(null);
  const contactFormRef = useRef(null);

  useEffect(() => {
    // 1. Fetch services from database
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/services`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    // 1b. Fetch projects from database
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchServices();
    fetchProjects();

    // 2. Setup scroll entrance observer
    const observerOptions = {
      root: null,
      threshold: 0.15,
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-triggered-visible');
          // If we want it to animate only once, unobserve
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    if (aboutLeftRef.current) observer.observe(aboutLeftRef.current);
    if (aboutRightRef.current) observer.observe(aboutRightRef.current);
    if (contactFormRef.current) observer.observe(contactFormRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validations
    if (!formData.name.trim() || !formData.contactNumber.trim() || !formData.businessName.trim()) {
      setSubmitStatus({
        type: 'error',
        message: 'All fields are required.'
      });
      return;
    }

    // Contact number digit check
    const cleanPhone = formData.contactNumber.replace(/[^0-9+ ]/g, '');
    if (cleanPhone.length < 8) {
      setSubmitStatus({
        type: 'error',
        message: 'Please enter a valid contact number.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactNumber: cleanPhone.trim(),
          businessName: formData.businessName.trim()
        })
      });

      const resData = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Details submitted successfully! Our team will contact you soon.'
        });
        setFormData({
          name: '',
          contactNumber: '',
          businessName: ''
        });
      } else {
        setSubmitStatus({
          type: 'error',
          message: resData.message || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      console.error('Lead submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to connect to the server. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-container" id="landing-page-root">
      
      {/* 1. HERO SECTION */}
      <section className="section hero-section" id="home">
        <div className="hero-tag" id="hero-badge">Next-Gen Development</div>
        <h1 className="hero-title" id="hero-main-heading">
          Innovate, Build, & Scale with <span>GrowStack</span>
        </h1>
        <p className="hero-subtitle" id="hero-subtext">
          We combine interactive 3D web experience, cutting-edge AI integrations, and bulletproof MERN stack technologies to elevate your digital presence.
        </p>
        <div className="hero-cta-group" id="hero-buttons">
          <a href="#contact" className="btn-primary" id="btn-hero-cta">
            Work Together <ArrowRight size={18} />
          </a>
          <a href="#about" className="btn-secondary" id="btn-hero-secondary">
            Learn More
          </a>
        </div>

        {/* Scroll Mouse Prompt */}
        <div className="scroll-indicator" id="hero-scroll-prompt">
          <span>Scroll to Explore</span>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT SECTION (featuring 3D enter animations) */}
      <section className="section about-section" id="about" ref={aboutRef}>
        
        {/* Left Content Side */}
        <div 
          className="about-content scroll-anim-left" 
          ref={aboutLeftRef}
          id="about-left-side"
        >
          <span className="section-label">Who We Are</span>
          <h2 className="section-title" id="about-heading">Empowering Brands with Code & Geometry</h2>
          <p className="about-text" id="about-paragraph-1">
            GrowStack is a visionary web and AI development agency. We craft high-performance digital architectures that don't just solve business problems but inspire visual awe. 
          </p>
          <p className="about-text" id="about-paragraph-2">
            By merging high-speed React applications with smooth WebGL/Three.js interfaces and intelligent LLM backends, we bridge the gap between imagination and execution.
          </p>
          
          <div className="about-features" id="about-features-container">
            <div className="about-feature-card">
              <div className="feature-icon-wrapper"><Cpu size={24} /></div>
              <h4 className="feature-title">Immersive 3D</h4>
              <p className="feature-desc">Interactive user journeys using custom Three.js pipelines.</p>
            </div>
            <div className="about-feature-card">
              <div className="feature-icon-wrapper"><Brain size={24} /></div>
              <h4 className="feature-title">Cognitive AI</h4>
              <p className="feature-desc">Intelligent chat systems, indexing pipelines, and automation tools.</p>
            </div>
          </div>
        </div>

        {/* Right Graphical Side */}
        <div 
          className="about-graphic-container scroll-anim-right" 
          ref={aboutRightRef}
          id="about-right-side"
        >
          <div className="about-glass-panel" id="about-visual-panel">
            <img src="/logo.jpg" alt="GrowStack Stylized Logo" className="about-logo-large" />
            <h3 className="about-panel-title">GrowStack</h3>
            <span className="about-panel-subtitle">AI & Web Development</span>
          </div>
        </div>
      </section>

      {/* 3. SERVICES DEMO SECTION */}
      <section className="section services-section" id="services">
        <div className="services-header" id="services-title-wrapper">
          <span className="section-label">Our Capabilities</span>
          <h2 className="section-title">Engineered Services</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.5' }}>
            A curated list of our primary offerings, fully synchronized with our cloud administration panel.
          </p>
        </div>

        {loadingServices ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} id="services-loading">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }} id="services-empty">
            <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No services currently configured. Seed backend or log in as Admin to add services.</p>
          </div>
        ) : (
          <div className="services-grid" id="services-items-grid">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Briefcase;
              return (
                <div className="service-card" key={service._id || index} id={`service-card-${index}`}>
                  <div className="service-icon">
                    <IconComponent size={28} />
                  </div>
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-desc">{service.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3.5. PORTFOLIO / MY WORK SECTION */}
      <section className="section portfolio-section" id="work">
        <div className="services-header" id="portfolio-title-wrapper">
          <span className="section-label">Our Showcase</span>
          <h2 className="section-title">My Work</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.5' }}>
            Explore our curated selection of next-generation websites, digital products, and creative experiences.
          </p>
        </div>

        {loadingProjects ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }} id="portfolio-loading">
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px 0' }} id="portfolio-empty">
            <Briefcase size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>No projects showcase currently. Log in as Admin to add projects.</p>
          </div>
        ) : (
          <div className="portfolio-grid" id="portfolio-items-grid">
            {projects.map((project, index) => (
              <div className="portfolio-card" key={project._id || index} id={`portfolio-card-${index}`}>
                <div className="portfolio-card-image-wrapper">
                  {project.imageUrl ? (
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      className="portfolio-card-image"
                    />
                  ) : (
                    <div className="portfolio-card-image-placeholder">
                      <Briefcase size={36} />
                    </div>
                  )}
                </div>
                <div className="portfolio-card-body">
                  <div className="portfolio-card-text">
                    <h3 className="portfolio-title" title={project.title}>{project.title}</h3>
                    <p className="portfolio-desc" title={project.description}>{project.description}</p>
                  </div>
                  <div className="portfolio-card-footer">
                    <a 
                      href={project.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-portfolio-visit"
                      id={`btn-portfolio-visit-${index}`}
                    >
                      Visit Website <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. WORK TOGETHER / CONTACT SECTION */}
      <section className="section contact-section" id="contact">
        <div className="contact-info" id="contact-info-panel">
          <span className="section-label">Get in Touch</span>
          <h2 className="section-title">Let's craft something spectacular.</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '24px' }}>
            Are you ready to build a high-performance web experience or integrate AI tools into your workflow? Drop your details and we will set up a design roadmap session.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Phone size={18} style={{ color: 'var(--primary)' }} />
              <span>+91 96026 28826</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Building size={18} style={{ color: 'var(--primary)' }} />
              <span>vinaynama20@gmail.com</span>
            </div>
          </div>
        </div>

        <div 
          className="contact-card scroll-anim-bottom" 
          ref={contactFormRef}
          id="contact-form-wrapper"
        >
          <h3 className="contact-title">Start a Project</h3>
          <p className="contact-subtitle">Fill in the fields below. No registration required.</p>
          
          {submitStatus && (
            <div className={`form-alert ${submitStatus.type}`} id="contact-alert">
              {submitStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{submitStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} id="work-together-form">
            <div className="form-group">
              <label htmlFor="name-input" className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  id="name-input"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone-input" className="form-label">Contact Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                <input
                  type="tel"
                  id="phone-input"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="business-input" className="form-label">Business Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  id="business-input"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. GrowStack Enterprises"
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit" 
              disabled={isSubmitting}
              id="btn-submit-lead"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="app-footer">
        <div id="footer-copyright">
          © {new Date().getFullYear()} GrowStack. All rights reserved.
        </div>
        <div className="footer-links" id="footer-legal-links">
          <a href="#" className="footer-link">Privacy Policy</a>
          <a href="#" className="footer-link">Terms of Service</a>
        </div>
      </footer>

      {/* CSS Spin Keyframe injected locally if not in global css */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* 3D scroll animations classes */
        .scroll-anim-left {
          opacity: 0;
          transform: translateX(-50px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-anim-right {
          opacity: 0;
          transform: translateX(50px) rotateY(-15deg);
          transform-style: preserve-3d;
          perspective: 1000px;
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scroll-anim-bottom {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .scroll-triggered-visible {
          opacity: 1;
          transform: none !important;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
