import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addRating, getRatingsByUser } from "../../api/userApi";

// Add this mock data at the top of MyOrders.jsx (outside component)
const mockRestaurantNames = {
    10: "Mechmecha", 11: "Papillon", 12: "KFC Tunisia", 13: "Holy Moly",
    14: "Jwajem Hachicha", 15: "Ci Gusta", 16: "Côté Régale", 17: "Pasta Bella",
    18: "Pala Doro", 19: "Pasta Cuzi", 20: "Snack Attack", 21: "Pazzino",
    22: "Flannel Pizza", 23: "Matador", 24: "Chich Taouk", 25: "Mlawi Hssouna",
    26: "King Sandwich", 27: "Bambo", 28: "Plan B", 29: "Burger Xpress",
    30: "The Buzz", 31: "Mascotte", 32: "Tex Mex", 33: "Burger Craft"
};

const mockRestaurantEmojis = {
    10: "🍕", 11: "🍗", 12: "🍗", 13: "🍰", 14: "🍮", 15: "🍦",
    16: "🥗", 17: "🍝", 18: "🍝", 19: "🍝", 20: "🍕", 21: "🍕",
    22: "🍕", 23: "🥪", 24: "🥙", 25: "🥙", 26: "🥪", 27: "🥪",
    28: "🥗", 29: "🍔", 30: "🥗", 31: "🥗", 32: "🌮", 33: "🍔"
};

// Mock menu item names by id
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

