import { useState } from "react";
import { useInventory } from "../context/InventoryContext";
import ChatWindow from "../components/ChatWindow";
import OfferPreviewCard from "../components/OfferPreviewCard";

export default function ChatPage() {
  const [lastOffer, setLastOffer] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshInventory } = useInventory();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          AI Chat Assistant
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Hindi, Gujarati ya English mein baat karein — stock update, alerts,
          aur offers
        </div>
      </div>

      <div className="chat-grid">
        <div className="chat-window-wrapper">
          <ChatWindow
            key={refreshKey}
            onInventoryUpdate={() => {
              setRefreshKey((k) => k + 1);
              refreshInventory();
            }}
            onOfferGenerated={setLastOffer}
          />
        </div>

        {/* Right panel - now moves to bottom on mobile */}
        <div className="chat-sidebar">
          {lastOffer && (
            <OfferPreviewCard
              offerText={lastOffer}
              onClear={() => setLastOffer("")}
            />
          )}

          {/* Tips */}
          <div className="premium-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>Try saying...</div>
            {[
              { text: '"Kal 30 packet Maggi aaye"', action: "Stock update" },
              { text: '"Sab kuch check karo, kya kam hai?"', action: "Low stock" },
              { text: '"Aaj tomato offer pe dalo"', action: "Offer" },
              { text: '"Is hafte kitna bika?"', action: "Sales report" },
              { text: '"Rice ka stock 50 set karo"', action: "Set stock" },
            ].map((t) => (
              <div key={t.text} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                <div style={{ color: "var(--text)", fontStyle: "italic" }}>{t.text}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>→ {t.action}</div>
              </div>
            ))}
          </div>

          {/* Language guide */}
          <div className="premium-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--text)" }}>Supported Languages</div>
            {[
              ["🇮🇳", "Hindi", "हिंदी में बात करें"],
              ["🇮🇳", "Gujarati", "ગુજરાતીમાં વાત"],
              ["🇬🇧", "English", "Chat in English"],
            ].map(([flag, lang, eg]) => (
              <div key={lang} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", fontSize: 12 }}>
                <span style={{ fontSize: 18 }}>{flag}</span>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 600 }}>{lang}</div>
                  <div style={{ color: "var(--text-muted)" }}>{eg}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .chat-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
          height: calc(100vh - 160px);
        }
        @media (max-width: 1024px) {
          .chat-grid {
            grid-template-columns: 1fr;
            height: auto;
            display: flex;
            flex-direction: column;
          }
          .chat-window-wrapper {
            height: 500px; /* Fixed height on mobile to ensure it doesn't vanish */
            order: 1;
          }
          .chat-sidebar {
            order: 2;
            margin-top: 20px;
          }
        }
      `}</style>
    </div>
  );
}
