import { useState } from 'react'
import { chatApi } from '../api'
import OfferPreviewCard from '../components/OfferPreviewCard'

const festivals = ['Diwali','Navratri','Holi','Eid','Ganesh Chaturthi','Christmas','New Year','Raksha Bandhan']

export default function OffersPage() {
  const [prompt, setPrompt] = useState('')
  const [offer, setOffer] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async (customPrompt) => {
    const msg = customPrompt || prompt
    if (!msg) return
    setLoading(true)
    try {
      const { data } = await chatApi.send(`Generate WhatsApp offer for: ${msg}`)
      const text = data.data?.offerText || data.reply
      setOffer(text)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:700 }}>Offers Generator</div>
        <div style={{ fontSize:13, color:'var(--muted)', marginTop:4 }}>AI-generated WhatsApp promotional messages for your customers</div>
      </div>

      <div className="offers-container fade-in">
        <div className="offers-grid">
          {/* Custom offer */}
          <div className="premium-card offer-card">
            <div className="card-header-with-icon">
              <span className="icon">🎨</span>
              <div className="card-title">Custom Campaign</div>
            </div>
            <p className="card-description">Describe your promotion to generate a tailored WhatsApp message.</p>
            <textarea
              value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. '20% off on all vegetables today' or 'Buy 2 get 1 free on Maggi'"
              className="offer-textarea"
            />
            <button onClick={() => generate()} disabled={loading || !prompt} className="generate-btn custom">
              {loading ? 'Crafting Message...' : '🚀 Generate Offer'}
            </button>
          </div>

          {/* Festival offers */}
          <div className="premium-card offer-card">
            <div className="card-header-with-icon">
              <span className="icon">🏮</span>
              <div className="card-title">Festival Templates</div>
            </div>
            <p className="card-description">Ready-made templates for upcoming seasonal celebrations.</p>
            <div className="festival-buttons">
              {festivals.map(f => (
                <button key={f} onClick={() => generate(`${f} special offer for my kirana store`)} disabled={loading} className="festival-btn">
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {offer && (
          <div className="offer-preview-section fade-in">
            <div className="preview-label">Generated Results</div>
            <OfferPreviewCard offerText={offer} onClear={() => setOffer('')} />
          </div>
        )}

        {/* Ideas */}
        <div className="premium-card ideas-card">
          <div className="card-title-small">Quick Campaign Ideas</div>
          <div className="ideas-grid">
            {[
              'Aaj tomato sale pe dalo', 'Weekend combo offer banao',
              'Loyalty discount', 'Stock clearance',
              'Morning fresh vegetables', 'Bulk buy deal',
            ].map(idea => (
              <button key={idea} onClick={() => { setPrompt(idea); generate(idea) }} className="idea-chip">
                {idea}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .offers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .card-header-with-icon {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .card-header-with-icon .icon {
          font-size: 20px;
        }
        .card-title {
          font-weight: 800;
          font-size: 17px;
          font-family: 'Syne', sans-serif;
        }
        .card-description {
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .offer-textarea {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          color: var(--text);
          outline: none;
          min-height: 100px;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .offer-textarea:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 3px var(--purple-light);
        }
        .generate-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .generate-btn.custom {
          background: var(--coral);
          color: white;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2);
        }
        .generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .festival-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .festival-btn {
          padding: 10px;
          border-radius: 8px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .festival-btn:hover {
          border-color: var(--purple);
          background: white;
          color: var(--purple);
          transform: translateY(-2px);
        }
        .preview-label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .card-title-small {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .ideas-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .idea-chip {
          padding: 8px 14px;
          border-radius: 20px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .idea-chip:hover {
          background: white;
          border-color: var(--purple);
          color: var(--purple);
        }
        @media (max-width: 900px) {
          .offers-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
