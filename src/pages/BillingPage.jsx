import { useState, useEffect } from 'react'
import { billingApi, khataApi } from '../api'
import { useInventory } from '../context/InventoryContext'
import { useAuth } from '../context/AuthContext'
import translations from '../utils/translations'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function BillingPage() {
  const { user } = useAuth()
  const { items, refreshInventory } = useInventory()
  const t = translations[user?.language || 'english']
  
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState({ name: '', contact: '' })
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [view, setView] = useState('new') // 'new' or 'history'
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (view === 'history') loadHistory()
  }, [view])

  const loadHistory = async () => {
    try { const { data } = await billingApi.getAll(); setInvoices(data) } catch (e) {}
  }

  const addToCart = (item) => {
    if (item.quantity <= 0) return alert('Out of stock!')
    setCart(prev => {
      const ex = prev.find(i => i._id === item._id)
      if (ex) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const updateQty = (id, n) => {
    const item = items.find(i => i._id === id)
    if (n > item.quantity) return alert(`Only ${item.quantity} in stock`)
    if (n <= 0) return setCart(prev => prev.filter(i => i._id !== id))
    setCart(prev => prev.map(i => i._id === id ? { ...i, qty: n } : i))
  }

  const subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0)
  const gstTotal = cart.reduce((a, c) => a + ((c.price * c.qty * (c.gstRate || 0)) / 100), 0)
  const grandTotal = Math.max(0, subtotal + gstTotal - discount)

  const getWhatsAppLink = (invoice) => {
    const text = `*Invoice from InventIQ*%0A------------------%0AClient: ${invoice.customerName}%0AItems:%0A${invoice.items.map(i => `- ${i.itemName || i.name} x ${i.quantity} = ₹${i.total || (i.price * i.quantity)}`).join('%0A')}%0A------------------%0ATotal: ₹${invoice.grandTotal}%0AStatus: ${invoice.status}%0AThank you!`;
    return `https://wa.me/${invoice.customerContact?.replace(/\D/g, '')}?text=${text}`;
  }

  const downloadInvoicePDF = (invoice) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(109, 40, 217);
      doc.text("InventIQ", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Invoice Number: #${invoice._id.slice(-6).toUpperCase()}`, 14, 30);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`, 14, 35);
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Billed To:", 130, 22);
      doc.setFontSize(10);
      doc.text(invoice.customerName || "Walk-in Customer", 130, 28);
      if (invoice.customerContact) doc.text(invoice.customerContact, 130, 33);
      
      const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
      const tableRows = [];
      let computedSub = 0;
      
      invoice.items.forEach(item => {
        const price = item.price || 0;
        const qty = item.quantity || 0;
        computedSub += price * qty;
        tableRows.push([
          item.itemName || item.name || "Item",
          `Rs. ${price.toFixed(2)}`,
          qty.toString(),
          `Rs. ${(item.total || (price * qty)).toFixed(2)}`
        ]);
      });
      
      autoTable(doc, {
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [109, 40, 217] },
      });
      
      const finalY = doc.lastAutoTable?.finalY || 45;
      doc.setFontSize(12);
      doc.text(`Subtotal: Rs. ${computedSub.toFixed(2)}`, 130, finalY + 10);
      doc.text(`Discount: Rs. ${(invoice.discount || 0).toFixed(2)}`, 130, finalY + 16);
      doc.setFontSize(14);
      doc.setTextColor(10, 150, 10);
      doc.text(`Grand Total: Rs. ${(invoice.grandTotal || computedSub).toFixed(2)}`, 130, finalY + 26);
      
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const newWin = window.open(url, "_blank");
      if (!newWin) alert("Please allow popups to view your PDF Invoice natively!");
    } catch (err) {
      console.error("PDF Gen Error:", err);
      alert("Failed to generate PDF properly: " + err.message);
    }
  };

  const generateBill = async () => {
    if (!cart.length) return alert('Cart is empty')
    setLoading(true)
    try {
      const payload = {
        customerName: customer.name || 'Walk-in Customer',
        customerContact: customer.contact,
        items: cart.map(c => ({ ...c, quantity: c.qty })),
        paymentMethod,
        discount,
        status: paymentMethod === 'Udhaar' ? 'Unpaid' : 'Paid'
      }
      const { data: newInvoice } = await billingApi.create(payload)
      
      if (paymentMethod === 'Udhaar' && customer.contact) {
        try {
          let khataCust;
          const { data: allCusts } = await khataApi.getCustomers();
          khataCust = allCusts.find(c => c.phone === customer.contact);
          if (!khataCust) {
            const { data: created } = await khataApi.addCustomer({ name: customer.name || 'Walk-in', phone: customer.contact });
            khataCust = created;
          }
          await khataApi.addTransaction({
            customerId: khataCust._id,
            amount: grandTotal,
            type: 'CREDIT',
            note: `Invoice #${newInvoice._id.slice(-6)}`
          });
        } catch (khataErr) {
          console.error("Khata Auto-sync failed:", khataErr);
        }
      }

      alert('Bill generated successfully!')
      if (customer.contact) {
         if (window.confirm('Send receipt to WhatsApp?')) {
            window.open(getWhatsAppLink(newInvoice), '_blank')
         }
      }
      if (window.confirm('Download PDF Invoice?')) {
         downloadInvoicePDF(newInvoice)
      }

      setCart([])
      setCustomer({ name:'', contact:'' })
      setPaymentMethod('Cash')
      setDiscount(0)
      setShowQR(false)
      refreshInventory()
      setView('history')
    } catch (e) {
      alert('Failed to generate bill')
    } finally {
      setLoading(false)
    }
  }

  const upiUrl = `upi://pay?pa=store@upi&pn=InventIQ&am=${grandTotal.toFixed(2)}&cu=INR`;

  return (
    <div>
      {showQR && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
           <div style={{ background:'white', padding:30, borderRadius:16, textAlign:'center', maxWidth:400 }}>
              <h2 style={{ marginBottom:16 }}>Scan to Pay</h2>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`} alt="UPI QR" />
              <div style={{ marginTop:16, fontSize:20, fontWeight:700, color:'var(--purple)' }}>₹{grandTotal.toFixed(2)}</div>
              <p style={{ marginTop:20, color:'var(--muted)' }}>Ask customer to scan and pay via any UPI app.</p>
              <div style={{ display:'flex', gap:10, marginTop:24 }}>
                <button onClick={() => setShowQR(false)} style={{ flex:1, padding:12, borderRadius:8, border:'1px solid var(--border)', background:'white' }}>Cancel</button>
                <button onClick={generateBill} style={{ flex:1, padding:12, borderRadius:8, border:'none', background:'var(--green)', color:'white', fontWeight:600 }}>Payment Received</button>
              </div>
           </div>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700, color:'var(--text)' }}>{t.billing}</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>Send bills to customers and view history</div>
        </div>
        <div style={{ display:'flex', gap:6, background:'white', border:'1px solid var(--border)', borderRadius:8, padding:4 }}>
          <button onClick={() => setView('new')} style={{ padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:500, background: view==='new' ? 'var(--purple)' : 'transparent', border: 'none', color: view==='new' ? 'white' : 'var(--muted)', cursor:'pointer' }}>{t.new_bill}</button>
          <button onClick={() => setView('history')} style={{ padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:500, background: view==='history' ? 'var(--purple)' : 'transparent', border: 'none', color: view==='history' ? 'white' : 'var(--muted)', cursor:'pointer' }}>{t.history}</button>
        </div>
      </div>

      {view === 'new' ? (
        <div className="billing-grid">
          {/* Cart / Invoice Gen - MOVES TO TOP ON MOBILE */}
          <div className="billing-cart-panel" style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:16, borderBottom:'1px solid var(--border)' }}>
              <h3 style={{ fontSize:15, marginBottom:12 }}>{t.customer_details}</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <input placeholder="Name" value={customer.name} onChange={e => setCustomer({...customer, name:e.target.value})} style={inputSmall} />
                <input placeholder="WhatsApp Number" value={customer.contact} onChange={e => setCustomer({...customer, contact:e.target.value})} style={inputSmall} />
              </div>
            </div>

            <div className="billing-cart-items" style={{ flex:1, overflowY:'auto', padding:16, background:'var(--bg)', minHeight:120, maxHeight:400 }}>
              <h4 style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Selected Items ({cart.length})</h4>
              {!cart.length && <div style={{ textAlign:'center', padding:'20px 0', color: 'var(--text-light)', fontSize:13 }}>Select products to start.</div>}
              {cart.map(c => (
                <div key={c._id} className="premium-card fade-in" style={{ padding:12, marginBottom:8, border:'1px solid var(--purple-light)', background:'white' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.name}</div>
                    <div style={{ fontWeight:800, color:'var(--text)' }}>₹{(c.price * c.qty * (1 + (c.gstRate||0)/100)).toFixed(2)}</div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:10 }}>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>₹{c.price} x {c.qty} <span style={{marginLeft:4, color:'var(--purple)'}}>+{c.gstRate}%</span></div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>updateQty(c._id, c.qty-1)} style={qtyBtn}>-</button>
                      <span style={{ fontSize:14, fontWeight:700, minWidth:20, textAlign:'center' }}>{c.qty}</span>
                      <button onClick={()=>updateQty(c._id, c.qty+1)} style={qtyBtn}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:16, borderTop:'1px solid var(--border)', background:'var(--bg2)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:4, marginBottom:16 }}>
                {['Cash', 'UPI', 'Online', 'Udhaar'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)} style={{ padding:'8px 2px', borderRadius:6, fontSize:11, fontWeight:600, border:'1px solid var(--border)', background: paymentMethod===m ? 'var(--purple)' : 'white', color: paymentMethod===m ? 'white' : 'var(--text-muted)', cursor:'pointer' }}>{m}</button>
                ))}
              </div>

              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                 <span style={{color:'var(--text-muted)'}}>{t.grand_total} (incl. GST)</span>
                 <span style={{fontSize:20, fontWeight:800, color:'var(--purple)'}}>₹{grandTotal.toFixed(2)}</span>
              </div>
              
              <button 
                disabled={loading || !cart.length} 
                onClick={() => ['UPI', 'Online'].includes(paymentMethod) ? setShowQR(true) : generateBill()} 
                style={{ width:'100%', padding:'14px', borderRadius:10, background: paymentMethod === 'Udhaar' ? 'var(--coral)' : 'var(--green)', color:'white', fontSize:15, fontWeight:700, border:'none', cursor:'pointer', boxShadow:'0 4px 12px rgba(0,0,0,0.1)', marginTop:12 }}
              >
                {loading ? 'Processing...' : paymentMethod === 'Udhaar' ? 'Add to Khata Book' : t.complete_bill}
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="billing-products-panel" style={{ background:'white', borderRadius:12, padding:20, border:'1px solid var(--border)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
             <h3 style={{ fontSize:15, marginBottom:16, fontWeight:700 }}>Available Stock</h3>
             <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:10 }}>
               {items.map(item => {
                 const inCart = cart.find(c => c._id === item._id);
                 return (
                  <div key={item._id} onClick={() => addToCart(item)} className="premium-card" style={{ cursor:'pointer', padding:12, border: inCart ? '2px solid var(--purple)' : '1px solid var(--border)', background: inCart ? 'var(--purple-xl)' : 'white', opacity: item.quantity <= 0 ? 0.5 : 1 }}>
                    <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>{item.name}</div>
                    <div style={{ fontSize:11, color: item.quantity <= 5 ? 'var(--coral)' : 'var(--text-muted)' }}>Stock: {item.quantity}</div>
                    <div style={{ fontSize:14, color:'var(--purple)', fontWeight:800, marginTop:6 }}>₹{item.price}</div>
                  </div>
                 )
               })}
             </div>
          </div>
          
          <style>{`
            .billing-cart-panel {
              height: calc(100vh - 160px);
              position: sticky;
              top: 20px;
              order: 2;
            }
            @media (max-width: 1100px) {
              .billing-cart-panel {
                height: auto;
                position: relative;
                top: 0;
                order: 1; /* CART TOP ON MOBILE */
                margin-bottom: 20px;
              }
              .billing-products-panel {
                order: 2;
              }
            }
          `}</style>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:12, padding:20, border:'1px solid var(--border)', overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left', minWidth:600 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border)', fontSize:12, color:'var(--muted)', textTransform:'uppercase' }}>
                <th style={{ padding:12 }}>Date</th>
                <th style={{ padding:12 }}>Customer</th>
                <th style={{ padding:12 }}>Items</th>
                <th style={{ padding:12 }}>Payment</th>
                <th style={{ padding:12 }}>Total</th>
                <th style={{ padding:12 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:12, fontSize:13 }}>{new Date(inv.createdAt).toLocaleString()}</td>
                  <td style={{ padding:12, fontSize:13, fontWeight:500 }}>{inv.customerName}<br/><span style={{fontSize:11, color:'var(--muted)'}}>{inv.customerContact}</span></td>
                  <td style={{ padding:12, fontSize:13 }}>{inv.items.length} products</td>
                  <td style={{ padding:12, fontSize:13 }}>
                    <span style={{ padding:'2px 8px', borderRadius:4, fontSize:11, background: inv.paymentMethod==='Udhaar' ? '#FEE2E2' : '#E0E7FF', color: inv.paymentMethod==='Udhaar' ? '#991B1B' : '#3730A3' }}>{inv.paymentMethod}</span>
                  </td>
                  <td style={{ padding:12, fontSize:14, fontWeight:700, color:'var(--green)' }}>₹{inv.grandTotal.toFixed(2)}</td>
                  <td style={{ padding:12 }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => downloadInvoicePDF(inv)} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid var(--purple)', background:'white', color:'var(--purple)', fontSize:12, fontWeight:600, cursor:'pointer' }}>PDF</button>
                      <button onClick={() => window.open(getWhatsAppLink(inv), '_blank')} style={{ padding:'6px 12px', borderRadius:6, border:'1px solid #25D366', background:'white', color:'#25D366', fontSize:12, fontWeight:600, cursor:'pointer' }}>Wa.me</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const inputSmall = { width:'100%', padding:'8px 12px', border:'1px solid var(--border)', borderRadius:6, outline:'none', fontSize:13 };
const qtyBtn = { padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background:'white', cursor:'pointer', fontSize:14, fontWeight:700 };
