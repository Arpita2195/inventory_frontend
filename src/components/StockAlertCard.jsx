export default function StockAlertCard({ items = [] }) {
  if (!items.length) return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'var(--green)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
        Stock Alerts
      </div>
      <div style={{ fontSize:13, color:'var(--muted)' }}>All items are well stocked!</div>
    </div>
  )
  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'var(--coral)', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:'var(--coral)', display:'inline-block' }}/>
        Low Stock Alerts ({items.length})
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {items.map(item => (
          <div key={item._id} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'10px 12px', borderRadius:8, background:'var(--coral-xl)',
            border:'1px solid #FECDD3',
          }}>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{item.name}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{item.category}</div>
            </div>
            <div style={{
              fontSize:13, fontWeight:700, color:'var(--coral)',
              background:'white', padding:'3px 10px', borderRadius:20,
              border:'1px solid #FECDD3',
            }}>
              {item.quantity} {item.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
