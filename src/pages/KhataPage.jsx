import { useState, useEffect } from 'react'
import { khataApi } from '../api'
import { Link } from 'react-router-dom'

export default function KhataPage() {
  const [customers, setCustomers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newCust, setNewCust] = useState({ name: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      const { data } = await khataApi.getCustomers()
      setCustomers(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await khataApi.addCustomer(newCust)
      setNewCust({ name: '', phone: '' })
      setShowAdd(false)
      load()
    } catch (e) {
      alert(e.response?.data?.message || 'Error adding customer')
    } finally {
      setLoading(false)
    }
  }

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  )

  const totalUdhar = customers.reduce((acc, c) => acc + (c.balance > 0 ? c.balance : 0), 0)

  return (
    <div className="khata-container fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📖 Khata Book</h1>
          <p className="page-subtitle">Manage customer credit and payment history</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="add-btn"
        >
          + Add Customer
        </button>
      </div>

      <div className="khata-stats-grid">
        <div className="premium-card stat-card">
          <div className="stat-label">Total Outstanding</div>
          <div className="stat-value udhaar">₹{totalUdhar.toLocaleString()}</div>
          <div className="stat-sub">Money to collect</div>
        </div>
        <div className="premium-card stat-card">
          <div className="stat-label">Total Settlements</div>
          <div className="stat-value paid">₹{customers.reduce((acc, c) => acc + c.totalPaid, 0).toLocaleString()}</div>
          <div className="stat-sub">Money received</div>
        </div>
        <div className="premium-card stat-card">
          <div className="stat-label">Active Customers</div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-sub">Kirana subscribers</div>
        </div>
      </div>

      <div className="khata-list-container premium-card">
        <div className="list-search-bar">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Desktop Table View */}
        <div className="table-wrapper hide-on-mobile">
          <table className="khata-table">
            <thead>
              <tr>
                <th>Customer Details</th>
                <th>Purchases</th>
                <th>Payments</th>
                <th>Current Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c._id}>
                  <td>
                    <div className="cust-name">{c.name}</div>
                    <div className="cust-phone">{c.phone}</div>
                  </td>
                  <td>₹{c.totalCredit.toLocaleString()}</td>
                  <td>₹{c.totalPaid.toLocaleString()}</td>
                  <td className={c.balance > 0 ? 'balance-due' : 'balance-cleared'}>
                    ₹{c.balance.toLocaleString()}
                  </td>
                  <td>
                    <Link to={`/khata/${c._id}`} className="view-link">Details →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only-list show-on-mobile">
          {filtered.map(c => (
            <Link key={c._id} to={`/khata/${c._id}`} className="khata-mobile-card">
              <div className="mobile-card-top">
                <div className="cust-info">
                  <div className="cust-name">{c.name}</div>
                  <div className="cust-phone">{c.phone}</div>
                </div>
                <div className={`mobile-balance ${c.balance > 0 ? 'due' : 'cleared'}`}>
                  ₹{c.balance.toLocaleString()}
                </div>
              </div>
              <div className="mobile-card-bottom">
                <div className="mini-stat"><span>Credit:</span> ₹{c.totalCredit}</div>
                <div className="mini-stat"><span>Paid:</span> ₹{c.totalPaid}</div>
                <div className="view-indicator">View History ›</div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <div className="empty-search">No customers matching "{search}"</div>}
        </div>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="premium-card modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">New Entry</h2>
            <p className="modal-desc">Create a digital khata for your regular customer.</p>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Customer Full Name</label>
                <input required type="text" value={newCust.name} onChange={e => setNewCust({...newCust, name: e.target.value})} placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="form-group">
                <label>Mobile Number (WhatsApp Preferred)</label>
                <input required type="text" value={newCust.phone} onChange={e => setNewCust({...newCust, phone: e.target.value})} placeholder="10 digits" />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAdd(false)} className="cancel-btn">Back</button>
                <button type="submit" disabled={loading} className="save-btn">{loading ? 'Adding...' : 'Create Khata'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; }
        .page-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
        .add-btn { background: var(--purple); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); transition: all 0.2s; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3); }

        .khata-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 28px; }
        .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); }
        .stat-value { font-size: 24px; font-weight: 800; margin: 4px 0; }
        .stat-value.udhaar { color: var(--coral); }
        .stat-value.paid { color: var(--green); }
        .stat-sub { font-size: 11px; color: var(--text-muted); }

        .khata-list-container { padding: 0 !important; overflow: hidden; }
        .list-search-bar { padding: 16px; border-bottom: 1px solid var(--border-light); display: flex; align-items: center; gap: 12px; background: var(--bg3); }
        .search-input { border: none; background: transparent; font-size: 14px; flex: 1; outline: none; color: var(--text); }
        .search-icon { color: var(--text-light); }

        .khata-table { width: 100%; border-collapse: collapse; text-align: left; }
        .khata-table th { padding: 14px 20px; background: var(--bg); color: var(--text-light); font-size: 11px; font-weight: 800; text-transform: uppercase; }
        .khata-table td { padding: 16px 20px; border-bottom: 1px solid var(--border-light); font-size: 14px; }
        .cust-name { font-weight: 700; color: var(--text); }
        .cust-phone { font-size: 12px; color: var(--text-muted); }
        .balance-due { color: var(--coral); font-weight: 700; }
        .balance-cleared { color: var(--green); font-weight: 700; }
        .view-link { color: var(--purple); font-weight: 600; text-decoration: none; font-size: 13px; }

        .mobile-only-list { padding: 12px; display: none; }
        .khata-mobile-card { display: block; background: var(--bg); border: 1px solid var(--border-light); border-radius: 12px; padding: 16px; margin-bottom: 12px; text-decoration: none; color: inherit; transition: all 0.2s; }
        .mobile-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .mobile-balance { font-size: 18px; font-weight: 800; }
        .mobile-balance.due { color: var(--coral); }
        .mobile-balance.cleared { color: var(--green); }
        .mobile-card-bottom { display: flex; gap: 12px; border-top: 1px dashed var(--border); padding-top: 10px; font-size: 11px; align-items: center; }
        .mini-stat span { color: var(--text-muted); font-weight: 600; }
        .view-indicator { margin-left: auto; color: var(--purple); font-weight: 700; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justifyContent: center; z-index: 1000; padding: 20px; }
        .modal-content { max-width: 400px; width: 100%; border-top: 4px solid var(--purple); }
        .modal-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; margin-bottom: 4px; }
        .modal-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 24px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px; }
        .form-group input { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); outline: none; transition: border 0.2s; }
        .form-group input:focus { border-color: var(--purple); }
        .modal-footer { display: flex; gap: 12px; margin-top: 24px; }
        .cancel-btn { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: white; cursor: pointer; font-weight: 600; }
        .save-btn { flex: 1; padding: 12px; border-radius: 10px; border: none; background: var(--purple); color: white; cursor: pointer; font-weight: 700; }

        @media (max-width: 1100px) {
          .khata-stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .hide-on-mobile { display: none; }
          .show-on-mobile { display: block; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .add-btn { width: 100%; text-align: center; }
        }
      `}</style>
    </div>
  )
}
