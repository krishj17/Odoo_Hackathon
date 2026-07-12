import React, { useState } from 'react';

export default function FuelExpenses({ expenses, vehicles, onAddExpense }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: '', trip: '', expense_type: '', amount: '', description: '',
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
      await onAddExpense({
        vehicle: formData.vehicle ? parseInt(formData.vehicle) : null,
        trip: formData.trip ? parseInt(formData.trip) : null,
        expense_type: formData.expense_type,
        amount: parseFloat(formData.amount) || 0,
        description: formData.description,
      });
      setFormData({ vehicle: '', trip: '', expense_type: '', amount: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Failed to add expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVehicleName = (vehicleId) => {
    const v = vehicles?.find(v => v.id === vehicleId);
    return v ? v.name_model : '-';
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
  const fuelExpenses = expenses?.filter(e => e.expense_type?.toLowerCase().includes('fuel')).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
  const otherExpenses = totalExpenses - fuelExpenses;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel &amp; Expense Management</h1>
          <p className="page-subtitle">Log transactions and monitor consumption trends across your fleet.</p>
        </div>
        {onAddExpense && (
          <button className="primary-action-btn" onClick={() => setShowForm(!showForm)}>
            <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
            <span>{showForm ? 'Cancel' : 'Log Expense'}</span>
          </button>
        )}
      </div>

      <div className="kpi-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">payments</span>
          </div>
          <span className="kpi-label">Total Expenses</span>
          <span className="kpi-value">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">local_gas_station</span>
          </div>
          <span className="kpi-label">Fuel Costs</span>
          <span className="kpi-value">${fuelExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">receipt_long</span>
          </div>
          <span className="kpi-label">Other Expenses</span>
          <span className="kpi-value">${otherExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {showForm && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Log New Expense</h3>
          </div>
          {error && (
            <div style={{ padding: '0.75rem 1rem', marginBottom: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Expense Type</label>
                <select name="expense_type" value={formData.expense_type} onChange={handleChange} className="form-select" required disabled={isSubmitting}>
                  <option value="">Select Type</option>
                  <option value="fuel">Fuel</option>
                  <option value="toll">Toll</option>
                  <option value="parking">Parking</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" className="form-input" required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="form-select" disabled={isSubmitting}>
                  <option value="">Select Vehicle (optional)</option>
                  {vehicles?.map(v => (
                    <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Brief description" className="form-input" required disabled={isSubmitting} />
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center' }} disabled={isSubmitting}>
              <span className="material-symbols-outlined">{isSubmitting ? 'sync' : 'save'}</span>
              <span>{isSubmitting ? 'Saving...' : 'Log Expense'}</span>
            </button>
          </form>
        </div>
      )}

      <div className="content-panel">
        <div className="panel-header">
          <h3 className="panel-title">Expense Transaction Log</h3>
        </div>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Vehicle</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses && expenses.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.created_at).toLocaleDateString()}</td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{e.expense_type}</span></td>
                  <td>{getVehicleName(e.vehicle)}</td>
                  <td>{e.description}</td>
                  <td><strong>${parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                </tr>
              ))}
              {(!expenses || expenses.length === 0) && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No expenses logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
