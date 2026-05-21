import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { khataApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function KhataDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newTx, setNewTx] = useState({ amount: '', type: 'CREDIT', note: '' })
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [c, t] = await Promise.all([
        khataApi.getCustomer(id),
        khataApi.getTransactions(id)
      ])
      setCustomer(c.data)
      setTransactions(t.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [id])

  const handleAddTransaction = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await khataApi.addTransaction({
        customerId: id,
        ...newTx,
        amount: Number(newTx.amount)
      })
      
      const lastTx = { ...newTx, amount: Number(newTx.amount), date: new Date() }
      const newBal = newTx.type === 'CREDIT' ? customer.balance + Number(newTx.amount) : customer.balance - Number(newTx.amount)
      
      setNewTx({ amount: '', type: 'CREDIT', note: '' })
      setShowAdd(false)
      loadData()
      
      // Auto-open WhatsApp on success
      sendWhatsApp(lastTx, newBal)
    } catch (e) {
      alert(e.response?.data?.message || 'Error processing transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const sendWhatsApp = (tx, balance) => {
    const msg = `Hello ${customer.name},
Your transaction of ₹${tx.amount} has been recorded at ${user?.shopName}.
Type: ${tx.type === 'CREDIT' ? 'Credit (Udhaar)' : 'Payment Received'}
Remaining Balance: ₹${balance}
Thank you!`.trim()
    
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/${customer.phone}?text=${encoded}`, '_blank')
  }

  if (loading) return <div>Loading...</div>
  if (!customer) return <div>Customer not found.</div>

  return (
    <div className="khata-detail-container fade-in">
      <div className="detail-navigation">
        <button onClick={() => navigate('/khata')} className="back-btn">
          <span className="arrow">←</span> Back to Khata Book
        </button>
      </div>
      
      <div className="premium-card customer-hero">
        <div className="hero-content">
          <div className="customer-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="customer-meta">
            <h1 className="customer-name">{customer.name}</h1>
            <p className="customer-phone">📞 {customer.phone}</p>
          </div>
        </div>
        <div className="balance-display">
          <div className="label">Current Balance</div>
          <div className={`value ${customer.balance > 0 ? 'due' : 'cleared'}`}>
            ₹{customer.balance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="history-header">
        <h2 className="section-title">Ledger Entries</h2>
        <button 
          onClick={() => setShowAdd(true)}
          className="add-entry-btn"
        >
          + New Entry
        </button>
      </div>

      <div className="ledget-list">
        {transactions.length === 0 ? (
          <div className="premium-card empty-ledger">No ledger entries found for this customer.</div>
        ) : (
          <div className="transaction-timeline">
            {transactions.map(t => (
              <div key={t._id} className="premium-card transaction-card">
                <div className="tx-meta">
                  <div className="tx-date">{new Date(t.createdAt).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' })}</div>
                  <div className={`tx-badge ${t.type.toLowerCase()}`}>
                    {t.type === 'CREDIT' ? 'Credit Issued' : 'Payment Received'}
                  </div>
                </div>
                <div className="tx-body">
                  <div className="tx-note">{t.note || 'Regular Transaction'}</div>
                  <div className={`tx-amount ${t.type.toLowerCase()}`}>
                    {t.type === 'CREDIT' ? '+' : '-'} ₹{t.amount.toLocaleString()}
                  </div>
                </div>
                <div className="tx-footer">
                   <button onClick={() => sendWhatsApp(t, customer.balance)} className="wa-share-btn">
                     Share Receipt via WhatsApp
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="premium-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Record Entry</h2>
            <p className="modal-desc">This entry will adjust the customer's khata balance.</p>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Entry Type</label>
                <div className="select-wrapper">
                  <select value={newTx.type} onChange={e => setNewTx({...newTx, type: e.target.value})} className="custom-select">
                    <option value="CREDIT">Udhari (Credit Issued)</option>
                    <option value="PAYMENT">Jama (Payment Received)</option>
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input required type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: e.target.value})} placeholder="0.00" className="form-input" />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input type="text" value={newTx.note} onChange={e => setNewTx({...newTx, note: e.target.value})} placeholder="e.g. Milk, Monthly Settlement" className="form-input" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAdd(false)} className="cancel-btn">Discard</button>
                <button type="submit" disabled={submitting} className="save-btn">{submitting ? 'Syncing...' : 'Add & Notify'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .khata-detail-container { max-width: 800px; margin: 0 auto; }
        .detail-navigation { margin-bottom: 20px; }
        .back-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 6px; }
        .back-btn:hover { color: var(--purple); }
        
        .customer-hero { display: flex; justify-content: space-between; align-items: center; background: var(--bg2) !important; border-bottom: 4px solid var(--purple) !important; padding: 24px !important; }
        .hero-content { display: flex; align-items: center; gap: 16px; }
        .customer-avatar { width: 52px; height: 52px; border-radius: 14px; background: var(--purple); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; font-family: 'Syne', sans-serif; }
        .customer-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin: 0; }
        .customer-phone { color: var(--text-muted); font-size: 13px; margin: 4px 0 0; }
        
        .balance-display { text-align: right; }
        .balance-display .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-light); margin-bottom: 4px; }
        .balance-display .value { font-size: 28px; font-weight: 900; }
        .balance-display .value.due { color: var(--coral); }
        .balance-display .value.cleared { color: var(--green); }

        .history-header { display: flex; justify-content: space-between; align-items: center; margin: 32px 0 20px; }
        .section-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; margin: 0; }
        .add-entry-btn { background: var(--purple); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2); }

        .transaction-timeline { display: flex; flex-direction: column; gap: 12px; }
        .transaction-card { padding: 16px !important; display: flex; flex-direction: column; gap: 12px; }
        .tx-meta { display: flex; justify-content: space-between; align-items: center; }
        .tx-date { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .tx-badge { font-size: 9px; font-weight: 800; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; }
        .tx-badge.credit { background: var(--coral-light); color: var(--coral); }
        .tx-badge.payment { background: var(--green-light); color: var(--green); }
        
        .tx-body { display: flex; justify-content: space-between; align-items: center; }
        .tx-note { font-weight: 600; font-size: 14px; color: var(--text); }
        .tx-amount { font-size: 18px; font-weight: 800; }
        .tx-amount.credit { color: var(--coral); }
        .tx-amount.payment { color: var(--green); }

        .tx-footer { margin-top: 4px; padding-top: 12px; border-top: 1px dashed var(--border-light); }
        .wa-share-btn { width: 100%; padding: 8px; border-radius: 6px; background: #e7f7ed; border: 1px solid #25d36640; color: #128c7e; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .wa-share-btn:hover { background: #dcf8e6; border-color: #25d366; }

        .empty-ledger { text-align: center; padding: 40px !important; color: var(--text-muted); font-size: 13px; }

        @media (max-width: 600px) {
          .customer-hero { flex-direction: column; align-items: flex-start; gap: 20px; }
          .balance-display { text-align: left; width: 100%; border-top: 1px dashed var(--border); padding-top: 16px; }
          .history-header { flex-direction: column; gap: 16px; align-items: flex-start; }
          .add-entry-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  )
}
