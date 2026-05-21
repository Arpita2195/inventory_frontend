import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [err, setErr] = useState('')
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { await login(form.email, form.password); navigate('/') }
    catch (e) { setErr(e.message) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #F8F9FC 0%, #EDE9FE 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:60, height:60, borderRadius:16, background:'var(--purple)', boxShadow:'0 8px 24px rgba(109,40,217,0.3)', marginBottom:16 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'white' }}>IQ</span>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, color:'var(--text)', letterSpacing:'-1px' }}>InventIQ</div>
          <div style={{ fontSize:14, color:'var(--muted)', marginTop:4 }}>Apni Dukaan, Apna AI</div>
        </div>

        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:16, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, marginBottom:6, color:'var(--text)' }}>Welcome back</h2>
          <p style={{ fontSize:13, color:'var(--muted)', marginBottom:24 }}>Sign in to manage your store</p>

          {err && <div style={{ background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--coral)', marginBottom:16 }}>{err}</div>}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Field label="Email" type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com" />
            <Field label="Password" type="password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} placeholder="••••••••" />
            <button type="submit" disabled={loading} style={{ marginTop:4, padding:'12px', borderRadius:10, background:'var(--purple)', border:'none', color:'white', fontSize:15, fontWeight:600, fontFamily:"'Syne',sans-serif", opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', boxShadow:'0 4px 12px rgba(109,40,217,0.3)' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'var(--muted)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--purple)', fontWeight:600 }}>Register here</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={{ display:'block', fontSize:12, color:'var(--text2)', marginBottom:6, fontWeight:500 }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'11px 14px', fontSize:14, color:'var(--text)', outline:'none', transition:'border .15s' }}
        onFocus={e => { e.target.style.borderColor='var(--purple)'; e.target.style.background='white' }}
        onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.background='var(--bg3)' }} />
    </div>
  )
}
