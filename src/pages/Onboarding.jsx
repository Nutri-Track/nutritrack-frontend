import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { macroApi } from '../api'
import { useAuth } from '../context/AuthContext'

const steps = [
  { id: 0, label: 'Body', icon: '👤' },
  { id: 1, label: 'Activity', icon: '🏃' },
  { id: 2, label: 'Goal', icon: '🎯' },
]

export function Onboarding() {
  const navigate = useNavigate()
  const { refreshTargets } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    gender: 'male', age: '', height: '', weight: '',
    activity_level: 'sedentary', goal: 'maintaining',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const payload = {
      ...form,
      age: parseInt(form.age, 10),
      height: parseFloat(form.height),
      weight: parseFloat(form.weight),
    }
    try {
      await macroApi.onboard(payload)
      await refreshTargets()
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) setError(detail[0].msg)
      else setError(detail || err.message || 'Onboarding failed')
    } finally { setLoading(false) }
  }

  const canNext = () => {
    if (step === 0) return form.age && form.height && form.weight
    return true
  }

  return (
    <div className="auth-page">
      <div className="auth-card card" style={{ maxWidth: '520px' }} id="onboarding-card">
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem',
                background: step >= i ? 'var(--gradient)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${step >= i ? 'transparent' : 'var(--border)'}`,
                transition: 'all 0.3s ease',
                boxShadow: step === i ? '0 0 20px rgba(139,92,246,0.3)' : 'none',
              }}>
                {s.icon}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  width: 40, height: 2, borderRadius: 999,
                  background: step > i ? 'var(--accent-violet)' : 'var(--border)',
                  transition: 'background 0.3s ease',
                }} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl text-center" style={{ marginBottom: '0.5rem' }}>
          {step === 0 && 'Tell us about yourself'}
          {step === 1 && 'Your activity level'}
          {step === 2 && 'Choose your goal'}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          {step === 0 && "We'll calculate your personalized macro targets"}
          {step === 1 && 'This helps us fine-tune your calorie needs'}
          {step === 2 && 'Select what you want to achieve'}
        </p>

        {error && <div className="error-msg mb-4">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Step 0: Body */}
          {step === 0 && (
            <div className="auth-form fade-in">
              <div className="form-group">
                <label>Gender</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['male', 'female'].map(g => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                      style={{
                        flex: 1, padding: '0.85rem', borderRadius: 'var(--radius-md)',
                        border: `1px solid ${form.gender === g ? 'var(--accent-violet)' : 'var(--border)'}`,
                        background: form.gender === g ? 'rgba(139,92,246,0.1)' : 'var(--bg-input)',
                        color: form.gender === g ? 'var(--accent-violet)' : 'var(--text-secondary)',
                        cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                      }}>
                      {g === 'male' ? '♂️ Male' : '♀️ Female'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="onb-age">Age (years)</label>
                <input className="input font-mono" id="onb-age" type="number" min="10" max="120" required placeholder="e.g. 25"
                  value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="onb-height">Height (cm)</label>
                  <input className="input font-mono" id="onb-height" type="number" min="50" max="300" required step="0.1" placeholder="e.g. 175"
                    value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="onb-weight">Weight (kg)</label>
                  <input className="input font-mono" id="onb-weight" type="number" min="20" max="500" required step="0.1" placeholder="e.g. 70"
                    value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Activity */}
          {step === 1 && (
            <div className="auth-form fade-in">
              {[
                { val: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise', icon: '🧘' },
                { val: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week', icon: '🚶' },
                { val: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week', icon: '🏋️' },
                { val: 'very_active', label: 'Very Active', desc: '6-7 days/week', icon: '🏃' },
                { val: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise/job', icon: '🔥' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setForm({ ...form, activity_level: opt.val })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${form.activity_level === opt.val ? 'var(--accent-violet)' : 'var(--border)'}`,
                    background: form.activity_level === opt.val ? 'rgba(139,92,246,0.08)' : 'var(--bg-input)',
                    transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
                  }}>
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: form.activity_level === opt.val ? 'var(--accent-violet)' : 'var(--text-primary)', fontSize: '0.9rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Goal */}
          {step === 2 && (
            <div className="auth-form fade-in">
              {[
                { val: 'cutting', label: 'Cutting', desc: 'Lose body fat while preserving muscle', icon: '📉', color: '#06b6d4' },
                { val: 'maintaining', label: 'Maintaining', desc: 'Keep your current weight and build', icon: '⚖️', color: '#10b981' },
                { val: 'bulking', label: 'Bulking', desc: 'Build muscle mass with a caloric surplus', icon: '📈', color: '#8b5cf6' },
              ].map(opt => (
                <button key={opt.val} type="button" onClick={() => setForm({ ...form, goal: opt.val })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'inherit',
                    border: `1px solid ${form.goal === opt.val ? opt.color : 'var(--border)'}`,
                    background: form.goal === opt.val ? `${opt.color}12` : 'var(--bg-input)',
                    transition: 'all 0.2s ease', textAlign: 'left', width: '100%',
                  }}>
                  <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: form.goal === opt.val ? opt.color : 'var(--text-primary)', fontSize: '1rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
            {step > 0 && (
              <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)} style={{ flex: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Back
              </button>
            )}
            {step < 2 ? (
              <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()} style={{ flex: 1 }}>
                Continue
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Calculating...
                  </span>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Complete Setup</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
