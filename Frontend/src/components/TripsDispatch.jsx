import React, { useState } from 'react';
import { api } from '../api';

const VEHICLE_STATUS_LABELS = {
  available: 'Available',
  on_trip: 'On Trip',
  in_shop: 'In Shop',
  retired: 'Retired',
};

const VEHICLE_STATUS_COLORS = {
  available: 'badge-success',
  on_trip: 'badge-info',
  in_shop: 'badge-warning',
  retired: 'badge-danger',
};

const TRIP_STATUS_LABELS = {
  draft: 'Draft',
  dispatched: 'Dispatched',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function TripsDispatch({ trips, vehicles, drivers, onAddTrip, onToast }) {
  const [showForm, setShowForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(null);
  const [formData, setFormData] = useState({
    trip_code: '', source: '', destination: '', vehicle: '', driver: '',
    cargo_weight_kg: '', planned_distance_km: '', revenue: '',
  });
  const [completeData, setCompleteData] = useState({ final_odometer: '', fuel_consumed_l: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [weightWarning, setWeightWarning] = useState('');

  const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle));
  const availableDrivers = drivers.filter(d => d.status === 'available');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'vehicle' || name === 'cargo_weight_kg') {
      const vehicleId = name === 'vehicle' ? value : formData.vehicle;
      const weight = name === 'cargo_weight_kg' ? value : formData.cargo_weight_kg;
      if (vehicleId && weight) {
        const v = vehicles.find(v => v.id === parseInt(vehicleId));
        if (v && parseFloat(weight) > parseFloat(v.max_load_capacity_kg)) {
          setWeightWarning(`Overweight! Cargo (${weight} kg) exceeds ${v.name_model} capacity (${parseFloat(v.max_load_capacity_kg).toLocaleString()} kg).`);
        } else {
          setWeightWarning('');
        }
      } else {
        setWeightWarning('');
      }
    }
  };

  const handleCompleteChange = (e) => {
    setCompleteData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedVehicle && formData.cargo_weight_kg) {
      if (parseFloat(formData.cargo_weight_kg) > parseFloat(selectedVehicle.max_load_capacity_kg)) {
        setError(`Cannot create trip: Cargo weight (${formData.cargo_weight_kg} kg) exceeds ${selectedVehicle.name_model}'s maximum capacity of ${parseFloat(selectedVehicle.max_load_capacity_kg).toLocaleString()} kg.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onAddTrip({
        trip_code: formData.trip_code,
        source: formData.source,
        destination: formData.destination,
        cargo_weight_kg: parseFloat(formData.cargo_weight_kg),
        planned_distance_km: parseFloat(formData.planned_distance_km),
        revenue: parseFloat(formData.revenue) || 0,
        vehicle: formData.vehicle ? parseInt(formData.vehicle) : null,
        driver: formData.driver ? parseInt(formData.driver) : null,
        status: 'draft',
      });
      setFormData({ trip_code: '', source: '', destination: '', vehicle: '', driver: '', cargo_weight_kg: '', planned_distance_km: '', revenue: '' });
      setWeightWarning('');
      setShowForm(false);
      if (onToast) onToast('Trip created successfully!', 'success');
    } catch (err) {
      const msg = err.data?.cargo_weight_kg?.[0] || err.data?.detail || err.message || 'Failed to create trip.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatch = async (trip) => {
    try {
      await api.patch(`/trips/trips/${trip.id}/`, { status: 'dispatched' });
      if (onToast) onToast(`Trip ${trip.trip_code} dispatched successfully! Vehicle and driver are now On Trip.`, 'success');
      window.location.reload();
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to dispatch trip.', 'error');
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!completeData.final_odometer || !completeData.fuel_consumed_l) {
      if (onToast) onToast('Please enter final odometer and fuel consumed.', 'error');
      return;
    }
    try {
      await api.post(`/trips/trips/${showCompleteForm.id}/complete/`, {
        final_odometer: parseFloat(completeData.final_odometer),
        fuel_consumed_l: parseFloat(completeData.fuel_consumed_l),
      });
      setShowCompleteForm(null);
      setCompleteData({ final_odometer: '', fuel_consumed_l: '' });
      if (onToast) onToast(`Trip ${showCompleteForm.trip_code} completed! Vehicle and driver are now Available.`, 'success');
      window.location.reload();
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to complete trip.', 'error');
    }
  };

  const handleCancel = async (trip) => {
    try {
      await api.post(`/trips/trips/${trip.id}/cancel/`);
      if (onToast) onToast(`Trip ${trip.trip_code} cancelled. Vehicle and driver restored to Available.`, 'info');
      window.location.reload();
    } catch (err) {
      if (onToast) onToast(err.message || 'Failed to cancel trip.', 'error');
    }
  };

  const activeTrips = trips.filter(t => t.status === 'dispatched').length;
  const draftTrips = trips.filter(t => t.status === 'draft').length;
  const completedTrips = trips.filter(t => t.status === 'completed').length;

  const getVehicleName = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? v.name_model : '-';
  };

  const getVehicleReg = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? v.registration_number : '';
  };

  const getDriverName = (driverId) => {
    const d = drivers.find(d => d.id === driverId);
    return d ? d.name : '-';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Manage and dispatch active trip routes across regional hubs.</p>
        </div>
        {onAddTrip && (
          <button className="primary-action-btn" onClick={() => setShowForm(!showForm)}>
            <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
            <span>{showForm ? 'Cancel' : 'New Trip'}</span>
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">route</span>
          </div>
          <span className="kpi-label">Total Trips</span>
          <span className="kpi-value">{trips.length}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">local_shipping</span>
          </div>
          <span className="kpi-label">Active (Dispatched)</span>
          <span className="kpi-value">{activeTrips}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">edit_note</span>
          </div>
          <span className="kpi-label">Draft</span>
          <span className="kpi-value">{draftTrips}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">check_circle</span>
          </div>
          <span className="kpi-label">Completed</span>
          <span className="kpi-value">{completedTrips}</span>
        </div>
      </div>

      {showForm && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Create New Trip</h3>
          </div>
          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
              {error}
            </div>
          )}
          {weightWarning && !error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>warning</span>
              {weightWarning}
            </div>
          )}
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Trip Code</label>
                <input type="text" name="trip_code" value={formData.trip_code} onChange={handleChange} placeholder="e.g. TR001" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. Mumbai Hub" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input type="text" name="destination" value={formData.destination} onChange={handleChange} placeholder="e.g. Pune Warehouse" className="form-input" required disabled={isSubmitting} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="form-select" disabled={isSubmitting}>
                  <option value="">Select Vehicle</option>
                  {vehicles.filter(v => v.status === 'available').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name_model} ({v.registration_number}) | Cap: {parseFloat(v.max_load_capacity_kg).toLocaleString()} kg
                    </option>
                  ))}
                  {vehicles.filter(v => v.status === 'available').length === 0 && (
                    <option value="" disabled>No available vehicles</option>
                  )}
                </select>
                {selectedVehicle && (
                  <div style={{ marginTop: '0.25rem', fontSize: '11px', color: 'var(--outline)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className={`badge badge-success`} style={{ fontSize: '9px', padding: '0.1rem 0.4rem' }}>
                      Available
                    </span>
                    Max capacity: {parseFloat(selectedVehicle.max_load_capacity_kg).toLocaleString()} kg
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Driver</label>
                <select name="driver" value={formData.driver} onChange={handleChange} className="form-select" disabled={isSubmitting}>
                  <option value="">Select Driver</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.license_number}) - Available
                    </option>
                  ))}
                  {availableDrivers.length === 0 && (
                    <option value="" disabled>No available drivers</option>
                  )}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cargo Weight (KG)</label>
                <input type="number" step="0.01" name="cargo_weight_kg" value={formData.cargo_weight_kg} onChange={handleChange} placeholder="e.g. 450" className="form-input" required disabled={isSubmitting}
                  style={weightWarning ? { borderColor: '#dc2626', boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)' } : {}} />
                {selectedVehicle && formData.cargo_weight_kg && (
                  <div style={{ marginTop: '0.25rem', fontSize: '11px', color: parseFloat(formData.cargo_weight_kg) > parseFloat(selectedVehicle.max_load_capacity_kg) ? '#dc2626' : 'var(--tertiary)', fontWeight: 600 }}>
                    {parseFloat(formData.cargo_weight_kg) > parseFloat(selectedVehicle.max_load_capacity_kg) ? (
                      <>OVERWEIGHT by {(parseFloat(formData.cargo_weight_kg) - parseFloat(selectedVehicle.max_load_capacity_kg)).toLocaleString()} kg</>
                    ) : (
                      <>Within capacity ({Math.round((parseFloat(formData.cargo_weight_kg) / parseFloat(selectedVehicle.max_load_capacity_kg)) * 100)}% used)</>
                    )}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Planned Distance (KM)</label>
                <input type="number" step="0.01" name="planned_distance_km" value={formData.planned_distance_km} onChange={handleChange} placeholder="e.g. 150" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Revenue ($)</label>
                <input type="number" step="0.01" name="revenue" value={formData.revenue} onChange={handleChange} placeholder="0.00" className="form-input" disabled={isSubmitting} />
              </div>
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center' }} disabled={isSubmitting || !!weightWarning}>
              <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'add'}</span>
              <span>{isSubmitting ? 'Creating...' : 'Create Trip'}</span>
            </button>
          </form>
        </div>
      )}

      {showCompleteForm && (
        <div className="content-panel" style={{ border: '2px solid var(--primary)' }}>
          <div className="panel-header">
            <h3 className="panel-title">Complete Trip: {showCompleteForm.trip_code}</h3>
            <button onClick={() => setShowCompleteForm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div style={{ padding: '0.5rem 0', fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
            Enter final odometer reading and fuel consumed to mark this trip as completed. Vehicle and driver will be set back to Available.
          </div>
          <form onSubmit={handleComplete} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Final Odometer (KM)</label>
                <input type="number" step="0.01" name="final_odometer" value={completeData.final_odometer} onChange={handleCompleteChange} placeholder="e.g. 75000" className="form-input" required />
                <div style={{ marginTop: '0.25rem', fontSize: '11px', color: 'var(--outline)' }}>
                  Current vehicle odometer: {selectedVehicle ? parseFloat(selectedVehicle.odometer).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Consumed (Liters)</label>
                <input type="number" step="0.01" name="fuel_consumed_l" value={completeData.fuel_consumed_l} onChange={handleCompleteChange} placeholder="e.g. 45.5" className="form-input" required />
              </div>
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center', backgroundColor: '#059669' }}>
              <span className="material-symbols-outlined">check_circle</span>
              <span>Complete Trip</span>
            </button>
          </form>
        </div>
      )}

      <div className="content-panel">
        <div className="panel-header">
          <h3 className="panel-title">Trip Dispatch Logs</h3>
        </div>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Trip Code</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Cargo (KG)</th>
                <th>Distance (KM)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.trip_code}</strong></td>
                  <td>{t.source}</td>
                  <td>{t.destination}</td>
                  <td>
                    <div>{getVehicleName(t.vehicle)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{getVehicleReg(t.vehicle)}</div>
                  </td>
                  <td>{getDriverName(t.driver)}</td>
                  <td>{parseFloat(t.cargo_weight_kg).toLocaleString()}</td>
                  <td>{parseFloat(t.planned_distance_km).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${
                      t.status === 'dispatched' ? 'badge-info' :
                      t.status === 'completed' ? 'badge-success' :
                      t.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {TRIP_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {t.status === 'draft' && (
                        <button onClick={() => handleDispatch(t)} title="Dispatch Trip" style={{ background: 'none', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span>
                          Dispatch
                        </button>
                      )}
                      {t.status === 'dispatched' && (
                        <>
                          <button onClick={() => { setShowCompleteForm(t); }} title="Complete Trip" style={{ background: 'none', border: '1px solid #059669', color: '#059669', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                            Complete
                          </button>
                          <button onClick={() => handleCancel(t)} title="Cancel Trip" style={{ background: 'none', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                            Cancel
                          </button>
                        </>
                      )}
                      {(t.status === 'completed' || t.status === 'cancelled') && (
                        <span style={{ fontSize: '11px', color: 'var(--outline)', fontStyle: 'italic' }}>No actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No trips created yet. Click "New Trip" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
