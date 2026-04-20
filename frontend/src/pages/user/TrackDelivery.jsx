import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const DELIVERY_SERVICE = "http://localhost:8083";

const STATUS_STEPS = [
    { key: "AVAILABLE",   label: "Commande placée",    emoji: "📦", desc: "Votre commande a été reçue" },
    { key: "ASSIGNED",    label: "Livreur assigné",    emoji: "🛵", desc: "Un livreur a accepté votre commande" },
    { key: "IN_PROGRESS", label: "En route",           emoji: "🚀", desc: "Votre commande est en chemin" },
    { key: "DELIVERED",   label: "Livré !",            emoji: "🎉", desc: "Votre commande a été livrée" },
];

export default function TrackDelivery() {
    const { deliveryId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchTracking();
        const interval = setInterval(fetchTracking, 15000);
        return () => clearInterval(interval);
    }, [deliveryId]);

    const fetchTracking = async () => {
        try {
            const res = await fetch(`${DELIVERY_SERVICE}/api/delivery/${deliveryId}/track`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setError("Impossible de charger le suivi");
                return;
            }
            const data = await res.json();
            setTracking(data);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const getCurrentStepIndex = () => {
        if (!tracking) return 0;
        const idx = STATUS_STEPS.findIndex(s => s.key === tracking.status);
        return idx === -1 ? 0 : idx;
    };

    const currentIdx = getCurrentStepIndex();
    const isDelivered = tracking?.status === "DELIVERED";

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; background: #f7efe6; }

                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.05); } }
                @keyframes slideRight { from { width: 0%; } to { width: 100%; } }
                @keyframes bounceIn { 0% { transform:scale(0); } 60% { transform:scale(1.2); } 100% { transform:scale(1); } }
                @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
                @keyframes successPop { 0% { transform:scale(0) rotate(-10deg); opacity:0; } 60% { transform:scale(1.15) rotate(3deg); } 100% { transform:scale(1) rotate(0deg); opacity:1; } }

                .navbar {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 15px 60px; background: white;
                    box-shadow: 0 2px 20px rgba(0,0,0,0.08);
                    position: sticky; top: 0; z-index: 100;
                }
                .logo { font-size: 20px; font-weight: 700; color: #4caf50; text-decoration: none; }
                .nav-actions { display: flex; gap: 12px; }
                .nav-btn { padding: 9px 18px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; text-decoration: none; display: flex; align-items: center; gap: 6px; }
                .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
                .btn-outline:hover { background: #f27405; color: white; }

                .page { max-width: 680px; margin: 0 auto; padding: 40px 20px 80px; }

                /* DELIVERY ID CARD */
                .id-card {
                    background: linear-gradient(135deg, #f27405, #e06600);
                    border-radius: 20px; padding: 25px 30px;
                    margin-bottom: 25px; color: white;
                    display: flex; justify-content: space-between; align-items: center;
                    animation: fadeInUp 0.5s ease;
                    box-shadow: 0 10px 30px rgba(242,116,5,0.3);
                }
                .id-card-left {}
                .id-label { font-size: 12px; opacity: 0.8; margin-bottom: 4px; letter-spacing: 1px; }
                .id-number { font-size: 28px; font-weight: 900; }
                .id-order { font-size: 13px; opacity: 0.8; margin-top: 4px; }
                .refresh-btn {
                    background: rgba(255,255,255,0.2); border: none; color: white;
                    padding: 10px 18px; border-radius: 20px; cursor: pointer;
                    font-size: 13px; font-weight: 600; transition: all 0.3s;
                    font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 6px;
                }
                .refresh-btn:hover { background: rgba(255,255,255,0.3); }
                .last-updated { font-size: 11px; opacity: 0.7; margin-top: 6px; }

                /* STATUS CARD */
                .status-card {
                    background: white; border-radius: 20px; padding: 30px;
                    margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.07);
                    animation: fadeInUp 0.6s ease;
                }
                .status-title { font-size: 16px; font-weight: 700; color: #3a2e2a; margin-bottom: 25px; display: flex; align-items: center; gap: 8px; }

                /* PROGRESS STEPS */
                .steps-container { position: relative; }
                .steps-line {
                    position: absolute; left: 24px; top: 24px;
                    width: 2px; height: calc(100% - 48px);
                    background: #f0e8e0; z-index: 0;
                }
                .steps-line-fill {
                    position: absolute; left: 24px; top: 24px;
                    width: 2px; background: linear-gradient(to bottom, #f27405, #4caf50);
                    transition: height 1s ease; z-index: 1;
                }
                .step-row {
                    display: flex; align-items: flex-start; gap: 20px;
                    margin-bottom: 30px; position: relative; z-index: 2;
                }
                .step-row:last-child { margin-bottom: 0; }
                .step-icon-wrapper {
                    width: 48px; height: 48px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 20px; flex-shrink: 0;
                    transition: all 0.5s ease;
                    border: 3px solid #f0e8e0;
                    background: white;
                }
                .step-icon-wrapper.done {
                    background: #4caf50; border-color: #4caf50;
                    box-shadow: 0 4px 15px rgba(76,175,80,0.3);
                }
                .step-icon-wrapper.current {
                    background: #f27405; border-color: #f27405;
                    box-shadow: 0 4px 15px rgba(242,116,5,0.3);
                    animation: pulse 2s ease-in-out infinite;
                }
                .step-icon-wrapper.pending { opacity: 0.4; }
                .step-content { flex: 1; padding-top: 8px; }
                .step-label-text {
                    font-size: 15px; font-weight: 700; color: #3a2e2a;
                    margin-bottom: 3px;
                }
                .step-label-text.pending { color: #bbb; }
                .step-desc { font-size: 12px; color: #aaa; }
                .step-desc.done { color: #4caf50; }
                .step-desc.current { color: #f27405; font-weight: 600; }
                .current-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    background: #fff3e8; color: #f27405;
                    padding: 3px 10px; border-radius: 10px;
                    font-size: 11px; font-weight: 700; margin-top: 5px;
                }
                .live-dot {
                    width: 6px; height: 6px; background: #f27405;
                    border-radius: 50%; animation: pulse 1s ease-in-out infinite;
                }

                /* DELIVERER CARD */
                .deliverer-card {
                    background: white; border-radius: 20px; padding: 25px;
                    margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.07);
                    animation: fadeInUp 0.7s ease;
                    display: flex; align-items: center; gap: 20px;
                }
                .deliverer-avatar {
                    width: 60px; height: 60px; border-radius: 50%;
                    background: linear-gradient(135deg, #2c5364, #0f2027);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 28px; flex-shrink: 0;
                    box-shadow: 0 5px 15px rgba(44,83,100,0.3);
                    animation: float 3s ease-in-out infinite;
                }
                .deliverer-info { flex: 1; }
                .deliverer-label { font-size: 11px; color: #aaa; font-weight: 600; letter-spacing: 1px; margin-bottom: 4px; }
                .deliverer-name { font-size: 17px; font-weight: 800; color: #3a2e2a; margin-bottom: 4px; }
                .deliverer-status { font-size: 12px; color: #4caf50; font-weight: 600; display: flex; align-items: center; gap: 5px; }

                /* SUCCESS CARD */
                .success-card {
                    background: linear-gradient(135deg, #f0fff4, #e8f5e9);
                    border: 2px solid #a5d6a7; border-radius: 20px;
                    padding: 35px; text-align: center;
                    margin-bottom: 20px; animation: fadeInUp 0.5s ease;
                }
                .success-icon { font-size: 70px; display: block; margin-bottom: 15px; animation: successPop 0.6s ease; }
                .success-title { font-size: 24px; font-weight: 900; color: #2e7d32; margin-bottom: 8px; }
                .success-subtitle { color: #666; font-size: 14px; }

                /* ACTIONS */
                .actions { display: flex; flex-direction: column; gap: 12px; animation: fadeInUp 0.8s ease; }
                .orders-btn {
                    padding: 16px; border: none; border-radius: 50px;
                    background: linear-gradient(135deg, #f27405, #e06600);
                    color: white; font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: all 0.3s;
                    box-shadow: 0 5px 20px rgba(242,116,5,0.3);
                    font-family: 'Poppins', sans-serif;
                }
                .orders-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(242,116,5,0.4); }
                .home-btn {
                    padding: 14px; border: 1.5px solid #f27405;
                    border-radius: 50px; background: transparent;
                    color: #f27405; font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: all 0.3s;
                    font-family: 'Poppins', sans-serif;
                }
                .home-btn:hover { background: #fff3e8; }

                /* ERROR */
                .error-card {
                    background: #fff3f3; border: 2px solid #ffcdd2;
                    border-radius: 20px; padding: 30px; text-align: center;
                    margin-bottom: 20px;
                }
                .error-icon { font-size: 50px; margin-bottom: 15px; }
                .error-title { font-size: 18px; font-weight: 700; color: #c62828; margin-bottom: 8px; }
                .error-sub { color: #888; font-size: 13px; }

                /* LOADING */
                .loading { text-align: center; padding: 80px 20px; }
                .spinner { font-size: 50px; animation: spin 1s linear infinite; display: block; margin-bottom: 20px; }

                /* AUTO REFRESH BADGE */
                .auto-refresh {
                    text-align: center; font-size: 12px; color: #aaa;
                    margin-bottom: 20px; display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                }
                .refresh-dot {
                    width: 6px; height: 6px; background: #4caf50;
                    border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;
                }
            `}</style>

            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/restaurants" className="logo">🌿 Fresh Bites</Link>
                <div className="nav-actions">
                    <Link to="/my-orders" className="nav-btn btn-outline">📦 Mes commandes</Link>
                </div>
            </nav>

            {loading ? (
                <div className="loading">
                    <span className="spinner">🛵</span>
                    <p>Chargement du suivi...</p>
                </div>
            ) : error ? (
                <div className="page">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <div className="error-title">{error}</div>
                        <div className="error-sub">Vérifiez que delivery-service est en marche</div>
                    </div>
                    <div className="actions">
                        <button className="orders-btn" onClick={fetchTracking}>🔄 Réessayer</button>
                        <button className="home-btn" onClick={() => navigate("/my-orders")}>← Retour aux commandes</button>
                    </div>
                </div>
            ) : (
                <div className="page">
                    {/* ID CARD */}
                    <div className="id-card">
                        <div className="id-card-left">
                            <div className="id-label">🛵 SUIVI DE LIVRAISON</div>
                            <div className="id-number">#{deliveryId}</div>
                            {tracking?.orderId && (
                                <div className="id-order">Commande #{tracking.orderId}</div>
                            )}
                            {lastUpdated && (
                                <div className="last-updated">
                                    Mis à jour: {lastUpdated.toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                        <button className="refresh-btn" onClick={fetchTracking}>
                            🔄 Actualiser
                        </button>
                    </div>

                    {/* AUTO REFRESH */}
                    <div className="auto-refresh">
                        <div className="refresh-dot"></div>
                        Actualisation automatique toutes les 15 secondes
                    </div>

                    {/* SUCCESS */}
                    {isDelivered && (
                        <div className="success-card">
                            <span className="success-icon">🎉</span>
                            <div className="success-title">Commande livrée !</div>
                            <div className="success-subtitle">Bon appétit ! N'oubliez pas de noter votre commande.</div>
                        </div>
                    )}

                    {/* PROGRESS STEPS */}
                    <div className="status-card">
                        <div className="status-title">📍 Statut de la livraison</div>
                        <div className="steps-container">
                            <div className="steps-line" />
                            <div className="steps-line-fill" style={{
                                height: currentIdx === 0 ? "0%" :
                                        currentIdx === 1 ? "33%" :
                                        currentIdx === 2 ? "66%" : "100%"
                            }} />
                            {STATUS_STEPS.map((step, i) => {
                                const isDone = i < currentIdx;
                                const isCurrent = i === currentIdx;
                                const isPending = i > currentIdx;
                                return (
                                    <div key={step.key} className="step-row">
                                        <div className={`step-icon-wrapper ${isDone ? "done" : isCurrent ? "current" : "pending"}`}>
                                            {isDone ? "✓" : step.emoji}
                                        </div>
                                        <div className="step-content">
                                            <div className={`step-label-text ${isPending ? "pending" : ""}`}>
                                                {step.label}
                                            </div>
                                            <div className={`step-desc ${isDone ? "done" : isCurrent ? "current" : ""}`}>
                                                {step.desc}
                                            </div>
                                            {isCurrent && !isDelivered && (
                                                <div className="current-badge">
                                                    <div className="live-dot" /> En cours...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* DELIVERER INFO */}
                    {tracking?.delivererName && tracking.delivererName !== "Not assigned yet" && (
                        <div className="deliverer-card">
                            <div className="deliverer-avatar">🛵</div>
                            <div className="deliverer-info">
                                <div className="deliverer-label">VOTRE LIVREUR</div>
                                <div className="deliverer-name">{tracking.delivererName}</div>
                                <div className="deliverer-status">
                                    <div className="refresh-dot" />
                                    {isDelivered ? "Livraison effectuée ✅" : "En route vers vous..."}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="actions">
                        <button className="orders-btn" onClick={() => navigate("/my-orders")}>
                            📦 Mes commandes
                        </button>
                        <button className="home-btn" onClick={() => navigate("/restaurants")}>
                            🍴 Continuer à commander
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}