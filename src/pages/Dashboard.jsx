import { useState, useEffect, useCallback } from 'react'
import { macroApi, complianceApi } from '../api'
import { useAuth } from '../context/AuthContext'

const today = () => new Date().toISOString().split('T')[0]
const weekAgo = () => {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return d.toISOString().split('T')[0]
}

const MacroRing = ({ pct, color, size = 48, strokeW = 4 }) => {
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeW} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </svg>
  )
}

export default function Dashboard() {
  const [comparison, setComparison] = useState(null)
  const [weekly, setWeekly] = useState(null)
  const [alerts, setAlerts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const { user } = useAuth()

  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  useEffect(() => {
    Promise.all([
      macroApi.getComparison(today()).catch(() => null),
      macroApi.getWeeklySummary(weekAgo()).catch(() => null),
      complianceApi.getAlerts(5).catch(() => null),
    ]).then(([comp, week, al]) => {
      setComparison(comp)
      setWeekly(week)
      setAlerts(al)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /><span className="text-sm text-muted">Loading dashboard...</span></div>

  const macros = comparison ? [
    { label: 'Calories', actual: comparison.actual.total_calories, target: comparison.target.daily_calorie_target, pct: comparison.calorie_percentage, status: comparison.calorie_status, color: '#8b5cf6', unit: 'kcal', icon: '🔥' },
    { label: 'Protein', actual: comparison.actual.total_protein, target: comparison.target.daily_protein_target, pct: comparison.protein_percentage, status: comparison.protein_status, color: '#06b6d4', unit: 'g', icon: '💪' },
    { label: 'Carbs', actual: comparison.actual.total_carbs, target: comparison.target.daily_carbs_target, pct: comparison.carbs_percentage, status: comparison.carbs_status, color: '#10b981', unit: 'g', icon: '⚡' },
    { label: 'Fat', actual: comparison.actual.total_fat, target: comparison.target.daily_fat_target, pct: comparison.fat_percentage, status: comparison.fat_status, color: '#f59e0b', unit: 'g', icon: '🥑' },
  ] : []

  const statusBadge = (status) => {
    if (status === 'ok') return <span className="badge badge-green">On Track</span>
    if (status === 'surplus' || status === 'excess') return <span className="badge badge-red">{status}</span>
    return <span className="badge badge-amber">{status}</span>
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="slide-up">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>{greeting()}, <span className="gradient-text">{user?.username || 'User'}</span></h1>
          <p className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Macro Cards */}
      {macros.length > 0 && (
        <div className="grid-4 mb-6 stagger">
          {macros.map(m => (
            <div className="card" key={m.label} style={{ position: 'relative' }}>
              <div className="flex justify-between items-center mb-2">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label}</span>
                </div>
                {statusBadge(m.status)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div className="text-2xl font-mono" style={{ marginBottom: '0.25rem' }}>
                    {m.actual}
                    <span className="text-sm text-muted" style={{ fontWeight: 400, fontFamily: 'Inter' }}> / {m.target} {m.unit}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                    <div className="progress-fill" style={{
                      width: `${Math.min(m.pct, 100)}%`,
                      background: m.pct > 120 ? 'var(--accent-red)' : m.pct < 70 ? 'var(--accent-amber)' : m.color
                    }} />
                  </div>
                  <div className="text-xs text-muted mt-1 font-mono">{m.pct}%</div>
                </div>
                <MacroRing pct={m.pct} color={m.pct > 120 ? 'var(--accent-red)' : m.pct < 70 ? 'var(--accent-amber)' : m.color} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Trend */}
      {weekly && (
        <div className="card mb-6 fade-in">
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Weekly Trend
              </h3>
              <span className="text-xs text-muted">{weekly.start_date} → {weekly.end_date}</span>
            </div>
            <div className="flex gap-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span className="badge badge-violet">{weekly.total_meals} meals</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '140px', padding: '0 0.25rem' }}>
            {weekly.daily_breakdowns.map((d, i) => {
              const maxCal = Math.max(...weekly.daily_breakdowns.map(x => x.total_calories), 1)
              const h = (d.total_calories / maxCal) * 100
              return (
                <div key={i} className="chart-bar" style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem'
                }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{d.total_calories}</span>
                  <div style={{
                    width: '100%', height: `${h}%`, minHeight: '4px',
                    background: d.meal_count === 0 ? 'rgba(255,255,255,0.04)' : 'var(--gradient)',
                    borderRadius: '8px 8px 3px 3px',
                    boxShadow: d.meal_count > 0 ? '0 4px 12px rgba(139,92,246,0.2)' : 'none',
                  }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 500 }}>
                    {new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
            <span className="text-sm text-muted">Avg: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{weekly.weekly_averages.total_calories}</strong> kcal/day</span>
          </div>
        </div>
      )}

      {/* Reports & Analysis */}
      <div className="grid-2 mb-6 stagger">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-violet)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Daily Analysis</h3>
              <p className="text-xs text-muted">Check today's goals & frequency</p>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" id="run-daily-check" onClick={async () => {
            setLoading(true)
            try {
              await complianceApi.checkCompliance(today())
              const al = await complianceApi.getAlerts(5)
              setAlerts(al)
              showToast('✅ Daily analysis complete!', 'success')
            } catch (e) {
              showToast('❌ ' + (e.response?.data?.detail || e.message), 'error')
            } finally { setLoading(false) }
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Run Daily Check
          </button>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Weekly Report</h3>
              <p className="text-xs text-muted">Analyze trends & missing logs</p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" id="gen-weekly-report" onClick={async () => {
            setLoading(true)
            try {
              const res = await complianceApi.analyzePatterns(7)
              let msg = ''
              if (res.weekly_averages) msg += `Avg: ${res.weekly_averages.avg_calories} kcal (${res.weekly_averages.status}). `
              if (res.missing_logs?.length > 0) msg += `${res.weekly_averages?.missed_days || res.missing_logs.length} days missing. `
              if (res.patterns_found?.length > 0) msg += `${res.patterns_found.length} trend(s) detected.`
              showToast('📊 ' + (msg || 'Weekly report generated!'), 'info')
            } catch (e) {
              showToast('❌ ' + (e.response?.data?.detail || 'Report failed'), 'error')
            } finally { setLoading(false) }
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Generate Report
          </button>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts && alerts.alerts.length > 0 && (
        <div className="card fade-in">
          <div className="section-title" style={{ marginBottom: '1rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Recent Alerts
            {alerts.unread_count > 0 && <span className="badge badge-red">{alerts.unread_count} new</span>}
          </div>
          {alerts.alerts.slice(0, 3).map(a => (
            <div key={a.id} className={`alert-item ${a.is_read ? 'is-read' : ''}`}>
              <div style={{ flex: 1 }}>
                <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</span>
                  <span className={`badge ${a.severity === 'high' ? 'badge-red' : a.severity === 'medium' ? 'badge-amber' : 'badge-green'}`}>{a.severity}</span>
                </div>
                <p className="text-xs text-muted">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!comparison && (
        <div className="card empty-state">
          <span className="empty-state-icon">🍽️</span>
          <p>No data for today yet.</p>
          <p className="text-xs text-muted mt-1">Log a meal in Food Log to see your progress!</p>
        </div>
      )}
    </div>
  )
}
