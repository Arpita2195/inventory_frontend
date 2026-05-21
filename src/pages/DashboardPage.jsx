import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { inventoryApi, chatApi } from '../api'
import StatCard from '../components/StatCard'
import StockAlertCard from '../components/StockAlertCard'
import SalesChart from '../components/SalesChart'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [report, setReport] = useState({ daily:[], topItems:[], totalRevenue:0 })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [inv, low, rep] = await Promise.all([inventoryApi.getAll(), inventoryApi.getLowStock(), chatApi.getReports(7)])
      setInventory(inv.data); setLowStock(low.data); setReport(rep.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const totalValue = inventory.reduce((a,i) => a + i.quantity * i.price, 0)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayData = report.daily?.find(d => d.date === todayStr) || { revenue: 0, profit: 0, sales: 0 };

  const quickActions = [
    { to:'/chat',      label:'Open AI Chat',     sub:'Talk in Hindi/Gujarati/English', color:'var(--purple)', bg:'var(--purple-xl)', border:'#DDD6FE' },
    { to:'/inventory', label:'Manage Inventory', sub:'Add or update stock',             color:'var(--teal)',   bg:'var(--teal-xl)',   border:'#99F6E4' },
    { to:'/offers',    label:'Generate Offer',   sub:'Create WhatsApp promo',           color:'var(--coral)',  bg:'var(--coral-xl)', border:'#FECDD3' },
    { to:'/reports',   label:'View Reports',     sub:'Sales trends & insights',         color:'var(--amber)',  bg:'var(--amber-xl)', border:'#FDE68A' },
  ]

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting-text">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="shop-info">{user?.shopName} • <span className="highlight">Live Dashboard</span></p>
        </div>
        <button onClick={load} className="refresh-btn">
          <span className="refresh-icon">🔄</span> Refresh
        </button>
      </div>

      {!loading ? (
        <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard label="Total Stock" value={inventory?.length || 0} sub="Items tracking" accent="var(--purple)" />
          <StatCard label="Low Stock" value={lowStock?.length || 0} sub="Needs reorder" accent="var(--coral)" />
          <StatCard label="Today Revenue" value={`₹${(todayData?.revenue || 0).toLocaleString()}`} sub="Daily sales" accent="var(--amber)" />
          <StatCard label="Daily Profit" value={`₹${(todayData?.profit || 0).toLocaleString()}`} sub="Estimated earnings" accent="var(--green)" />
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating latest analytics...</div>
      )}

      <div className="dashboard-main-grid">
        <div className="chart-section premium-card">
          <div className="card-header">
            <div className="card-title">Sales Overview</div>
            <div className="card-tag">Last 7 Days</div>
          </div>
          <SalesChart data={report.daily} />
        </div>
        
        <div className="alerts-section">
          <StockAlertCard items={lowStock} />
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="quick-actions-panel premium-card">
          <div className="card-label">Quick Management</div>
          <div className="actions-list">
            {quickActions.map(a => (
              <Link key={a.to} to={a.to} className="action-tile" style={{ background: a.bg, borderColor: a.border }}>
                <div className="tile-accent" style={{ background: a.color }}></div>
                <div className="tile-content">
                  <div className="tile-title" style={{ color: a.color }}>{a.label}</div>
                  <div className="tile-sub">{a.sub}</div>
                </div>
                <div className="tile-arrow" style={{ color: a.color }}>›</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="top-items-panel premium-card">
          <div className="card-label">Weekly Top Sellers</div>
          {!report.topItems?.length ? (
            <div className="empty-state">No sales data recorded yet</div>
          ) : (
            <div className="top-items-list">
              {report.topItems.map((item, i) => (
                <div key={item.name} className="top-item-row">
                  <div className="item-rank">{i + 1}</div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-qty">{item.qty} units sold</div>
                  </div>
                  <div className="item-revenue">₹{item.revenue}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
        .greeting-text { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--text); }
        .shop-info { color: var(--text-muted); font-size: 14px; margin-top: 6px; }
        .highlight { color: var(--purple); font-weight: 700; }
        .refresh-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: white; color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .refresh-btn:hover { background: var(--bg); border-color: var(--text-light); }

        .dashboard-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; margin-bottom: 24px; }
        .chart-section { padding: 24px !important; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .card-title { font-weight: 800; font-family: 'Syne', sans-serif; font-size: 18px; }
        .card-tag { font-size: 10px; padding: 4px 8px; border-radius: 6px; background: var(--bg3); border: 1px solid var(--border); color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

        .dashboard-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .card-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--text-light); margin-bottom: 20px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px; }
        
        .actions-list { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .action-tile { display: flex; align-items: center; gap: 16px; padding: 18px; border-radius: 12px; border: 1px solid; text-decoration: none; transition: all 0.2s; position: relative; overflow: hidden; background: white; }
        .action-tile:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-color: var(--purple-light); }
        .tile-accent { width: 4px; height: 100%; position: absolute; left: 0; top: 0; }
        .tile-content { flex: 1; }
        .tile-title { font-weight: 800; font-size: 14px; margin-bottom: 4px; }
        .tile-sub { font-size: 11px; color: var(--text-muted); line-height: 1.4; }
        .tile-arrow { font-size: 20px; font-weight: 300; opacity: 0.5; }

        .top-items-list { display: flex; flex-direction: column; gap: 8px; }
        .top-item-row { display: flex; align-items: center; padding: 12px; border-radius: 10px; background: var(--bg3); border: 1px solid var(--border-light); }
        .item-rank { width: 32px; height: 32px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-right: 16px; color: var(--purple); border: 1px solid var(--border); }
        .item-details { flex: 1; }
        .item-name { font-weight: 700; font-size: 14px; color: var(--text); }
        .item-qty { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .item-revenue { font-weight: 800; color: var(--green); font-size: 15px; }

        .empty-state { padding: 40px 0; text-align: center; color: var(--text-light); font-size: 13px; font-style: italic; }

        @media (max-width: 1100px) {
          .dashboard-main-grid, .dashboard-bottom-grid { grid-template-columns: 1fr; }
          .alerts-section { order: -1; }
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .refresh-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  )
}
