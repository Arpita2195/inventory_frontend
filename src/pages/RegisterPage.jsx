import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', shopName:'', language:'hindi', phone:'' })
  const [err, setErr] = useState('')
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => { e.preventDefault(); setErr(''); try { await register(form); navigate('/') } catch (e) { setErr(e.message) } }
  const set = k => e => setForm({...form, [k]: e.target.value})

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #F8F9FC 0%, #EDE9FE 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:54, height:54, borderRadius:14, background:'var(--purple)', boxShadow:'0 6px 20px rgba(109,40,217,0.3)', marginBottom:12 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'white' }}>IQ</span>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.5px' }}>InventIQ</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>Register your kirana store</div>
        </div>

        <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:16, padding:32, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:700, marginBottom:20, color:'var(--text)' }}>Create your account</h2>
          {err && <div style={{ background:'#FFF1F2', border:'1px solid #FECDD3', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--coral)', marginBottom:16 }}>{err}</div>}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Field label="Your Name *" value={form.name} onChange={set('name')} placeholder="Ramesh Patel" />
              <Field label="Phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            </div>
            <Field label="Shop Name *" value={form.shopName} onChange={set('shopName')} placeholder="Patel General Store" />
            <Field label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            <Field label="Password *" type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
            <div>
              <label style={labelStyle}>Preferred Language</label>
              <select value={form.language} onChange={set('language')} style={inputStyle}>
                <option value="hindi">Hindi — हिंदी</option>
                <option value="gujarati">Gujarati — ગુજરાતી</option>
                <option value="english">English</option>
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop:4, padding:'12px', borderRadius:10, background:'var(--purple)', border:'none', color:'white', fontSize:15, fontWeight:600, fontFamily:"'Syne',sans-serif", opacity: loading ? 0.7 : 1, boxShadow:'0 4px 12px rgba(109,40,217,0.3)' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:'var(--muted)' }}>
            Already have an account? <Link to="/login" style={{ color:'var(--purple)', fontWeight:600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = { display:'block', fontSize:12, color:'var(--text2)', marginBottom:6, fontWeight:500 }
const inputStyle = { width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', fontSize:14, color:'var(--text)', outline:'none' }

function Field({ label, type='text', value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle}
        onFocus={e => { e.target.style.borderColor='var(--purple)'; e.target.style.background='white' }}
        onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.background='var(--bg3)' }} />
    </div>
  )
}
