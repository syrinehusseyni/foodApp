import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8082";

export default function RestaurantDashboard() {
    const [restaurant, setRestaurant] = useState(null);
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem("restaurantToken");
    const restaurantId = localStorage.getItem("restaurantId");
    const restaurantName = localStorage.getItem("restaurantName");
    const email = localStorage.getItem("restaurantEmail");

    useEffect(() => {
        if (!token || !restaurantId || restaurantId === "null") {
            navigate("/restaurant/login");
            return;
        }
        fetchData();
    }, [token, restaurantId, navigate]);

    const fetchData = async () => {
        try {
            // Fetch orders
            const ordersRes = await fetch(`${API}/api/restaurant/${restaurantId}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(Array.isArray(data) ? data : []);
            }

            // Fetch menu items
            const menuRes = await fetch(`${API}/menu-items/restaurant/${restaurantId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (menuRes.ok) {
                const data = await menuRes.json();
                setMenuItems(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("restaurantToken");
        localStorage.removeItem("restaurantEmail");
        localStorage.removeItem("restaurantId");
        localStorage.removeItem("restaurantName");
        navigate("/restaurant/login");
    };

    const pendingOrders = orders.filter(o => o.status === "PLACED" || o.status === "PREPARING");
    const deliveredOrders = orders.filter(o => o.status === "DELIVERED");
    const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; background:#f0f7f0; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

                .navbar { display:flex; justify-content:space-between; align-items:center; padding:15px 40px; background:linear-gradient(135deg,#1b4332,#2d6a4f); box-shadow:0 2px 20px rgba(0,0,0,0.2); position:sticky; top:0; z-index:100; }
                .logo { font-size:20px; font-weight:700; color:white; }
                .nav-right { display:flex; align-items:center; gap:12px; }
                .email-badge { color:rgba(255,255,255,0.7); font-size:13px; }
                .logout-btn { background:rgba(255,255,255,0.15); color:white; border:1px solid rgba(255,255,255,0.3); padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .logout-btn:hover { background:#ff5252; border-color:#ff5252; }

                .container { max-width:1100px; margin:0 auto; padding:30px 20px 60px; }

                .hero { background:linear-gradient(135deg,#1b4332,#2d6a4f); border-radius:20px; padding:30px; margin-bottom:25px; color:white; animation:fadeInUp 0.5s ease; }
                .hero-title { font-size:26px; font-weight:800; margin-bottom:5px; }
                .hero-sub { color:rgba(255,255,255,0.7); font-size:14px; }

                .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:15px; margin-bottom:25px; }
                .stat { background:white; border-radius:16px; padding:20px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.5s ease; }
                .stat-emoji { font-size:28px; margin-bottom:8px; }
                .stat-num { font-size:24px; font-weight:900; color:#2d6a4f; }
                .stat-label { font-size:12px; color:#888; margin-top:4px; }

                .nav-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; margin-bottom:25px; }
                .nav-card { background:white; border-radius:20px; padding:30px; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.07); transition:all 0.3s; animation:fadeInUp 0.6s ease; border:2px solid transparent; display:flex; align-items:center; gap:20px; }
                .nav-card:hover { transform:translateY(-5px); box-shadow:0 15px 35px rgba(45,106,79,0.2); border-color:#a5d6a7; }
                .nav-card-icon { font-size:45px; width:70px; height:70px; background:linear-gradient(135deg,#e8f5e9,#c8e6c9); border-radius:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
                .nav-card-title { font-size:18px; font-weight:800; color:#1b4332; margin-bottom:5px; }
                .nav-card-sub { font-size:13px; color:#888; }
                .nav-card-arrow { margin-left:auto; font-size:20px; color:#2d6a4f; }

                .recent-orders { background:white; border-radius:20px; padding:25px; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.7s ease; }
                .section-title { font-size:18px; font-weight:800; color:#1b4332; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
                .order-row { display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #f0f0f0; }
                .order-row:last-child { border-bottom:none; }
                .order-id { font-weight:700; color:#1b4332; font-size:14px; }
                .order-info { font-size:12px; color:#888; margin-top:3px; }
                .order-status { padding:5px 12px; border-radius:20px; font-size:11px; font-weight:700; }
                .status-PLACED { background:#fff3e8; color:#f27405; }
                .status-PREPARING { background:#fff8e1; color:#f9a825; }
                .status-IN_DELIVERY { background:#e3f2fd; color:#1565c0; }
                .status-DELIVERED { background:#f0fff4; color:#2e7d32; }
                .status-CANCELLED { background:#fff0f0; color:#c62828; }
                .order-price { font-weight:800; color:#2d6a4f; font-size:15px; }
                .empty-orders { text-align:center; padding:30px; color:#aaa; font-size:14px; }

                .loading { text-align:center; padding:80px; }
                .spinner { font-size:40px; animation:spin 1s linear infinite; display:block; }
            `}</style>

            <nav className="navbar">
                <div className="logo">🍽️ Restaurant Portal</div>
                <div className="nav-right">
                    <span className="email-badge">👤 {email}</span>
                    <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
                </div>
            </nav>

            {loading ? (
                <div className="loading"><span className="spinner">🍽️</span></div>
            ) : (
                <div className="container">
                    <div className="hero">
                        <div className="hero-title">👋 Bienvenue, {restaurantName || "Restaurant"}</div>
                        <div className="hero-sub">Gérez vos commandes et votre menu</div>
                    </div>

                    {/* STATS */}
                    <div className="stats">
                        <div className="stat">
                            <div className="stat-emoji">📦</div>
                            <div className="stat-num">{orders.length}</div>
                            <div className="stat-label">Total commandes</div>
                        </div>
                        <div className="stat">
                            <div className="stat-emoji">⏳</div>
                            <div className="stat-num">{pendingOrders.length}</div>
                            <div className="stat-label">En attente</div>
                        </div>
                        <div className="stat">
                            <div className="stat-emoji">✅</div>
                            <div className="stat-num">{deliveredOrders.length}</div>
                            <div className="stat-label">Livrées</div>
                        </div>
                        <div className="stat">
                            <div className="stat-emoji">💰</div>
                            <div className="stat-num">{revenue.toFixed(1)} DT</div>
                            <div className="stat-label">Revenus</div>
                        </div>
                    </div>

                    {/* NAV CARDS */}
                    <div className="nav-cards">
                        <div className="nav-card" onClick={() => navigate("/restaurant/orders")}>
                            <div className="nav-card-icon">📋</div>
                            <div>
                                <div className="nav-card-title">Commandes entrantes</div>
                                <div className="nav-card-sub">{pendingOrders.length} commande(s) en attente</div>
                            </div>
                            <div className="nav-card-arrow">→</div>
                        </div>
                        <div className="nav-card" onClick={() => navigate("/restaurant/menu")}>
                            <div className="nav-card-icon">🍴</div>
                            <div>
                                <div className="nav-card-title">Gérer le menu</div>
                                <div className="nav-card-sub">{menuItems.length} article(s) au menu</div>
                            </div>
                            <div className="nav-card-arrow">→</div>
                        </div>
                    </div>

                    {/* RECENT ORDERS */}
                    <div className="recent-orders">
                        <div className="section-title">📦 Commandes récentes</div>
                        {orders.length === 0 ? (
                            <div className="empty-orders">Aucune commande pour le moment</div>
                        ) : (
                            orders.slice(0, 5).map(order => (
                                <div key={order.id} className="order-row">
                                    <div>
                                        <div className="order-id">Commande #{order.id}</div>
                                        <div className="order-info">
                                            {order.orderItems?.length || 0} article(s)
                                        </div>
                                    </div>
                                    <div className={`order-status status-${order.status}`}>
                                        {order.status}
                                    </div>
                                    <div className="order-price">{(order.totalPrice || 0).toFixed(3)} DT</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
