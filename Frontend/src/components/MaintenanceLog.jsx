import React, { useState } from 'react';

export default function MaintenanceLog({ vehicles, maintenanceLogs, onAddMaint, onUpdateMaint }) {
  const [maintVehicleId, setMaintVehicleId] = useState('');
  const [maintType, setMaintType] = useState('');
  const [maintCost, setMaintCost] = useState('');
  const [maintDate, setMaintDate] = useState('');
  const [maintStatus, setMaintStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!maintVehicleId || !maintType || !maintCost || !maintDate) {
      setError('Please fill out all maintenance record fields.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onAddMaint({
        vehicle_id: parseInt(maintVehicleId),
        service_type: maintType,
        cost: parseFloat(maintCost),
        service_date: maintDate,
        status: maintStatus,
      });
      setMaintVehicleId('');
      setMaintType('');
      setMaintCost('');
      setMaintDate('');
      setMaintStatus('active');
    } catch (err) {
      setError(err.message || 'Failed to add maintenance record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (log) => {
    const newStatus = editStatus || (log.status === 'active' ? 'completed' : 'active');
    setIsSubmitting(true);
    setError('');
    try {
      await onUpdateMaint(log.id, { status: newStatus });
      setEditingId(null);
      setEditStatus('');
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (log) => {
    setEditingId(log.id);
    setEditStatus(log.status === 'active' ? 'completed' : 'active');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus('');
  };

  const statusLabel = (s) => {
    const map = { active: 'Active', completed: 'Completed', pending: 'Pending' };
    return map[s] || s;
  };

  const getVehicleName = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? v.name_model : `Vehicle #${vehicleId}`;
  };

  const getVehicleReg = (vehicleId) => {
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? v.registration_number : '';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Maintenance &amp; Service Log</h1>
          <p className="page-subtitle">Monitor scheduled maintenance, pending work orders and costs.</p>
        </div>
      </div>

      <div className="quick-actions-panel">
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Log Service Record</h3>
          </div>
          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <select 
                value={maintVehicleId} 
                onChange={e => setMaintVehicleId(e.target.value)} 
                className="form-select"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Vehicle</option>
                {vehicles.filter(v => v.status !== 'retired').map((v) => (
                  <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <input 
                type="text" 
                value={maintType} 
                onChange={e => setMaintType(e.target.value)} 
                placeholder="e.g. Brake pad replacement" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={maintCost} 
                onChange={e => setMaintCost(e.target.value)} 
                placeholder="0.00" 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                value={maintDate} 
                onChange={e => setMaintDate(e.target.value)} 
                className="form-input" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                value={maintStatus} 
                onChange={e => setMaintStatus(e.target.value)} 
                className="form-select"
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center' }} disabled={isSubmitting}>
              <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
              <span>{isSubmitting ? 'Saving...' : 'Save Record'}</span>
            </button>
          </form>
        </div>

        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Active Work Logs</h3>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="font-mono" style={{ color: 'var(--primary)', fontWeight: 600 }}>WO-{String(log.id).padStart(4, '0')}</span></td>
                    <td>
                      <strong>{getVehicleName(log.vehicle)}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{getVehicleReg(log.vehicle)}</div>
                    </td>
                    <td>{log.service_type}</td>
                    <td>{log.service_date}</td>
                    <td>${parseFloat(log.cost).toLocaleString()}</td>
                    <td>
                      {editingId === log.id ? (
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}
                          disabled={isSubmitting}
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`badge ${
                          log.status === 'completed' ? 'badge-success' :
                          log.status === 'active' ? 'badge-warning' : 'badge-neutral'
                        }`}>
                          {statusLabel(log.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === log.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => handleStatusUpdate(log)}
                            className="action-btn action-btn-primary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="action-btn action-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(log)}
                          className="action-btn action-btn-primary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {maintenanceLogs.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No maintenance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
