import { useState, useRef, useCallback, useEffect } from 'react';
import { inventoryApi, supplierApi } from '../api';

export default function InventoryTable({ items = [], onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', brandName: '', packSize: '', category: 'General', quantity: 0, unit: 'pcs',
    mrp: 0, price: 0, purchasePrice: 0, gstRate: 0, hsnCode: '', isPacked: true,
    supplierName: '', supplierContact: '', supplierEmail: '', lowStockThreshold: 5,
  });
  const [search, setSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [sortBy, setSortBy] = useState('name-asc');
  const [suppliers, setSuppliers] = useState([]);
  const [restockItem, setRestockItem] = useState(null); // item being reordered
  const [restockQty, setRestockQty] = useState(10);

  useEffect(() => {
    supplierApi.getAll().then(r => setSuppliers(r.data || [])).catch(() => {});
  }, []);

  const getSupplierForItem = (item) => {
    // First try: direct supplier mapped to item
    if (item.supplierName && item.supplierContact) return { name: item.supplierName, contact: item.supplierContact };
    // Second try: find supplier by category match
    const match = suppliers.find(s => s.categories?.some(c => c.toLowerCase() === item.category?.toLowerCase()));
    return match ? { name: match.name, contact: match.contact } : null;
  };

  const sendWhatsApp = (item, qty, supplier) => {
    const phone = supplier.contact?.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Hi ${supplier.name},\n\nI want to reorder:\n📦 Product: ${item.name}\n📁 Category: ${item.category}\n🔢 Quantity: ${qty} ${item.unit || 'pcs'}\n\nCurrent stock is low (${item.quantity} ${item.unit || 'pcs'}). Please confirm availability.\n\n— ${item.supplierName || 'Shop Owner'} via InventIQ`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    setRestockItem(null);
  };

  const debounceTimer = useRef(null);

  const handleNameBlur = async (name, isEdit = false) => {
    if (!name || name.length < 3) return;
    setIsPredicting(true);
    try {
      const { data } = await inventoryApi.predictGST(name);
      if (data && data.cat) {
        if (isEdit) {
          setEditVal((prev) => ({ ...prev, category: data.cat, gstRate: data.rate }));
        } else {
          setNewItem((prev) => ({ ...prev, category: data.cat, gstRate: data.rate }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  // Debounced prediction - fires 600ms after user stops typing
  const handleNameChange = useCallback((name, isEdit = false, setter) => {
    setter(prev => ({ ...prev, name }));
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (name.length < 3) return;
    debounceTimer.current = setTimeout(() => {
      handleNameBlur(name, isEdit);
    }, 600);
  }, []);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase()) ||
      i.brandName?.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const getCleanName = (str) => {
      if (!str) return "";
      return str.replace(/[^\x00-\x7F]/g, "").trim().toLowerCase();
    };
    const nameA = getCleanName(a.name);
    const nameB = getCleanName(b.name);
    if (sortBy === 'name-asc') {
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    }
    if (sortBy === 'name-desc') {
      if (nameA > nameB) return -1;
      if (nameA < nameB) return 1;
      return 0;
    }
    if (sortBy === 'qty-desc') return b.quantity - a.quantity;
    if (sortBy === 'qty-asc') return a.quantity - b.quantity;
    return 0;
  });

  const startEdit = (item) => {
    setEditing(item._id);
    setEditVal({ ...item });
  };
  const saveEdit = async (id) => {
    await inventoryApi.update(id, editVal);
    setEditing(null);
    onRefresh();
  };
  const confirmItemDeletion = async (id) => {
    await inventoryApi.remove(id);
    setConfirmDelete(null);
    onRefresh();
  };
  const addItem = async () => {
    if (!newItem.name) return;
    await inventoryApi.add(newItem);
    setAdding(false);
    setNewItem({
      name: '', brandName: '', packSize: '', category: 'General', quantity: 0, unit: 'pcs',
      mrp: 0, price: 0, purchasePrice: 0, gstRate: 0, hsnCode: '', isPacked: true,
      supplierName: '', supplierContact: '', supplierEmail: '', lowStockThreshold: 5,
    });
    onRefresh();
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ position:'relative', flex: 1, maxWidth: 400, display:'flex', gap:10 }}>
          <div style={{ position:'relative', flex: 1 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-light)', fontSize:16 }}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search stock...'
              style={{ width:'100%', padding:'10px 12px 10px 38px', borderRadius:10, border:'1px solid var(--border)', outline:'none', fontSize:14, background:'white' }}
            />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', outline:'none', fontSize:13, fontWeight:600, background:'white', cursor:'pointer', color:'var(--text-muted)' }}
          >
            <option value="name-asc">A-Z (Ascending)</option>
            <option value="name-desc">Z-A (Descending)</option>
            <option value="qty-desc">Stock (High to Low)</option>
            <option value="qty-asc">Stock (Low to High)</option>
          </select>
        </div>
        <button
          onClick={() => setAdding(true)}
          style={{ padding:'10px 20px', borderRadius:10, background:'var(--purple)', color:'white', border:'none', fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 12px rgba(99,102,241,0.2)' }}
        >
          + Add New
        </button>
      </div>

      {adding && (
        <div className="premium-card" style={{ marginBottom:24, background:'var(--bg2)', border:'1px solid var(--purple-light)' }}>
          <div style={{ marginBottom:16, fontWeight:700, fontSize:15, color:'var(--purple)' }}>Quick Stock Entry</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
             <div className="form-group">
               <label style={labelS}>Product Name *</label>
               <input value={newItem.name} onChange={e=>handleNameChange(e.target.value, false, setNewItem)} onBlur={e=>handleNameBlur(e.target.value, false)} style={inputS} placeholder='e.g. Amul Milk 500ml' />
             </div>
             <div className="form-group">
               <label style={labelS}>Stock Qty</label>
               <input type="number" value={newItem.quantity} onChange={e=>setNewItem({...newItem, quantity:+e.target.value})} style={inputS} />
             </div>
             <div className="form-group">
               <label style={labelS}>Selling Price (₹)</label>
               <input type="number" value={newItem.price} onChange={e=>setNewItem({...newItem, price:+e.target.value})} style={inputS} />
             </div>
             <div className="form-group">
               <label style={labelS}>GST %</label>
               <input type="number" value={newItem.gstRate} onChange={e=>setNewItem({...newItem, gstRate:+e.target.value})} style={inputS} />
             </div>
             <div className="form-group">
               <label style={labelS}>Category (AI predicted)</label>
               <div style={{ position:'relative' }}>
                 <input value={newItem.category} onChange={e=>setNewItem({...newItem, category:e.target.value})} style={inputS} placeholder='e.g. Dairy, Grocery' />
                 {isPredicting && <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--purple)' }}>✨</div>}
               </div>
             </div>
          </div>
          <div style={{ marginTop:20, display:'flex', gap:10 }}>
            <button onClick={addItem} style={{ padding:'10px 24px', borderRadius:8, background:'var(--green)', color:'white', border:'none', fontWeight:600 }}>Save Product</button>
            <button onClick={()=>setAdding(false)} style={{ padding:'10px 20px', borderRadius:8, background:'white', border:'1px solid var(--border)', color:'var(--text-muted)' }}>Discard</button>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="table-container hide-on-mobile">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background:'var(--bg3)' }}>
              {['Product', 'Qty', 'Price', 'GST %', 'Total', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'14px', fontSize:11, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.quantity <= item.lowStockThreshold;
              const isEdit = editing === item._id;
              return (
                <tr key={item._id} style={{ borderBottom:'1px solid var(--border-light)' }}>
                  <td style={{ padding:'14px' }}>
                    {isEdit ? (
                      <div style={{ position:'relative' }}>
                        <input value={editVal.name} onChange={e=>handleNameChange(e.target.value, true, setEditVal)} onBlur={e=>handleNameBlur(e.target.value, true)} style={inputS} />
                        {isPredicting && editing === item._id && <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--purple)' }}>✨</div>}
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight:600, fontSize:14 }}>{item.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-light)' }}>{item.category} • {item.brandName || 'Store Brand'}</div>
                      </>
                    )}
                  </td>
                  <td style={{ padding:'14px' }}>
                    {isEdit ? (
                      <input type="number" value={editVal.quantity} onChange={e=>setEditVal({...editVal, quantity:+e.target.value})} style={inputS} />
                    ) : (
                      <span style={{ fontWeight:700, color: isLow ? 'var(--coral)' : 'var(--text)' }}>{item.quantity} {item.unit}</span>
                    )}
                  </td>
                  <td style={{ padding:'14px' }}>
                    {isEdit ? (
                      <input type="number" value={editVal.price} onChange={e=>setEditVal({...editVal, price:+e.target.value})} style={inputS} />
                    ) : (
                      <span>₹{item.price}</span>
                    )}
                  </td>
                  <td style={{ padding:'14px' }}>
                    {isEdit ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <input type="number" value={editVal.gstRate} onChange={e=>setEditVal({...editVal, gstRate:+e.target.value})} style={{...inputS, padding:6}} />
                        <input value={editVal.category} onChange={e=>setEditVal({...editVal, category:e.target.value})} style={{...inputS, padding:6, fontSize:10}} placeholder="Category" />
                      </div>
                    ) : (
                      <span style={{ color:'var(--text-muted)' }}>{item.gstRate || 0}%</span>
                    )}
                  </td>
                  <td style={{ padding:'14px', fontWeight:700, color:'var(--green)' }}>₹{((item.price) * (1 + (item.gstRate||0)/100)).toFixed(2)}</td>
                  <td style={{ padding:'14px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      <span style={{ padding:'4px 10px', borderRadius:20, fontSize:10, fontWeight:700, background: isLow ? 'var(--coral-light)' : 'var(--green-light)', color: isLow ? 'var(--coral)' : 'var(--green)' }}>
                        {isLow ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                      {isLow && (
                        <button
                          onClick={() => { setRestockItem(item); setRestockQty(10); }}
                          style={{ padding:'4px 8px', borderRadius:8, background:'#25D366', color:'white', border:'none', fontSize:10, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                        >
                          📲 Reorder
                        </button>
                      )}
                    </div>
                    {/* WhatsApp Reorder Panel */}
                    {restockItem?._id === item._id && (() => {
                      const sup = getSupplierForItem(item);
                      return (
                        <div style={{ marginTop:8, padding:12, background:'#F0FFF4', border:'1px solid #86EFAC', borderRadius:10, minWidth:200 }}>
                          <div style={{ fontSize:11, fontWeight:800, color:'#166534', marginBottom:8 }}>📦 Reorder: {item.name}</div>
                          {sup ? (
                            <>
                              <div style={{ fontSize:11, color:'#166534', marginBottom:6 }}>🚛 Supplier: <strong>{sup.name}</strong></div>
                              <div style={{ fontSize:11, color:'#166534', marginBottom:8 }}>📞 {sup.contact}</div>
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                                <label style={{ fontSize:10, fontWeight:700, color:'#166534' }}>Qty:</label>
                                <input type="number" value={restockQty} onChange={e=>setRestockQty(+e.target.value)} style={{ width:60, padding:'4px 8px', borderRadius:6, border:'1px solid #86EFAC', fontSize:13, outline:'none' }} />
                                <span style={{ fontSize:10, color:'#166534' }}>{item.unit}</span>
                              </div>
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={() => sendWhatsApp(item, restockQty, sup)} style={{ flex:1, padding:'8px', borderRadius:8, background:'#25D366', color:'white', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>💬 Send on WhatsApp</button>
                                <button onClick={() => setRestockItem(null)} style={{ padding:'8px 10px', borderRadius:8, background:'white', border:'1px solid #86EFAC', color:'#166534', fontSize:12, cursor:'pointer' }}>✕</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize:11, color:'#DC2626' }}>⚠️ No supplier linked to <strong>{item.category}</strong> category. Add one in Suppliers page.</div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding:'14px' }}>
                    {/* Reorder popup panel when bell is clicked */}
                    {restockItem?._id === item._id && (() => {
                      const sup = getSupplierForItem(item);
                      return (
                        <div style={{ position:'absolute', zIndex:200, right:60, background:'white', border:'1px solid #86EFAC', borderRadius:12, padding:14, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', minWidth:220 }}>
                          <div style={{ fontSize:12, fontWeight:800, color:'#166534', marginBottom:8 }}>🔔 Reorder: <span style={{color:'var(--purple)'}}>{item.name}</span></div>
                          {sup ? (
                            <>
                              <div style={{ fontSize:11, color:'#555', marginBottom:4 }}>🚛 <strong>{sup.name}</strong> &nbsp;📞 {sup.contact}</div>
                              <div style={{ fontSize:11, color:'#555', marginBottom:8 }}>Category: <strong>{item.category}</strong></div>
                              <label style={{ fontSize:10, fontWeight:700, color:'#166534', display:'block', marginBottom:4 }}>How much to order?</label>
                              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                                <input type="number" value={restockQty} onChange={e=>setRestockQty(+e.target.value)} min={1} style={{ width:70, padding:'6px 8px', borderRadius:6, border:'1px solid #86EFAC', fontSize:14, outline:'none', fontWeight:700 }} />
                                <span style={{ fontSize:11, color:'#166534', fontWeight:600 }}>{item.unit}</span>
                              </div>
                              <div style={{ display:'flex', gap:6 }}>
                                <button onClick={() => sendWhatsApp(item, restockQty, sup)} style={{ flex:1, padding:'8px', borderRadius:8, background:'#25D366', color:'white', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>💬 WhatsApp</button>
                                <button onClick={() => setRestockItem(null)} style={{ padding:'8px 10px', borderRadius:8, background:'white', border:'1px solid #ddd', color:'#666', fontSize:12, cursor:'pointer' }}>✕</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize:11, color:'#DC2626' }}>⚠️ No supplier for <strong>{item.category}</strong>. Add in Suppliers page.</div>
                          )}
                        </div>
                      );
                    })()}
                    <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative' }}>
                       {isEdit ? (
                         <button onClick={()=>saveEdit(item._id)} style={{ background:'none', border:'none', cursor:'pointer' }}>💾</button>
                       ) : confirmDelete === item._id ? (
                         <div style={{ display:'flex', gap:4 }}>
                           <button onClick={()=>confirmItemDeletion(item._id)} style={{ padding:4, background:'var(--coral)', color:'white', border:'none', borderRadius:4, fontSize:10 }}>Yes</button>
                           <button onClick={()=>setConfirmDelete(null)} style={{ padding:4, background:'white', border:'1px solid var(--border)', borderRadius:4, fontSize:10 }}>No</button>
                         </div>
                       ) : (
                         <>
                           {isLow && (
                             <button
                               title="Reorder via WhatsApp"
                               onClick={() => { setRestockItem(restockItem?._id === item._id ? null : item); setRestockQty(10); }}
                               style={{ background: restockItem?._id === item._id ? '#dcfce7' : 'none', border: restockItem?._id === item._id ? '1px solid #86EFAC' : 'none', borderRadius:6, cursor:'pointer', fontSize:16, padding:'2px 4px' }}
                             >🔔</button>
                           )}
                           <button onClick={()=>startEdit(item)} style={{ background:'none', border:'none', cursor:'pointer' }}>✏️</button>
                           <button onClick={()=>setConfirmDelete(item._id)} style={{ background:'none', border:'none', cursor:'pointer' }}>🗑️</button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid */}
      <div className="show-only-mobile" style={{ display:'none', flexDirection:'column', gap:12 }}>
         {filtered.map(item => {
            const isLow = item.quantity <= item.lowStockThreshold;
            const isEdit = editing === item._id;
            const isDel = confirmDelete === item._id;

            return (
              <div key={item._id} className="premium-card" style={{ padding:14, borderLeft: isLow ? '4px solid var(--coral)' : '1px solid var(--border)' }}>
                 {isEdit ? (
                   <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div style={{ position:'relative' }}>
                        <input value={editVal.name} onChange={e=>handleNameChange(e.target.value, true, setEditVal)} onBlur={e=>handleNameBlur(e.target.value, true)} style={inputS} placeholder="Product Name" />
                        {isPredicting && editing === item._id && <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'var(--purple)' }}>✨</div>}
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                        <div><label style={labelMini}>Qty</label><input type="number" value={editVal.quantity} onChange={e=>setEditVal({...editVal, quantity:+e.target.value})} style={inputS} /></div>
                        <div><label style={labelMini}>Price</label><input type="number" value={editVal.price} onChange={e=>setEditVal({...editVal, price:+e.target.value})} style={inputS} /></div>
                        <div><label style={labelMini}>GST %</label><input type="number" value={editVal.gstRate} onChange={e=>setEditVal({...editVal, gstRate:+e.target.value})} style={inputS} /></div>
                        <div><label style={labelMini}>Category</label><input value={editVal.category} onChange={e=>setEditVal({...editVal, category:e.target.value})} style={inputS} /></div>
                      </div>
                      <div style={{ display:'flex', gap:8, marginTop:8 }}>
                        <button onClick={()=>saveEdit(item._id)} style={{ flex:1, padding:10, borderRadius:8, background:'var(--purple)', color:'white', border:'none', fontWeight:600 }}>Save Changes</button>
                        <button onClick={()=>setEditing(null)} style={{ padding:10, borderRadius:8, background:'white', border:'1px solid var(--border)', color:'var(--text-muted)' }}>Cancel</button>
                      </div>
                   </div>
                 ) : (
                   <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div style={{ fontWeight:700, fontSize:15 }}>{item.name}</div>
                      <span style={{ padding:'2px 8px', borderRadius:20, fontSize:10, fontWeight:800, background: isLow ? 'var(--coral-light)' : 'var(--green-light)', color: isLow ? 'var(--coral)' : 'var(--green)' }}>{item.quantity} {item.unit}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-light)', marginTop:4 }}>{item.category} • <span style={{color:'var(--purple)'}}>GST {item.gstRate || 0}%</span></div>
                    {isLow && (
                      <div style={{ marginTop:8 }}>
                        {restockItem?._id === item._id ? (() => {
                          const sup = getSupplierForItem(item);
                          return (
                            <div style={{ padding:12, background:'#F0FFF4', border:'1px solid #86EFAC', borderRadius:10 }}>
                              <div style={{ fontSize:11, fontWeight:800, color:'#166534', marginBottom:6 }}>📦 Reorder: {item.name}</div>
                              {sup ? (
                                <>
                                  <div style={{ fontSize:11, color:'#166534', marginBottom:4 }}>🚛 {sup.name} • 📞 {sup.contact}</div>
                                  <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:8 }}>
                                    <input type="number" value={restockQty} onChange={e=>setRestockQty(+e.target.value)} style={{ width:70, padding:'6px', borderRadius:6, border:'1px solid #86EFAC', fontSize:13, outline:'none' }} />
                                    <span style={{ fontSize:11, color:'#166534' }}>{item.unit}</span>
                                  </div>
                                  <div style={{ display:'flex', gap:6 }}>
                                    <button onClick={() => sendWhatsApp(item, restockQty, sup)} style={{ flex:1, padding:'8px', borderRadius:8, background:'#25D366', color:'white', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>💬 WhatsApp</button>
                                    <button onClick={() => setRestockItem(null)} style={{ padding:'8px', borderRadius:8, background:'white', border:'1px solid #86EFAC', color:'#166534', fontSize:12, cursor:'pointer' }}>✕</button>
                                  </div>
                                </>
                              ) : (
                                <div style={{ fontSize:11, color:'#DC2626' }}>⚠️ No supplier for <strong>{item.category}</strong>. Add in Suppliers page.</div>
                              )}
                            </div>
                          );
                        })() : (
                          <button onClick={() => { setRestockItem(item); setRestockQty(10); }} style={{ width:'100%', padding:'8px', borderRadius:8, background:'#25D366', color:'white', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>📲 Reorder via WhatsApp</button>
                        )}
                      </div>
                    )}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
                        <div style={{ fontWeight:700, color:'var(--purple)' }}>₹{((item.price) * (1 + (item.gstRate||0)/100)).toFixed(2)} <span style={{fontSize:10, color:'var(--text-light)', fontWeight:400}}>Total</span></div>
                        <div style={{ display:'flex', gap:10 }}>
                          {isDel ? (
                            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                              <span style={{fontSize:11, fontWeight:700, color:'var(--coral)'}}>Sure?</span>
                              <button onClick={()=>confirmItemDeletion(item._id)} style={{ padding:'6px 12px', borderRadius:6, background:'var(--coral)', color:'white', border:'none' }}>Yes</button>
                              <button onClick={()=>setConfirmDelete(null)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background:'white' }}>No</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={()=>startEdit(item)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--border)', background:'white' }}>Edit</button>
                              <button onClick={()=>setConfirmDelete(item._id)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--coral)', color:'var(--coral)', background:'white' }}>Delete</button>
                            </>
                          )}
                        </div>
                    </div>
                   </>
                 )}
              </div>
            )
         })}
      </div>
      
      <style>{`
        @media (max-width: 1100px) {
          .hide-on-mobile { display: none !important; }
          .show-only-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

const labelS = { display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:6, fontWeight:600, textTransform:'uppercase' };
const labelMini = { display:'block', fontSize:10, color:'var(--text-light)', marginBottom:4, fontWeight:600, textTransform:'uppercase' };
const inputS = { width:'100%', padding:'10px', borderRadius:8, border:'1px solid var(--border)', fontSize:14, outline:'none' };