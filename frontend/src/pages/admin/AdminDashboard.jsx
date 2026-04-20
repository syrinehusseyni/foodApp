import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8089";

export default function AdminDashboard() {
    const [restaurants, setRestaurants] = useState([]);
    const [deliverers, setDeliverers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("adminToken");
    const email = localStorage.getItem("adminEmail");

    useEffect(() => {
        if (!token) { navigate("/admin/login"); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [restoRes, delivRes] = await Promise.all([
                fetch(`${API}/api/admin/restaurants`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/api/admin/deliverers`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (restoRes.ok) setRestaurants(await restoRes.json());
            if (delivRes.ok) setDeliverers(await delivRes.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
        navigate("/admin/login");
    };

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; background:#f5f5f5; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

                .navbar { display:flex; justify-content:space-between; align-items:center; padding:15px 40px; background:linear-gradient(135deg,#1a1a2e,#16213e); box-shadow:0 2px 20px rgba(0,0,0,0.3); position:sticky; top:0; z-index:100; }
                .logo { font-size:20px; font-weight:700; color:white; }
                .nav-right { display:flex; align-items:center; gap:12px; }
                .email-badge { color:rgba(255,255,255,0.7); font-size:13px; }
                .logout-btn { background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .logout-btn:hover { background:#ff5252; border-color:#ff5252; }

                .container { max-width:1100px; margin:0 auto; padding:30px 20px 60px; }

                .hero { background:linear-gradient(135deg,#1a1a2e,#16213e); border-radius:20px; padding:30px; margin-bottom:25px; color:white; animation:fadeInUp 0.5s ease; }
                .hero-title { font-size:26px; font-weight:800; margin-bottom:5px; }
                .hero-sub { color:rgba(255,255,255,0.7); font-size:14px; }

                .stats { display:grid; grid-template-columns:repeat(3,1fr); gap:15px; margin-bottom:25px; }
                .stat { background:white; border-radius:16px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.5s ease; }
                .stat-emoji { font-size:28px; margin-bottom:8px; }
                .stat-num { font-size:28px; font-weight:900; color:#1a1a2e; }
                .stat-label { font-size:12px; color:#888; margin-top:4px; }

                .nav-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
                .nav-card { background:white; border-radius:20px; padding:30px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.07); transition:all 0.3s; animation:fadeInUp 0.6s ease; border:2px solid transparent; display:flex; align-items:center; gap:20px; }
                .nav-card:hover { transform:translateY(-5px); box-shadow:0 15px 35px rgba(26,26,46,0.15); border-color:#e0e0e0; }
                .nav-card-icon { font-size:45px; width:70px; height:70px; background:#f5f5f5; border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .nav-card-title { font-size:18px; font-weight:800; color:#1a1a2e; margin-bottom:5px; }
                .nav-card-sub { font-size:13px; color:#888; }
                .nav-card-arrow { margin-left:auto; font-size:20px; color:#aaa; }

                .loading { text-align:center; padding:80px; }
                .spinner { font-size:40px; animation:spin 1s linear infinite; display:block; }
            `}</style>

            <nav className="navbar">
                <div className="logo">🔐 Admin Portal</div>
                <div className="nav-right">
                    <span className="email-badge">👤 {email}</span>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </nav>

            {loading ? (
                <div className="loading"><span className="spinner">⚙️</span></div>
            ) : (
                <div className="container">
                    <div className="hero">
                        <div className="hero-title">👋 Admin Dashboard</div>
                        <div className="hero-sub">Gérez tous les restaurants et livreurs de Fresh Bites</div>
                    </div>

                    <div className="stats">
                        <div className="stat">
                            <div className="stat-emoji">🍽️</div>
                            <div className="stat-num">{restaurants.length}</div>
                            <div className="stat-label">Restaurants</div>
                        </div>
                        <div className="stat">
                            <div className="stat-emoji">🛵</div>
                            <div className="stat-num">{deliverers.length}</div>
                            <div className="stat-label">Livreurs</div>
                        </div>
                        <div className="stat">
                            <div className="stat-emoji">✅</div>
                            <div className="stat-num">{restaurants.length + deliverers.length}</div>
                            <div className="stat-label">Total acteurs</div>
                        </div>
                    </div>

                    <div className="nav-cards">
                        <div className="nav-card" onClick={() => navigate("/admin/restaurants")}>
                            <div className="nav-card-icon">🍽️</div>
                            <div>
                                <div className="nav-card-title">Gérer les restaurants</div>
                                <div className="nav-card-sub">{restaurants.length} restaurant(s) enregistré(s)</div>
                            </div>
                            <div className="nav-card-arrow">→</div>
                        </div>
                        <div className="nav-card" onClick={() => navigate("/admin/deliverers")}>
                            <div className="nav-card-icon">🛵</div>
                            <div>
                                <div className="nav-card-title">Gérer les livreurs</div>
                                <div className="nav-card-sub">{deliverers.length} livreur(s) enregistré(s)</div>
                            </div>
                            <div className="nav-card-arrow">→</div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}