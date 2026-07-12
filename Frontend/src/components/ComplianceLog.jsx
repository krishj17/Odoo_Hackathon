import React from 'react';

export default function ComplianceLog() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings &amp; RBAC</h1>
          <p className="page-subtitle">Configure system security and Role-Based Access Controls.</p>
        </div>
      </div>

      <div className="quick-actions-panel">
        {/* System Settings Form */}
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Configuration</h3>
          </div>
          <form onSubmit={e => { e.preventDefault(); alert('Settings successfully updated!'); }} className="dashboard-form">
            <div className="form-group">
              <label className="form-label">System Name</label>
              <input type="text" defaultValue="TransitOps Velocity" className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Session Timeout</label>
              <select className="form-select">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Default Distance Unit</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="primary-action-btn" style={{ flex: 1, justifyContent: 'center' }}>Miles</button>
                <button type="button" className="primary-action-btn" style={{ flex: 1, justifyContent: 'center', backgroundColor: 'var(--white)', color: 'var(--outline)', border: '1px solid var(--outline-variant)' }}>Kilometers</button>
              </div>
            </div>
            <button type="submit" className="primary-action-btn" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <span className="material-symbols-outlined">save</span>
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* RBAC Table */}
        <div className="content-panel">
          <div className="panel-header">
            <h3 className="panel-title">Role Permissions Control</h3>
          </div>
          <div className="dashboard-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Fleet</th>
                  <th style={{ textAlign: 'center' }}>Driver</th>
                  <th style={{ textAlign: 'center' }}>Trips</th>
                  <th style={{ textAlign: 'center' }}>Fuel/Exp.</th>
                  <th style={{ textAlign: 'center' }}>Analytics</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Fleet Manager</strong>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>Full Admin Access</div>
                  </td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Dispatcher</strong>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>Active Ops Only</div>
                  </td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-neutral">View</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Safety Officer</strong>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>Compliance Tracking</div>
                  </td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-neutral">View</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                </tr>
                <tr>
                  <td>
                    <strong>Financial Analyst</strong>
                    <div style={{ fontSize: '11px', color: 'var(--outline)' }}>Audit &amp; Reporting</div>
                  </td>
                  <td style={{ textAlign: 'center' }}><span className="badge badge-neutral">View</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span style={{ color: 'var(--outline)' }}>—</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                  <td style={{ textAlign: 'center' }}><span className="material-symbols-outlined text-success-green" style={{ fontVariationSettings: "'FILL' 1", color: '#10b981' }}>check_circle</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="info-bar" style={{ marginTop: '1.25rem', marginBottom: 0 }}>
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Changes to RBAC settings take effect after the next user login session.</span>
          </div>
        </div>
      </div>
    </>
  );
}
