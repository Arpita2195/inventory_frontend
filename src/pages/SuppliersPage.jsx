import { useState, useEffect } from 'react'
import api from '../api/axiosInstance'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newSup, setNewSup] = useState({ name: '', contact: '', email: '', address: '', categories: [] })

  useEffect(() => { loadSuppliers() }, [])

  const loadSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers')
      setSuppliers(data)
    } finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!newSup.name || !newSup.contact) return alert('Name and Contact are required')
    await api.post('/suppliers', newSup)
    setAdding(false)
    setNewSup({ name: '', contact: '', email: '', address: '', categories: [] })
    loadSuppliers()
  }

  const handleDelete = async (id) => {
    if(window.confirm('Delete supplier? This will unmap linked products.')) {
      await api.delete(`/suppliers/${id}`)
      loadSuppliers()
    }
  }

  const s = {
    card: { background:'white', border:'1px solid var(--border)', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 },
    input: { padding:'10px', borderRadius:8, border:'1px solid var(--border)', outline:'none', fontSize:14 }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700 }}>Supplier Management</h1>
          <p style={{ fontSize:13, color:'var(--muted)' }}>Map products to vendors for automatic restocking</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ padding:'10px 20px', borderRadius:8, background:'var(--purple)', color:'white', border:'none', cursor:'pointer', fontWeight:600 }}>+ Add Supplier</button>
      </div>

      {adding && (
        <div style={{ ...s.card, marginBottom:30, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <input placeholder="Supplier Name *" value={newSup.name} onChange={e => setNewSup({...newSup, name:e.target.value})} style={s.input} />
          <input placeholder="Contact Number *" value={newSup.contact} onChange={e => setNewSup({...newSup, contact:e.target.value})} style={s.input} />
          <input placeholder="Email Address" value={newSup.email} onChange={e => setNewSup({...newSup, email:e.target.value})} style={s.input} />
          <input placeholder="Office Address" value={newSup.address} onChange={e => setNewSup({...newSup, address:e.target.value})} style={s.input} />
           <div style={{ gridColumn:'1/-1', display:'flex', gap:8 }}>
            <button onClick={handleAdd} style={{ padding:'10px 24px', borderRadius:8, background:'var(--green)', color:'white', border:'none', cursor:'pointer', fontWeight:600 }}>Save Supplier</button>
            <button onClick={() => setAdding(false)} style={{ padding:'10px 20px', borderRadius:8, background:'white', border:'1px solid var(--border)', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="suppliers-grid fade-in">
        <div className="supplier-cards-container">
          {suppliers.map(sup => (
            <div key={sup._id} className="premium-card supplier-card">
              <div className="supplier-header">
                <div style={{ flex: 1 }}>
                  <div className="supplier-title">{sup.name}</div>
                  <div className="supplier-subtitle">Vendor ID: #{sup._id.slice(-4).toUpperCase()}</div>
                </div>
                <button onClick={() => handleDelete(sup._id)} title="Delete Supplier" style={deleteIconBtn}>🗑️</button>
              </div>

              <div className="supplier-info-grid">
                <div className="info-item">
                  <span className="info-label">Contact</span>
                  <div className="info-value">📞 {sup.contact}</div>
                </div>
                {sup.email && (
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <div className="info-value">✉️ {sup.email}</div>
                  </div>
                )}
                {sup.address && (
                  <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="info-label">Location</span>
                    <div className="info-value">📍 {sup.address}</div>
                  </div>
                )}
              </div>
              
              <div className="supplier-footer">
                 <div className="mapping-label">Mapped Categories</div>
                 <div className="category-tags">
                    {['Grocery', 'Dairy', 'Snacks', 'Personal Care', 'Cleaning', 'General'].map(cat => {
                        const isMapped = sup.categories?.includes(cat);
                        return (
                          <button 
                              key={cat} 
                              onClick={async () => {
                                  if (isMapped) return;
                                  await api.post('/suppliers/map-categories', { supplierId: sup._id, categories: [cat] });
                                  loadSuppliers();
                              }}
                              className={`category-tag ${isMapped ? 'active' : ''}`}
                          >
                            {isMapped ? '✓ ' : '+ '} {cat}
                          </button>
                        );
                    })}
                 </div>
              </div>
            </div>
          ))}
          {!suppliers.length && !loading && (
            <div className="premium-card empty-state">
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>No suppliers found</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Add your first vendor to start mapping products.</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .supplier-cards-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .supplier-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .supplier-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 12px;
        }
        .supplier-title {
          font-weight: 800;
          font-size: 17px;
          color: var(--text);
          font-family: 'Syne', sans-serif;
        }
        .supplier-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .supplier-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .info-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--text-light);
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
        }
        .supplier-footer {
          margin-top: auto;
          background: var(--bg);
          padding: 12px;
          border-radius: 10px;
        }
        .mapping-label {
          font-size: 10px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .category-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .category-tag {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid var(--border);
          background: white;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .category-tag:hover {
          border-color: var(--purple);
          color: var(--purple);
        }
        .category-tag.active {
          background: var(--purple);
          color: white;
          border-color: var(--purple);
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
        }
        @media (max-width: 1100px) {
          .supplier-cards-container {
            grid-template-columns: 1fr;
          }
          .supplier-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

const deleteIconBtn = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4, borderRadius: 6, transition: 'background 0.2s' };
