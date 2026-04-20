import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8082";
const emptyForm = { name: "", description: "", price: "", available: true };

const imageByKeyword = [
    { keyword: "pizza", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop" },
    { keyword: "burger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&auto=format&fit=crop" },
    { keyword: "pasta", url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=900&auto=format&fit=crop" },
    { keyword: "salad", url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=900&auto=format&fit=crop" },
    { keyword: "cake", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&auto=format&fit=crop" },
    { keyword: "chicken", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop" },
];

function getMenuItemImage(name = "") {
    const lowered = name.toLowerCase();
    const match = imageByKeyword.find((item) => lowered.includes(item.keyword));
    return match?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop";
}

export default function ManageMenu() {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("restaurantToken");
    const restaurantId = localStorage.getItem("restaurantId");

    useEffect(() => {
        if (!token || !restaurantId || restaurantId === "null") {
            navigate("/restaurant/login");
            return;
        }
        fetchMenu();
    }, [token, restaurantId, navigate]);

    const fetchMenu = async () => {
        if (!restaurantId || restaurantId === "null") {
            setError("Restaurant session not found. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/menu-items/restaurant/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMenuItems(Array.isArray(data) ? data : []);
            } else {
                setError("Impossible de charger le menu.");
            }
        } catch (err) {
            setError("Erreur de connexion");
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

        if (!restaurantId || restaurantId === "null") {
            setError("Restaurant session not found. Please sign in again.");
            setSubmitting(false);
            return;
        }

        try {
            const payload = {
                restaurantId: Number(restaurantId),
                name: form.name,
                description: form.description,
                price: parseFloat(form.price),
                available: form.available,
            };

            const url = editingId ? `${API}/menu-items/${editingId}` : `${API}/menu-items`;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await res.json();
                await fetchMenu();
                setForm(emptyForm);
                setEditingId(null);
                setShowForm(false);
                showSuccess(editingId ? "Article mis a jour !" : "Article ajoute !");
            } else {
                const err = await res.json();
                setError(err.message || "Erreur lors de la sauvegarde");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setForm({
            name: item.name,
            description: item.description || "",
            price: item.price,
            available: item.available,
        });
        setEditingId(item.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cet article ?")) return;

        setDeleting((prev) => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`${API}/menu-items/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setMenuItems((prev) => prev.filter((item) => item.id !== id));
                showSuccess("Article supprime !");
            }
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setDeleting((prev) => ({ ...prev, [id]: false }));
        }
    };

    const handleToggleAvailable = async (item) => {
        try {
            const res = await fetch(`${API}/menu-items/${item.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...item, available: !item.available }),
            });
            if (res.ok) {
                setMenuItems((prev) =>
                    prev.map((current) =>
                        current.id === item.id
                            ? { ...current, available: !current.available }
                            : current
                    )
                );
            }
        } catch (err) {
            setError("Erreur de connexion");
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    };

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; background:#f0f7f0; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }

                .navbar { display:flex; justify-content:space-between; align-items:center; padding:15px 40px; background:linear-gradient(135deg,#1b4332,#2d6a4f); box-shadow:0 2px 20px rgba(0,0,0,0.2); position:sticky; top:0; z-index:100; }
                .logo { font-size:20px; font-weight:700; color:white; cursor:pointer; }
                .nav-right { display:flex; gap:10px; }
                .back-btn { background:rgba(255,255,255,0.15); color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; }
                .back-btn:hover { background:rgba(255,255,255,0.25); }
                .add-btn { background:#f27405; color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; transition:all 0.3s; }
                .add-btn:hover { background:#e06600; }

                .toast { position:fixed; top:80px; left:50%; transform:translateX(-50%); background:#2d6a4f; color:white; padding:14px 28px; border-radius:50px; font-size:14px; font-weight:700; z-index:9999; animation:slideDown 0.4s ease; }

                .container { max-width:1180px; margin:0 auto; padding:30px 12px 60px; }
                .form-card { background:white; border-radius:20px; padding:30px; margin-bottom:25px; box-shadow:0 4px 20px rgba(0,0,0,0.1); animation:fadeInUp 0.4s ease; border:2px solid #a5d6a7; }
                .form-title { font-size:20px; font-weight:800; color:#1b4332; margin-bottom:20px; }
                .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px; }
                .form-group { display:flex; flex-direction:column; gap:6px; }
                .form-group.full { grid-column:1/-1; }
                .label { font-size:12px; font-weight:700; color:#555; letter-spacing:0.5px; }
                .input { padding:12px 16px; border:2px solid #e8e8e8; border-radius:12px; font-size:14px; outline:none; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .input:focus { border-color:#2d6a4f; box-shadow:0 0 0 3px rgba(45,106,79,0.1); }
                .textarea { padding:12px 16px; border:2px solid #e8e8e8; border-radius:12px; font-size:14px; outline:none; transition:all 0.3s; font-family:'Poppins',sans-serif; resize:vertical; }
                .textarea:focus { border-color:#2d6a4f; }
                .toggle-row { display:flex; align-items:center; gap:12px; }
                .toggle { width:48px; height:26px; border-radius:13px; border:none; cursor:pointer; transition:all 0.3s; position:relative; flex-shrink:0; }
                .toggle.on { background:#2d6a4f; }
                .toggle.off { background:#ddd; }
                .toggle::after { content:''; position:absolute; width:20px; height:20px; background:white; border-radius:50%; top:3px; transition:all 0.3s; }
                .toggle.on::after { left:25px; }
                .toggle.off::after { left:3px; }
                .toggle-label { font-size:14px; color:#444; font-weight:600; }
                .form-actions { display:flex; gap:12px; margin-top:20px; }
                .save-btn { flex:1; padding:14px; border:none; border-radius:50px; background:linear-gradient(135deg,#2d6a4f,#1b4332); color:white; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .save-btn:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(45,106,79,0.3); }
                .save-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
                .cancel-btn { padding:14px 28px; border:1.5px solid #ddd; border-radius:50px; background:transparent; color:#666; font-size:15px; font-weight:600; cursor:pointer; font-family:'Poppins',sans-serif; }
                .cancel-btn:hover { background:#f5f5f5; }
                .form-error { background:#fff3f3; border:1px solid #ffcdd2; color:#c62828; padding:12px; border-radius:10px; font-size:13px; margin-bottom:15px; }

                .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; animation:fadeInUp 0.5s ease; }
                .header-title { font-size:22px; font-weight:800; color:#1b4332; }
                .header-count { background:#e8f5e9; color:#2d6a4f; padding:5px 14px; border-radius:20px; font-size:13px; font-weight:700; }

                .menu-grid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:18px; }
                .menu-card { background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.4s ease; transition:all 0.3s; border:2px solid transparent; }
                .menu-card:hover { transform:translateY(-3px); box-shadow:0 10px 25px rgba(45,106,79,0.15); border-color:#c8e6c9; }
                .menu-card.unavailable { background:#f1f1f1; border-color:#d8d8d8; box-shadow:none; }
                .image-wrap { position:relative; height:170px; background:#e9efe9; }
                .item-image { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.3s ease, filter 0.3s ease; }
                .menu-card:hover .item-image { transform:scale(1.04); }
                .menu-card.unavailable .item-image { filter:grayscale(1) brightness(0.8); }
                .unavailable-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(90,90,90,0.35); color:white; font-size:14px; font-weight:700; letter-spacing:0.4px; }
                .card-body { padding:20px; }
                .card-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
                .item-name { font-size:16px; font-weight:800; color:#1b4332; }
                .menu-card.unavailable .item-name,
                .menu-card.unavailable .item-price,
                .menu-card.unavailable .item-desc,
                .menu-card.unavailable .toggle-label { color:#767676; }
                .item-price { font-size:18px; font-weight:900; color:#2d6a4f; }
                .item-desc { font-size:12px; color:#888; margin-bottom:12px; line-height:1.5; }
                .avail-toggle { display:flex; align-items:center; gap:8px; margin-bottom:15px; }
                .avail-badge { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; cursor:pointer; transition:all 0.3s; border:none; font-family:'Poppins',sans-serif; }
                .avail-badge.on { background:#e8f5e9; color:#2d6a4f; }
                .avail-badge.off { background:#fff0f0; color:#c62828; }
                .avail-badge:hover { transform:scale(1.05); }
                .card-actions { display:flex; gap:8px; }
                .edit-btn { flex:1; padding:9px; border:1.5px solid #2d6a4f; border-radius:12px; background:transparent; color:#2d6a4f; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .edit-btn:hover { background:#e8f5e9; }
                .del-btn { flex:1; padding:9px; border:1.5px solid #ffcdd2; border-radius:12px; background:transparent; color:#c62828; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .del-btn:hover { background:#fff0f0; }
                .del-btn:disabled { opacity:0.5; cursor:not-allowed; }

                .empty { text-align:center; padding:60px; color:#aaa; }
                .empty-icon { font-size:60px; margin-bottom:15px; }
                .loading { text-align:center; padding:80px; }
                .spinner { font-size:40px; animation:spin 1s linear infinite; display:block; }

                @media (max-width: 980px) {
                    .menu-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
                }

                @media (max-width: 640px) {
                    .container { padding:20px 10px 40px; }
                    .menu-grid { grid-template-columns:1fr; }
                }
            `}</style>

            {successMsg && <div className="toast">{successMsg}</div>}

            <nav className="navbar">
                <div className="logo" onClick={() => navigate("/restaurant/dashboard")}>Restaurant Portal</div>
                <div className="nav-right">
                    <button className="back-btn" onClick={() => navigate("/restaurant/dashboard")}>Dashboard</button>
                    <button className="add-btn" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}>
                        Ajouter un article
                    </button>
                </div>
            </nav>

            {loading ? (
                <div className="loading"><span className="spinner">Loading...</span></div>
            ) : (
                <div className="container">
                    {showForm && (
                        <div className="form-card">
                            <div className="form-title">{editingId ? "Modifier l'article" : "Nouvel article"}</div>
                            {error && <div className="form-error">{error}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="label">Nom de l'article *</label>
                                        <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Prix (DT) *</label>
                                        <input className="input" type="number" step="0.001" min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
                                    </div>
                                    <div className="form-group full">
                                        <label className="label">Description</label>
                                        <textarea className="textarea" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="toggle-row">
                                    <button type="button" className={`toggle ${form.available ? "on" : "off"}`} onClick={() => setForm((f) => ({ ...f, available: !f.available }))} />
                                    <span className="toggle-label">{form.available ? "Disponible" : "Indisponible"}</span>
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-btn" onClick={cancelForm}>Annuler</button>
                                    <button type="submit" className="save-btn" disabled={submitting}>
                                        {submitting ? "Sauvegarde..." : editingId ? "Mettre a jour" : "Ajouter"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="header">
                        <div className="header-title">Mon Menu</div>
                        <span className="header-count">{menuItems.length} article(s)</span>
                    </div>

                    {error && !showForm && <div className="form-error">{error}</div>}

                    {menuItems.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">No items</div>
                            <p>Aucun article dans le menu</p>
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {menuItems.map((item) => (
                                <div key={item.id} className={`menu-card ${!item.available ? "unavailable" : ""}`}>
                                    <div className="image-wrap">
                                        <img
                                            className="item-image"
                                            src={getMenuItemImage(item.name)}
                                            alt={item.name}
                                            onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop";
                                            }}
                                        />
                                        {!item.available && <div className="unavailable-overlay"> </div>}
                                    </div>
                                    <div className="card-body">
                                        <div className="card-top">
                                            <div className="item-name">{item.name}</div>
                                            <div className="item-price">{(item.price || 0).toFixed(3)} DT</div>
                                        </div>
                                        {item.description && <div className="item-desc">{item.description}</div>}
                                        <div className="avail-toggle">
                                            <button className={`avail-badge ${item.available ? "on" : "off"}`} onClick={() => handleToggleAvailable(item)}>
                                                {item.available ? "Disponible" : "Indisponible"}
                                            </button>
                                        </div>
                                        <div className="card-actions">
                                            <button className="edit-btn" onClick={() => handleEdit(item)}>Modifier</button>
                                            <button className="del-btn" onClick={() => handleDelete(item.id)} disabled={deleting[item.id]}>
                                                {deleting[item.id] ? "..." : "Supprimer"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
