export default function StatCard({ label, value, sub, accent = '#6D28D9', accentBg = '#EDE9FE' }) {
  return (
    <div className="premium-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:4, background:accent }} />
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:accentBg, opacity:0.4, zIndex:0 }} />
      
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:36, height:36, borderRadius:8, background:accentBg, marginBottom:12 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:accent }} />
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600 }}>{label}</div>
        <div className="stat-card-value" style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:'var(--text)', lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:12, color:'var(--text-light)', marginTop:8, fontWeight:500 }}>{sub}</div>}
      </div>
    </div>
  )
}
