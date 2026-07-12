import React from 'react';

export default function FleetDashboard({ stats, vehicles, drivers, trips }) {
  const totalVehicles = stats?.total_vehicles ?? vehicles?.length ?? 0;
  const availableVehicles = stats?.available_vehicles ?? 0;
  const inShopVehicles = stats?.in_shop_vehicles ?? 0;
  const activeTrips = stats?.dispatched_trips ?? 0;
  const draftTrips = stats?.draft_trips ?? 0;
  const onTripDrivers = stats?.on_trip_drivers ?? 0;
  const totalTrips = stats?.total_trips ?? 0;
  const utilization = totalVehicles > 0 ? Math.round(((totalVehicles - availableVehicles) / totalVehicles) * 100) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Operations Dashboard</h1>
          <p className="page-subtitle">Real-time dispatcher view of fleet performance and recent activity logs.</p>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span className="kpi-label">Total Vehicles</span>
          <span className="kpi-value">{totalVehicles}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--tertiary)' }}>
          <span className="kpi-label">Available Vehicles</span>
          <span className="kpi-value">{availableVehicles}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid #ba1a1a' }}>
          <span className="kpi-label">In Maintenance</span>
          <span className="kpi-value">{inShopVehicles}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span className="kpi-label">Active Trips</span>
          <span className="kpi-value">{activeTrips}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span className="kpi-label">Pending Trips</span>
          <span className="kpi-value">{draftTrips}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <span className="kpi-label">Drivers On Trip</span>
          <span className="kpi-value">{onTripDrivers}</span>
        </div>
        <div className="glass-card" style={{ borderLeft: '4px solid var(--tertiary)' }}>
          <span className="kpi-label">Fleet Utilization</span>
          <span className="kpi-value">{utilization}%</span>
        </div>
      </div>

      <div className="quick-actions-panel">
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Fleet Status Overview</h3>
          </div>
          <div className="chart-row">
            {['available', 'on_trip', 'in_shop', 'retired'].map(status => {
              const count = vehicles?.filter(v => v.status === status).length || 0;
              const pct = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
              const labels = { available: 'Available', on_trip: 'On Trip', in_shop: 'In Shop', retired: 'Retired' };
              return (
                <div className="chart-bar-container" key={status}>
                  <div className="chart-bar" style={{ height: `${Math.max(pct, 5)}%` }} title={`${labels[status]}: ${count}`}></div>
                  <span className="chart-bar-label">{labels[status]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Trips</h3>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Trip Code</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips && trips.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.trip_code}</strong></td>
                    <td>{t.source}</td>
                    <td>{t.destination}</td>
                    <td>
                      <span className={`badge ${
                        t.status === 'dispatched' ? 'badge-info' :
                        t.status === 'completed' ? 'badge-success' :
                        t.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!trips || trips.length === 0) && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--outline)' }}>No trips yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
