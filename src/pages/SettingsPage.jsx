import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    shopName: user?.shopName || "",
    phone: user?.phone || "",
    language: user?.language || "hindi",
    password: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return setMsg({ type: "error", text: "Passwords do not match" });
    }
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const payload = {
        name: form.name,
        shopName: form.shopName,
        phone: form.phone,
        language: form.language,
      };
      if (form.password) payload.password = form.password;
      const { data } = await authApi.updateProfile(payload);
      updateUser(data);
      setMsg({ type: "success", text: "Profile updated successfully!" });
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
    } catch (e) {
      setMsg({
        type: "error",
        text: e.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="settings-header">
        <h1 className="page-title">⚙️ Account Settings</h1>
        <p className="page-subtitle">Personalize your shop identity and AI preferences</p>
      </div>

      <div className="settings-grid">
        {/* Profile form */}
        <div className="premium-card form-section section-main">
          <div className="card-header-simple">
            <div className="card-title">Shop Details</div>
            <div className="card-badge">Profile</div>
          </div>

          {msg.text && (
            <div className={`status-alert ${msg.type}`}>
              {msg.type === 'success' ? '✅' : '❌'} {msg.text}
            </div>
          )}

          <form onSubmit={save} className="settings-form">
            <div className="form-group-grid">
              <Field label="Owner Name" value={form.name} onChange={set("name")} placeholder="e.g. Ramesh Patel" />
              <Field label="Shop Name / Brand" value={form.shopName} onChange={set("shopName")} placeholder="e.g. Patel General Store" />
            </div>
            
            <Field label="Registered Mobile" value={form.phone} onChange={set("phone")} placeholder="10 Digits" />

            <div className="form-group custom">
              <label className="field-label">AI Conversation Language</label>
              <div className="select-wrapper">
                <select value={form.language} onChange={set("language")} className="custom-select">
                  <option value="hindi">Primary: Hindi (हिंदी)</option>
                  <option value="gujarati">Primary: Gujarati (ગુજરાતી)</option>
                  <option value="english">Primary: English</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
              <p className="field-helperText">The AI Assistant will prioritize this language for all responses.</p>
            </div>

            <div className="separator"></div>

            <div className="password-section">
              <h3 className="section-subtitle">Security Settings</h3>
              <div className="form-group-grid">
                <Field label="Update Password" type="password" value={form.password} onChange={set("password")} placeholder="New secret" />
                <Field label="Confirm Secret" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="Match above" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="save-btn-large">
              {loading ? 'Committing Changes...' : '✨ Save Profile'}
            </button>
          </form>
        </div>

        {/* Account info + app info */}
        <div className="side-panels">
          <div className="premium-card profile-info-card">
            <div className="avatar-section">
              <div className="avatar-circle">
                {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="avatar-meta">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>

            <div className="metadata-rows">
              {[
                ["Shop Name", user?.shopName, "🏪"],
                ["Language", user?.language?.charAt(0).toUpperCase() + user?.language?.slice(1), "🌍"],
                ["Verified Id", user?._id?.slice(-8).toUpperCase(), "🆔"],
              ].map(([k, v, icon]) => (
                <div key={k} className="meta-row">
                  <span className="meta-key">{icon} {k}</span>
                  <span className="meta-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card danger-zone-card">
            <div className="danger-header">
              <span className="danger-icon">⚠️</span>
              <div className="danger-title">Integrity Actions</div>
            </div>
            <p className="danger-desc">Clearing chat history or data is permanent. Use with caution.</p>
            <div className="danger-actions">
              <button 
                onClick={() => { if(window.confirm("Clear chat?")) alert("Clearing sequence started...") }}
                className="danger-btn"
              >
                Flush AI Memory
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-container { max-width: 1100px; margin: 0 auto; }
        .settings-header { margin-bottom: 32px; }
        .page-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; }
        .page-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 6px; }

        .settings-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: flex-start; }
        .side-panels { display: flex; flex-direction: column; gap: 24px; }
        
        .card-header-simple { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .card-title { font-weight: 800; font-family: 'Syne', sans-serif; font-size: 18px; }
        .card-badge { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; background: var(--bg); color: var(--text-light); text-transform: uppercase; }

        .status-alert { padding: 12px; borderRadius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 24px; border: 1px solid; }
        .status-alert.success { background: var(--green-light); border-color: var(--green); color: var(--green-dark, #065f46); }
        .status-alert.error { background: var(--coral-light); border-color: var(--coral); color: var(--coral-dark, #9f1239); }

        .form-group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .separator { height: 1px; background: var(--border-light); margin: 24px 0; }
        .section-subtitle { font-size: 14px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 16px; letter-spacing: 0.5px; }

        .custom-select { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); appearance: none; outline: none; font-size: 14px; font-weight: 500; cursor: pointer; }
        .select-wrapper { position: relative; }
        .select-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10px; color: var(--text-light); pointer-events: none; }
        .field-label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-light); margin-bottom: 8px; letter-spacing: 1px; }
        .field-helperText { font-size: 11px; color: var(--text-muted); margin-top: 6px; }

        .save-btn-large { width: 100%; padding: 14px; border-radius: 12px; border: none; background: var(--purple); color: white; font-weight: 800; font-size: 15px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); margin-top: 12px; }
        .save-btn-large:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
        .save-btn-large:disabled { opacity: 0.6; cursor: not-allowed; }

        .avatar-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--border-light); }
        .avatar-circle { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, var(--purple), var(--purple-light)); color: white; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; }
        .user-name { font-weight: 800; font-size: 16px; }
        .user-email { font-size: 12px; color: var(--text-muted); }

        .metadata-rows { display: flex; flex-direction: column; gap: 4px; }
        .meta-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 13px; }
        .meta-row:last-child { border-bottom: none; }
        .meta-key { color: var(--text-muted); font-weight: 600; }
        .meta-value { font-weight: 700; color: var(--text); }

        .danger-zone-card { border-top: 4px solid var(--coral); }
        .danger-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .danger-icon { font-size: 18px; }
        .danger-title { font-weight: 800; color: var(--coral-dark, #9f1239); font-size: 15px; }
        .danger-desc { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.4; }
        .danger-btn { width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--coral); color: var(--coral); background: transparent; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .danger-btn:hover { background: var(--coral-light); }

        @media (max-width: 900px) {
          .settings-grid { grid-template-columns: 1fr; }
          .form-group-grid { grid-template-columns: 1fr; }
          .page-title { font-size: 24px; }
          .section-main { order: 1; }
          .side-panels { order: 0; }
        }
      `}</style>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "var(--muted)",
  marginBottom: 6,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};
const inputStyle = {
  width: "100%",
  background: "var(--bg3)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: 14,
  color: "var(--text)",
  outline: "none",
  transition: "border .15s",
};

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--purple)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
