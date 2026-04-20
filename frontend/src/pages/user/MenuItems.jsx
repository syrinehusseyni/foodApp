import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMenuByRestaurant, getRestaurantById } from "../../api/userApi";
import {
  getMenuItemVisuals,
  getRestaurantVisuals,
} from "../../utils/catalogDisplay";

const fallbackRestaurant = {
  name: "Restaurant",
  address: "Address not found",
};

export default function MenuItems() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liked, setLiked] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSupplements, setSelectedSupplements] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);

  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const restaurantId = Number(id);

  useEffect(() => {
    fetchData();
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sheetOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [restaurantData, menuData] = await Promise.all([
        getRestaurantById(token, id),
        getMenuByRestaurant(token, id),
      ]);

      if (!restaurantData || !restaurantData.id) {
        throw new Error("Restaurant not found");
      }

      const visualRestaurant = getRestaurantVisuals(restaurantData);
      setRestaurant({
        ...fallbackRestaurant,
        ...visualRestaurant,
        ...restaurantData,
      });

      const normalizedMenu = Array.isArray(menuData)
        ? menuData.map((item, index) => {
            const visuals = getMenuItemVisuals(item);
            return {
              ...item,
              ...visuals,
              price: Number(item.price),
              ingredients: item.description || "Description not found",
              available: item.available ?? true,
              topSale: index < 2,
            };
          })
        : [];

      setMenuItems(normalizedMenu);

      if (normalizedMenu.length === 0) {
        setError("No menu items found for this restaurant.");
      }
    } catch (err) {
      setRestaurant({
        ...fallbackRestaurant,
        ...getRestaurantVisuals({ id: restaurantId, name: "Restaurant" }),
      });
      setMenuItems([]);
      setError("Unable to load this restaurant from the backend.");
    } finally {
      setLoading(false);
    }
  };

  const openSheet = (item) => {
    setSelectedItem(item);
    setSelectedSupplements([]);
    setItemQuantity(1);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedItem(null), 250);
  };

  const toggleSupplement = (supplement) => {
    setSelectedSupplements((prev) =>
      prev.find((item) => item.name === supplement.name)
        ? prev.filter((item) => item.name !== supplement.name)
        : [...prev, supplement]
    );
  };

  const getSheetTotal = () => {
    if (!selectedItem) return "0.000";
    const supplementTotal = selectedSupplements.reduce(
      (sum, supplement) => sum + supplement.price,
      0
    );
    return ((selectedItem.price + supplementTotal) * itemQuantity).toFixed(3);
  };

  const addToCartFromSheet = () => {
    if (!selectedItem) return;

    const supplementTotal = selectedSupplements.reduce(
      (sum, supplement) => sum + supplement.price,
      0
    );
    const itemPrice = selectedItem.price + supplementTotal;
    const nextItem = {
      menuItemId: selectedItem.id,
      name:
        selectedItem.name +
        (selectedSupplements.length > 0
          ? ` (+ ${selectedSupplements.map((item) => item.name).join(", ")})`
          : ""),
      price: itemPrice,
      quantity: itemQuantity,
      restaurantId,
    };

    let baseCart = cart;
    if (cart.length > 0 && cart.some((item) => item.restaurantId !== restaurantId)) {
      const shouldReplace = window.confirm(
        "Your cart contains items from another restaurant. Replace them?"
      );
      if (!shouldReplace) {
        return;
      }
      baseCart = [];
    }

    const existing = baseCart.find(
      (item) => item.menuItemId === selectedItem.id && item.name === nextItem.name
    );

    const updatedCart = existing
      ? baseCart.map((item) =>
          item.menuItemId === selectedItem.id && item.name === nextItem.name
            ? { ...item, quantity: item.quantity + itemQuantity }
            : item
        )
      : [...baseCart, nextItem];

    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    closeSheet();
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const topSales = useMemo(() => menuItems.filter((item) => item.available).slice(0, 2), [menuItems]);
  const resto = restaurant || {
    ...fallbackRestaurant,
    ...getRestaurantVisuals({ id: restaurantId, name: "Restaurant" }),
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #f7efe6; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pricePop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .navbar { display: flex; justify-content: space-between; align-items: center; padding: 15px 60px; background: white; box-shadow: 0 2px 20px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 200; }
        .logo { font-size: 20px; font-weight: 700; color: #4caf50; text-decoration: none; }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .nav-btn { padding: 9px 18px; border-radius: 20px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s ease; text-decoration: none; display: flex; align-items: center; gap: 6px; }
        .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
        .btn-outline:hover { background: #f27405; color: white; }
        .btn-logout { background: transparent; border: 1.5px solid #ddd; color: #666; }
        .btn-logout:hover { background: #ff5252; color: white; border-color: #ff5252; }
        .cart-btn { position: relative; background: #f27405; color: white; border: none; padding: 10px 20px; border-radius: 24px; cursor: pointer; font-size: 13px; font-weight: 700; }
        .cart-count { position: absolute; top: -8px; right: -6px; background: #ff5252; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }

        .hero { position: relative; height: 340px; overflow: hidden; }
        .hero-img { width: 100%; height: 100%; object-fit: cover; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.58)); display: flex; align-items: flex-end; }
        .hero-content { padding: 35px 60px 40px; color: white; width: 100%; }
        .hero-name { font-size: 42px; font-weight: 900; margin-bottom: 15px; }
        .hero-meta { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .hero-tag { background: rgba(255,255,255,0.16); backdrop-filter: blur(8px); padding: 10px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .hero-tag.free { color: #dfffe2; }
        .back-btn { position: absolute; top: 24px; left: 24px; z-index: 2; color: white; text-decoration: none; background: rgba(0,0,0,0.24); backdrop-filter: blur(10px); padding: 10px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
        .like-btn { background: rgba(255,255,255,0.2); border: none; color: white; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; font-size: 18px; backdrop-filter: blur(8px); }
        .like-btn.liked { animation: heartPop 0.3s ease; }

        .content { max-width: 1200px; margin: 0 auto; padding: 35px 60px 60px; }
        .section-title { font-size: 22px; font-weight: 800; color: #3a2e2a; margin-bottom: 18px; }
        .top-ventes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .top-card { background: white; border-radius: 18px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.07); transition: all 0.3s ease; animation: fadeInUp 0.5s ease; }
        .top-card:hover, .menu-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(242,116,5,0.15); }
        .top-card-img, .item-img { width: 100%; height: 180px; object-fit: cover; }
        .top-card-body, .item-body { padding: 16px; }
        .top-card-name, .item-name { font-size: 16px; font-weight: 700; color: #3a2e2a; }
        .top-sale-badge { background: #ffe3c5; color: #f27405; border-radius: 12px; padding: 4px 8px; font-size: 11px; font-weight: 700; }
        .top-card-ingredients, .item-ingredients { font-size: 12px; color: #888; line-height: 1.5; margin-top: 8px; min-height: 36px; }
        .top-card-footer, .item-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; }
        .top-card-price, .item-price { font-size: 16px; font-weight: 800; color: #f27405; }
        .add-btn-small, .plus-btn { background: #f27405; color: white; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: 700; }

        .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
.menu-card { background: white; border-radius: 16px; overflow: hidden; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.07); transition: all 0.3s ease; animation: fadeInUp 0.5s ease; border: 2px solid transparent; }
        .menu-card.unavailable { 
          opacity: 0.6 !important; 
          filter: grayscale(100%) brightness(0.9) !important; 
          pointer-events: none !important; 
          cursor: not-allowed !important; 
        }
        .item-img-wrapper { position: relative; height: 180px; overflow: hidden; background: #f7efe6; }
.unavailable-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; letter-spacing: 0.4px; }
        .unavailable-title { font-size: 16px; font-weight: 600; color: #bbb; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
        .menu-card.unavailable .item-name,
        .menu-card.unavailable .item-price,
        .menu-card.unavailable .item-ingredients,
        .menu-card.unavailable .item-body { 
          color: #999 !important; 
          filter: grayscale(100%) !important; 
        }

        .sheet-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(3px); animation: fadeIn 0.3s ease; }
        .bottom-sheet { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 24px 24px 0 0; z-index: 1000; max-height: 90vh; overflow-y: auto; animation: slideUp 0.4s cubic-bezier(0.32, 0.72, 0, 1); }
        .sheet-handle { width: 40px; height: 4px; background: #e0e0e0; border-radius: 2px; margin: 12px auto 0; cursor: pointer; }
        .sheet-img { width: 100%; height: 250px; object-fit: cover; }
        .sheet-body { padding: 25px; }
        .sheet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; gap: 16px; }
        .sheet-name { font-size: 22px; font-weight: 800; color: #3a2e2a; }
        .sheet-base-price { font-size: 20px; font-weight: 800; color: #f27405; }
        .sheet-ingredients { background: #f9f5f0; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
        .sheet-ingredients-title { font-size: 13px; font-weight: 700; color: #3a2e2a; margin-bottom: 8px; }
        .sheet-ingredients-text { font-size: 13px; color: #666; line-height: 1.6; }
        .supplements-title { font-size: 16px; font-weight: 800; color: #3a2e2a; margin-bottom: 15px; }
        .supplement-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f5f0ec; cursor: pointer; }
        .supplement-left { display: flex; align-items: center; gap: 12px; }
        .supplement-checkbox { width: 22px; height: 22px; border-radius: 6px; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; }
        .supplement-checkbox.checked { background: #f27405; border-color: #f27405; }
        .supplement-name { font-size: 14px; color: #3a2e2a; font-weight: 500; }
        .supplement-price { font-size: 14px; font-weight: 700; color: #f27405; }
        .sheet-footer { display: flex; align-items: center; gap: 15px; margin-top: 25px; padding-top: 20px; border-top: 2px solid #f0e8e0; }
        .qty-control { display: flex; align-items: center; gap: 12px; }
        .qty-btn { width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer; font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .qty-minus { background: #f0f0f0; color: #666; }
        .qty-plus { background: #f27405; color: white; }
        .qty-num { font-size: 18px; font-weight: 800; color: #3a2e2a; min-width: 25px; text-align: center; }
        .add-cart-btn { flex: 1; padding: 16px; border: none; border-radius: 50px; background: linear-gradient(135deg, #f27405, #e06600); color: white; font-size: 16px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .add-cart-price { background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 20px; font-size: 15px; font-weight: 900; animation: pricePop 0.3s ease; }

        .loading, .empty-state { text-align: center; padding: 80px 20px; }
        .spinner { font-size: 50px; animation: spin 1s linear infinite; display: block; margin-bottom: 20px; }
        .error-box { background: #fff3e8; border: 1px solid #ffd3ad; color: #b74d00; padding: 14px 18px; border-radius: 14px; margin-bottom: 20px; }
      `}</style>

      <nav className="navbar">
        <Link to="/restaurants" className="logo">🌿 Fresh Bites</Link>
        <div className="nav-actions">
          <Link to="/my-orders" className="nav-btn btn-outline">📦 My Orders</Link>
          <button className="cart-btn" onClick={() => navigate("/cart")}>
            🛒 Cart
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
          <button
            className="nav-btn btn-logout"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            🚪 Logout
          </button>
        </div>
      </nav>

      {loading ? (
        <div className="loading">
          <span className="spinner">🍽️</span>
          <p>Loading menu...</p>
        </div>
      ) : (
        <>
          <div className="hero">
            <img src={resto.image} alt={resto.name} className="hero-img" />
            <Link to="/restaurants" className="back-btn">← Back</Link>
            <div className="hero-overlay">
              <div className="hero-content">
                <h1 className="hero-name">{resto.name}</h1>
                <div className="hero-meta">
                  <button
                    className={`like-btn ${liked ? "liked" : ""}`}
                    onClick={() => setLiked((prev) => !prev)}
                  >
                    {liked ? "❤️" : "🤍"}
                  </button>
                  <span className="hero-tag">⭐ {resto.rating}%</span>
                  <span className="hero-tag">⏱️ {resto.time}</span>
                  <span className={`hero-tag ${resto.delivery === "Free" ? "free" : ""}`}>
                    🛵 Delivery: {resto.delivery === "Free" ? "Free" : resto.delivery}
                  </span>
                  <span className="hero-tag">📍 {resto.address || "Address not found"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content">
            {error && <div className="error-box">{error}</div>}

            {topSales.length > 0 && (
              <>
                <div className="section-title">🔥 Top Picks</div>
                <div className="top-ventes-grid">
                  {topSales.map((item, index) => (
                    <div
                      key={item.id}
                      className="top-card"
                      onClick={() => openSheet(item)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <img src={item.image} alt={item.name} className="top-card-img" />
                      <div className="top-card-body">
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "5px" }}>
                          <span className="top-card-name">{item.name}</span>
                          <span className="top-sale-badge">TOP</span>
                        </div>
                        <p className="top-card-ingredients">{item.ingredients}</p>
                        <div className="top-card-footer">
                          <span className="top-card-price">{item.price.toFixed(3)} DT</span>
                          <button
                            className="add-btn-small"
                            onClick={(event) => {
                              event.stopPropagation();
                              openSheet(item);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="section-title">🍴 Menu</div>
            <div className="menu-grid">
              {menuItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`menu-card ${!item.available ? "unavailable" : ""}`}
                  onClick={item.available ? () => openSheet(item) : undefined}
                  style={{ animationDelay: `${index * 0.08}s`, pointerEvents: item.available ? 'auto' : 'none' }}
                >
                  <div className="item-img-wrapper">
                    <img src={item.image} alt={item.name} className="item-img" />
                    {!item.available && <div className="unavailable-overlay"> </div>}
                  </div>
                  <div className="item-body">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-ingredients">{item.ingredients}</p>
                    <div className="item-footer">
                      <span className="item-price">{item.price.toFixed(3)} DT</span>
                      {item.available ? (
                        <button
                          className="plus-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            openSheet(item);
                          }}
                        >
                          +
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {sheetOpen && selectedItem && (
            <>
              <div className="sheet-overlay" onClick={closeSheet} />
              <div className="bottom-sheet">
                <div className="sheet-handle" onClick={closeSheet} />
                <img src={selectedItem.image} alt={selectedItem.name} className="sheet-img" />
                <div className="sheet-body">
                  <div className="sheet-header">
                    <h2 className="sheet-name">{selectedItem.name}</h2>
                    <span className="sheet-base-price">{selectedItem.price.toFixed(3)} DT</span>
                  </div>
                  <div className="sheet-ingredients">
                    <div className="sheet-ingredients-title">Ingredients</div>
                    <div className="sheet-ingredients-text">{selectedItem.ingredients}</div>
                  </div>

                  {selectedItem.supplements?.length > 0 && (
                    <>
                      <div className="supplements-title">Add-ons</div>
                      {selectedItem.supplements.map((supplement, index) => {
                        const isChecked = selectedSupplements.some(
                          (item) => item.name === supplement.name
                        );
                        return (
                          <div
                            key={`${supplement.name}-${index}`}
                            className="supplement-item"
                            onClick={() => toggleSupplement(supplement)}
                          >
                            <div className="supplement-left">
                              <div className={`supplement-checkbox ${isChecked ? "checked" : ""}`}>
                                {isChecked && <span style={{ color: "white", fontSize: "14px" }}>✓</span>}
                              </div>
                              <span className="supplement-name">{supplement.name}</span>
                            </div>
                            <span className="supplement-price">+ {supplement.price} DT</span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div className="sheet-footer">
                    <div className="qty-control">
                      <button className="qty-btn qty-minus" onClick={() => setItemQuantity((qty) => Math.max(1, qty - 1))}>−</button>
                      <span className="qty-num">{itemQuantity}</span>
                      <button className="qty-btn qty-plus" onClick={() => setItemQuantity((qty) => qty + 1)}>+</button>
                    </div>
                    <button className="add-cart-btn" onClick={addToCartFromSheet}>
                      🛒 Add
                      <span className="add-cart-price">{getSheetTotal()} DT</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
