import React, { useState } from 'react';

export default function FleetManagement({ vehicles, onAddVehicle }) {
  const [newVehicleReg, setNewVehicleReg] = useState('');
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('van');
  const [newVehicleCap, setNewVehicleCap] = useState('');
  const [newVehicleOdo, setNewVehicleOdo] = useState('');
  const [newVehicleCost, setNewVehicleCost] = useState('');
  const [newVehicleRegion, setNewVehicleRegion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newVehicleReg || !newVehicleName || !newVehicleCap || !newVehicleCost) {
      setError('Please fill out all vehicle registry fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onAddVehicle({
        registration_number: newVehicleReg,
        name_model: newVehicleName,
        type: newVehicleType,
        max_load_capacity_kg: parseFloat(newVehicleCap),
        odometer: parseFloat(newVehicleOdo) || 0,
        acquisition_cost: parseFloat(newVehicleCost),
        region: newVehicleRegion,
      });
      setNewVehicleReg('');
      setNewVehicleName('');
      setNewVehicleCap('');
      setNewVehicleOdo('');
      setNewVehicleCost('');
      setNewVehicleRegion('');
    } catch (err) {
      setError(err.message || 'Failed to add vehicle. Registration number may already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusLabel = (s) => {
    const map = { available: 'Available', on_trip: 'On Trip', in_shop: 'In Shop', retired: 'Retired' };
    return map[s] || s;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Manage and track your global fleet inventory from a central dashboard.</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">directions_bus</span>
          </div>
          <span className="kpi-label">Active Fleet Units</span>
          <span className="kpi-value">{vehicles.length}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">check_circle</span>
          </div>
          <span className="kpi-label">Available Vehicles</span>
          <span className="kpi-value">
            {vehicles.filter(v => v.status === 'available').length}
          </span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">build</span>
          </div>
          <span className="kpi-label">In Maintenance Shop</span>
          <span className="kpi-value">
            {vehicles.filter(v => v.status === 'in_shop').length}
          </span>
        </div>
      </div>

      <div className="quick-actions-panel">
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Register Vehicle</h3>
          </div>
          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-group">
              <label className="form-label">Registration No.</label>
              <input 
                type="text" 
                value={newVehicleReg} 
                onChange={e => setNewVehicleReg(e.target.value)} 
                placeholder="e.g. GJ01UB452" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name / Model</label>
              <input 
                type="text" 
                value={newVehicleName} 
                onChange={e => setNewVehicleName(e.target.value)} 
                placeholder="e.g. Tata Ace Gold" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Type</label>
              <select 
                value={newVehicleType} 
                onChange={e => setNewVehicleType(e.target.value)} 
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="van">Van</option>
                <option value="truck">Truck</option>
                <option value="mini">Mini</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Load Capacity (KG)</label>
              <input 
                type="number" 
                step="0.01"
                value={newVehicleCap} 
                onChange={e => setNewVehicleCap(e.target.value)} 
                placeholder="e.g. 2500" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Odometer (KM)</label>
              <input 
                type="number" 
                step="0.01"
                value={newVehicleOdo} 
                onChange={e => setNewVehicleOdo(e.target.value)} 
                placeholder="0" 
                className="form-input" 
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Acquisition Cost ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={newVehicleCost} 
                onChange={e => setNewVehicleCost(e.target.value)} 
                placeholder="e.g. 850000" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Region</label>
              <input 
                type="text" 
                value={newVehicleRegion} 
                onChange={e => setNewVehicleRegion(e.target.value)} 
                placeholder="e.g. North, South, East, West" 
                className="form-input" 
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center' }} disabled={isSubmitting}>
              <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'add'}</span>
              <span>{isSubmitting ? 'Adding...' : 'Add Vehicle'}</span>
            </button>
          </form>
        </div>

        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active Fleet Inventory</h3>
          </div>
          <div className="info-bar">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Rule: Registration No. must be unique. Retired/In Shop vehicles are hidden from Trip Dispatcher.</span>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Reg. No</th>
                  <th>Name/Model</th>
                  <th>Type</th>
                  <th>Capacity (KG)</th>
                  <th>Odometer (KM)</th>
                  <th>Cost ($)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td><span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>{v.registration_number}</span></td>
                    <td><strong>{v.name_model}</strong></td>
                    <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                    <td>{parseFloat(v.max_load_capacity_kg).toLocaleString()} kg</td>
                    <td>{parseFloat(v.odometer).toLocaleString()}</td>
                    <td>{parseFloat(v.acquisition_cost).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${
                        v.status === 'available' ? 'badge-success' :
                        v.status === 'on_trip' ? 'badge-info' :
                        v.status === 'in_shop' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {statusLabel(v.status)}
                      </span>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No vehicles registered yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
