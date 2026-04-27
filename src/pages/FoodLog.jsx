import { useState, useEffect } from 'react'
import { foodApi } from '../api'

const today = () => new Date().toISOString().split('T')[0]
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍿' }

export default function FoodLog() {
  const [meals, setMeals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(today())
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', meal_type: 'lunch', calories: '', protein: '', carbs: '', fat: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchMeals = () => {
    setLoading(true)
    foodApi.getDailyMeals(date)
      .then(setMeals)
      .catch(() => setMeals({ meals: [], total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0, meal_count: 0 }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMeals() }, [date])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await foodApi.createMeal({
        name: form.name, meal_type: form.meal_type,
        calories: Number(form.calories), protein: Number(form.protein),
        carbs: Number(form.carbs), fat: Number(form.fat),
        logged_at: `${date}T12:00:00`,
      })
      setForm({ name: '', meal_type: 'lunch', calories: '', protein: '', carbs: '', fat: '' })
      setShowForm(false)
      showToast('✅ Meal added successfully!', 'success')
      fetchMeals()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) setError(detail[0].msg)
      else setError(detail || err.message || 'Failed to add meal')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this meal?')) return
    await foodApi.deleteMeal(id)
    showToast('🗑️ Meal deleted', 'info')
    fetchMeals()
  }

  const macroStats = [
    { label: 'Calories', val: meals?.total_calories, unit: 'kcal', color: '#8b5cf6', icon: '🔥' },
    { label: 'Protein', val: meals?.total_protein, unit: 'g', color: '#06b6d4', icon: '💪' },
    { label: 'Carbs', val: meals?.total_carbs, unit: 'g', color: '#10b981', icon: '⚡' },
    { label: 'Fat', val: meals?.total_fat, unit: 'g', color: '#f59e0b', icon: '🥑' },
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
          <h1>Food <span className="gradient-text">Log</span></h1>
          <p className="text-muted">Track your daily meals and macros</p>
        </div>
        <div className="flex gap-2">
          <input type="date" className="input" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} id="food-log-date" />
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="toggle-meal-form">
            {showForm ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Meal</>
            )}
          </button>
        </div>
      </div>

      {/* Add Meal Form */}
      {showForm && (
        <div className="card mb-4 fade-in" id="meal-form-card">
          <h3 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-violet)" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Meal
          </h3>
          {error && <div className="error-msg mb-2">⚠ {error}</div>}
          <form onSubmit={handleSubmit} id="add-meal-form">
            <div className="grid-2 mb-2">
              <div className="form-group">
                <label htmlFor="meal-name">Meal Name</label>
                <input className="input" id="meal-name" placeholder="e.g. Grilled Chicken Salad" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="meal-type">Type</label>
                <select className="input select" id="meal-type" value={form.meal_type}
                  onChange={e => setForm({ ...form, meal_type: e.target.value })}>
                  {MEAL_TYPES.map(t => <option key={t} value={t}>{mealIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-4 mb-2">
              {['calories', 'protein', 'carbs', 'fat'].map(f => (
                <div className="form-group" key={f}>
                  <label htmlFor={`meal-${f}`}>{f.charAt(0).toUpperCase() + f.slice(1)} {f === 'calories' ? '(kcal)' : '(g)'}</label>
                  <input className="input font-mono" id={`meal-${f}`} type="number" min="0" step="0.1" placeholder="0"
                    value={form[f]} onChange={e => setForm({ ...form, [f]: e.target.value })} required />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting} id="submit-meal">
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Adding...
                </span>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Add Meal</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Daily Totals */}
      {meals && (
        <div className="grid-4 mb-4 stagger">
          {macroStats.map(s => (
            <div className="card" key={s.label} style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span>{s.icon}</span>
                <span className="text-xs text-muted" style={{ fontWeight: 600 }}>{s.label}</span>
              </div>
              <div className="text-2xl font-mono">{s.val} <span className="text-sm text-muted" style={{ fontFamily: 'Inter' }}>{s.unit}</span></div>
            </div>
          ))}
        </div>
      )}

      {/* Meal List */}
      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <div className="card">
          <h3 className="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
            Meals <span className="badge badge-violet" style={{ marginLeft: '0.25rem' }}>{meals?.meal_count || 0}</span>
          </h3>
          {(!meals || meals.meals.length === 0) ? (
            <div className="empty-state">
              <span className="empty-state-icon">🍽️</span>
              <p>No meals logged for this date</p>
              <p className="text-xs text-muted mt-1">Click "Add Meal" to start tracking</p>
            </div>
          ) : (
            meals.meals.map(meal => (
              <div key={meal.id} className="meal-item">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{mealIcons[meal.meal_type] || '🍴'}</span>
                    <span style={{ fontWeight: 600 }}>{meal.name}</span>
                    <span className="badge badge-violet">{meal.meal_type}</span>
                  </div>
                  <div className="text-xs text-muted flex" style={{ gap: '1rem' }}>
                    <span className="font-mono" style={{ color: '#8b5cf6' }}>{meal.calories} kcal</span>
                    <span className="font-mono" style={{ color: '#06b6d4' }}>P: {meal.protein}g</span>
                    <span className="font-mono" style={{ color: '#10b981' }}>C: {meal.carbs}g</span>
                    <span className="font-mono" style={{ color: '#f59e0b' }}>F: {meal.fat}g</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(meal.id)} title="Delete meal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
