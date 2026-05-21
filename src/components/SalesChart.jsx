import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,0.1)' }}>
      <div style={{ color:'var(--muted)', marginBottom:4, fontWeight:500 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight:600 }}>
          {p.name === 'revenue' ? '₹' : ''}{p.value} {p.name}
        </div>
      ))}
    </div>
  )
  return null
}

export default function SalesChart({ data = [] }) {
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize:14, fontWeight:600, marginBottom:4, color:'var(--text)' }}>Sales Overview</div>
      <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>Revenue and units over time</div>
      {data.length === 0
        ? <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted2)', fontSize:13, background:'var(--bg3)', borderRadius:8 }}>No sales data yet</div>
        : <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top:5, right:5, bottom:0, left:0 }}>
              <defs>
                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6D28D9" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#6D28D9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F4F9" />
              <XAxis dataKey="date" tick={{ fontSize:11, fill:'#94A3B8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6D28D9" strokeWidth={2} fill="url(#gRevenue)" name="revenue" />
              <Area type="monotone" dataKey="sales" stroke="#0D9488" strokeWidth={2} fill="url(#gSales)" name="sales" />
            </AreaChart>
          </ResponsiveContainer>
      }
    </div>
  )
}
