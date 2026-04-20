import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getRestaurants } from "../../api/userApi";
import { getRestaurantVisuals } from "../../utils/catalogDisplay";

const fruitPositions = Array.from({ length: 8 }, (_, i) => ({
  top: `${(i * 37 + 13) % 100}%`,
  left: `${(i * 53 + 7) % 100}%`,
  fontSize: `${25 + ((i * 7) % 30)}px`,
  duration: `${5 + ((i * 3) % 10)}s`,
  delay: `${(i * 1.5) % 5}s`,
}));

const categories = [
  { id: "all", label: "All", emoji: "🍽️" },
  { id: "poulet", label: "Poulet", emoji: "🍗" },
  { id: "pates", label: "Pates", emoji: "🍝" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "sandwich", label: "Sandwich", emoji: "🥪" },
  { id: "dessert", label: "Dessert", emoji: "🍰" },
  { id: "salade", label: "Salade", emoji: "🥗" },
  { id: "burger", label: "Burger", emoji: "🍔" },
];

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [liked, setLiked] = useState({});

  const { token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getRestaurants(token);
      if (!Array.isArray(data) || data.length === 0) {
        setRestaurants([]);
        setError("No restaurants found in the repository-backed services.");
        return;
      }

      const normalized = data.map((restaurant) => ({
        ...restaurant,
        ...getRestaurantVisuals(restaurant),
      }));
      setRestaurants(normalized);
    } catch (err) {
      setRestaurants([]);
      setError("Unable to load restaurants from the backend.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return restaurants.filter((restaurant) => {
      const matchSearch = restaurant.name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "all" || restaurant.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [restaurants, search, activeCategory]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleLike = (event, id) => {
    event.stopPropagation();
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #f7efe6; }

        @keyframes floatFruit {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }

        .floating-fruits {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none; z-index: 1; overflow: hidden;
        }
        .fruit {
          position: absolute; opacity: 0.06;
          animation: floatFruit var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }

        .navbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 60px; background: white;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          position: sticky; top: 0; z-index: 100;
        }
        .logo {
          font-size: 20px; font-weight: 700; color: #4caf50;
          text-decoration: none; display: flex; align-items: center; gap: 8px;
        }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .nav-btn {
          padding: 9px 18px; border-radius: 20px; border: none;
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.3s ease; text-decoration: none;
          display: flex; align-items: center; gap: 6px;
        }
        .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
        .btn-outline:hover { background: #f27405; color: white; }
        .btn-primary { background: #f27405; color: white; }
        .btn-primary:hover { background: #e06600; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(242,116,5,0.3); }
        .btn-logout { background: transparent; border: 1.5px solid #ddd; color: #666; }
        .btn-logout:hover { background: #ff5252; color: white; border-color: #ff5252; }

        .hero {
          background: linear-gradient(135deg, #fff8f0, #fff3e8);
          padding: 50px 60px 30px;
          position: relative; z-index: 10;
        }
        .hero-content {
          max-width: 1200px; margin: 0 auto;
          animation: fadeInUp 0.8s ease;
        }
        .hero-title {
          font-size: 36px; font-weight: 800; color: #3a2e2a;
          margin-bottom: 8px;
        }
        .hero-title span { color: #f27405; }
        .hero-subtitle { color: #888; font-size: 15px; margin-bottom: 25px; }

        .search-bar {
          display: flex; align-items: center; gap: 15px;
          max-width: 600px;
        }
        .search-wrapper { position: relative; flex: 1; }
        .search-input {
          width: 100%; padding: 14px 50px 14px 20px;
          border-radius: 50px; border: 2px solid #ffe0c8;
          font-size: 14px; outline: none; transition: all 0.3s ease;
          background: white; box-shadow: 0 5px 20px rgba(242,116,5,0.1);
        }
        .search-input:focus { border-color: #f27405; box-shadow: 0 5px 25px rgba(242,116,5,0.2); }

        .categories {
          background: white; padding: 20px 60px;
          border-bottom: 1px solid #f0e8e0;
          position: sticky; top: 65px; z-index: 99;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .categories-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; gap: 12px; overflow-x: auto;
          padding-bottom: 5px;
        }
        .categories-inner::-webkit-scrollbar { display: none; }
        .cat-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 50px; border: none;
          cursor: pointer; font-size: 14px; font-weight: 600;
          white-space: nowrap; transition: all 0.3s ease;
          background: #f7f0e8; color: #6c5f5b;
        }
        .cat-btn:hover { background: #ffe3c5; color: #f27405; transform: translateY(-2px); }
        .cat-btn.active {
          background: #f27405; color: white;
          box-shadow: 0 5px 15px rgba(242,116,5,0.3);
          transform: translateY(-2px);
        }
        .cat-emoji { font-size: 18px; }

        .container {
          max-width: 1200px; margin: 0 auto;
          padding: 35px 60px 60px;
          position: relative; z-index: 10;
        }
        .section-header {
          display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 25px;
        }
        .section-title {
          font-size: 20px; font-weight: 700; color: #3a2e2a;
          display: flex; align-items: center; gap: 10px;
        }
        .count-badge {
          background: #ffe3c5; color: #f27405;
          padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 25px;
        }

        .restaurant-card {
          background: white; border-radius: 20px;
          overflow: hidden; cursor: pointer;
          box-shadow: 0 5px 20px rgba(0,0,0,0.07);
          transition: all 0.35s ease;
          animation: fadeInUp 0.5s ease;
          position: relative;
        }
        .restaurant-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(242,116,5,0.18);
        }
        .card-img-wrapper { position: relative; overflow: hidden; height: 190px; }
        .card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .restaurant-card:hover .card-img { transform: scale(1.08); }

        .like-btn {
          position: absolute; top: 12px; right: 12px;
          width: 36px; height: 36px; border-radius: 50%;
          background: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          transition: all 0.3s ease; z-index: 5;
        }
        .like-btn:hover { transform: scale(1.15); }
        .like-btn.liked { animation: heartPop 0.3s ease; }

        .promo-badge {
          position: absolute; top: 12px; left: 12px;
          background: #f27405; color: white;
          padding: 4px 10px; border-radius: 10px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
        }

        .card-body { padding: 18px; }
        .card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 8px;
        }
        .card-name { font-size: 17px; font-weight: 700; color: #3a2e2a; }
        .rating-badge {
          display: flex; align-items: center; gap: 4px;
          background: #f0fff4; color: #2e7d32;
          padding: 4px 10px; border-radius: 10px;
          font-size: 12px; font-weight: 700;
        }
        .card-meta {
          display: flex; gap: 12px; margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .meta-tag {
          display: flex; align-items: center; gap: 4px;
          color: #888; font-size: 12px;
        }
        .card-tags { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .tag {
          background: #fff3e8; color: #f27405;
          padding: 4px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
        }
        .card-footer {
          display: flex; justify-content: space-between; align-items: center;
          border-top: 1px solid #f5f0ec; padding-top: 12px;
        }
        .card-address {
          color: #aaa; font-size: 11px; max-width: 150px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .view-btn {
          background: #f27405; color: white; border: none;
          padding: 8px 16px; border-radius: 20px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.3s ease;
        }
        .view-btn:hover { background: #e06600; transform: scale(1.05); }

        .loading, .empty {
          text-align: center; padding: 80px 20px; position: relative; z-index: 10;
        }
        .spinner { font-size: 50px; animation: spin 1s linear infinite; display: block; margin-bottom: 20px; }
        .empty-emoji { font-size: 60px; margin-bottom: 15px; }
        .empty-text { color: #888; font-size: 16px; }
        .error-text { color: #d84315; margin-top: 10px; }
      `}</style>

      <div className="floating-fruits">
        {fruitPositions.map((pos, index) => (
          <div
            key={index}
            className="fruit"
            style={{
              top: pos.top,
              left: pos.left,
              fontSize: pos.fontSize,
              "--duration": pos.duration,
              "--delay": pos.delay,
            }}
          >
            🍊
          </div>
        ))}
      </div>

      <nav className="navbar">
        <Link to="/restaurants" className="logo">🌿 Fresh Bites</Link>
        <div className="nav-actions">
          <Link to="/my-orders" className="nav-btn btn-outline">📦 My Orders</Link>
          <Link to="/cart" className="nav-btn btn-primary">🛒 Cart</Link>
          <button className="nav-btn btn-logout" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            What are you <span>craving</span> today?
          </h1>
          <p className="hero-subtitle">
            {restaurants.length} restaurants available from backend data
          </p>
          <div className="search-bar">
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="categories">
        <div className="categories-inner">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`cat-btn ${activeCategory === category.id ? "active" : ""}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="cat-emoji">{category.emoji}</span>
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <span className="spinner">🍽️</span>
          <p>Loading restaurants...</p>
        </div>
      ) : (
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              🍴 Restaurants
              <span className="count-badge">{filtered.length} found</span>
            </div>
          </div>

          {error && filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-emoji">🔎</div>
              <p className="empty-text">No restaurants available right now.</p>
              <p className="error-text">{error}</p>
            </div>
          ) : (
            <div className="grid">
              {filtered.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="restaurant-card"
                  onClick={() => navigate(`/restaurants/${restaurant.id}/menu`)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="card-img-wrapper">
                    <img src={restaurant.image} alt={restaurant.name} className="card-img" />

                    <button
                      className={`like-btn ${liked[restaurant.id] ? "liked" : ""}`}
                      onClick={(event) => toggleLike(event, restaurant.id)}
                    >
                      {liked[restaurant.id] ? "❤️" : "🤍"}
                    </button>

                    {index % 3 === 0 && <div className="promo-badge">POPULAR</div>}
                  </div>

                  <div className="card-body">
                    <div className="card-top">
                      <h3 className="card-name">{restaurant.name}</h3>
                      <div className="rating-badge">⭐ {restaurant.rating}%</div>
                    </div>

                    <div className="card-meta">
                      <span className="meta-tag">⏱️ {restaurant.time}</span>
                      <span className="meta-tag">💰 {restaurant.price}</span>
                      <span className="meta-tag">👥 +{restaurant.reviews} reviews</span>
                    </div>

                    <div className="card-tags">
                      <span className="tag">🍴 {restaurant.cuisine}</span>
                      {restaurant.category !== "all" && (
                        <span className="tag">
                          {categories.find((item) => item.id === restaurant.category)?.emoji}{" "}
                          {restaurant.category}
                        </span>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="card-address">📍 {restaurant.address || "Address not found"}</span>
                      <button className="view-btn">View Menu →</button>
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
