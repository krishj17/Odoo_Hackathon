import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function FinancialAnalytics({ stats, expenses }) {
  const [reports, setReports] = useState([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
  const fuelExpenses = expenses?.filter(e => e.expense_type?.toLowerCase().includes('fuel')).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
  const maintenanceCost = parseFloat(stats?.total_maintenance_cost || 0);
  const acquisitionCost = parseFloat(stats?.total_acquisition_cost || 0);
  const totalTrips = stats?.total_trips || 0;
  const completedTrips = stats?.completed_trips || 0;
  const fleetUtilization = stats?.fleet_utilization || 0;

  const expenseBreakdown = {};
  expenses?.forEach(e => {
    const type = e.expense_type || 'other';
    expenseBreakdown[type] = (expenseBreakdown[type] || 0) + parseFloat(e.amount || 0);
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await api.get('/dashboard/reports/');
        setReports(data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      } finally {
        setIsLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    window.open('/api/dashboard/reports/csv/', '_blank');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Intelligence &amp; Analytics</h1>
          <p className="page-subtitle">Real-time transit operations profitability tracking.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="primary-action-btn"
        >
          <span className="material-symbols-outlined">download</span>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="kpi-grid">
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">payments</span>
          </div>
          <span className="kpi-label">Total Fleet Expenses</span>
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
            <span className="material-symbols-outlined glass-card-icon">build</span>
          </div>
          <span className="kpi-label">Maintenance Costs</span>
          <span className="kpi-value">${maintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="material-symbols-outlined glass-card-icon">speed</span>
          </div>
          <span className="kpi-label">Fleet Utilization</span>
          <span className="kpi-value">{fleetUtilization}%</span>
        </div>
      </div>

      <div className="quick-actions-panel">
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Expense Breakdown by Type</h3>
          </div>
          <div className="chart-row">
            {Object.entries(expenseBreakdown).length > 0 ? (
              Object.entries(expenseBreakdown).map(([type, amount]) => {
                const maxAmount = Math.max(...Object.values(expenseBreakdown));
                const pct = maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
                return (
                  <div className="chart-bar-container" key={type}>
                    <div className="chart-bar" style={{ height: `${Math.max(pct, 10)}%` }} title={`${type}: $${amount.toFixed(2)}`}></div>
                    <span className="chart-bar-label" style={{ textTransform: 'capitalize' }}>{type}</span>
                  </div>
                );
              })
            ) : (
              <div style={{ width: '100%', textAlign: 'center', padding: '2rem', color: 'var(--outline)' }}>No expense data yet.</div>
            )}
          </div>
        </div>

        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Fleet Financial Summary</h3>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Acquisition Cost</td>
                  <td><strong>${acquisitionCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                </tr>
                <tr>
                  <td>Total Operational Expenses</td>
                  <td><strong>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                </tr>
                <tr>
                  <td>Total Maintenance Cost</td>
                  <td><strong>${maintenanceCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                </tr>
                <tr>
                  <td>Total Trips</td>
                  <td><strong>{totalTrips}</strong></td>
                </tr>
                <tr>
                  <td>Completed Trips</td>
                  <td><strong>{completedTrips}</strong></td>
                </tr>
                <tr>
                  <td>Avg Cost per Trip</td>
                  <td><strong>${totalTrips > 0 ? (totalExpenses / totalTrips).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vehicle Performance Report */}
      {!isLoadingReports && reports.length > 0 && (
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Vehicle Performance Report</h3>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Trips</th>
                  <th>Distance (km)</th>
                  <th>Fuel (L)</th>
                  <th>Fuel Efficiency</th>
                  <th>Operational Cost</th>
                  <th>Revenue</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.vehicle_id}>
                    <td>
                      <strong>{r.name_model}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--outline)' }}>{r.registration_number}</div>
                    </td>
                    <td>{r.total_trips}</td>
                    <td>{parseFloat(r.total_distance_km).toLocaleString()}</td>
                    <td>{parseFloat(r.total_fuel_l).toLocaleString()}</td>
                    <td>{parseFloat(r.fuel_efficiency).toFixed(2)} km/L</td>
                    <td>${parseFloat(r.total_operational_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>${parseFloat(r.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`badge ${parseFloat(r.roi_percent) >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {parseFloat(r.roi_percent).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
