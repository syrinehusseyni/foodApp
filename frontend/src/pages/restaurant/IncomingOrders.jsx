import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8082";

const STATUS_FLOW = {
    PLACED: { next: "PREPARING", label: "▶ Commencer préparation", color: "#f27405", bg: "#fff3e8" },
    PREPARING: { next: "IN_DELIVERY", label: "✅ Prêt pour livraison", color: "#2d6a4f", bg: "#e8f5e9" },
    IN_DELIVERY: { next: null, label: "🛵 En livraison", color: "#1565c0", bg: "#e3f2fd" },
    DELIVERED: { next: null, label: "✅ Livré", color: "#2e7d32", bg: "#f0fff4" },
    CANCELLED: { next: null, label: "❌ Annulé", color: "#c62828", bg: "#fff0f0" },
};
const mockMenuItemNames = {
    7: "Pizza Neptune", 8: "Ojja Crevette", 9: "Tortilla Viande Hachée",
    10: "Salade Fruits de Mer", 11: "Salade Mechouia", 12: "Brik",
    13: "Calzone Kabeb", 14: "Calzone Escaloppe", 15: "Makloub Salami",
    16: "Galette Thon", 17: "Pizza Neptune", 18: "Pizza 4 Saisons",
    19: "Chika Mixte", 20: "Fénoméne", 21: "Chika Tike", 22: "Chicken Panné",
    23: "Radical", 24: "La Suisse", 25: "Orientale", 26: "Sfaxien",
    27: "Bucket Original", 28: "Zinger Burger", 29: "Twister Poulet",
    30: "Crispy Box", 31: "Hot Wings", 32: "Popcorn Chicken",
    33: "Family Feast", 34: "Sundae Caramel", 35: "Cookies & Cream",
    36: "Waffle Nutella", 37: "Crêpe Spéciale", 38: "Milkshake Fraise",
    39: "Pancake Stack", 40: "Churros Chocolat", 41: "Cheesecake Fruits Rouges",
    42: "Jwajem Classique", 43: "Makroudh", 44: "Baklawa",
    45: "Assida Zgougou", 46: "Kaak Warka", 47: "Plateau Pâtisseries",
    48: "Gelato Pistache", 49: "Gelato Stracciatella", 50: "Sundae Ci Gusta",
    51: "Affogato", 52: "Coupe Fruit", 53: "Waffle Gelato",
    54: "Pain Perdu Caramel", 55: "Croque Monsieur", 56: "Club Sandwich",
    57: "Quiche Lorraine", 58: "Tarte Tatin", 59: "Salade Niçoise",
    60: "Spaghetti Bolognese", 61: "Penne Arrabiata", 62: "Tagliatelle Saumon",
    63: "Lasagne Maison", 64: "Gnocchi Pesto", 65: "Risotto aux Champignons",
    66: "Pâtes Carbonara", 67: "Linguine Fruits de Mer", 68: "Pizza Diavola",
    69: "Tiramisu Maison", 70: "Bruschetta Trio", 71: "Carpaccio Bœuf",
    72: "Pasta Cuzi Signature", 73: "Fettuccine Alfredo", 74: "Penne Poulet Pesto",
    75: "Tortellini Ricotta", 76: "Spaghetti Vongole", 77: "Pizza Attack",
    78: "Burger Attack", 79: "Hot Dog Maison", 80: "Nachos Attack",
    81: "Wings BBQ", 82: "Wrap Thon", 83: "Pizza Pazzino", 84: "Pizza Royale",
    85: "Pizza Végétarienne", 86: "Pizza Chorizo", 87: "Calzone Pazzino",
    88: "Flannel Classic", 89: "BBQ Chicken Pizza", 90: "Pizza Blanche",
    91: "Pizza Fruits de Mer", 92: "Pizza Kebab", 93: "Sandwich Matador",
    94: "Merguez Frites", 95: "Fricassé Spécial", 96: "Lablabi",
    97: "Kapsa Agneau", 98: "Wrap Chich Taouk", 99: "Assiette Chich Taouk",
    100: "Sandwich Kafta", 101: "Hummus Maison", 102: "Falafel Plate",
    103: "Omlette Chawarma", 104: "Omlette Escaloppe", 105: "Omlette Cordon Bleu",
    106: "Omlette Jambon", 107: "Omlette Thon", 108: "Omlette Salami",
    109: "Omlette Thon Fromage", 110: "Mlawi Hssouna", 111: "Mlewi Spécial",
    112: "Omlette Jambon Mozzarelle", 113: "Mlawi Hssouna Royale",
    114: "King Burger", 115: "Sandwich Tunisien Roi", 116: "Wrap Poulet King",
    117: "Hot Dog King", 118: "Assiette Mixte King", 119: "Sandwich Bambo",
    120: "Fricassé Bambo", 121: "Brik Bambo", 122: "Assida Poulet",
    123: "Merguez Pain", 124: "Salade Plan B", 125: "Bowl César Poulet",
    126: "Wrap Végétarien", 127: "Salade Thaï", 128: "Bowl Smoothie",
    129: "Sandwich Saumon Avocat", 130: "Xpress Classic", 131: "Xpress Crispy",
    132: "Xpress Double", 133: "Smash Burger", 134: "Cheese Fries",
    135: "Buzz Salad", 136: "Sandwich Buzz", 137: "Poke Bowl Saumon",
    138: "Salade Grecque", 139: "Jus Detox Buzz", 140: "Salade Mascotte",
    141: "Croque Madame", 142: "Pasta Mascotte", 143: "Club Mascotte",
    144: "Tarte du Jour", 145: "Burrito Supreme", 146: "Tacos Tex Mex",
    147: "Quesadilla Poulet", 148: "Fajitas Bœuf", 149: "Nachos Loaded",
    150: "Churros Maison", 151: "Craft Classic", 152: "Truffle Burger",
    153: "BBQ Smokehouse", 154: "Veggie Craft", 155: "Craft Smash Double",
    156: "Onion Rings"
};

