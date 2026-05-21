import { useInventory } from "../context/InventoryContext";
import InventoryTable from "../components/InventoryTable";
import { inventoryApi } from "../api";

export default function InventoryPage() {
  const { items, loading, refreshInventory } = useInventory();

  const stats = [
    {
      label: "Total Items",
      value: items.length,
      color: "var(--purple)",
      bg: "var(--purple-xl)",
    },
    {
      label: "Low Stock",
      value: items.filter((i) => i.quantity <= i.lowStockThreshold).length,
      color: "var(--coral)",
      bg: "var(--coral-xl)",
    },
    {
      label: "Total Value",
      value: `₹${items.reduce((a, i) => a + i.quantity * i.price, 0).toLocaleString()}`,
      color: "var(--amber)",
      bg: "var(--amber-xl)",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text)",
          }}
        >
          Inventory
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Manage your shop stock
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button 
          onClick={() => {
            if (window.confirm("ARE YOU SURE? This will permanently delete ALL your inventory items. This cannot be undone.")) {
              inventoryApi.removeAll()
                .then(() => {
                  alert("Inventory cleared!");
                  refreshInventory();
                })
                .catch(err => alert("Failed to clear inventory: " + (err.response?.data?.message || err.message)));
            }
          }}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#FEE2E2', border: '1px solid #FECDD3', color: '#B91C1C', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
        >
          🗑️ Delete All Data
        </button>
      </div>

      <div className="dashboard-stats-grid" style={{ marginBottom: 20 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "16px 20px",
              flex: 1,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 26,
                fontWeight: 700,
                color: s.color,
                marginTop: 6,
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--muted)",
            background: "white",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}
        >
          Loading inventory...
        </div>
      ) : (
        <InventoryTable items={items} onRefresh={refreshInventory} />
      )}
    </div>
  );
}
