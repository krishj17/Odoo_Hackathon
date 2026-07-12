import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function Login({ onLoginSuccess }) {
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toasts State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Dynamic stylesheet injection for Inter and Material Symbols
  useEffect(() => {
    const interLink = document.createElement('link');
    interLink.rel = 'stylesheet';
    interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap';
    document.head.appendChild(interLink);

    const materialLink = document.createElement('link');
    materialLink.rel = 'stylesheet';
    materialLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block';
    document.head.appendChild(materialLink);

    return () => {
      // Cleanup links if component unmounts
      if (document.head.contains(interLink)) document.head.removeChild(interLink);
      if (document.head.contains(materialLink)) document.head.removeChild(materialLink);
    };
  }, []);

  const getRoleFromEmail = (emailVal) => {
    const emailLower = emailVal.toLowerCase();
    if (emailLower.includes('dispatcher') || emailLower.includes('dispatch')) {
      return 'dispatcher';
    } else if (emailLower.includes('safety') || emailLower.includes('officer')) {
      return 'safety-officer';
    } else if (emailLower.includes('analyst') || emailLower.includes('finance') || emailLower.includes('financial')) {
      return 'financial-analyst';
    } else {
      return 'fleet-manager';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill out all fields.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const { access, refresh } = await api.post('/users/login/', { email, password });
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      const meData = await api.get('/users/me/');
      const roleStr = meData.role ? meData.role.replace('_', '-') : 'fleet-manager';

      addToast(`Successfully signed in as ${meData.email}!`, 'success');
      
      setTimeout(() => {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess(meData.email, roleStr);
        }
      }, 1000);

    } catch (err) {
      setIsLoading(false);
      const msg = err.status === 401 ? 'Invalid email or password.' : (err.message || 'An error occurred during sign in.');
      addToast(msg, 'error');
    }
  };

  return (
    <div className="transitops-login-page animate-fade-in">
      {/* Component Styles scoped using the .transitops-login-page class wrapper */}
      <style>{`
        .transitops-login-page {
          /* Colors */
          --surface-container: #e6eeff;
          --on-secondary-container: #5c647a;
          --on-surface: #0d1c2e;
          --tertiary: #006329;
          --primary: #004ac6;
          --on-surface-variant: #434655;
          --outline: #737686;
          --outline-variant: #c3c6d7;
          --surface-container-low: #eff4ff;
          --primary-container: #2563eb;
          --on-primary-container: #eeefff;
          --primary-fixed-dim: #b4c5ff;
          --background: #f8f9ff;
          --surface: #f8f9ff;
          --white: #ffffff;

          /* Fonts */
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--on-surface);
          background-color: var(--background);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .transitops-login-page *,
        .transitops-login-page *::before,
        .transitops-login-page *::after {
          box-sizing: border-box;
        }

        /* Layout */
        .transitops-login-page .login-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        @media (min-width: 768px) {
          .transitops-login-page .login-main {
            flex-direction: row;
          }
        }

        /* Left Hero Section */
        .transitops-login-page .hero-section {
          position: relative;
          width: 100%;
          min-height: 500px;
          background-color: var(--surface-container-low);
          display: flex;
          flex-direction: column;
          padding: 2.5rem;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .transitops-login-page .hero-section {
            width: 45%;
            min-height: 100vh;
            padding: 4rem;
          }
        }

        .transitops-login-page .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .transitops-login-page .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
        }

        .transitops-login-page .hero-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(239, 244, 255, 0.95) 0%,
            rgba(239, 244, 255, 0.75) 50%,
            rgba(230, 238, 255, 0.5) 100%
          );
        }

        .transitops-login-page .hero-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-grow: 1;
        }

        /* Branding */
        .transitops-login-page .branding {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 3rem;
        }

        .transitops-login-page .logo-icon-container {
          width: 2.5rem;
          height: 2.5rem;
          background-color: var(--primary-container);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .transitops-login-page .logo-icon {
          color: var(--on-primary-container);
          font-variation-settings: 'FILL' 1;
          font-size: 24px;
        }

        .transitops-login-page .brand-name {
          font-size: 24px;
          line-height: 32px;
          letter-spacing: -0.01em;
          font-weight: 700;
          color: var(--primary);
        }

        /* Hero Text */
        .transitops-login-page .hero-text {
          max-width: 32rem; /* max-w-lg */
          margin-bottom: 3rem;
        }

        .transitops-login-page .hero-title {
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.02em;
          font-weight: 700;
          color: var(--on-surface);
          margin: 0 0 1rem 0;
        }

        .transitops-login-page .hero-desc {
          font-size: 16px;
          line-height: 24px;
          font-weight: 400;
          color: var(--on-surface-variant);
          margin: 0;
        }

        /* Feature Grid */
        .transitops-login-page .feature-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: auto;
        }

        @media (min-width: 640px) {
          .transitops-login-page .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .transitops-login-page .feature-card {
          padding: 1.25rem;
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(4px);
          border-radius: 20px;
          border: 1px solid var(--outline-variant);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          cursor: default;
          transition: all 0.2s ease-in-out;
        }

        .transitops-login-page .feature-card:hover {
          background-color: rgba(255, 255, 255, 0.85);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
        }

        .transitops-login-page .feature-icon-container {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 12px;
          background-color: var(--primary-fixed-dim);
          color: var(--primary-container);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        }

        .transitops-login-page .feature-card:hover .feature-icon-container {
          background-color: var(--primary-container);
          color: var(--white);
        }

        .transitops-login-page .feature-title {
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
          color: var(--on-surface);
          margin: 0;
        }

        .transitops-login-page .feature-desc {
          font-size: 13px;
          line-height: 18px;
          font-weight: 400;
          color: var(--on-surface-variant);
          margin: 0;
        }

        /* Right Form Section */
        .transitops-login-page .form-section {
          width: 100%;
          background-color: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.5s ease-out;
        }

        @media (min-width: 768px) {
          .transitops-login-page .form-section {
            width: 55%;
            padding: 32px; /* margin-page */
          }
        }

        .transitops-login-page .login-card {
          width: 100%;
          max-width: 480px;
          background-color: var(--white);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid rgba(195, 198, 215, 0.3);
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05); /* card-shadow */
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        @media (min-width: 768px) {
          .transitops-login-page .login-card {
            padding: 3rem;
          }
        }

        /* Card Header */
        .transitops-login-page .card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .transitops-login-page .card-logo {
          width: 3.5rem;
          height: 3.5rem;
          background-color: var(--primary-container);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
        }

        .transitops-login-page .card-logo .logo-icon {
          color: var(--on-primary-container);
          font-variation-settings: 'FILL' 1;
          font-size: 32px;
        }

        .transitops-login-page .card-title {
          font-size: 32px;
          line-height: 40px;
          letter-spacing: -0.02em;
          font-weight: 700;
          color: var(--on-surface);
          margin: 0 0 0.5rem 0;
        }

        .transitops-login-page .card-subtitle {
          font-size: 16px;
          line-height: 24px;
          color: var(--on-surface-variant);
          margin: 0;
        }

        /* Form Styles */
        .transitops-login-page .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .transitops-login-page .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .transitops-login-page .form-label {
          font-size: 14px;
          line-height: 20px;
          color: var(--on-surface);
          font-weight: 600;
        }

        .transitops-login-page .input-container {
          position: relative;
        }

        .transitops-login-page .input-icon-left {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--outline);
          transition: color 0.2s ease;
          pointer-events: none;
          font-size: 20px;
        }

        .transitops-login-page .input-container:focus-within .input-icon-left {
          color: var(--primary);
        }

        .transitops-login-page .form-input,
        .transitops-login-page .form-select {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background-color: var(--white);
          border: 1px solid var(--outline-variant);
          border-radius: 12px;
          font-size: 14px;
          line-height: 20px;
          color: var(--on-surface);
          outline: none;
          transition: all 0.2s ease;
        }

        .transitops-login-page .form-input::placeholder {
          color: var(--outline);
          opacity: 0.8;
        }

        .transitops-login-page .form-input:focus,
        .transitops-login-page .form-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12); /* input-glow */
        }

        /* Password Toggle Icon */
        .transitops-login-page .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--outline);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .transitops-login-page .password-toggle:hover {
          color: var(--on-surface);
        }

        .transitops-login-page .password-toggle .material-symbols-outlined {
          font-size: 20px;
        }

        .transitops-login-page .form-select {
          appearance: none;
          cursor: pointer;
          padding-right: 2.5rem;
        }

        .transitops-login-page .select-arrow {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--outline);
          pointer-events: none;
          font-size: 20px;
        }

        /* Form Extras */
        .transitops-login-page .form-extras {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }

        .transitops-login-page .remember-me-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .transitops-login-page .remember-checkbox {
          width: 1rem;
          height: 1rem;
          border-radius: 4px;
          border: 1px solid var(--outline-variant);
          cursor: pointer;
          accent-color: var(--primary);
        }

        .transitops-login-page .remember-text {
          font-size: 12px;
          line-height: 16px;
          color: var(--on-surface-variant);
          transition: color 0.2s ease;
        }

        .transitops-login-page .remember-me-label:hover .remember-text {
          color: var(--on-surface);
        }

        .transitops-login-page .forgot-password-link {
          font-size: 12px;
          line-height: 16px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .transitops-login-page .forgot-password-link:hover {
          color: #003ea8;
        }

        /* Submit Button */
        .transitops-login-page .submit-btn {
          width: 100%;
          background-color: #2563EB;
          color: var(--white);
          border: none;
          font-size: 14px;
          line-height: 20px;
          font-weight: 700;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .transitops-login-page .submit-btn:hover:not(:disabled) {
          background-color: var(--primary);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }

        .transitops-login-page .submit-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .transitops-login-page .submit-btn:disabled {
          background-color: var(--outline-variant);
          box-shadow: none;
          cursor: not-allowed;
          transform: none;
          opacity: 0.7;
        }

        .transitops-login-page .submit-btn .material-symbols-outlined {
          font-size: 18px;
        }

        /* Form Divider/Footer inside Card */
        .transitops-login-page .card-divider {
          border-top: 1px solid rgba(195, 198, 215, 0.3);
          padding-top: 0.5rem;
        }

        /* Global Footer */
        .transitops-login-page .global-footer {
          width: 100%;
          background-color: var(--white);
          border-top: 1px solid rgba(195, 198, 215, 0.3);
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .transitops-login-page .global-footer {
            flex-direction: row;
            justify-content: space-between;
            padding: 1.5rem 32px;
          }
        }

        .transitops-login-page .footer-copyright {
          font-size: 12px;
          line-height: 16px;
          color: var(--on-surface-variant);
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .transitops-login-page.animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        /* Toast Notification Styles */
        .toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
        }

        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          min-width: 320px;
          max-width: 450px;
          box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.08);
          background-color: var(--white);
          border: 1px solid var(--outline-variant);
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.3s ease;
        }

        .toast-icon {
          font-variation-settings: 'FILL' 1;
          font-size: 22px;
          flex-shrink: 0;
        }

        .toast-message {
          font-size: 14px;
          line-height: 20px;
          font-weight: 500;
          color: var(--on-surface);
          flex-grow: 1;
        }

        .toast-close {
          background: none;
          border: none;
          color: var(--outline);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: background-color 0.2s, color 0.2s;
        }

        .toast-close:hover {
          background-color: var(--surface-container-low);
          color: var(--on-surface);
        }

        .toast-close .material-symbols-outlined {
          font-size: 18px;
        }

        /* Toast Colors */
        .toast-success {
          border-left: 4px solid var(--tertiary);
        }
        .toast-success .toast-icon {
          color: var(--tertiary);
        }

        .toast-error {
          border-left: 4px solid #b91c1c;
        }
        .toast-error .toast-icon {
          color: #b91c1c;
        }

        .toast-warning {
          border-left: 4px solid #d97706;
        }
        .toast-warning .toast-icon {
          color: #d97706;
        }

        .toast-info {
          border-left: 4px solid var(--primary-container);
        }
        .toast-info .toast-icon {
          color: var(--primary-container);
        }

        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) translateY(0);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
      `}</style>

      {/* Main Layout Container */}
      <main className="login-main">
        
        {/* Left Side: Hero Section (45%) */}
        <section className="hero-section">
          {/* Background Image Overlay */}
          <div className="hero-bg">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxjPAwXtZViOC9q3D8VVh-dDqXHSWAUaj7-8UYAYw1rtAwgi3ubnZts45Ma3_21c5IbSBac3sF2H9jEJPK5Y_tBwAzBzLgLeuBNm1JTw2DY9u63sRwbmfi4V2KUauRafpfvVkS294ylZrzlapwlTa1F4o-o6ViASsEniXoAyaYxJsmQpg5id5GoEDcb9n7asOtvSNIU0TIns3DRNeFddUZvB7PvT0XF0kAP5H236s9RgFIgmSre9lWk75W8mH50X6ewZ8qBubCoVw" 
              alt="TransitOps Background" 
            />
            <div className="hero-gradient"></div>
          </div>

          {/* Content Overlay */}
          <div className="hero-content">
            {/* Branding */}
            <div className="branding">
              <div className="logo-icon-container">
                <span className="material-symbols-outlined logo-icon">local_shipping</span>
              </div>
              <span className="brand-name">TransitOps</span>
            </div>

            {/* Text Headlines */}
            <div className="hero-text">
              <h1 className="hero-title">Smart Transport Operations</h1>
              <p className="hero-desc">
                Manage your fleet, drivers, trips, maintenance and analytics from one intelligent platform.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="feature-grid">
              {/* Feature Card 1 */}
              <div className="feature-card">
                <div className="feature-icon-container">
                  <span className="material-symbols-outlined">dataset</span>
                </div>
                <h3 className="feature-title">Fleet Management</h3>
                <p className="feature-desc">Complete lifecycle visibility.</p>
              </div>

              {/* Feature Card 2 */}
              <div className="feature-card">
                <div className="feature-icon-container">
                  <span className="material-symbols-outlined">route</span>
                </div>
                <h3 className="feature-title">Trip Dispatch</h3>
                <p className="feature-desc">Optimized routing &amp; scheduling.</p>
              </div>

              {/* Feature Card 3 */}
              <div className="feature-card">
                <div className="feature-icon-container">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <h3 className="feature-title">Driver Management</h3>
                <p className="feature-desc">Compliance &amp; performance.</p>
              </div>

              {/* Feature Card 4 */}
              <div className="feature-card">
                <div className="feature-icon-container">
                  <span className="material-symbols-outlined">monitoring</span>
                </div>
                <h3 className="feature-title">Real-time Analytics</h3>
                <p className="feature-desc">Data-driven decision making.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Login Form (55%) */}
        <section className="form-section">
          <div className="login-card">
            {/* Branding In Card */}
            <div className="card-header">
              <div className="card-logo">
                <span className="material-symbols-outlined logo-icon">local_shipping</span>
              </div>
              <h2 className="card-title">Welcome Back</h2>
              <p className="card-subtitle">Sign in to continue your workspace.</p>
            </div>

            {/* Form Fields */}
            <form className="login-form" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon-left">mail</span>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@transitops.com" 
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="input-container">
                  <span className="material-symbols-outlined input-icon-left">lock</span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="form-input"
                    required
                    disabled={isLoading}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              

              {/* Extras */}
              <div className="form-extras">
                <label className="remember-me-label">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="remember-checkbox"
                    disabled={isLoading}
                  />
                  <span className="remember-text">Remember me</span>
                </label>
                <a href="#forgot" className="forgot-password-link" onClick={(e) => { e.preventDefault(); addToast("Password reset workflow is not configured.", 'info'); }}>
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span>Signing In...</span>
                    <span className="material-symbols-outlined animate-spin" style={{ animation: 'spin 1s linear infinite' }}>sync</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            {/* Form Footer */}
            <div className="card-divider"></div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="global-footer">
        <div className="footer-copyright">
          TransitOps &copy; 2026
        </div>
      </footer>

      {/* Toast Notifications Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="material-symbols-outlined toast-icon">
              {toast.type === 'success' && 'check_circle'}
              {toast.type === 'error' && 'error'}
              {toast.type === 'warning' && 'warning'}
              {toast.type === 'info' && 'info'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button type="button" className="toast-close" onClick={() => removeToast(toast.id)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Embedded Spin Animation Keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