export default function IncomingOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [activeFilter, setActiveFilter] = useState("all");
    const [successMsg, setSuccessMsg] = useState("");
    const navigate = useNavigate();

    const token = localStorage.getItem("restaurantToken");
    const restaurantId = localStorage.getItem("restaurantId");

    useEffect(() => {
        if (!token || !restaurantId || restaurantId === "null") {
            navigate("/restaurant/login");
            return;
        }
        fetchOrders();
        const interval = setInterval(fetchOrders, 20000);
        return () => clearInterval(interval);
    }, [token, restaurantId, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API}/api/restaurant/${restaurantId}/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(Array.isArray(data) ? data.sort((a, b) => b.id - a.id) : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdating(prev => ({ ...prev, [orderId]: true }));
        try {
            const res = await fetch(`${API}/api/restaurant/orders/${orderId}/status?status=${newStatus}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: newStatus } : o
                ));
                setSuccessMsg(`✅ Commande #${orderId} mise à jour → ${newStatus}`);
                setTimeout(() => setSuccessMsg(""), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(prev => ({ ...prev, [orderId]: false }));
        }
    };

    const filters = [
        { id: "all", label: "Toutes" },
        { id: "PLACED", label: "⏳ Nouvelles" },
        { id: "PREPARING", label: "👨‍🍳 Préparation" },
        { id: "IN_DELIVERY", label: "🛵 En livraison" },
        { id: "DELIVERED", label: "✅ Livrées" },
        { id: "CANCELLED", label: "❌ Annulées" },
    ];

    const filtered = activeFilter === "all"
        ? orders
        : orders.filter(o => o.status === activeFilter);

    const pendingCount = orders.filter(o => o.status === "PLACED").length;

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; background:#f0f7f0; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
                @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }

                .navbar { display:flex; justify-content:space-between; align-items:center; padding:15px 40px; background:linear-gradient(135deg,#1b4332,#2d6a4f); box-shadow:0 2px 20px rgba(0,0,0,0.2); position:sticky; top:0; z-index:100; }
                .logo { font-size:20px; font-weight:700; color:white; cursor:pointer; }
                .nav-right { display:flex; gap:12px; }
                .back-btn { background:rgba(255,255,255,0.15); color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; transition:all 0.3s; }
                .back-btn:hover { background:rgba(255,255,255,0.25); }
                .refresh-btn { background:#f27405; color:white; border:none; padding:8px 18px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; font-family:'Poppins',sans-serif; transition:all 0.3s; }
                .refresh-btn:hover { background:#e06600; }

                .toast { position:fixed; top:80px; left:50%; transform:translateX(-50%); background:#2d6a4f; color:white; padding:14px 28px; border-radius:50px; font-size:14px; font-weight:700; z-index:9999; animation:slideDown 0.4s ease; box-shadow:0 8px 25px rgba(45,106,79,0.4); }

                .container { max-width:1000px; margin:0 auto; padding:30px 20px 60px; }

                .header { background:linear-gradient(135deg,#1b4332,#2d6a4f); border-radius:20px; padding:25px 30px; margin-bottom:20px; color:white; animation:fadeInUp 0.5s ease; display:flex; justify-content:space-between; align-items:center; }
                .header-title { font-size:22px; font-weight:800; margin-bottom:5px; }
                .header-sub { color:rgba(255,255,255,0.7); font-size:13px; }
                .pending-badge { background:rgba(242,116,5,0.9); color:white; padding:8px 18px; border-radius:20px; font-size:14px; font-weight:700; animation: ${pendingCount > 0 ? "pulse 2s ease-in-out infinite" : "none"}; }

                .filters { background:white; border-radius:16px; padding:15px 20px; margin-bottom:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; gap:8px; overflow-x:auto; }
                .filters::-webkit-scrollbar { display:none; }
                .filter-btn { padding:8px 18px; border-radius:50px; border:none; cursor:pointer; font-size:13px; font-weight:600; white-space:nowrap; transition:all 0.3s; background:#f5f5f5; color:#666; font-family:'Poppins',sans-serif; }
                .filter-btn.active { background:#2d6a4f; color:white; }
                .filter-btn:hover:not(.active) { background:#e8f5e9; color:#2d6a4f; }

                .order-card { background:white; border-radius:20px; padding:25px; margin-bottom:15px; box-shadow:0 4px 15px rgba(0,0,0,0.07); animation:fadeInUp 0.4s ease; border-left:4px solid transparent; transition:all 0.3s; }
                .order-card.PLACED { border-left-color:#f27405; }
                .order-card.PREPARING { border-left-color:#f9a825; }
                .order-card.IN_DELIVERY { border-left-color:#1565c0; }
                .order-card.DELIVERED { border-left-color:#2e7d32; }
                .order-card.CANCELLED { border-left-color:#c62828; }
                .order-card:hover { transform:translateY(-2px); box-shadow:0 8px 25px rgba(0,0,0,0.1); }

                .order-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; }
                .order-id { font-size:18px; font-weight:800; color:#1b4332; }
                .order-time { font-size:12px; color:#aaa; margin-top:3px; }
                .status-badge { padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; }

                .items-box { background:#f9f9f9; border-radius:12px; padding:15px; margin-bottom:15px; }
                .items-title { font-size:12px; font-weight:700; color:#666; margin-bottom:10px; letter-spacing:1px; }
                .item-row { display:flex; justify-content:space-between; font-size:13px; color:#444; padding:4px 0; }
                .item-name { font-weight:600; }

                .order-footer { display:flex; justify-content:space-between; align-items:center; padding-top:15px; border-top:1px solid #f0f0f0; }
                .order-total { font-size:18px; font-weight:900; color:#2d6a4f; }
                .order-customer { font-size:12px; color:#aaa; }

                .action-btn { padding:10px 22px; border:none; border-radius:20px; cursor:pointer; font-size:13px; font-weight:700; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                .action-btn:hover { transform:translateY(-2px); box-shadow:0 5px 15px rgba(0,0,0,0.15); }
                .action-btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
                .btn-prepare { background:#f27405; color:white; }
                .btn-ready { background:#2d6a4f; color:white; }

                .new-badge { background:#ff5252; color:white; padding:3px 10px; border-radius:10px; font-size:10px; font-weight:700; margin-left:8px; animation:pulse 1s ease-in-out infinite; }

                .empty { text-align:center; padding:60px; color:#aaa; }
                .empty-icon { font-size:60px; margin-bottom:15px; }
                .loading { text-align:center; padding:80px; }
                .spinner { font-size:40px; animation:spin 1s linear infinite; display:block; }

                .live-dot { display:inline-block; width:8px; height:8px; background:#4caf50; border-radius:50%; animation:pulse 1.5s ease-in-out infinite; margin-right:6px; }
            `}</style>

            {successMsg && <div className="toast">{successMsg}</div>}

            <nav className="navbar">
                <div className="logo" onClick={() => navigate("/restaurant/dashboard")}>🍽️ Restaurant Portal</div>
                <div className="nav-right">
                    <button className="back-btn" onClick={() => navigate("/restaurant/dashboard")}>← Dashboard</button>
                    <button className="refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
                </div>
            </nav>

            {loading ? (
                <div className="loading"><span className="spinner">📋</span></div>
            ) : (
                <div className="container">
                    <div className="header">
                        <div>
                            <div className="header-title">📋 Commandes entrantes</div>
                            <div className="header-sub">
                                <span className="live-dot"></span>
                                Actualisation automatique toutes les 20 secondes
                            </div>
                        </div>
                        {pendingCount > 0 && (
                            <div className="pending-badge">🔔 {pendingCount} nouvelle(s)</div>
                        )}
                    </div>

                    {/* FILTERS */}
                    <div className="filters">
                        {filters.map(f => (
                            <button key={f.id} className={`filter-btn ${activeFilter === f.id ? "active" : ""}`}
                                onClick={() => setActiveFilter(f.id)}>
                                {f.label}
                                {f.id === "PLACED" && pendingCount > 0 && (
                                    <span style={{ marginLeft: "6px", background: "#ff5252", color: "white", padding: "1px 7px", borderRadius: "10px", fontSize: "10px" }}>
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ORDERS */}
                    {filtered.length === 0 ? (
                        <div className="empty">
                            <div className="empty-icon">📭</div>
                            <p>Aucune commande pour le moment</p>
                        </div>
                    ) : (
                        filtered.map(order => {
                            const statusInfo = STATUS_FLOW[order.status] || STATUS_FLOW.PLACED;
                            const isNew = order.status === "PLACED";
                            return (
                                <div key={order.id} className={`order-card ${order.status}`}>
                                    <div className="order-top">
                                        <div>
                                            <div className="order-id">
                                                Commande #{order.id}
                                                {isNew && <span className="new-badge">NOUVEAU</span>}
                                            </div>
                                            <div className="order-time">
                                                👤 Client #{order.customerId}
                                            </div>
                                        </div>
                                        <div className="status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                                            {order.status}
                                        </div>
                                    </div>

                                    {/* ITEMS */}
                                    <div className="items-box">
                                        <div className="items-title">🛒 ARTICLES</div>
                                        {order.orderItems?.map((item, i) => (
                                            <div key={i} className="item-row">
                                                <span className="item-name">
    x{item.quantity} {mockMenuItemNames[item.menuItemId] || `Item #${item.menuItemId}`}
</span>
                                                <span>{(item.price * item.quantity).toFixed(3)} DT</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div>
                                            <div className="order-total">{(order.totalPrice || 0).toFixed(3)} DT</div>
                                            <div className="order-customer">Commande #{order.id}</div>
                                        </div>
                                        <div>
                                            {order.status === "PLACED" && (
                                                <button
                                                    className="action-btn btn-prepare"
                                                    onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                                                    disabled={updating[order.id]}>
                                                    {updating[order.id] ? "..." : "👨‍🍳 Commencer préparation"}
                                                </button>
                                            )}
                                            {order.status === "PREPARING" && (
                                                <button
                                                    className="action-btn btn-ready"
                                                    onClick={() => handleUpdateStatus(order.id, "IN_DELIVERY")}
                                                    disabled={updating[order.id]}>
                                                    {updating[order.id] ? "..." : "✅ Prêt — En livraison"}
                                                </button>
                                            )}
                                            {order.status === "IN_DELIVERY" && (
                                                <span style={{ color: "#1565c0", fontWeight: "700", fontSize: "13px" }}>
                                                    🛵 En cours de livraison...
                                                </span>
                                            )}
                                            {order.status === "DELIVERED" && (
                                                <span style={{ color: "#2e7d32", fontWeight: "700", fontSize: "13px" }}>
                                                    🎉 Livré !
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </>
    );
}
