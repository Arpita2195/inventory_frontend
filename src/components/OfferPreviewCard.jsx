import { useState } from 'react'

export default function OfferPreviewCard({ offerText, onClear }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(offerText)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  if (!offerText) return null
  return (
    <div style={{ background:'white', border:'1px solid #A7F3D0', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize:12, color:'var(--teal)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', display:'inline-block' }}/>
        Generated WhatsApp Offer
      </div>
      <div style={{ background:'var(--bg3)', borderRadius:10, padding:'14px 16px', fontSize:14, lineHeight:1.7, color:'var(--text)', whiteSpace:'pre-wrap', marginBottom:12, border:'1px solid var(--border)' }}>
        {offerText}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={copy} style={{ padding:'8px 16px', borderRadius:8, background: copied ? 'var(--green)' : 'var(--teal)', border:'none', color:'white', fontSize:13, fontWeight:500 }}>
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(offerText)}`} target="_blank" rel="noreferrer"
          style={{ padding:'8px 16px', borderRadius:8, background:'#25D366', color:'white', fontSize:13, fontWeight:500, display:'inline-block' }}>
          Share on WhatsApp
        </a>
        {onClear && <button onClick={onClear} style={{ padding:'8px 16px', borderRadius:8, background:'white', border:'1px solid var(--border)', color:'var(--muted)', fontSize:13 }}>Clear</button>}
      </div>
    </div>
  )
}
