import { useState, useEffect } from 'react'
import { complianceApi } from '../api'

const severityConfig = {
  high: { icon: '🔴', badge: 'badge-red', glow: 'rgba(239,68,68,0.05)' },
  medium: { icon: '🟡', badge: 'badge-amber', glow: 'rgba(245,158,11,0.05)' },
  low: { icon: '🟢', badge: 'badge-green', glow: 'rgba(16,185,129,0.05)' },
}

export default function Alerts() {
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAlerts = () => {
    setLoading(true)
    complianceApi.getAlerts(100)
      .then(setAlerts)
      .catch(() => setAlerts({ alerts: [], total: 0, unread_count: 0 }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAlerts() }, [])

  const markRead = async (id) => {
    await complianceApi.markAlertRead(id)
    showToast('✓ Marked as read', 'success')
    fetchAlerts()
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      await complianceApi.analyzePatterns(7)
      showToast('🔍 Analysis complete!', 'success')
      fetchAlerts()
    } catch {
      showToast('❌ Analysis failed', 'error')
    } finally { setAnalyzing(false) }
  }

  if (loading) return <div className="loading"><div className="spinner" /><span className="text-sm text-muted">Loading alerts...</span></div>

  const statCards = [
    { label: 'Resolved', val: alerts ? alerts.total - alerts.unread_count : 0, color: 'var(--accent-green)', icon: '✓' },
    { label: 'Unread', val: alerts?.unread_count || 0, color: 'var(--accent-amber)', icon: '●' },
    { label: 'Total', val: alerts?.total || 0, color: 'var(--accent-violet)', icon: '∑' },
  ]

  return (
    <div className="slide-up">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Compliance <span className="gradient-text">Alerts</span></h1>
          <p className="text-muted">Monitor your diet compliance and patterns</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={fetchAlerts} id="refresh-alerts">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
          <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing} id="run-analysis">
            {analyzing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Analyzing...
              </span>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Run Analysis</>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-6 stagger">
        {statCards.map(s => (
          <div className="card" key={s.label} style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-muted" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                <div className="text-2xl font-mono" style={{ marginTop: '0.25rem' }}>{s.val}</div>
              </div>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${s.color}15`, border: `1px solid ${s.color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', fontWeight: 700, color: s.color
              }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert List */}
      <div className="card">
        <h3 className="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          All Alerts
        </h3>
        {(!alerts || alerts.alerts.length === 0) ? (
          <div className="empty-state">
            <span className="empty-state-icon">🎉</span>
            <p>No alerts yet</p>
            <p className="text-xs text-muted mt-1">Run an analysis to check your compliance!</p>
          </div>
        ) : (
          alerts.alerts.map(a => {
            const cfg = severityConfig[a.severity] || severityConfig.low
            return (
              <div key={a.id} className={`alert-item ${a.is_read ? 'is-read' : ''}`}
                style={{ background: !a.is_read ? cfg.glow : 'transparent' }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem' }}>{a.title}</span>
                    <span className={`badge ${cfg.badge}`}>{a.severity}</span>
                    <span className="badge badge-violet">{a.alert_type}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{a.message}</p>
                  <p className="text-xs text-muted">{new Date(a.created_at).toLocaleString()}</p>
                </div>
                {!a.is_read && (
                  <button className="btn btn-outline btn-sm" onClick={() => markRead(a.id)} style={{ flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    Read
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
