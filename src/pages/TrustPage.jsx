import { useState } from 'react';

export default function TrustPage() {
  const [activeTab, setActiveTab] = useState('encryption');

  const pillars = [
    { id: 'encryption', label: 'AES-256 Shield', icon: '🛡️', title: 'Military-Grade Encryption', desc: 'Every transaction is sealed with 256-bit encryption. Even our database admins cannot see your private Khata balances.' },
    { id: 'isolation', label: 'Vault Isolation', icon: '🔒', title: 'Data Vault Architecture', desc: 'Your shop data is stored in a dedicated digital silo. There is zero risk of data leakage between different shop owners.' },
    { id: 'accuracy', label: 'AI Integrity', icon: '🧠', title: 'Certified GST Lexicon', desc: 'Our AI is trained on a verified permanent lexicon of Indian GST slabs. It is built to prevent hallucinations and ensure tax accuracy.' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="fade-in">
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: 20, background: 'var(--green-light)', color: 'var(--green)', fontSize: 12, fontWeight: 800, marginBottom: 16 }}>
           ✅ CERTIFIED TRUST CENTER
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Your Data is our Priority.</h1>
        <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>InventIQ uses advanced security protocols to keep your business records safe, private, and 100% accurate.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 32 }}>
        {pillars.map(p => (
          <button 
            key={p.id}
            onClick={() => setActiveTab(p.id)}
            style={{ 
              padding: '20px 12px', border: '1px solid var(--border)', borderRadius: 16, background: activeTab === p.id ? 'var(--purple-xl)' : 'white', cursor: 'pointer', transition: 'all .2s', outline: 'none', borderBottom: activeTab === p.id ? '3px solid var(--purple)' : '1px solid var(--border)'
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 12 }}>{p.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeTab === p.id ? 'var(--purple)' : 'var(--text)' }}>{p.label}</div>
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 32, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.05 }}>{pillars.find(p => p.id === activeTab).icon}</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{pillars.find(p => p.id === activeTab).title}</h2>
        <p style={{ fontSize: 15, color: 'var(--text-light)', lineHeight: 1.8, maxWidth: 500 }}>{pillars.find(p => p.id === activeTab).desc}</p>
        
        <div style={{ marginTop: 32, padding: '16px 20px', background: 'var(--bg3)', borderRadius: 12, borderLeft: '4px solid var(--green)', display: 'flex', alignItems: 'center', gap: 16 }}>
           <div style={{ fontSize: 20 }}>✅</div>
           <div style={{ fontSize: 13, fontWeight: 600 }}>This feature is active for your shop at <strong>{new Date().toLocaleDateString()}</strong>.</div>
        </div>
      </div>

      <div style={{ marginTop: 40, textAlign: 'center' }}>
         <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.5px' }}>POWERED BY BIT-LOCK SECURITY ENGINE</div>
      </div>
    </div>
  );
}
