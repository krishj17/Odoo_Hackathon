import React, { useState } from 'react';

export default function DriverDirectory({ drivers, onAddDriver }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', license_number: '', license_category: 'LMV',
    license_expiry_date: '', contact_number: '', safety_score: '100', status: 'available',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await onAddDriver(formData);
      setFormData({ name: '', license_number: '', license_category: 'LMV', license_expiry_date: '', contact_number: '', safety_score: '100', status: 'available' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
  };

  const statusLabel = (s) => {
    const map = { available: 'Available', on_trip: 'On Trip', off_duty: 'Off Duty', suspended: 'Suspended' };
    return map[s] || s;
  };

  const availableCount = drivers.filter(d => d.status === 'available').length;
  const onDutyCount = drivers.filter(d => d.status === 'on_trip').length;
  const suspendedCount = drivers.filter(d => d.status === 'suspended').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers &amp; Safety Profiles</h1>
          <p className="page-subtitle">Real-time status monitoring of driver credentials and safety logs.</p>
        </div>
        {onAddDriver && (
          <button className="primary-action-btn" onClick={() => setShowForm(!showForm)}>
            <span className="material-symbols-outlined">{showForm ? 'close' : 'person_add'}</span>
            <span>{showForm ? 'Cancel' : 'Add Driver'}</span>
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">groups</span>
          </div>
          <span className="kpi-label">Total Drivers</span>
          <span className="kpi-value">{drivers.length}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">check_circle</span>
          </div>
          <span className="kpi-label">Available</span>
          <span className="kpi-value">{availableCount}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">local_shipping</span>
          </div>
          <span className="kpi-label">On Trip</span>
          <span className="kpi-value">{onDutyCount}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">warning</span>
          </div>
          <span className="kpi-label">Suspended</span>
          <span className="kpi-value">{suspendedCount}</span>
        </div>
      </div>

      {showForm && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Register New Driver</h3>
          </div>
          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rajesh Kumar" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input type="text" name="license_number" value={formData.license_number} onChange={handleChange} placeholder="e.g. MH1220230001" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">License Category</label>
                <select name="license_category" value={formData.license_category} onChange={handleChange} className="form-select" disabled={isSubmitting}>
                  <option value="LMV">LMV</option>
                  <option value="HMV">HMV</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">License Expiry Date</label>
                <input type="date" name="license_expiry_date" value={formData.license_expiry_date} onChange={handleChange} className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="e.g. 9876543210" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Safety Score</label>
                <input type="number" name="safety_score" value={formData.safety_score} onChange={handleChange} placeholder="100" className="form-input" disabled={isSubmitting} />
              </div>
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center' }} disabled={isSubmitting}>
              <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'person_add'}</span>
              <span>{isSubmitting ? 'Adding...' : 'Register Driver'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="content-panel">
        <div className="panel-header">
          <h3 className="panel-title">Driver Personnel Directory</h3>
        </div>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>License No</th>
                <th>Category</th>
                <th>Expiry</th>
                <th>Safety Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="driver-profile-row">
                      <div className="driver-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '13px' }}>
                        {d.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="driver-profile-name">{d.name}</div>
                        <div className="driver-profile-sub">{d.contact_number}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="font-mono">{d.license_number}</span></td>
                  <td><span className="badge badge-neutral">{d.license_category}</span></td>
                  <td>
                    <span style={{ fontSize: '13px', fontWeight: isExpired(d.license_expiry_date) ? '600' : 'normal', color: isExpired(d.license_expiry_date) ? '#dc2626' : 'inherit' }}>
                      {formatDate(d.license_expiry_date)}
                      {isExpired(d.license_expiry_date) && ' EXPIRED'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${parseFloat(d.safety_score) >= 80 ? 'badge-success' : parseFloat(d.safety_score) >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                      {d.safety_score || '100'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      d.status === 'available' ? 'badge-success' :
                      d.status === 'on_trip' ? 'badge-info' :
                      d.status === 'suspended' ? 'badge-danger' : 'badge-neutral'
                    }`}>
                      {statusLabel(d.status)}
                    </span>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No drivers registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
