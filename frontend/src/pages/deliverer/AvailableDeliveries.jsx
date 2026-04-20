import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8083";

const STATUS_STEPS = ["AVAILABLE", "ASSIGNED", "IN_PROGRESS", "DELIVERED"];

const STATUS_COLORS = {
    AVAILABLE: "#2196f3",
    ASSIGNED: "#9c27b0",
    IN_PROGRESS: "#ff9800",
    DELIVERED: "#4caf50",
};

const NEXT_STATUS = {
    ASSIGNED: "IN_PROGRESS",
    IN_PROGRESS: "DELIVERED",
};

export default function AvailableDeliveries() {
    const [available, setAvailable] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("available");
    const [actionLoading, setActionLoading] = useState({});
    const [error, setError] = useState("");
    const [delivererId, setDelivererId] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("delivererToken");
    const email = localStorage.getItem("delivererEmail");

    // Load delivererId from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("delivererId");
        if (saved) setDelivererId(parseInt(saved));
    }, []);

    // Fetch on mount and when delivererId changes
    useEffect(() => {
        if (!token) { navigate("/deliverer/login"); return; }
        fetchDeliveries();
        const interval = setInterval(fetchDeliveries, 15000);
        return () => clearInterval(interval);
    }, [delivererId]);

    const fetchDeliveries = async () => {
        try {
            const savedId = localStorage.getItem("delivererId");
            const currentId = delivererId || (savedId ? parseInt(savedId) : null);

            // Get available deliveries
            const res = await fetch(`${API}/api/delivery/available`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 403) { navigate("/deliverer/login"); return; }
            const data = await res.json();
            setAvailable(Array.isArray(data) ? data : []);

            // Get MY deliveries by livreurId — persists across logout!
            if (currentId) {
                const myRes = await fetch(`${API}/api/delivery/deliverer/${currentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (myRes.ok) {
                    const myData = await myRes.json();
                    setMyDeliveries(Array.isArray(myData) ? myData : []);
                }
            }
        } catch (err) {
            setError("Failed to load deliveries");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (deliveryId) => {
        if (!delivererId) {
            const id = prompt("Entrez votre ID livreur:");
            if (!id) return;
            const parsed = parseInt(id);
            setDelivererId(parsed);
            localStorage.setItem("delivererId", parsed);
            doAccept(deliveryId, parsed);
        } else {
            doAccept(deliveryId, delivererId);
        }
    };

    const doAccept = async (deliveryId, livreurId) => {
        setActionLoading(prev => ({ ...prev, [deliveryId]: true }));
        setError("");
        try {
            const res = await fetch(`${API}/api/delivery/${deliveryId}/accept?livreurId=${livreurId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Failed to accept delivery");
                return;
            }
            const updated = await res.json();
            setAvailable(prev => prev.filter(d => d.id !== deliveryId));
            setMyDeliveries(prev => [...prev, updated]);
            setActiveTab("active");
        } catch (err) {
            setError("Connection error");
        } finally {
            setActionLoading(prev => ({ ...prev, [deliveryId]: false }));
        }
    };

    const handleUpdateStatus = async (deliveryId, newStatus) => {
        setActionLoading(prev => ({ ...prev, [`status_${deliveryId}`]: true }));
        setError("");
        try {
            const res = await fetch(`${API}/api/delivery/${deliveryId}/status`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Failed to update status");
                return;
            }
            const updated = await res.json();
            // Update in place — stays in myDeliveries whether active or delivered
            setMyDeliveries(prev => prev.map(d => d.id === deliveryId ? updated : d));
            // If just delivered, switch to history tab
            if (newStatus === "DELIVERED") setActiveTab("history");
        } catch (err) {
            setError("Connection error");
        } finally {
            setActionLoading(prev => ({ ...prev, [`status_${deliveryId}`]: false }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("delivererToken");
        localStorage.removeItem("delivererEmail");
        localStorage.removeItem("delivererId");
        navigate("/deliverer/login");
    };

    const activeDeliveries = myDeliveries.filter(d => ["ASSIGNED", "IN_PROGRESS"].includes(d.status));
    const historyDeliveries = myDeliveries.filter(d => d.status === "DELIVERED");

    const renderContent = () => {
        if (loading) return <div className="loading"><span className="spinner">🛵</span></div>;

        if (activeTab === "available") {
            if (available.length === 0) return (
                <div className="empty">
                    <div className="empty-icon">📭</div>
                    <div className="empty-text">Aucune livraison disponible</div>
                    <div className="empty-sub">Revenez bientôt ou actualisez!</div>
                </div>
            );
            return available.map(d => (
                <DeliveryCard key={d.id} delivery={d} type="available"
                    onAccept={() => handleAccept(d.id)}
                    loading={actionLoading[d.id]} />
            ));
        }

        if (activeTab === "active") {
            if (activeDeliveries.length === 0) return (
                <div className="empty">
                    <div className="empty-icon">🚀</div>
                    <div className="empty-text">Aucune livraison en cours</div>
                    <div className="empty-sub">Acceptez une livraison depuis l'onglet Disponibles!</div>
                </div>
            );
            return activeDeliveries.map(d => (
                <DeliveryCard key={d.id} delivery={d} type="mine"
                    onUpdateStatus={(status) => handleUpdateStatus(d.id, status)}
                    loading={actionLoading[`status_${d.id}`]} />
            ));
        }

        if (activeTab === "history") {
            if (historyDeliveries.length === 0) return (
                <div className="empty">
                    <div className="empty-icon">📋</div>
                    <div className="empty-text">Aucune livraison effectuée</div>
                    <div className="empty-sub">Votre historique apparaîtra ici!</div>
                </div>
            );
            return historyDeliveries.map(d => (
                <DeliveryCard key={d.id} delivery={d} type="history" loading={false} />
            ));
        }
    };

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; background: #f0f4f8; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

                .navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background: linear-gradient(135deg, #0f2027, #2c5364); box-shadow: 0 2px 20px rgba(0,0,0,0.3); position: sticky; top: 0; z-index: 100; }
                .logo { font-size: 20px; font-weight: 700; color: white; display: flex; align-items: center; gap: 10px; }
                .logo-badge { background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 5px; }
                .nav-right { display: flex; align-items: center; gap: 12px; }
                .email-badge { color: rgba(255,255,255,0.7); font-size: 13px; }
                .logout-btn { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 8px 18px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; font-family: 'Poppins', sans-serif; }
                .logout-btn:hover { background: #ff5252; border-color: #ff5252; }

                .container { max-width: 1000px; margin: 0 auto; padding: 30px 20px 60px; }

                .header-card { background: linear-gradient(135deg, #0f2027, #2c5364); border-radius: 20px; padding: 30px; margin-bottom: 25px; color: white; animation: fadeInUp 0.5s ease; }
                .header-title { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
                .header-sub { color: rgba(255,255,255,0.7); font-size: 14px; }
                .stats { display: flex; gap: 15px; margin-top: 20px; }
                .stat { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px 20px; flex: 1; text-align: center; }
                .stat-num { font-size: 26px; font-weight: 800; }
                .stat-label { font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 3px; }

                .live-dot { display: inline-block; width: 8px; height: 8px; background: #4caf50; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite; }

                .tabs { display: flex; gap: 8px; margin-bottom: 20px; }
                .tab { padding: 10px 20px; border-radius: 50px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.3s; font-family: 'Poppins', sans-serif; background: white; color: #666; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .tab.active { background: #2c5364; color: white; box-shadow: 0 5px 15px rgba(44,83,100,0.3); }
                .tab-count { background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 6px; }
                .tab:not(.active) .tab-count { background: #f0f0f0; color: #666; }

                .error-bar { background: #fff3f3; border: 1px solid #ffcdd2; color: #c62828; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; display: flex; align-items: center; gap: 8px; }

                .refresh-btn { background: rgba(44,83,100,0.1); color: #2c5364; border: none; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; font-family: 'Poppins', sans-serif; margin-left: auto; display: block; margin-bottom: 15px; }
                .refresh-btn:hover { background: #2c5364; color: white; }

                .delivery-card { background: white; border-radius: 16px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); animation: fadeInUp 0.4s ease; border: 2px solid transparent; transition: all 0.3s; }
                .delivery-card:hover { border-color: #e3f2fd; transform: translateY(-2px); }
                .delivery-card.history-card { opacity: 0.85; border-color: #e8f5e9; }

                .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .delivery-id { font-size: 16px; font-weight: 800; color: #1a1a2e; }
                .order-ref { font-size: 12px; color: #aaa; margin-top: 3px; }
                .status-badge { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; color: white; }

                .info-row { display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
                .info-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
                .info-item strong { color: #333; }

                .address-box { background: #f8f9fa; border-radius: 10px; padding: 12px 15px; margin-bottom: 15px; font-size: 13px; color: #444; display: flex; align-items: center; gap: 8px; }

                .progress-bar { margin-bottom: 15px; }
                .progress-steps { display: flex; }
                .progress-step { flex: 1; text-align: center; position: relative; }
                .step-dot { width: 12px; height: 12px; border-radius: 50%; margin: 0 auto 5px; background: #e0e0e0; position: relative; z-index: 1; }
                .step-dot.done { background: #4caf50; }
                .step-dot.current { background: #f27405; box-shadow: 0 0 0 3px rgba(242,116,5,0.2); }
                .step-label { font-size: 9px; color: #aaa; }
                .step-label.done { color: #4caf50; font-weight: 600; }
                .step-label.current { color: #f27405; font-weight: 700; }
                .step-line { position: absolute; top: 5px; left: 50%; right: -50%; height: 2px; background: #e0e0e0; z-index: 0; }
                .step-line.done { background: #4caf50; }

                .card-actions { display: flex; gap: 10px; margin-top: 5px; }
                .accept-btn { flex: 1; padding: 12px; border: none; border-radius: 12px; background: linear-gradient(135deg, #2c5364, #0f2027); color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-family: 'Poppins', sans-serif; }
                .accept-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(44,83,100,0.3); }
                .accept-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .status-btn { flex: 1; padding: 12px; border: none; border-radius: 12px; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s; font-family: 'Poppins', sans-serif; }
                .status-btn.start { background: linear-gradient(135deg, #ff9800, #f57c00); }
                .status-btn.finish { background: linear-gradient(135deg, #4caf50, #388e3c); }
                .status-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
                .status-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
                .delivered-badge { color: #4caf50; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px; padding: 8px 0; }

                .id-input-box { background: #fff8e1; border: 2px solid #ffc107; border-radius: 12px; padding: 15px 20px; margin-bottom: 20px; font-size: 13px; color: #5d4037; }
                .id-input-box strong { display: block; margin-bottom: 8px; font-size: 14px; }
                .id-input-row { display: flex; gap: 10px; }
                .id-input { flex: 1; padding: 10px 14px; border: 1.5px solid #ffc107; border-radius: 8px; font-size: 14px; outline: none; font-family: 'Poppins', sans-serif; }
                .id-save-btn { padding: 10px 20px; background: #ffc107; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 13px; transition: all 0.3s; }
                .id-save-btn:hover { background: #ffb300; }

                .empty { text-align: center; padding: 60px 20px; color: #aaa; }
                .empty-icon { font-size: 60px; margin-bottom: 15px; }
                .empty-text { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #666; }
                .empty-sub { font-size: 13px; }
                .loading { text-align: center; padding: 60px; }
                .spinner { font-size: 40px; animation: spin 1s linear infinite; display: block; }
            `}</style>

            <nav className="navbar">
                <div className="logo">
                    🛵 Deliverer Portal
                    <div className="logo-badge">
                        <span className="live-dot"></span> Live
                    </div>
                </div>
                <div className="nav-right">
                    <span className="email-badge">👤 {email}</span>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </nav>

            <div className="container">
                {/* Header Stats */}
                <div className="header-card">
                    <div className="header-title">🛵 Delivery Dashboard</div>
                    <div className="header-sub">Gérez vos livraisons en temps réel • Auto-refresh 15s</div>
                    <div className="stats">
                        <div className="stat">
                            <div className="stat-num">{available.length}</div>
                            <div className="stat-label">📦 Disponibles</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">{activeDeliveries.length}</div>
                            <div className="stat-label">🚀 En cours</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">{historyDeliveries.length}</div>
                            <div className="stat-label">✅ Livrées</div>
                        </div>
                    </div>
                </div>

                {/* Deliverer ID input */}
                {!delivererId && (
                    <div className="id-input-box">
                        <strong>⚠️ Entrez votre ID livreur pour accepter des livraisons</strong>
                        <DelivererIdInput onSave={(id) => {
                            setDelivererId(id);
                            localStorage.setItem("delivererId", id);
                        }} />
                        <small style={{ marginTop: "6px", display: "block", color: "#888" }}>
                            SQL: SELECT id, name FROM deliverers;
                        </small>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="error-bar">
                        ⚠️ {error}
                        <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "18px" }}>✕</button>
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs">
                    <button className={`tab ${activeTab === "available" ? "active" : ""}`} onClick={() => setActiveTab("available")}>
                        📦 Disponibles <span className="tab-count">{available.length}</span>
                    </button>
                    <button className={`tab ${activeTab === "active" ? "active" : ""}`} onClick={() => setActiveTab("active")}>
                        🚀 En cours <span className="tab-count">{activeDeliveries.length}</span>
                    </button>
                    <button className={`tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
                        📋 Historique <span className="tab-count">{historyDeliveries.length}</span>
                    </button>
                </div>

                <button className="refresh-btn" onClick={fetchDeliveries}>🔄 Actualiser</button>

                {renderContent()}
            </div>
        </>
    );
}

function DelivererIdInput({ onSave }) {
    const [val, setVal] = useState("");
    return (
        <div className="id-input-row">
            <input className="id-input" type="number" placeholder="ex: 1"
                value={val} onChange={e => setVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && val && onSave(parseInt(val))}
            />
            <button className="id-save-btn" onClick={() => { if (val) onSave(parseInt(val)); }}>
                Sauvegarder
            </button>
        </div>
    );
}

function DeliveryCard({ delivery, type, onAccept, onUpdateStatus, loading }) {
    const STATUS_STEPS = ["AVAILABLE", "ASSIGNED", "IN_PROGRESS", "DELIVERED"];
    const currentIdx = STATUS_STEPS.indexOf(delivery.status);
    const STATUS_COLORS = {
        AVAILABLE: "#2196f3", ASSIGNED: "#9c27b0",
        IN_PROGRESS: "#ff9800", DELIVERED: "#4caf50",
    };
    const NEXT_STATUS = { ASSIGNED: "IN_PROGRESS", IN_PROGRESS: "DELIVERED" };
    const nextStatus = NEXT_STATUS[delivery.status];

    return (
        <div className={`delivery-card ${type === "history" ? "history-card" : ""}`}>
            <div className="card-top">
                <div>
                    <div className="delivery-id">🚚 Livraison #{delivery.id}</div>
                    <div className="order-ref">Commande #{delivery.orderId}</div>
                </div>
                <div className="status-badge" style={{ background: STATUS_COLORS[delivery.status] || "#888" }}>
                    {delivery.status}
                </div>
            </div>

            <div className="info-row">
                <div className="info-item">👤 <strong>Client #{delivery.userId}</strong></div>
                {delivery.livreurId && (
                    <div className="info-item">🛵 <strong>Livreur #{delivery.livreurId}</strong></div>
                )}
            </div>

            <div className="address-box">
                📍 {delivery.deliveryAddress || "Adresse non fournie"}
            </div>

            {/* Progress steps */}
            <div className="progress-bar">
                <div className="progress-steps">
                    {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="progress-step">
                            {i < STATUS_STEPS.length - 1 && (
                                <div className={`step-line ${i < currentIdx ? "done" : ""}`} />
                            )}
                            <div className={`step-dot ${i < currentIdx ? "done" : i === currentIdx ? "current" : ""}`} />
                            <div className={`step-label ${i < currentIdx ? "done" : i === currentIdx ? "current" : ""}`}>
                                {step.replace("_", " ")}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="card-actions">
                {type === "available" && (
                    <button className="accept-btn" onClick={onAccept} disabled={loading}>
                        {loading ? "Acceptation..." : "✅ Accepter la livraison"}
                    </button>
                )}
                {type === "mine" && nextStatus === "IN_PROGRESS" && (
                    <button className="status-btn start" onClick={() => onUpdateStatus("IN_PROGRESS")} disabled={loading}>
                        {loading ? "Mise à jour..." : "🚀 Démarrer la livraison"}
                    </button>
                )}
                {type === "mine" && nextStatus === "DELIVERED" && (
                    <button className="status-btn finish" onClick={() => onUpdateStatus("DELIVERED")} disabled={loading}>
                        {loading ? "Mise à jour..." : "✅ Marquer comme livré"}
                    </button>
                )}
                {delivery.status === "DELIVERED" && (
                    <div className="delivered-badge">🎉 Livraison effectuée avec succès!</div>
                )}
            </div>
        </div>
    );
}