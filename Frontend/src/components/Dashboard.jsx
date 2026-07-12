import React, { useState, useEffect } from 'react';
import FleetManagement from './FleetManagement';
import MaintenanceLog from './MaintenanceLog';
import FleetDashboard from './FleetDashboard';
import TripsDispatch from './TripsDispatch';
import DriverDirectory from './DriverDirectory';
import ComplianceLog from './ComplianceLog';
import FuelExpenses from './FuelExpenses';
import FinancialAnalytics from './FinancialAnalytics';
import { api } from '../api';

// Helper to capitalize strings
const capitalize = (str) => {
  if (!str) return '';
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Helper to format email into Name
const getNameFromEmail = (email) => {
  if (!email) return 'User';
  const prefix = email.split('@')[0];
  return prefix.split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Role-to-Tabs Mapping
const roleTabs = {
  'fleet-manager': [
    { id: 'fleet', label: 'Fleet Management', icon: 'directions_bus' },
    { id: 'maintenance', label: 'Maintenance Log', icon: 'build' }
  ],
  'dispatcher': [
    { id: 'dashboard', label: 'Fleet Dashboard', icon: 'dashboard' },
    { id: 'trips', label: 'Trips & Dispatch', icon: 'route' }
  ],
  'safety-officer': [
    { id: 'drivers', label: 'Driver Directory', icon: 'person_pin_circle' },
    { id: 'compliance', label: 'Compliance Log', icon: 'security' }
  ],
  'financial-analyst': [
    { id: 'fuel-expenses', label: 'Fuel & Expenses', icon: 'payments' },
    { id: 'analytics', label: 'Financial Analytics', icon: 'analytics' }
  ]
};

export default function Dashboard({ user, onLogout }) {
  const userRole = user?.role || 'fleet-manager';
  const userEmail = user?.email || '';
  const userName = getNameFromEmail(userEmail);
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const allowedTabs = roleTabs[userRole] || roleTabs['fleet-manager'];
  const [activeTab, setActiveTab] = useState(allowedTabs[0]?.id || 'fleet');

  // Shared Master States - fetched from backend
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Fetch all data from backend
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoadingData(true);
      try {
        const [vehiclesData, driversData, maintenanceData, tripsData, expensesData, statsData] = await Promise.allSettled([
          api.get('/fleet/vehicles/'),
          api.get('/fleet/drivers/'),
          api.get('/fleet/maintenance/'),
          api.get('/trips/trips/'),
          api.get('/trips/expenses/'),
          api.get('/dashboard/stats/'),
        ]);

        if (vehiclesData.status === 'fulfilled') setVehicles(vehiclesData.value);
        if (driversData.status === 'fulfilled') setDrivers(driversData.value);
        if (maintenanceData.status === 'fulfilled') setMaintenanceLogs(maintenanceData.value);
        if (tripsData.status === 'fulfilled') setTrips(tripsData.value);
        if (expensesData.status === 'fulfilled') setExpenses(expensesData.value);
        if (statsData.status === 'fulfilled') setStats(statsData.value);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, []);

  // Dynamic stylesheet injection for Material Symbols and Fonts
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
      if (document.head.contains(interLink)) document.head.removeChild(interLink);
      if (document.head.contains(materialLink)) document.head.removeChild(materialLink);
    };
  }, []);

  const handleAddVehicle = async (newV) => {
    try {
      const created = await api.post('/fleet/vehicles/', {
        registration_number: newV.registration_number,
        name_model: newV.name_model,
        type: newV.type.toLowerCase(),
        max_load_capacity_kg: newV.max_load_capacity_kg,
        odometer: newV.odometer || 0,
        acquisition_cost: newV.acquisition_cost,
        region: newV.region || '',
        status: 'available',
      });
      setVehicles([created, ...vehicles]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const handleAddMaint = async (newM) => {
    try {
      const created = await api.post('/fleet/maintenance/', {
        vehicle: newM.vehicle_id,
        service_type: newM.service_type,
        cost: newM.cost,
        service_date: newM.service_date,
        status: newM.status === 'Pending' ? 'active' : newM.status === 'Completed' ? 'completed' : 'active',
      });
      setMaintenanceLogs([created, ...maintenanceLogs]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateMaint = async (id, updates) => {
    try {
      const updated = await api.patch(`/fleet/maintenance/${id}/`, updates);
      setMaintenanceLogs(maintenanceLogs.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const handleAddTrip = async (newT) => {
    try {
      const created = await api.post('/trips/trips/', newT);
      setTrips([created, ...trips]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const handleAddDriver = async (newD) => {
    try {
      const created = await api.post('/fleet/drivers/', {
        name: newD.name,
        license_number: newD.license_number,
        license_category: newD.license_category,
        license_expiry_date: newD.license_expiry_date,
        contact_number: newD.contact_number,
        safety_score: newD.safety_score || 100,
        status: newD.status || 'available',
      });
      setDrivers([created, ...drivers]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  const handleAddExpense = async (newE) => {
    try {
      const created = await api.post('/trips/expenses/', newE);
      setExpenses([created, ...expenses]);
      return created;
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="transitops-dashboard animate-fade-in">
      <style>{`
        .transitops-dashboard {
          /* Colors (Velocity theme - Light Blue & Deep Navy) */
          --surface-container: #ebedff;
          --on-secondary-container: #5a6278;
          --on-surface: #181b28;
          --tertiary: #006229;
          --primary: #004ac6;
          --on-surface-variant: #434655;
          --outline: #737686;
          --outline-variant: #c3c6d7;
          --surface-container-low: #f3f2ff;
          --primary-container: #2563eb;
          --on-primary-container: #eeefff;
          --primary-fixed-dim: #b4c5ff;
          --background: #faf8ff;
          --surface: #faf8ff;
          --white: #ffffff;
          --sidebar-bg: #ffffff;
          --sidebar-text: #434655;
          --sidebar-active-bg: #f3f2ff;
          --sidebar-active-text: #004ac6;
          --border-color: rgba(195, 198, 215, 0.4);

          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--on-surface);
          background-color: var(--background);
          min-height: 100vh;
          display: flex;
          box-sizing: border-box;
          width: 100%;
        }

        .transitops-dashboard *,
        .transitops-dashboard *::before,
        .transitops-dashboard *::after {
          box-sizing: border-box;
        }

        /* Sidebar styling */
        .dashboard-sidebar {
          width: 280px;
          background-color: var(--sidebar-bg);
          color: var(--sidebar-text);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
        }

        .sidebar-brand {
          display: flex;
          flex-direction: column;
          padding: 2rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .brand-subtext {
          font-size: 10px;
          font-weight: 700;
          color: var(--outline);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        /* Sidebar profile widget */
        .sidebar-profile {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          background-color: rgba(0, 0, 0, 0.01);
        }

        .profile-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background-color: var(--primary-fixed-dim);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          border: 2px solid var(--white);
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .profile-name {
          color: var(--on-surface);
          font-size: 14px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-role {
          font-size: 10px;
          color: var(--primary);
          background-color: var(--sidebar-active-bg);
          padding: 0.15rem 0.5rem;
          border-radius: 99px;
          align-self: flex-start;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Sidebar navigation link */
        .sidebar-nav {
          flex-grow: 1;
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: var(--sidebar-text);
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: var(--background);
          color: var(--primary);
        }

        .nav-link.active {
          background-color: var(--sidebar-active-bg);
          color: var(--sidebar-active-text);
          font-weight: 700;
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--primary);
          border-radius: 4px 0 0 4px;
        }

        .nav-link .material-symbols-outlined {
          font-size: 20px;
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.65rem;
          background-color: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background-color: #ef4444;
          color: var(--white);
          border-color: #ef4444;
        }

        /* Main Workspace area */
        .dashboard-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Top Navbar */
        .dashboard-navbar {
          height: 64px;
          background-color: var(--white);
          border-bottom: 1px solid var(--outline-variant);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          flex-shrink: 0;
        }

        .navbar-search {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--background);
          padding: 0.5rem 1rem;
          border-radius: 99px;
          width: 320px;
          border: 1px solid var(--outline-variant);
        }

        .search-icon {
          color: var(--outline);
          font-size: 18px;
        }

        .search-input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 13px;
          color: var(--on-surface);
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .action-icon-btn {
          background: none;
          border: none;
          color: var(--outline);
          cursor: pointer;
          position: relative;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s, color 0.2s;
        }

        .action-icon-btn:hover {
          background-color: var(--surface-container-low);
          color: var(--on-surface);
        }

        .badge-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 7px;
          height: 7px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 1.5px solid var(--white);
        }

        .navbar-user-tag {
          font-size: 11px;
          font-weight: 700;
          color: var(--primary);
          background-color: var(--surface-container-low);
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          border: 1px solid var(--border-color);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Workspace content styling */
        .workspace-content {
          flex-grow: 1;
          padding: 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
        }

        .page-title {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--on-surface);
          margin: 0 0 0.25rem 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--on-surface-variant);
          margin: 0;
        }

        .primary-action-btn {
          background-color: var(--primary);
          color: var(--white);
          border: none;
          padding: 0.65rem 1.25rem;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 74, 198, 0.15);
          transition: all 0.2s ease;
        }

        .primary-action-btn:hover {
          background-color: #003ea8;
          transform: translateY(-1px);
        }

        /* Bento KPI Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .glass-card {
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.25rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.01);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
        }

        .glass-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .glass-card-icon {
          padding: 0.5rem;
          background-color: rgba(0, 74, 198, 0.08);
          color: var(--primary);
          border-radius: 8px;
          font-size: 20px;
        }

        .kpi-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--outline);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--on-surface);
          margin-top: 0.25rem;
        }

        .kpi-info-badge {
          font-size: 11px;
          font-weight: 700;
          color: var(--tertiary);
          text-transform: uppercase;
        }

        .kpi-info-badge.red {
          color: #dc2626;
        }

        /* Layout panels */
        .content-panel {
          background-color: var(--white);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.01);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--outline-variant);
          padding-bottom: 0.75rem;
        }

        .panel-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--on-surface);
          margin: 0;
        }

        .info-bar {
          background-color: var(--surface-container-low);
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 12px;
          font-style: italic;
          color: var(--on-surface-variant);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(195, 198, 215, 0.25);
          margin-bottom: 1.25rem;
        }

        /* Forms */
        .dashboard-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--outline);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input, .form-select {
          width: 100%;
          padding: 0.65rem 1rem;
          background-color: var(--white);
          border: 1px solid var(--outline-variant);
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          color: var(--on-surface);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus, .form-select:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0, 74, 198, 0.08);
        }

        /* Tables */
        .dashboard-table-wrapper {
          overflow-x: auto;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }

        .dashboard-table th {
          padding: 0.75rem 1rem;
          background-color: var(--surface-container-low);
          color: var(--outline);
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--outline-variant);
        }

        .dashboard-table td {
          padding: 0.9rem 1rem;
          border-bottom: 1px solid rgba(195, 198, 215, 0.25);
          color: var(--on-surface);
          vertical-align: middle;
        }

        .dashboard-table tbody tr:hover {
          background-color: rgba(0, 74, 198, 0.02);
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }

        /* Status Tags */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.2rem 0.6rem;
          border-radius: 99px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .badge-success {
          background-color: #d1fae5;
          color: #065f46;
        }

        .badge-info {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .badge-warning {
          background-color: #fef3c7;
          color: #92400e;
        }

        .badge-danger {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .badge-neutral {
          background-color: #f1f5f9;
          color: #475569;
        }

        /* Driver Details Grid */
        .driver-profile-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .driver-profile-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 8px;
          overflow: hidden;
          background-color: var(--surface-container);
          flex-shrink: 0;
        }

        .driver-profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .driver-profile-name {
          font-weight: 600;
          color: var(--on-surface);
        }

        .driver-profile-sub {
          font-size: 11px;
          color: var(--outline);
        }

        /* Mock Progress Bar */
        .progress-bar-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar-bg {
          width: 80px;
          height: 6px;
          background-color: var(--surface-container);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background-color: var(--tertiary);
          border-radius: 99px;
        }

        .progress-bar-fill.blue {
          background-color: var(--primary);
        }

        /* Charts */
        .chart-row {
          display: flex;
          gap: 1.5rem;
          height: 220px;
          align-items: flex-end;
          padding: 1.5rem 0 0.5rem 0;
          border-bottom: 1px solid var(--outline-variant);
        }

        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .chart-bar {
          width: 100%;
          max-width: 48px;
          background: linear-gradient(180deg, var(--primary-fixed-dim) 0%, var(--primary) 100%);
          border-radius: 6px 6px 0 0;
          transition: height 0.8s ease-in-out, opacity 0.2s;
          cursor: pointer;
        }

        .chart-bar:hover {
          opacity: 0.85;
        }

        .chart-bar-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--outline);
          text-transform: uppercase;
        }

        /* Sidebar action triggers */
        .quick-actions-panel {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }

        @media (max-width: 992px) {
          .quick-actions-panel {
            grid-template-columns: 1fr;
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .transitops-dashboard.animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>

      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="brand-text">TransitOps</span>
          <span className="brand-subtext">Velocity Edition</span>
        </div>

        {/* Profile Card */}
        <div className="sidebar-profile">
          <div className="profile-avatar">{userInitials}</div>
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-role">{capitalize(userRole)}</span>
          </div>
        </div>

        {/* Tab Navigation links */}
        <nav className="sidebar-nav">
          {allowedTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="nav-text">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="dashboard-main">
        {/* Top Navbar */}
        <header className="dashboard-navbar">
          <div className="navbar-search">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search operational resources..." className="search-input" />
          </div>

          <div className="navbar-actions">
            <div className="navbar-user-tag">{capitalize(userRole)} Workspace</div>
            <button className="action-icon-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="badge-dot"></span>
            </button>
            <button className="action-icon-btn">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Content Panel Area */}
        <div className="workspace-content">
          {isLoadingData && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div style={{
                width: '36px', height: '36px', border: '3px solid #c3c6d7',
                borderTop: '3px solid #2563eb', borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!isLoadingData && activeTab === 'fleet' && (
            <FleetManagement vehicles={vehicles} onAddVehicle={handleAddVehicle} />
          )}

          {!isLoadingData && activeTab === 'maintenance' && (
            <MaintenanceLog 
              vehicles={vehicles} 
              maintenanceLogs={maintenanceLogs} 
              onAddMaint={handleAddMaint}
              onUpdateMaint={handleUpdateMaint}
            />
          )}

          {!isLoadingData && activeTab === 'dashboard' && (
            <FleetDashboard stats={stats} vehicles={vehicles} drivers={drivers} trips={trips} />
          )}

          {!isLoadingData && activeTab === 'trips' && (
            <TripsDispatch 
              trips={trips} 
              vehicles={vehicles} 
              drivers={drivers} 
              onAddTrip={handleAddTrip}
              onToast={addToast}
            />
          )}

          {!isLoadingData && activeTab === 'drivers' && (
            <DriverDirectory drivers={drivers} onAddDriver={handleAddDriver} />
          )}

          {!isLoadingData && activeTab === 'compliance' && (
            <ComplianceLog />
          )}

          {!isLoadingData && activeTab === 'fuel-expenses' && (
            <FuelExpenses 
              expenses={expenses} 
              vehicles={vehicles} 
              onAddExpense={handleAddExpense} 
            />
          )}

          {!isLoadingData && activeTab === 'analytics' && (
            <FinancialAnalytics stats={stats} expenses={expenses} />
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '0.75rem', pointerEvents: 'none' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem 1.25rem', borderRadius: '12px', minWidth: '320px', maxWidth: '450px',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)',
            backgroundColor: 'var(--white)', border: '1px solid var(--outline-variant)',
            borderLeft: `4px solid ${toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#2563eb'}`,
            animation: 'toastSlideIn 0.3s ease forwards'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#dc2626' : '#2563eb' }}>
              {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, flex: 1, color: 'var(--on-surface)' }}>{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', padding: '2px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes toastSlideIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
