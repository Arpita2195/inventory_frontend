import { useEffect, useState } from 'react'
import { chatApi } from '../api'
import SalesChart from '../components/SalesChart'

export default function ReportsPage() {
  const [days, setDays] = useState(7)
  const [report, setReport] = useState({ daily:[], topItems:[], totalRevenue:0 })
  const [loading, setLoading] = useState(true)

  const load = async (d) => { setLoading(true); try { const { data } = await chatApi.getReports(d); setReport(data) } catch(e){} finally { setLoading(false) } }
  useEffect(() => { load(days) }, [days])

  const totalSales = report.daily?.reduce((a,d) => a + d.sales, 0) || 0

  return (
    <div className="reports-container fade-in">
      <div className="reports-header">
        <div>
          <h1 className="page-title">📈 Sales Reports</h1>
          <p className="page-subtitle">Track your store performance & growth</p>
        </div>
        <div className="day-selector-pills">
          {[7,14,30].map(d => (
            <button key={d} onClick={() => setDays(d)} className={`pill-btn ${days===d ? 'active' : ''}`}>
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="reports-stats-row">
        {[
          { label:'Total Revenue', value:`₹${(report.totalRevenue||0).toLocaleString()}`, color:'var(--green)', icon:'💰' },
          { label:'Units Sold', value:totalSales, color:'var(--purple)', icon:'📦' },
          { label:'Best Sellers', value:report.topItems?.length || 0, color:'var(--amber)', icon:'⭐' },
        ].map(s => (
          <div key={s.label} className="premium-card report-stat-card">
            <div className="stat-header">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-label">{s.label}</span>
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="premium-card chart-container">
        <div className="card-header">
          <div className="card-title">Revenue Trends</div>
          <div className="card-tag">Dynamic Growth</div>
        </div>
        {loading ? (
          <div className="chart-loader">Loading Performance Data...</div>
        ) : (
          <SalesChart data={report.daily} />
        )}
      </div>

      <div className="premium-card top-items-section">
        <div className="card-header">
          <div className="card-title">Top Performance Rankings</div>
          <div className="card-tag">Success Stories</div>
        </div>
        {!report.topItems?.length ? (
          <div className="empty-state">Start selling to see your rankings here!</div>
        ) : (
          <div className="ranking-list">
            {report.topItems.map((item, i) => (
              <div key={item.name} className="ranking-row">
                <div className="rank-badge">#{i+1}</div>
                <div className="item-meta">
                  <div className="item-name">{item.name}</div>
                  <div className="item-stats">{item.qty} units sold • ₹{item.revenue.toLocaleString()} revenue</div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100,(item.qty/(report.topItems[0]?.qty||1))*100)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .reports-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; }
        .page-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
        .day-selector-pills { display: flex; gap: 8px; background: white; border: 1px solid var(--border); border-radius: 12px; padding: 4px; }
        .pill-btn { padding: 8px 16px; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .pill-btn.active { background: var(--purple); color: white; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); }

        .reports-stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .report-stat-card { display: flex; flexDirection: column; gap: 8px; }
        .stat-header { display: flex; align-items: center; gap: 10px; }
        .stat-icon { font-size: 18px; }
        .stat-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); }
        .stat-value { font-size: 26px; font-weight: 800; font-family: 'Outfit', sans-serif; }

        .chart-container { padding: 24px !important; margin-bottom: 24px; }
        .chart-loader { padding: 60px; text-align: center; color: var(--text-light); font-size: 14px; font-style: italic; }

        .ranking-list { display: flex; flexDirection: column; }
        .ranking-row { display: flex; align-items: flex-start; gap: 20px; padding: 16px 0; border-bottom: 1px solid var(--border-light); }
        .ranking-row:last-child { border-bottom: none; }
        .rank-badge { width: 32px; height: 32px; border-radius: 10px; background: var(--purple-light); color: var(--purple); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
        .item-meta { flex: 1; }
        .item-name { font-weight: 700; font-size: 15px; margin-bottom: 4px; color: var(--text); }
        .item-stats { font-size: 12px; color: var(--text-muted); margin-bottom: 10px; }
        .progress-track { height: 6px; background: var(--bg); border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--purple); border-radius: 10px; }

        @media (max-width: 900px) {
          .reports-stats-row { grid-template-columns: 1fr; }
          .reports-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .day-selector-pills { width: 100%; justify-content: space-between; }
          .pill-btn { flex: 1; text-align: center; }
        }
      `}</style>
    </div>
  )
}
