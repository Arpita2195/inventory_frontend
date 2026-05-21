import { useState, useRef, useEffect } from "react";
import { chatApi } from "../api";

const BubbleUser = ({ text }) => (
  <div
    style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}
  >
    <div
      style={{
        maxWidth: "72%",
        background: "var(--purple)",
        color: "white",
        padding: "10px 14px",
        borderRadius: "16px 16px 4px 16px",
        fontSize: 14,
        lineHeight: 1.5,
        boxShadow: "0 2px 8px rgba(109,40,217,0.25)",
      }}
    >
      {text}
    </div>
  </div>
);

const BubbleAI = ({ text, action }) => {
  const actionColors = {
    UPDATE_INVENTORY: { bg: "#CCFBF1", text: "#0F766E", border: "#99F6E4" },
    LOW_STOCK_CHECK: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
    GENERATE_OFFER: { bg: "#FFE4E6", text: "#9F1239", border: "#FECDD3" },
    ADD_ITEM: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
    SALES_SUMMARY: { bg: "#EDE9FE", text: "#5B21B6", border: "#DDD6FE" },
    UPDATE_PRICE: { bg: "#FED7AA", text: "#C2410C", border: "#FDBA74" },
  };
  const actionLabels = {
    UPDATE_INVENTORY: "Stock updated",
    LOW_STOCK_CHECK: "Low stock check",
    GENERATE_OFFER: "Offer generated",
    ADD_ITEM: "Item added",
    SALES_SUMMARY: "Sales summary",
    UPDATE_PRICE: "Price updated",
  };
  const ac = actionColors[action];
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 12,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "var(--purple)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          color: "white",
          flexShrink: 0,
          marginTop: 2,
          fontFamily: "'Syne',sans-serif",
          boxShadow: "0 2px 6px rgba(109,40,217,0.3)",
        }}
      >
        IQ
      </div>
      <div style={{ maxWidth: "72%" }}>
        {action && action !== "NONE" && ac && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: ac.text,
              background: ac.bg,
              border: `1px solid ${ac.border}`,
              borderRadius: 20,
              padding: "2px 8px",
              display: "inline-block",
              marginBottom: 5,
            }}
          >
            {actionLabels[action]}
          </div>
        )}
        <div
          style={{
            background: "white",
            border: "1px solid var(--border)",
            padding: "10px 14px",
            borderRadius: "4px 16px 16px 16px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text)",
            whiteSpace: "pre-wrap",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div
    style={{
      display: "flex",
      gap: 8,
      marginBottom: 12,
      alignItems: "flex-start",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "var(--purple)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 800,
        color: "white",
        flexShrink: 0,
        fontFamily: "'Syne',sans-serif",
      }}
    >
      IQ
    </div>
    <div
      style={{
        background: "white",
        border: "1px solid var(--border)",
        padding: "12px 16px",
        borderRadius: "4px 16px 16px 16px",
        display: "flex",
        gap: 5,
        alignItems: "center",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--muted2)",
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  </div>
);

const suggestions = [
  "Aaj ka stock dikhao",
  "Low stock kya hai?",
  "Diwali offer banao",
  "Add 10 apples to stock",
  "Weekly sales summary",
  "What is my top-selling item?",
  "Rice ka stock 50 set karo"
];

export default function ChatWindow({ onInventoryUpdate }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Namaste! Main InventIQ hoon. Aap apni dukaan ke baare mein kuch bhi pooch sakte hain — stock update, low stock alert, ya WhatsApp offer banana. Kya madad kar sakta hoon?",
      action: "NONE",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const bottomRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Microphone not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Default to Hindi, auto detects English/Gujarati if combined words
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onspeechend = () => recognition.stop();
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Simple language detection
    if (/[અ-હ]/.test(text)) utterance.lang = 'gu-IN';
    else if (/[अ-ह]/.test(text)) utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';
    
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const { data } = await chatApi.send(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, action: data.action },
      ]);
      
      // Auto-speak the AI response
      speak(data.reply);

      if (
        ["UPDATE_INVENTORY", "ADD_ITEM", "UPDATE_PRICE"].includes(data.action)
      )
        onInventoryUpdate?.();
    } catch {
      const errorMsg = "Kuch galat ho gaya. Please dobara try karein.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMsg,
          action: "NONE",
        },
      ]);
      speak(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "white",
        borderRadius: 12,
        border: "1px solid var(--border)",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "white",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "var(--purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 800,
            color: "white",
            fontFamily: "'Syne',sans-serif",
            boxShadow: "0 2px 8px rgba(109,40,217,0.3)",
          }}
        >
          IQ
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            InventIQ Assistant
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--green)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--green)",
                display: "inline-block",
              }}
            />
            Online · AI Powered
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px 16px 8px",
          background: "var(--bg)",
        }}
      >
        {messages.map((m, i) =>
          m.role === "user" ? (
            <BubbleUser key={i} text={m.content} />
          ) : (
            <BubbleAI key={i} text={m.content} action={m.action} />
          ),
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (Always available horizontal scroll) */}
      <div
        className="hide-scrollbar"
        style={{
          padding: "12px 16px",
          background: "var(--bg)",
          display: "flex",
          flexWrap: "nowrap",
          overflowX: "auto",
          gap: 8,
          borderTop: "1px solid var(--border)",
        }}
      >
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            style={{
              fontSize: 12,
              padding: "6px 14px",
              borderRadius: 20,
              background: "white",
              border: "1px solid var(--border)",
              color: "var(--purple)",
              cursor: "pointer",
              transition: "all .15s",
              whiteSpace: "nowrap",
              fontWeight: 500,
              flexShrink: 0,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--purple-xl)";
              e.target.style.borderColor = "var(--purple)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.borderColor = "var(--border)";
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 10,
          background: "white",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Hindi, Gujarati, ya English mein likho..."
          style={{
            flex: 1,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            color: "var(--text)",
            outline: "none",
            transition: "border .15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--purple)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={startListening}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: isListening ? "#FECDD3" : "var(--bg3)",
            border: "none",
            color: isListening ? "var(--coral)" : "var(--muted)",
            fontSize: 18,
            cursor: "pointer",
            transition: "all .15s",
          }}
          title="Mic (Hindi, English, Gujarati)"
        >
          🎤
        </button>
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            background:
              loading || !input.trim() ? "var(--bg3)" : "var(--purple)",
            border: "none",
            color: loading || !input.trim() ? "var(--muted)" : "white",
            fontSize: 14,
            fontWeight: 500,
            transition: "all .15s",
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
