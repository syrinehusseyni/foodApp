import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../../context/AuthContext";
import { createDelivery, getMenuByRestaurant, placeOrder } from "../../api/userApi";

const TUNIS_CENTER = [36.8065, 10.1815];

const mapPinIcon = divIcon({
  className: "delivery-map-pin-wrapper",
  html: '<div class="delivery-map-pin"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function MapViewport({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function MapPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(TUNIS_CENTER);
  const [mapCenter, setMapCenter] = useState(TUNIS_CENTER);
  const [locationLabel, setLocationLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [deliveryId, setDeliveryId] = useState(null);
  const [cartWarning, setCartWarning] = useState("");

  const { token, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const persistCart = (nextCart) => {
    setCart(nextCart);
    if (nextCart.length === 0) {
      localStorage.removeItem("cart");
      return;
    }
    localStorage.setItem("cart", JSON.stringify(nextCart));
  };

  const updateQty = (menuItemId, delta) => {
    const nextCart = cart
      .map((item) =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    persistCart(nextCart);
  };

  const removeItem = (menuItemId, itemName) => {
    const nextCart = cart.filter(
      (item) => !(item.menuItemId === menuItemId && item.name === itemName)
    );
    persistCart(nextCart);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const restaurantIds = useMemo(
    () => [...new Set(cart.map((item) => Number(item.restaurantId)).filter(Boolean))],
    [cart]
  );
  const restaurantId = restaurantIds.length === 1 ? restaurantIds[0] : null;
  const addressPreview = useMemo(() => {
    const [lat, lng] = selectedPosition;
    const parts = [address.trim()];

    if (locationLabel && locationLabel !== address.trim()) {
      parts.push(locationLabel.split(",").slice(0, 3).join(",").trim());
    }

    parts.push(`Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`);

    const compact = parts.filter(Boolean).join(" | ");
    return compact.length > 240 ? `${compact.slice(0, 237)}...` : compact;
  }, [address, locationLabel, selectedPosition]);
  const isDeliveryReady = Boolean(address.trim() && selectedPosition && restaurantIds.length === 1);

  const validateCartAvailability = async (items = cart) => {
    if (!token || !items.length) {
      setCartWarning("");
      return items;
    }

    const uniqueRestaurantIds = [
      ...new Set(items.map((item) => Number(item.restaurantId)).filter(Boolean)),
    ];

    if (uniqueRestaurantIds.length !== 1) {
      setCartWarning("");
      return items;
    }

    const latestMenu = await getMenuByRestaurant(token, uniqueRestaurantIds[0]);
    const availabilityById = new Map(
      Array.isArray(latestMenu)
        ? latestMenu.map((item) => [Number(item.id), item.available !== false])
        : []
    );

    const removedItems = items.filter(
      (item) => availabilityById.get(Number(item.menuItemId)) !== true
    );

    if (removedItems.length === 0) {
      setCartWarning("");
      return items;
    }

    const nextCart = items.filter(
      (item) => availabilityById.get(Number(item.menuItemId)) === true
    );
    persistCart(nextCart);
    setCartWarning(
      `Removed unavailable item${removedItems.length > 1 ? "s" : ""}: ${removedItems
        .map((item) => item.name)
        .join(", ")}.`
    );

    if (nextCart.length === 0) {
      setStep(1);
    }

    return nextCart;
  };

  useEffect(() => {
    validateCartAvailability().catch(() => {
      setCartWarning("We couldn't refresh item availability. Please try again.");
    });
  }, [token, restaurantId]);

  const reverseGeocode = async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    if (!response.ok) {
      throw new Error("Unable to fetch address for that map point.");
    }
    const data = await response.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  };

  const updateSelectedPosition = async (nextPosition, keepAddress = false) => {
    setSelectedPosition(nextPosition);
    setMapCenter(nextPosition);

    try {
      const label = await reverseGeocode(nextPosition[0], nextPosition[1]);
      setLocationLabel(label);
      if (!keepAddress) {
        setAddress(label);
      }
    } catch (error) {
      setLocationLabel(`${nextPosition[0].toFixed(5)}, ${nextPosition[1].toFixed(5)}`);
    }
  };

  const searchAddressOnMap = async () => {
    if (!address.trim()) return;

    setSearchingAddress(true);
    try {
      const query = encodeURIComponent(`${address.trim()}, Tunis, Tunisia`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`
      );
      if (!response.ok) {
        throw new Error("Unable to search this address right now.");
      }

      const results = await response.json();
      if (!results.length) {
        throw new Error("No map result found for this address.");
      }

      const nextPosition = [Number(results[0].lat), Number(results[0].lon)];
      setSelectedPosition(nextPosition);
      setMapCenter(nextPosition);
      setLocationLabel(results[0].display_name || address.trim());
    } catch (error) {
      alert(error.message || "Address search failed.");
    } finally {
      setSearchingAddress(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextPosition = [position.coords.latitude, position.coords.longitude];
        updateSelectedPosition(nextPosition).finally(() => {
          setLocating(false);
        });
      },
      () => {
        setLocating(false);
        alert("We couldn't access your location. You can still search or place the pin manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handlePlaceOrder = async () => {
    if (!isDeliveryReady) return;

    if (!token || !userId) {
      alert("Your session has expired. Please log in again.");
      navigate("/");
      return;
    }

    const validatedCart = await validateCartAvailability();

    if (validatedCart.length === 0) {
      alert("Some items are no longer available and were removed from your cart.");
      return;
    }

    if (!restaurantId) {
      alert("Your cart must contain valid items from one restaurant only.");
      return;
    }

    setLoading(true);
    try {
      const order = await placeOrder(token, {
        customerId: Number(userId),
        restaurantId,
        orderItems: validatedCart.map((item) => ({
          menuItemId: Number(item.menuItemId),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      });

      if (!order?.id) {
        alert(order?.message || "Failed to place order. Please try again.");
        return;
      }

      setOrderId(order.id);

      const delivery = await createDelivery(token, {
        orderId: order.id,
        userId: Number(userId),
        deliveryAddress: addressPreview,
      });

      if (delivery?.id) {
        setDeliveryId(delivery.id);
      }

      clearCart();
      setStep(3);
    } catch (error) {
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Poppins', sans-serif; background: #f7efe6; }

        .navbar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 15px 60px; background: white;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          position: sticky; top: 0; z-index: 100;
        }
        .logo { font-size: 20px; font-weight: 700; color: #4caf50; text-decoration: none; }
        .nav-actions { display: flex; gap: 12px; align-items: center; }
        .nav-btn {
          padding: 9px 18px; border-radius: 20px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all 0.3s ease;
          text-decoration: none; display: flex; align-items: center; gap: 6px;
        }
        .btn-outline { background: transparent; border: 1.5px solid #f27405; color: #f27405; }
        .btn-outline:hover { background: #f27405; color: white; }

        .content { max-width: 1120px; margin: 0 auto; padding: 40px 24px 80px; }
        .steps { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; color: #8b7d76; font-weight: 600; }
        .step-pill { padding: 8px 14px; border-radius: 999px; background: #f0e8e0; }
        .step-pill.active { background: #f27405; color: white; }

        .card {
          background: white; border-radius: 22px; padding: 24px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.08); margin-bottom: 20px;
        }
        .card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f0e8e0;
        }
        .title { font-size: 22px; font-weight: 800; color: #3a2e2a; }
        .muted { color: #8b7d76; }
        .clear-btn {
          background: none; border: 1px solid #ffd0d0; color: #d66161;
          padding: 8px 14px; border-radius: 999px; cursor: pointer; font-weight: 600;
        }

        .cart-item {
          display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px;
          align-items: center; padding: 16px 0; border-bottom: 1px solid #f5f0ec;
        }
        .cart-item:last-child { border-bottom: none; }
        .item-name { font-weight: 700; color: #3a2e2a; margin-bottom: 4px; }
        .item-price-unit { color: #9f948c; font-size: 13px; }
        .qty-control { display: flex; align-items: center; gap: 10px; }
        .qty-btn {
          width: 32px; height: 32px; border: none; border-radius: 50%;
          cursor: pointer; font-size: 18px; font-weight: 700;
        }
        .qty-minus { background: #f0f0f0; color: #666; }
        .qty-plus { background: #f27405; color: white; }
        .item-total { min-width: 90px; text-align: right; font-weight: 800; color: #f27405; }
        .remove-btn { background: none; border: none; cursor: pointer; color: #d66161; font-size: 18px; }

        .summary-row, .summary-total {
          display: flex; justify-content: space-between; padding: 10px 0;
        }
        .summary-total {
          margin-top: 12px; padding-top: 16px; border-top: 2px solid #f0e8e0;
          font-size: 20px; font-weight: 800; color: #3a2e2a;
        }
        .total-price { color: #f27405; }

        .primary-btn, .secondary-btn {
          width: 100%; border: none; border-radius: 999px; padding: 16px;
          font-weight: 800; cursor: pointer; text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .primary-btn { background: linear-gradient(135deg, #f27405, #e06600); color: white; margin-top: 18px; }
        .secondary-btn { background: white; color: #f27405; border: 1.5px solid #f27405; margin-top: 10px; }

        .warning {
          background: #fff3e8; color: #b45810; border: 1px solid #ffd3ad;
          padding: 12px 14px; border-radius: 14px; margin-bottom: 18px;
        }
        .delivery-layout {
          display: grid; grid-template-columns: 380px minmax(0, 1fr); gap: 20px; margin-top: 20px;
        }
        .delivery-panel {
          border: 1px solid #f2e3d6; border-radius: 24px; overflow: hidden;
          background: linear-gradient(180deg, #fffaf6, #fff);
          box-shadow: 0 16px 36px rgba(114, 74, 31, 0.08);
        }
        .delivery-hero {
          padding: 22px 22px 18px;
          background:
            radial-gradient(circle at top left, rgba(242,116,5,0.2), transparent 34%),
            linear-gradient(135deg, #3a2e2a, #6a4a2f 58%, #f27405 130%);
          color: white;
        }
        .delivery-kicker { font-size: 12px; text-transform: uppercase; letter-spacing: 0.14em; opacity: 0.72; }
        .delivery-headline { font-size: 28px; font-weight: 900; margin-top: 8px; line-height: 1.15; }
        .delivery-subtitle { margin-top: 8px; color: rgba(255,255,255,0.82); line-height: 1.55; }
        .delivery-body { padding: 22px; }
        .delivery-field { display: flex; flex-direction: column; gap: 8px; }
        .field-label { font-size: 12px; font-weight: 800; color: #7f6654; text-transform: uppercase; letter-spacing: 0.08em; }
        .field-input {
          width: 100%; border-radius: 16px; border: 1.5px solid #eadacc; background: white;
          padding: 14px 16px; font-size: 14px; color: #3a2e2a; transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .field-input:focus { outline: none; border-color: #f27405; box-shadow: 0 0 0 4px rgba(242,116,5,0.12); }
        .delivery-search-row { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
        .search-btn {
          border: none; border-radius: 16px; background: #f27405; color: white;
          padding: 0 18px; font-weight: 800; cursor: pointer;
        }
        .search-btn:disabled { opacity: 0.65; cursor: wait; }
        .map-shell {
          position: relative; min-height: 500px; border-radius: 28px; overflow: hidden;
          border: 1px solid #efdece; box-shadow: 0 18px 38px rgba(58,46,42,0.08);
        }
        .map-title {
          position: absolute; top: 18px; left: 18px; z-index: 500;
          background: rgba(255,255,255,0.9); color: #4f3d33;
          padding: 12px 14px; border-radius: 18px; backdrop-filter: blur(10px);
          box-shadow: 0 10px 24px rgba(58,46,42,0.1);
        }
        .map-title strong { display: block; font-size: 15px; }
        .map-title span { display: block; font-size: 12px; color: #8b7d76; margin-top: 4px; }
        .map-actions {
          position: absolute; right: 16px; top: 16px; z-index: 500;
          display: flex; gap: 10px;
        }
        .map-action-btn {
          border: none; border-radius: 999px; padding: 12px 14px; font-weight: 800;
          background: rgba(58,46,42,0.88); color: white; cursor: pointer;
          box-shadow: 0 10px 24px rgba(58,46,42,0.18);
        }
        .map-action-btn.alt { background: rgba(255,255,255,0.92); color: #4f3d33; }
        .leaflet-map { width: 100%; height: 500px; z-index: 1; }
        .delivery-map-pin-wrapper { background: transparent; border: none; }
        .delivery-map-pin {
          width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
          background: #f27405; transform: rotate(-45deg);
          box-shadow: 0 10px 22px rgba(242,116,5,0.35);
          position: relative;
        }
        .delivery-map-pin::after {
          content: ""; width: 12px; height: 12px; border-radius: 50%;
          background: white; position: absolute; top: 8px; left: 8px;
        }
        .map-preview {
          margin-top: 16px; background: #fff8f1; border: 1px solid #f3dbc7;
          border-radius: 18px; padding: 16px;
        }
        .map-preview-label { font-size: 12px; font-weight: 800; color: #9b7658; text-transform: uppercase; letter-spacing: 0.08em; }
        .map-preview-text { margin-top: 8px; color: #4f3d33; font-weight: 600; line-height: 1.6; }
        .delivery-meta {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px;
        }
        .meta-card {
          background: #fff; border: 1px solid #f1e2d4; border-radius: 18px; padding: 14px;
        }
        .meta-label { font-size: 11px; font-weight: 800; color: #9b7658; text-transform: uppercase; letter-spacing: 0.08em; }
        .meta-value { margin-top: 6px; color: #3a2e2a; font-weight: 800; }

        .empty { text-align: center; padding: 80px 20px; }
        .empty-title { font-size: 24px; font-weight: 800; color: #3a2e2a; margin-bottom: 10px; }
        .browse-btn {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 18px;
          padding: 14px 28px; border-radius: 999px; background: #f27405; color: white;
          text-decoration: none; font-weight: 700;
        }

        .success-card { text-align: center; }
        .success-title { font-size: 28px; font-weight: 900; color: #3a2e2a; margin-bottom: 8px; }
        .success-info { margin-top: 18px; background: #f9f5f0; border-radius: 16px; padding: 18px; text-align: left; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ece2d8; }
        .info-row:last-child { border-bottom: none; }

        @media (max-width: 900px) {
          .delivery-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 720px) {
          .navbar { padding: 15px 20px; }
          .content { padding: 24px 16px 60px; }
          .cart-item { grid-template-columns: 1fr; }
          .item-total { text-align: left; }
          .steps { flex-wrap: wrap; }
          .delivery-search-row, .delivery-meta { grid-template-columns: 1fr; }
          .map-actions { left: 16px; right: 16px; top: auto; bottom: 16px; justify-content: space-between; }
          .map-shell, .leaflet-map { min-height: 360px; height: 360px; }
        }
      `}</style>

      <nav className="navbar">
        <Link to="/restaurants" className="logo">Fresh Bites</Link>
        <div className="nav-actions">
          <Link to="/restaurants" className="nav-btn btn-outline">Restaurants</Link>
          <Link to="/my-orders" className="nav-btn btn-outline">My Orders</Link>
        </div>
      </nav>

      <div className="content">
        {step < 3 && (
          <div className="steps">
            <span className={`step-pill ${step >= 1 ? "active" : ""}`}>1. Cart</span>
            <span className={`step-pill ${step >= 2 ? "active" : ""}`}>2. Delivery</span>
            <span className={`step-pill ${step >= 3 ? "active" : ""}`}>3. Confirmation</span>
          </div>
        )}

        {step === 1 && cart.length === 0 && (
          <div className="empty card">
            <div className="empty-title">Your cart is empty</div>
            <p className="muted">Add a few items from a real restaurant menu to start an order.</p>
            <Link to="/restaurants" className="browse-btn">Browse restaurants</Link>
          </div>
        )}

        {step === 1 && cart.length > 0 && (
          <>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="title">My Cart</div>
                  <div className="muted">{totalItems} items</div>
                </div>
                <button className="clear-btn" onClick={clearCart}>Clear</button>
              </div>

              {restaurantIds.length > 1 && (
                <div className="warning">
                  Your cart has items from multiple restaurants. Please remove some items before checkout.
                </div>
              )}

              {cartWarning && <div className="warning">{cartWarning}</div>}

              {cart.map((item) => (
                <div key={`${item.menuItemId}-${item.name}`} className="cart-item">
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-price-unit">{Number(item.price).toFixed(3)} DT / unit</div>
                  </div>
                  <div className="qty-control">
                    <button className="qty-btn qty-minus" onClick={() => updateQty(item.menuItemId, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn qty-plus" onClick={() => updateQty(item.menuItemId, 1)}>+</button>
                  </div>
                  <div className="item-total">{(item.price * item.quantity).toFixed(3)} DT</div>
                  <button className="remove-btn" onClick={() => removeItem(item.menuItemId, item.name)}>x</button>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="summary-row">
                <span className="muted">Subtotal</span>
                <span>{totalPrice.toFixed(3)} DT</span>
              </div>
              <div className="summary-row">
                <span className="muted">Delivery</span>
                <span style={{ color: "#4caf50", fontWeight: "700" }}>Free</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="total-price">{totalPrice.toFixed(3)} DT</span>
              </div>
              <button className="primary-btn" onClick={() => setStep(2)}>Continue to delivery</button>
              <Link to="/restaurants" className="secondary-btn">Continue shopping</Link>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="card">
            <div className="title">Delivery Address</div>
            <p className="muted" style={{ marginTop: "8px" }}>
              Type the address and select the exact delivery point on the live map.
            </p>

            {restaurantIds.length > 1 && (
              <div className="warning">
                Checkout is disabled until the cart contains items from only one restaurant.
              </div>
            )}

            {cartWarning && <div className="warning">{cartWarning}</div>}

            <div className="delivery-layout">
              <div className="delivery-panel">

                <div className="delivery-body">
                  <div className="delivery-field">
                    <label className="field-label">Delivery Address</label>
                    <div className="delivery-search-row">
                      <input
                        className="field-input"
                        placeholder="Search a real address in Tunis"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            searchAddressOnMap();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="search-btn"
                        onClick={searchAddressOnMap}
                        disabled={searchingAddress || !address.trim()}
                      >
                        {searchingAddress ? "Searching..." : "Find"}
                      </button>
                    </div>
                  </div>

                  <div className="map-preview">
                    <div className="map-preview-label">Pinned Address</div>
                    <div className="map-preview-text">
                      {locationLabel || "No exact point selected yet. Search an address or click the map."}
                    </div>
                  </div>

                  <div className="delivery-meta">
                    <div className="meta-card">
                      <div className="meta-label">Status</div>
                      <div className="meta-value">{isDeliveryReady ? "Ready to dispatch" : "Need address + pin"}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Latitude</div>
                      <div className="meta-value">{selectedPosition[0].toFixed(5)}</div>
                    </div>
                    <div className="meta-card">
                      <div className="meta-label">Longitude</div>
                      <div className="meta-value">{selectedPosition[1].toFixed(5)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="map-shell">
                  <div className="map-title">
                    <strong>OpenStreetMap Picker</strong>
                    <span>Click anywhere or drag the pin to set the exact delivery point</span>
                  </div>

                  <div className="map-actions">
                    <button type="button" className="map-action-btn" onClick={useCurrentLocation}>
                      {locating ? "Locating..." : "Use my location"}
                    </button>
                    <button
                      type="button"
                      className="map-action-btn alt"
                      onClick={() => {
                        setSelectedPosition(TUNIS_CENTER);
                        setMapCenter(TUNIS_CENTER);
                        setLocationLabel("");
                      }}
                    >
                      Reset map
                    </button>
                  </div>

                  <MapContainer center={mapCenter} zoom={13} scrollWheelZoom className="leaflet-map">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapViewport center={mapCenter} />
                    <MapPicker onPick={updateSelectedPosition} />
                    <Marker
                      position={selectedPosition}
                      icon={mapPinIcon}
                      draggable
                      eventHandlers={{
                        dragend: (event) => {
                          const latlng = event.target.getLatLng();
                          updateSelectedPosition([latlng.lat, latlng.lng]);
                        },
                      }}
                    />
                  </MapContainer>
                </div>


              </div>
            </div>

            <button
              className="primary-btn"
              onClick={handlePlaceOrder}
              disabled={loading || !isDeliveryReady || restaurantIds.length !== 1}
            >
              {loading ? "Placing order..." : `Confirm order - ${totalPrice.toFixed(3)} DT`}
            </button>
            <button className="secondary-btn" onClick={() => setStep(1)}>Back to cart</button>
          </div>
        )}

        {step === 3 && (
          <div className="card success-card">
            <div className="success-title">Order confirmed</div>
            <p className="muted">Your restaurant has received the order.</p>

            <div className="success-info">
              <div className="info-row">
                <span>Order ID</span>
                <strong>#{orderId}</strong>
              </div>
              <div className="info-row">
                <span>Delivery ID</span>
                <strong>{deliveryId ? `#${deliveryId}` : "Pending assignment"}</strong>
              </div>
              <div className="info-row">
                <span>Address</span>
                <strong>{addressPreview}</strong>
              </div>
              <div className="info-row">
                <span>Status</span>
                <strong style={{ color: "#4caf50" }}>PLACED</strong>
              </div>
            </div>

            {deliveryId && (
              <button className="primary-btn" onClick={() => navigate(`/track/${deliveryId}`)}>
                Track delivery
              </button>
            )}
            <button className="secondary-btn" onClick={() => navigate("/restaurants")}>
              Continue ordering
            </button>
          </div>
        )}
      </div>
    </>
  );
}
