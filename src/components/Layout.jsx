import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { notificationApi } from '../api'
import translations from '../utils/translations'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const t = translations[user?.language || 'english']
  
  const [hoveredLogout, setHoveredLogout] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { to: '/',          icon: '⬛', label: t.dashboard },
    { to: '/chat',      icon: '💬', label: t.inventory + ' AI' },
    { to: '/inventory', icon: '📦', label: t.inventory },
    { to: '/suppliers', icon: '🚛', label: t.suppliers },
    { to: '/offers',    icon: '📣', label: t.offers },
    { to: '/billing',   icon: '🧾', label: t.billing },
    { to: '/khata',     icon: '📖', label: t.khata },
    { to: '/reports',   icon: '📊', label: t.reports },
    { to: '/settings',  icon: '⚙️',  label: t.settings },
    { to: '/trust',     icon: '🛡️',  label: t.trust_center },
  ]

  const loadNotifications = async () => {
    try {
      const { data } = await notificationApi.getAll()
      setNotifications(data || [])
    } catch(e) {}
  }

  useEffect(() => {
    loadNotifications()
    const int = setInterval(loadNotifications, 30000)
    return () => clearInterval(int)
  }, [])

  const markRead = async () => {
    const unread = notifications.filter(n => !n.read).map(n => n._id)
    if (!unread.length) return
    try {
      await notificationApi.markAsRead(unread)
      setNotifications(prev => prev.map(n => ({...n, read: true})))
    } catch(e) {}
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'IQ'

  return (
    <div style={s.shell} className="app-shell">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
      
      {/* Floating AI Widget */}
      {location.pathname !== '/chat' && (
        <button 
          onClick={() => navigate('/chat')}
          style={{ position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:28, background:'var(--purple)', color:'white', fontSize:24, border:'none', cursor:'pointer', boxShadow:'0 4px 16px rgba(109,40,217,0.3)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
        >
          💬
        </button>
      )}

      <aside style={s.sidebar} className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={s.logo}>
          <div style={s.logoTitle}>InventIQ</div>
          <div style={s.logoSub}>{user?.shopName || 'Apni Dukaan, Apna AI'}</div>
        </div>
        <nav style={s.nav}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} style={({ isActive }) => s.navLink(isActive)} onClick={() => setSidebarOpen(false)}>
              <span style={s.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={s.bottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{initials}</div>
            <div style={{flex:1, overflow:'hidden'}}>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.shopName}>{user?.shopName}</div>
            </div>
          </div>
          <button
            style={{...s.logoutBtn, background: hoveredLogout ? '#FFF1F2' : 'transparent', color: hoveredLogout ? 'var(--coral)' : 'var(--muted)'}}
            onMouseEnter={() => setHoveredLogout(true)}
            onMouseLeave={() => setHoveredLogout(false)}
            onClick={handleLogout}
          >{t.logout}</button>
          
          <div style={{ marginTop: 12, padding: '10px 12px', border: '1px dashed var(--border)', borderRadius: 10, background: '#F0FDF4' }}>
             <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:10, fontWeight:700, color:'#166534' }}>
                <span>✅ SESSION SECURE</span>
             </div>
             <div style={{ fontSize:9, color:'var(--muted)', marginTop:4, textTransform:'uppercase' }}>AES-256 Bit Encrypted</div>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <div style={s.topbarTitle} className="topbar-title-text"></div>
          </div>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { 
                if (!showNotif) loadNotifications(); 
                setShowNotif(!showNotif); 
                if (notifications.some(n => !n.read)) markRead(); 
              }}
              style={{ background:'transparent', border:'none', fontSize:20, cursor:'pointer', position:'relative', padding:8 }}
            >
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span style={{ position:'absolute', top:4, right:4, background:'var(--coral)', color:'white', fontSize:10, fontWeight:700, borderRadius:10, padding:'2px 6px' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{ position:'absolute', top:45, right:0, width:320, background:'white', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', zIndex:100, maxHeight:400, overflowY:'auto' }}>
                <div style={{ padding:14, borderBottom:'1px solid var(--border)', fontWeight:600, fontSize:14, display:'flex', justifyContent:'space-between' }}>
                  <span>Smart Alerts</span>
                  <button onClick={() => setShowNotif(false)} style={{ border:'none', background:'none', color:'var(--muted)', cursor:'pointer' }}>✕</button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding:20, textAlign:'center', color:'var(--muted)', fontSize:13 }}>No alerts yet</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column' }}>
                    {notifications.map(n => (
                       <div key={n._id} style={{ padding:12, borderBottom:'1px solid var(--border)', background: n.type === 'system' ? '#EFF6FF' : (n.read ? 'white' : 'var(--purple-xl)') }}>
                         <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                            {n.type === 'system' && <span style={{ fontSize:10, background:'#3B82F6', color:'white', padding:'1px 4px', borderRadius:4 }}>PRIORITY</span>}
                            <div style={{ fontSize:13, fontWeight:600, color: n.type === 'system' ? '#1E40AF' : 'var(--text)' }}>{n.title}</div>
                         </div>
                         <div style={{ fontSize:12, color: n.type === 'system' ? '#1E3A8A' : 'var(--muted)' }}>{n.message}</div>
                         <div style={{ fontSize:10, color:'var(--muted2)', marginTop:6 }}>{new Date(n.createdAt).toLocaleString()}</div>
                       </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={s.content} className="app-content"><Outlet /></div>
      </main>
    </div>
  )
}

const s = {
  shell: { display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' },
  sidebar: { width:230, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, boxShadow:'2px 0 8px rgba(0,0,0,0.04)' },
  logo: { padding:'24px 20px 16px', borderBottom:'1px solid var(--border)' },
  logoTitle: { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:'var(--purple)', letterSpacing:'-0.5px' },
  logoSub: { fontSize:11, color:'var(--muted2)', marginTop:2 },
  nav: { flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2 },
  navLink: (active) => ({
    display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
    borderRadius:8, fontSize:14, fontWeight: active ? 500 : 400,
    color: active ? 'var(--purple)' : 'var(--muted)',
    background: active ? 'var(--purple-xl)' : 'transparent',
    border: active ? '1px solid #DDD6FE' : '1px solid transparent',
    transition:'all .15s',
  }),
  navIcon: { fontSize:16, width:20, textAlign:'center' },
  bottom: { padding:'12px 10px', borderTop:'1px solid var(--border)' },
  userCard: { display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:8, background:'var(--bg3)', border:'1px solid var(--border)' },
  avatar: { width:32, height:32, borderRadius:8, background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', flexShrink:0 },
  userName: { fontSize:13, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  shopName: { fontSize:11, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  logoutBtn: { marginTop:6, width:'100%', padding:'8px', borderRadius:8, background:'transparent', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13, transition:'all .15s' },
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  topbar: { height:56, borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', background:'var(--bg2)', flexShrink:0 },
  topbarTitle: { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700 },
  content: { flex:1, overflow:'auto', padding:24, background:'var(--bg)' },
}
