import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8089";

const emptyForm = { name: "", email: "", password: "", phone: "", licenseNumber: "", vehiculeType: "Moto" };

export default function ManageDeliverers() {
    const [deliverers, setDeliverers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("adminToken");

    useEffect(() => {
        if (!token) { navigate("/admin/login"); return; }
        fetchDeliverers();
    }, []);

    const fetchDeliverers = async () => {
        try {
            const res = await fetch(`${API}/api/admin/deliverers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setDeliverers(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(""), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/admin/deliverers`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                await fetchDeliverers();
                setForm(emptyForm);
                setShowForm(false);
                showSuccess("✅ Livreur créé avec succès!");
            } else {
                const err = await res.json();
                setError(err.message || "Erreur lors de la création");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce livreur ?")) return;
        setDeleting(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`${API}/api/admin/deliverers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDeliverers(prev => prev.filter(d => d.id !== id));
                showSuccess("🗑️ Livreur supprimé!");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(prev => ({ ...prev, [id]: false }));
        }
    };

    const vehicleTypes = ["Moto", "Vélo", "Voiture", "Scooter"];

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; background:#f5f5f5; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }

                .navbar { display:flex; justify-content:space-between; align-items:center; padding:15px 40px; background:linear-gradient(135deg,#1a1a2e,#16213e); box-shadow:0 2px 20px rgba(0,0,0,0.3); position:sticky; top:0; z-index:100; }
                .logo { font-size:20px; font-weight:700; color:white; cursor:pointer; }
                .nav-right { display:flex; gap:10px; }
                .back-btn { background:rgba(255,255,255,0.1); color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; }
                .back-btn:hover { background:rgba(255,255,255,0.2); }
                .add-btn { background:#f27405; color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; transition:all 0.3s; }
                .add-btn:hover { background:#e06600; }

                .toast { position:fixed; top:80px; left:50%; transform:translateX(-50%); background:#1a1a2e; color:white; padding:14px 28px; border-radius:50px; font-size:14px; font-weight:700; z-index:9999; animation:slideDown 0.4s ease; }

                .container { max-width:1000px; margin:0 auto; padding:30px 20px 60px; }

                .form-card { background:white; border-radius:20px; padding:30px; margin-bottom:25px; box-shadow:0 4px 20px rgba(0,0,0,0.1); animation:fadeInUp 0.4s ease; border:2px solid #e0e0e0; }
                .form-title { font-size:20px; font-weight:800; color:#1a1a2e; margin-bottom:20px; }
                .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px; }
                .form-group { display:flex; flex-direction:column; gap:6px; }
                .label { font-size:12px; font-weight:700; color:#555; letter-spacing:0.5px; }
                .input { padding:12px 16px; border:2px solid #e8e8e8; border-radius:12px; font-size:14px; outline:none; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .input:focus { border-color:#1a1a2e; box-shadow:0 0 0 3px rgba(26,26,46,0.1); }
                .select { padding:12px 16px; border:2px solid #e8e8e8; border-radius:12px; font-size:14px; outline:none; transition:all 0.3s; font-family:'Poppins',sans-serif; background:white; cursor:pointer; }
                .select:focus { border-color:#1a1a2e; }
                .form-actions { display:flex; gap:12px; margin-top:20px; }
                .save-btn { flex:1; padding:14px; border:none; border-radius:50px; background:linear-gradient(135deg,#1a1a2e,#16213e); color:white; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .save-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(26,26,46,0.3); }
                .save-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
                .cancel-btn { padding:14px 28px; border:1.5px solid #ddd; border-radius:50px; background:transparent; color:#666; font-size:15px; font-weight:600; cursor:pointer; font-family:'Poppins',sans-serif; }
                .form-error { background:#fff3f3; border:1px solid #ffcdd2; color:#c62828; padding:12px; border-radius:10px; font-size:13px; margin-bottom:15px; }

                .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
                .header-title { font-size:22px; font-weight:800; color:#1a1a2e; }
                .header-count { background:#e8e8e8; color:#1a1a2e; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:700; }

                .deliv-card { background:white; border-radius:16px; padding:20px; margin-bottom:15px; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.4s ease; display:flex; justify-content:space-between; align-items:center; transition:all 0.3s; border:2px solid transparent; }
                .deliv-card:hover { border-color:#e0e0e0; transform:translateY(-2px); }
                .deliv-left { display:flex; align-items:center; gap:15px; }
                .deliv-icon { width:50px; height:50px; border-radius:12px; background:linear-gradient(135deg,#2c5364,#0f2027); display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
                .deliv-name { font-size:16px; font-weight:800; color:#1a1a2e; margin-bottom:3px; }
                .deliv-email { font-size:12px; color:#888; margin-bottom:2px; }
                .deliv-info { font-size:12px; color:#aaa; }
                .deliv-id { background:#f5f5f5; color:#666; padding:3px 10px; border-radius:10px; font-size:11px; font-weight:700; margin-top:4px; display:inline-block; }
                .vehicle-badge { background:#e3f2fd; color:#1565c0; padding:3px 10px; border-radius:10px; font-size:11px; font-weight:700; margin-left:6px; }
                .del-btn { background:#fff0f0; color:#c62828; border:1.5px solid #ffcdd2; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .del-btn:hover { background:#ff5252; color:white; border-color:#ff5252; }
                .del-btn:disabled { opacity:0.5; cursor:not-allowed; }

                .empty { text-align:center; padding:60px; color:#aaa; }
                .empty-icon { font-size:60px; margin-bottom:15px; }
                .loading { text-align:center; padding:80px; }
                .spinner { font-size:40px; animation:spin 1s linear infinite; display:block; }
            `}</style>

            {successMsg && <div className="toast">{successMsg}</div>}

            <nav className="navbar">
                <div className="logo" onClick={() => navigate("/admin/dashboard")}>🔐 Admin Portal</div>
                <div className="nav-right">
                    <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>← Dashboard</button>
                    <button className="add-btn" onClick={() => setShowForm(true)}>➕ Nouveau livreur</button>
                </div>
            </nav>

            {loading ? (
                <div className="loading"><span className="spinner">🛵</span></div>
            ) : (
                <div className="container">
                    {showForm && (
                        <div className="form-card">
                            <div className="form-title">➕ Nouveau livreur</div>
                            {error && <div className="form-error">⚠️ {error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="label">NOM *</label>
                                        <input className="input" placeholder="John Doe" value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">EMAIL *</label>
                                        <input className="input" type="email" placeholder="john@delivery.com" value={form.email}
                                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">MOT DE PASSE *</label>
                                        <input className="input" type="password" placeholder="••••••••" value={form.password}
                                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">TÉLÉPHONE</label>
                                        <input className="input" placeholder="71 000 111" value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">N° PERMIS</label>
                                        <input className="input" placeholder="LIC-001" value={form.licenseNumber}
                                            onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))} />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">TYPE DE VÉHICULE</label>
                                        <select className="select" value={form.vehiculeType}
                                            onChange={e => setForm(f => ({ ...f, vehiculeType: e.target.value }))}>
                                            {vehicleTypes.map(v => <option key={v}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={() => { setShowForm(false); setForm(emptyForm); setError(""); }}>Annuler</button>
                                    <button type="submit" className="save-btn" disabled={submitting}>
                                        {submitting ? "Création..." : "✅ Créer le livreur"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="header">
                        <div className="header-title">🛵 Livreurs</div>
                        <span className="header-count">{deliverers.length} livreur(s)</span>
                    </div>

                    {deliverers.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">🛵</div>
                            <p>Aucun livreur enregistré</p>
                        </div>
                    ) : (
                        deliverers.map(d => (
                            <div key={d.id} className="deliv-card">
                                <div className="deliv-left">
                                    <div className="deliv-icon">🛵</div>
                                    <div>
                                        <div className="deliv-name">{d.name}</div>
                                        <div className="deliv-email">📧 {d.email}</div>
                                        <div className="deliv-info">
                                            {d.phone && `📞 ${d.phone}`}
                                            {d.licenseNumber && ` • 🪪 ${d.licenseNumber}`}
                                        </div>
                                        <span className="deliv-id">ID: {d.id}</span>
                                        {d.vehiculeType && <span className="vehicle-badge">🚗 {d.vehiculeType}</span>}
                                    </div>
                                </div>
                                <button className="del-btn" onClick={() => handleDelete(d.id)} disabled={deleting[d.id]}>
                                    {deleting[d.id] ? "..." : "🗑️ Supprimer"}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </>
    );
}