export default function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");
    const [ratingModal, setRatingModal] = useState(null); // { orderId, restaurantId }
    const [score, setScore] = useState(0);
    const [hoveredScore, setHoveredScore] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [ratedOrders, setRatedOrders] = useState({}); // { orderId: true }
    const [successMsg, setSuccessMsg] = useState("");

    const { token, userId, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
        fetchExistingRatings();
    }, []);

    const fetchOrders = async () => {
    try {
        const response = await fetch(
            `http://localhost:8081/api/users/orders?customerId=${userId}`,
            { headers: { "Authorization": `Bearer ${token}` } }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
            setOrders(data.map(o => ({
                id: o.id,
                restaurantName: mockRestaurantNames[o.restaurantId] || `Restaurant #${o.restaurantId}`,
                restaurantId: o.restaurantId,
                restaurantEmoji: mockRestaurantEmojis[o.restaurantId] || "🍽️",
                status: o.status,
                totalPrice: o.totalPrice,
                createdAt: o.createdAt?.split("T")[0] || "N/A",
                deliveryId: o.deliveryId,
                address: "Votre adresse",
                items: o.orderItems?.map(i => ({
                    name: mockMenuItemNames[i.menuItemId] || `Item #${i.menuItemId}`,
                    quantity: i.quantity,
                    price: i.price
                })) || []
            })));
        }
    } catch (err) {
        setOrders([]);
    } finally {
        setLoading(false);
    }
};

    const fetchExistingRatings = async () => {
        if (!userId) return;
        try {
            const ratings = await getRatingsByUser(token, userId);
            if (Array.isArray(ratings)) {
                // mark orders that already have a restaurant rating
                const rated = {};
                ratings.forEach(r => {
                    if (r.type === "RESTAURANT") {
                        rated[r.restaurantId] = true;
                    }
                });
                setRatedOrders(rated);
            }
        } catch (err) {}
    };

    const openRatingModal = (orderId, restaurantId) => {
        setRatingModal({ orderId, restaurantId });
        setScore(0);
        setHoveredScore(0);
        setComment("");
    };

    const closeRatingModal = () => {
        setRatingModal(null);
        setScore(0);
        setHoveredScore(0);
        setComment("");
    };

    const submitRating = async () => {
        if (score === 0) return;
        setSubmitting(true);
        try {
            await addRating(token, {
                userId: userId ? parseInt(userId) : null,
                restaurantId: ratingModal.restaurantId,
                deliveryPersonId: null,
                score,
                comment,
                type: "RESTAURANT"
            });
            setRatedOrders(prev => ({ ...prev, [ratingModal.restaurantId]: true }));
            setSuccessMsg("✅ Merci pour votre avis !");
            setTimeout(() => setSuccessMsg(""), 3000);
            closeRatingModal();
        } catch (err) {
            console.error("Rating error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PLACED":      return { bg: "#fff3e8", color: "#f27405", label: "⏳ En attente" };
            case "PREPARING":   return { bg: "#fff8e1", color: "#f9a825", label: "👨‍🍳 En préparation" };
            case "IN_DELIVERY": return { bg: "#e3f2fd", color: "#1565c0", label: "🛵 En livraison" };
            case "DELIVERED":   return { bg: "#f0fff4", color: "#2e7d32", label: "✅ Livré" };
            case "CANCELLED":   return { bg: "#fff0f0", color: "#c62828", label: "❌ Annulé" };
            default:            return { bg: "#f5f5f5", color: "#666", label: status };
        }
    };

    const filters = [
        { id: "all",         label: "Toutes" },
        { id: "PLACED",      label: "⏳ En attente" },
        { id: "PREPARING",   label: "👨‍🍳 Préparation" },
        { id: "IN_DELIVERY", label: "🛵 En livraison" },
        { id: "DELIVERED",   label: "✅ Livrées" },
        { id: "CANCELLED",   label: "❌ Annulées" },
    ];

    const filtered = activeFilter === "all"
        ? orders
        : orders.filter(o => o.status === activeFilter);

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; background: #f7efe6; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes starPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
                @keyframes successSlide { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

                .navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 60px; background: white; box-shadow: 0 2px 20px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 100; }
                .logo { font-size: 20px; font-weight: 700; color: #4caf50; text-decoration: none; }
                .nav-actions { display: flex; gap: 12px; align-items: center; }
                .nav-btn { padding: 9px 18px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-decoration: none; display: flex; align-items: center; gap: 6px; }
                .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
                .btn-outline:hover { background: #f27405; color: white; }
                .btn-logout { background: transparent; border: 1.5px solid #ddd; color: #666; }
                .btn-logout:hover { background: #ff5252; color: white; border-color: #ff5252; }

                .hero { background: linear-gradient(135deg, #fff8f0, #fff3e8); padding: 40px 60px 30px; }
                .hero-inner { max-width: 1000px; margin: 0 auto; animation: fadeInUp 0.6s ease; }
                .hero-title { font-size: 32px; font-weight: 900; color: #3a2e2a; margin-bottom: 5px; }
                .hero-subtitle { color: #888; font-size: 14px; }

                .filters { background: white; padding: 15px 60px; border-bottom: 1px solid #f0e8e0; position: sticky; top: 65px; z-index: 99; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                .filters-inner { max-width: 1000px; margin: 0 auto; display: flex; gap: 10px; overflow-x: auto; }
                .filters-inner::-webkit-scrollbar { display: none; }
                .filter-btn { padding: 8px 18px; border-radius: 50px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; white-space: nowrap; transition: all 0.3s ease; background: #f7f0e8; color: #6c5f5b; }
                .filter-btn:hover { background: #ffe3c5; color: #f27405; }
                .filter-btn.active { background: #f27405; color: white; box-shadow: 0 4px 12px rgba(242,116,5,0.3); }

                .content { max-width: 1000px; margin: 0 auto; padding: 30px 60px 80px; }

                .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                .stat-card { background: white; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.07); animation: fadeInUp 0.4s ease; }
                .stat-emoji { font-size: 28px; margin-bottom: 8px; }
                .stat-number { font-size: 24px; font-weight: 900; color: #f27405; }
                .stat-label { font-size: 12px; color: #888; margin-top: 4px; }

                .order-card { background: white; border-radius: 20px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.07); transition: all 0.3s ease; animation: fadeInUp 0.5s ease; border: 2px solid transparent; }
                .order-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(242,116,5,0.12); border-color: #ffe3c5; }
                .order-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
                .order-left { display: flex; align-items: center; gap: 15px; }
                .order-emoji { font-size: 40px; width: 60px; height: 60px; background: #fff3e8; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
                .order-id { font-size: 12px; color: #aaa; margin-bottom: 4px; }
                .order-restaurant { font-size: 18px; font-weight: 800; color: #3a2e2a; margin-bottom: 4px; }
                .order-date { font-size: 12px; color: #aaa; }
                .status-badge { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }

                .order-items { background: #f9f5f0; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
                .order-item { display: flex; justify-content: space-between; font-size: 13px; color: #666; padding: 4px 0; }
                .order-item-name { font-weight: 600; color: #3a2e2a; }

                .order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #f0e8e0; }
                .order-address { font-size: 12px; color: #aaa; display: flex; align-items: center; gap: 5px; }
                .order-total { font-size: 18px; font-weight: 800; color: #f27405; }
                .order-actions { display: flex; gap: 10px; align-items: center; }
                .track-btn { background: #f27405; color: white; border: none; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
                .track-btn:hover { background: #e06600; transform: scale(1.05); }
                .reorder-btn { background: transparent; color: #f27405; border: 1.5px solid #f27405; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; }
                .reorder-btn:hover { background: #fff3e8; }
                .rate-btn { background: linear-gradient(135deg, #ffd700, #ffaa00); color: white; border: none; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(255,170,0,0.3); }
                .rate-btn:hover { transform: scale(1.05); box-shadow: 0 5px 15px rgba(255,170,0,0.4); }
                .rated-badge { background: #f0fff4; color: #2e7d32; padding: 8px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; border: 1.5px solid #a5d6a7; }

                /* RATING MODAL */
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(4px); animation: fadeIn 0.3s ease; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .modal { background: white; border-radius: 28px; padding: 40px; width: 100%; max-width: 460px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
                .modal-title { font-size: 22px; font-weight: 900; color: #3a2e2a; margin-bottom: 6px; text-align: center; }
                .modal-subtitle { font-size: 13px; color: #aaa; text-align: center; margin-bottom: 30px; }
                .stars-row { display: flex; justify-content: center; gap: 12px; margin-bottom: 25px; }
                .star { font-size: 42px; cursor: pointer; transition: transform 0.15s ease; user-select: none; line-height: 1; }
                .star:hover { transform: scale(1.2); }
                .star.active { animation: starPop 0.3s ease; }
                .score-label { text-align: center; font-size: 14px; font-weight: 700; color: #f27405; margin-bottom: 20px; min-height: 20px; }
                .comment-box { width: 100%; padding: 14px 18px; border-radius: 14px; border: 2px solid #ffe0c8; font-size: 14px; font-family: 'Poppins', sans-serif; resize: none; outline: none; transition: border-color 0.3s ease; color: #3a2e2a; }
                .comment-box:focus { border-color: #f27405; }
                .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
                .cancel-btn { flex: 1; padding: 14px; border-radius: 50px; border: 1.5px solid #ddd; background: transparent; color: #666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .cancel-btn:hover { background: #f5f5f5; }
                .submit-btn { flex: 2; padding: 14px; border-radius: 50px; border: none; background: linear-gradient(135deg, #f27405, #e06600); color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(242,116,5,0.3); }
                .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(242,116,5,0.4); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                /* SUCCESS TOAST */
                .success-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #2e7d32; color: white; padding: 14px 28px; border-radius: 50px; font-size: 14px; font-weight: 700; z-index: 9999; animation: successSlide 0.4s ease; box-shadow: 0 8px 25px rgba(46,125,50,0.3); }

                .loading { text-align: center; padding: 80px 20px; }
                .spinner { font-size: 50px; animation: spin 1s linear infinite; display: block; margin-bottom: 20px; }
                .empty { text-align: center; padding: 80px 20px; animation: fadeInUp 0.5s ease; }
                .empty-emoji { font-size: 80px; display: block; margin-bottom: 20px; }
                .empty-title { font-size: 24px; font-weight: 800; color: #3a2e2a; margin-bottom: 10px; }
                .empty-subtitle { color: #888; font-size: 15px; margin-bottom: 30px; }
                .browse-btn { display: inline-flex; align-items: center; gap: 8px; padding: 14px 30px; background: #f27405; color: white; border: none; border-radius: 50px; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; transition: all 0.3s ease; }
                .browse-btn:hover { background: #e06600; transform: translateY(-3px); }
            `}</style>

            {/* SUCCESS TOAST */}
            {successMsg && <div className="success-toast">{successMsg}</div>}

            {/* RATING MODAL */}
            {ratingModal && (
                <div className="modal-overlay" onClick={closeRatingModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">⭐ Noter le restaurant</div>
                        <div className="modal-subtitle">
                            Commande #{ratingModal.orderId} • Restaurant #{ratingModal.restaurantId}
                        </div>

                        {/* STARS */}
                        <div className="stars-row">
                            {[1, 2, 3, 4, 5].map(s => (
                                <span
                                    key={s}
                                    className={`star ${s <= (hoveredScore || score) ? 'active' : ''}`}
                                    style={{ filter: s <= (hoveredScore || score) ? 'none' : 'grayscale(1) opacity(0.3)' }}
                                    onMouseEnter={() => setHoveredScore(s)}
                                    onMouseLeave={() => setHoveredScore(0)}
                                    onClick={() => setScore(s)}
                                >
                                    ⭐
                                </span>
                            ))}
                        </div>

                        {/* SCORE LABEL */}
                        <div className="score-label">
                            {(hoveredScore || score) === 1 && "😞 Très mauvais"}
                            {(hoveredScore || score) === 2 && "😐 Passable"}
                            {(hoveredScore || score) === 3 && "🙂 Bien"}
                            {(hoveredScore || score) === 4 && "😊 Très bien"}
                            {(hoveredScore || score) === 5 && "🤩 Excellent !"}
                            {(hoveredScore || score) === 0 && "Sélectionnez une note"}
                        </div>

                        {/* COMMENT */}
                        <textarea
                            className="comment-box"
                            rows={3}
                            placeholder="Laissez un commentaire (optionnel)..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeRatingModal}>Annuler</button>
                            <button
                                className="submit-btn"
                                onClick={submitRating}
                                disabled={score === 0 || submitting}
                            >
                                {submitting ? "Envoi..." : "✅ Envoyer mon avis"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVBAR */}
            <nav className="navbar">
                <Link to="/restaurants" className="logo">🌿 Fresh Bites</Link>
                <div className="nav-actions">
                    <Link to="/restaurants" className="nav-btn btn-outline">🍴 Restaurants</Link>
                    <Link to="/cart" className="nav-btn btn-outline">🛒 Cart</Link>
                    <button className="nav-btn btn-logout" onClick={() => { logout(); navigate("/"); }}>🚪 Logout</button>
                </div>
            </nav>

            <div className="hero">
                <div className="hero-inner">
                    <h1 className="hero-title">📦 Mes Commandes</h1>
                    <p className="hero-subtitle">Suivez et gérez toutes vos commandes</p>
                </div>
            </div>

            <div className="filters">
                <div className="filters-inner">
                    {filters.map(f => (
                        <button key={f.id} className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                            onClick={() => setActiveFilter(f.id)}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading">
                    <span className="spinner">📦</span>
                    <p>Chargement des commandes...</p>
                </div>
            ) : (
                <div className="content">
                    {/* STATS */}
                    <div className="stats">
                        <div className="stat-card">
                            <div className="stat-emoji">📦</div>
                            <div className="stat-number">{orders.length}</div>
                            <div className="stat-label">Total commandes</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-emoji">✅</div>
                            <div className="stat-number">{orders.filter(o => o.status === "DELIVERED").length}</div>
                            <div className="stat-label">Livrées</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-emoji">🛵</div>
                            <div className="stat-number">{orders.filter(o => o.status === "IN_DELIVERY").length}</div>
                            <div className="stat-label">En livraison</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-emoji">💰</div>
                            <div className="stat-number">
                                {orders.filter(o => o.status === "DELIVERED")
                                    .reduce((sum, o) => sum + o.totalPrice, 0).toFixed(1)} DT
                            </div>
                            <div className="stat-label">Total dépensé</div>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty">
                            <span className="empty-emoji">📭</span>
                            <h2 className="empty-title">Aucune commande</h2>
                            <p className="empty-subtitle">Vous n'avez pas encore de commandes</p>
                            <Link to="/restaurants" className="browse-btn">🍴 Commander maintenant</Link>
                        </div>
                    ) : (
                        filtered.map((order, index) => {
                            const status = getStatusColor(order.status);
                            const isDelivered = order.status === "DELIVERED";
                            const alreadyRated = ratedOrders[order.restaurantId];

                            return (
                                <div key={order.id} className="order-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="order-header">
                                        <div className="order-left">
                                            <div className="order-emoji">{order.restaurantEmoji}</div>
                                            <div>
                                                <div className="order-id">Commande #{order.id}</div>
                                                <div className="order-restaurant">{order.restaurantName}</div>
                                                <div className="order-date">📅 {order.createdAt}</div>
                                            </div>
                                        </div>
                                        <div className="status-badge" style={{ background: status.bg, color: status.color }}>
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="order-item">
                                                <span className="order-item-name">x{item.quantity} {item.name}</span>
                                                <span>{(item.price * item.quantity).toFixed(3)} DT</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-address">📍 {order.address}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                            <div className="order-total">{order.totalPrice.toFixed(3)} DT</div>
                                            <div className="order-actions">
                                                {/* TRACK BUTTON */}
                                                {order.deliveryId && order.status !== "CANCELLED" && (
                                                    <button className="track-btn"
                                                        onClick={() => navigate(`/track/${order.deliveryId}`)}>
                                                        📍 Suivre
                                                    </button>
                                                )}

                                                {/* RATE BUTTON — only for delivered orders */}
                                                {isDelivered && (
                                                    alreadyRated
                                                        ? <div className="rated-badge">⭐ Noté</div>
                                                        : <button className="rate-btn"
                                                            onClick={() => openRatingModal(order.id, order.restaurantId)}>
                                                            ⭐ Noter
                                                          </button>
                                                )}

                                                <button className="reorder-btn"
                                                    onClick={() => navigate("/restaurants")}>
                                                    🔄 Recommander
                                                </button>
                                            </div>
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
