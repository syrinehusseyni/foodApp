import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginUser } from "../../api/userApi";

const fruitPositions = Array.from({ length: 15 }, (_, i) => ({
    top: `${(i * 37 + 13) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    fontSize: `${30 + (i * 7) % 40}px`,
    duration: `${5 + (i * 3) % 10}s`,
    delay: `${(i * 1.5) % 5}s`,
    opacity: 0.1 + (i % 3) * 0.03
}));

const formFruitPositions = Array.from({ length: 8 }, (_, i) => ({
    top: `${(i * 43 + 17) % 100}%`,
    left: `${(i * 61 + 11) % 100}%`,
    delay: `${(i * 1.2) % 5}s`,
    rotate: `${(i * 45) % 360}deg`
}));

export default function UserLogin() {
    const [showForm, setShowForm] = useState(false);
    const [exploding, setExploding] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [particles, setParticles] = useState([]);

    const { login } = useAuth();
    const navigate = useNavigate();

    const foods = [
        { name: "Fresh Fruit Salad", img: "https://images.unsplash.com/photo-1564093497595-593b96d80180" },
        { name: "Green Salad", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c" },
        { name: "Berry Pancakes", img: "https://eggs.ca/wp-content/uploads/2024/06/fluffy-pancakes-1664x832-1.jpg" },
        { name: "Dumplings", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d" },
        { name: "Coffee Cake", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff" },
    ];

    const fruits = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'];

    const handleOrderClick = (e) => {
        const newParticles = [];
        for (let i = 0; i < 20; i++) {
            newParticles.push({
                id: i,
                x: e.clientX || window.innerWidth / 2,
                y: e.clientY || window.innerHeight / 2,
                angle: Math.random() * 360,
                distance: 50 + Math.random() * 150,
                emoji: fruits[Math.floor(Math.random() * fruits.length)],
                delay: Math.random() * 0.2
            });
        }
        setParticles(newParticles);
        setExploding(true);
        setTimeout(() => {
            setShowForm(true);
            setExploding(false);
            setParticles([]);
        }, 800);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
        const data = await loginUser(email, password);
        if (data.token) {
            const userId = data.userId;
            // Save for future reference
            localStorage.setItem("registeredEmail", email);
            localStorage.setItem("registeredUserId", userId);
            login(data.token, "ROLE_USER", userId);
            navigate("/restaurants");
        } else {
            setError("Invalid email or password!");
        }
    } catch (err) {
        setError("Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
};

    if (!showForm) {
        return (
            <>
                <style>{`
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Poppins', sans-serif; background: #f7efe6; overflow-x: hidden; }

                    @keyframes floatFruit {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(10deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    @keyframes blobMove {
                        0%, 100% { border-radius: 60% 40% 70% 30% / 40% 60% 30% 70%; }
                        25% { border-radius: 40% 60% 30% 70% / 60% 30% 70% 40%; }
                        50% { border-radius: 70% 30% 60% 40% / 30% 70% 40% 60%; }
                        75% { border-radius: 30% 70% 40% 60% / 70% 40% 60% 30%; }
                    }
                    @keyframes float3D {
                        0%, 100% { transform: translateY(0); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
                        50% { transform: translateY(-10px); box-shadow: 0 25px 40px rgba(242,116,5,0.2); }
                    }
                    @keyframes particleFly {
                        0% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
                        100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(180deg); opacity: 0; }
                    }
                    @keyframes explode {
                        0% { transform: scale(1) rotate(0deg); opacity: 1; }
                        30% { transform: scale(1.3) rotate(10deg); opacity: 0.9; }
                        70% { transform: scale(1.8) rotate(-10deg); opacity: 0.5; }
                        100% { transform: scale(3) rotate(20deg); opacity: 0; }
                    }
                    @keyframes slideInLeft {
                        from { opacity: 0; transform: translateX(-60px); }
                        to { opacity: 1; transform: translateX(0); }
                    }

                    .container { width: 1200px; margin: auto; position: relative; z-index: 10; }

                    .floating-fruits {
                        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                        pointer-events: none; z-index: 1; overflow: hidden;
                    }
                    .fruit {
                        position: absolute; opacity: 0.12;
                        filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
                        animation: floatFruit var(--duration) ease-in-out infinite;
                        animation-delay: var(--delay);
                    }

                    /* NAVBAR */
                    .navbar {
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 25px 0; position: relative; z-index: 20;
                    }
                    .logo {
                        font-size: 20px; font-weight: 700; color: #4caf50;
                        display: flex; align-items: center; gap: 8px; transition: transform 0.3s ease;
                    }
                    .logo:hover { transform: scale(1.05); }
                    .nav-links { display: flex; gap: 25px; align-items: center; }
                    .nav-links a {
                        text-decoration: none; color: #444; font-weight: 500;
                        transition: all 0.3s ease; position: relative; cursor: pointer; font-size: 14px;
                    }
                    .nav-links a::after {
                        content: ''; position: absolute; bottom: -5px; left: 0;
                        width: 0; height: 2px; background: #f27405; transition: width 0.3s ease;
                    }
                    .nav-links a:hover { color: #f27405; }
                    .nav-links a:hover::after { width: 100%; }
                    .nav-links a.active {
                        background: #ffe3c5; padding: 6px 14px;
                        border-radius: 20px; color: #f27405;
                    }
                    .nav-links a.active::after { display: none; }
                    .nav-divider {
                        width: 1px; height: 20px; background: #ddd; margin: 0 5px;
                    }
                    .nav-role-link {
                        text-decoration: none; color: #888 !important; font-size: 12px !important;
                        padding: 5px 12px !important; border-radius: 15px !important;
                        border: 1px solid #ddd; transition: all 0.3s ease !important;
                    }
                    .nav-role-link:hover {
                        background: #f27405 !important; color: white !important;
                        border-color: #f27405 !important;
                    }
                    .nav-role-link::after { display: none !important; }
                    .order-nav-btn {
                        background: #fff; padding: 10px 18px; border-radius: 20px;
                        border: 1px solid #ddd; cursor: pointer; transition: all 0.3s ease;
                        font-size: 14px; font-weight: 600;
                    }
                    .order-nav-btn:hover {
                        background: #f27405; color: white; border-color: #f27405;
                        transform: translateY(-2px); box-shadow: 0 5px 15px rgba(242,116,5,0.3);
                    }

                    /* HERO */
                    .hero {
                        display: flex; align-items: center; justify-content: space-between;
                        margin-top: 40px; position: relative; z-index: 20;
                    }
                    .hero-left { width: 55%; animation: slideInLeft 0.8s ease; }

                    /* HERO TITLE with rectangle from left to orange blob */
                    .hero-title {
                        font-size: 42px; font-weight: 700; color: #3a2e2a;
                        line-height: 1.3; margin-bottom: 20px;
                    }
                    .hero-title-highlight {
                        background: rgba(255, 200, 150, 0.35);
                        padding: 15px 0px 15px 9999px;
                        margin-left: -9999px;
                        border-radius: 0 60px 60px 0;
                        display: inline-block;
                        width: calc(75vw + 9999px);
                        box-shadow: 0 4px 10px rgba(242,116,5,0.1);
                        line-height: 1.5;}

                    .hero-text { color: #6c5f5b; margin-bottom: 25px; line-height: 1.6; max-width: 500px; }
                    .order-btn {
                        background: #f27405; border: none; padding: 14px 28px;
                        border-radius: 25px; color: white; font-weight: 600; cursor: pointer;
                        transition: all 0.3s ease; box-shadow: 0 5px 20px rgba(242,116,5,0.3);
                        position: relative; overflow: hidden; font-size: 15px;
                    }
                    .order-btn::before {
                        content: ''; position: absolute; top: 0; left: -100%;
                        width: 100%; height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                        transition: left 0.5s ease;
                    }
                    .order-btn:hover::before { left: 100%; }
                    .order-btn:hover {
                        background: #e06600; transform: translateY(-3px) scale(1.05);
                        box-shadow: 0 8px 25px rgba(242,116,5,0.5);
                    }
                    .order-btn.exploding { animation: explode 0.8s ease forwards; }

                    /* HERO RIGHT */
                    .hero-right { position: relative; width: 520px; height: 420px; }
                    .orange-blob {
                        position: absolute; width: 100%; height: 100%;
                        background: #f27405;
                        border-radius: 70% 30% 60% 40% / 40% 60% 30% 70%;
                        animation: blobMove 12s ease-in-out infinite;
                        box-shadow: 0 20px 40px rgba(242,116,5,0.3);
                    }
                    .hero-img-container {
                        position: absolute; top: 30px; left: 80px;
                        width: 300px; height: 300px;
                        border-radius: 80% 20% 70% 30% / 30% 70% 20% 80%;
                        overflow: hidden;
                        animation: blobMove 15s ease-in-out infinite reverse;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                        border: 5px solid white;
                    }
                    .hero-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                    .hero-img-container:hover .hero-img { transform: scale(1.1) rotate(2deg); }

                    /* FEATURES */
                    .features { display: flex; gap: 25px; margin-top: 40px; position: relative; z-index: 20; }
                    .feature-card {
                        flex: 1; background: white; padding: 20px; border-radius: 16px;
                        display: flex; align-items: center; gap: 15px;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer;
                    }
                    .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
                    .feature-icon { font-size: 32px; transition: transform 0.3s ease; }
                    .feature-card:hover .feature-icon { transform: scale(1.2) rotate(5deg); }
                    .feature-title { font-weight: 600; transition: color 0.3s ease; }
                    .feature-card:hover .feature-title { color: #f27405; }

                    /* MENU */
                    .menu { margin-top: 60px; position: relative; z-index: 20; padding-bottom: 60px; }
                    .menu-title {
                        text-align: center; font-size: 28px; margin-bottom: 30px;
                        position: relative; display: inline-block; left: 50%; transform: translateX(-50%);
                        background: rgba(255,200,150,0.2); padding: 10px 30px; border-radius: 50px;
                    }
                    .menu-grid { display: flex; gap: 20px; }
                    .menu-card {
                        background: white; border-radius: 16px; padding: 15px; width: 220px;
                        box-shadow: 0 15px 30px rgba(0,0,0,0.15); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        animation: float3D 4s ease-in-out infinite; cursor: pointer;
                        border: 1px solid rgba(255,255,255,0.5);
                    }
                    .menu-card:nth-child(2) { animation-delay: 0.5s; }
                    .menu-card:nth-child(3) { animation-delay: 1s; }
                    .menu-card:nth-child(4) { animation-delay: 1.5s; }
                    .menu-card:nth-child(5) { animation-delay: 2s; }
                    .menu-card:hover {
                        transform: translateY(-15px) scale(1.03);
                        box-shadow: 0 30px 40px rgba(242,116,5,0.25);
                        animation: none;
                    }
                    .menu-card img {
                        width: 100%; border-radius: 12px; height: 140px; object-fit: cover;
                        transition: transform 0.5s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    }
                    .menu-card:hover img { transform: scale(1.08); }
                    .menu-card h4 { margin-top: 12px; font-size: 15px; transition: color 0.3s ease; }
                    .menu-card:hover h4 { color: #f27405; }
                    .add-btn {
                        margin-top: 12px; background: #f27405; color: white; border: none;
                        padding: 8px 16px; border-radius: 18px; cursor: pointer; font-size: 13px;
                        transition: all 0.3s ease; width: 100%; box-shadow: 0 4px 10px rgba(242,116,5,0.3);
                    }
                    .add-btn:hover { background: #e06600; transform: scale(1.05); }

                    /* PARTICLE */
                    .particle {
                        position: fixed; pointer-events: none; z-index: 9999; font-size: 24px;
                        animation: particleFly 0.8s ease-out forwards;
                    }
                `}</style>

                {/* Floating fruits */}
                <div className="floating-fruits">
                    {fruitPositions.map((pos, index) => (
                        <div key={index} className="fruit" style={{
                            top: pos.top, left: pos.left, fontSize: pos.fontSize,
                            '--duration': pos.duration, '--delay': pos.delay, opacity: pos.opacity
                        }}>
                            {fruits[index % fruits.length]}
                        </div>
                    ))}
                </div>

                {/* Particles on click */}
                {particles.map((particle) => (
                    <div key={particle.id} className="particle" style={{
                        left: particle.x, top: particle.y,
                        '--tx': (Math.cos(particle.angle * Math.PI / 180) * particle.distance) + 'px',
                        '--ty': (Math.sin(particle.angle * Math.PI / 180) * particle.distance) + 'px',
                        animationDelay: particle.delay + 's'
                    }}>
                        {particle.emoji}
                    </div>
                ))}

                <div className="container">
                    {/* NAVBAR */}
                    <nav className="navbar">
                        <div className="logo">🌿 Fresh Bites Delivery</div>
                        <div className="nav-links">
                            <a className="active">Home</a>
                            <a>Menu</a>
                            <a>Offers</a>
                            <a>About Us</a>
                            <div className="nav-divider"></div>
                            <Link to="/admin/login" className="nav-role-link">🛡️ Admin</Link>
                            <Link to="/restaurant/login" className="nav-role-link">🍴 Restaurant</Link>
                            <Link to="/deliverer/login" className="nav-role-link">🛵 Deliverer</Link>
                        </div>
                        <button className="order-nav-btn" onClick={handleOrderClick}>Order Now</button>
                    </nav>

                    {/* HERO */}
                    <section className="hero">
                        <div className="hero-left">
                            <h1 className="hero-title">
                                <span className="hero-title-highlight">
                                    DELICIOUSLY FRESH MEALS,<br />DELIVERED TO YOUR DOOR.
                                </span>
                            </h1>
                            <p className="hero-text">
                                Explore our wide variety of healthy salads, savory
                                dumplings, and sweet treats. Ready in 20 minutes.
                            </p>
                            <button
                                className={`order-btn ${exploding ? 'exploding' : ''}`}
                                onClick={handleOrderClick}>
                                Order Now 🍴
                            </button>
                        </div>

                        <div className="hero-right">
                            <div className="orange-blob"></div>
                            <div className="hero-img-container">
                                <img className="hero-img"
                                    src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d"
                                    alt="food" />
                            </div>
                        </div>
                    </section>

                    {/* FEATURES */}
                    <div className="features">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <div>
                                <div className="feature-title">FREE & FAST DELIVERY</div>
                                <p>On orders over $30</p>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🍜</div>
                            <div>
                                <div className="feature-title">WIDE MENU VARIETY</div>
                                <p>From local favorites to healthy options</p>
                            </div>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🌿</div>
                            <div>
                                <div className="feature-title">FRESH & SUSTAINABLE</div>
                                <p>Locally sourced ingredients</p>
                            </div>
                        </div>
                    </div>

                    {/* MENU */}
                    <section className="menu">
                        <h2 className="menu-title">OUR MENU FAVORITES</h2>
                        <div className="menu-grid">
                            {foods.map((food, i) => (
                                <div key={i} className="menu-card">
                                    <img src={food.img} alt={food.name} />
                                    <h4>{food.name}</h4>
                                    <button className="add-btn">Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </>
        );
    }

    // ── LOGIN FORM ──
    return (
        <>
            <style>{`
                @keyframes formSlide {
                    0% { opacity: 0; transform: scale(0.9) translateY(30px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes floatFruit {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(5deg); }
                }
                .form-page {
                    min-height: 100vh; background: #f7efe6;
                    display: flex; justify-content: center; align-items: center;
                    padding: 20px; position: relative; overflow: hidden;
                }
                .form-fruits { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
                .form-fruit { position: absolute; font-size: 50px; opacity: 0.1; animation: floatFruit 8s ease-in-out infinite; animation-delay: var(--delay); }
                .form-card {
                    background: white; padding: 50px; border-radius: 30px;
                    width: 100%; max-width: 440px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                    position: relative; z-index: 10; animation: formSlide 0.6s ease;
                }
                .back-btn {
                    background: none; border: 1px solid #f27405; color: #f27405;
                    font-size: 14px; cursor: pointer; margin-bottom: 30px;
                    padding: 8px 15px; border-radius: 30px;
                    display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease;
                }
                .back-btn:hover { background: #f27405; color: white; transform: translateX(-5px); }
                .form-header { text-align: center; margin-bottom: 35px; }
                .form-logo { font-size: 24px; font-weight: 700; color: #4caf50; margin-bottom: 15px; }
                .form-title { color: #333; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
                .form-subtitle { color: #777; font-size: 14px; }
                .error-container {
                    display: flex; align-items: center; gap: 10px;
                    background: #fff1f0; border: 1px solid #ffcdd2;
                    padding: 15px 20px; border-radius: 12px; margin-bottom: 25px;
                }
                .error-text { color: #d32f2f; font-size: 14px; }
                .input-group { margin-bottom: 25px; }
                .label {
                    display: flex; align-items: center; gap: 8px;
                    color: #666; font-size: 12px; font-weight: 600;
                    margin-bottom: 8px; letter-spacing: 0.5px;
                }
                .input {
                    width: 100%; padding: 15px 20px; border-radius: 12px;
                    border: 1px solid #ddd; font-size: 15px; transition: all 0.3s ease; outline: none;
                }
                .input:focus {
                    border-color: #f27405;
                    box-shadow: 0 0 0 3px rgba(242,116,5,0.1);
                    transform: translateY(-2px);
                }
                .input:hover { border-color: #f27405; }
                .submit-btn {
                    width: 100%; padding: 16px;
                    background: linear-gradient(135deg, #f27405, #e06600);
                    color: white; border: none; border-radius: 50px;
                    font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(242,116,5,0.3);
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                }
                .submit-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 40px rgba(242,116,5,0.4);
                }
                .form-footer { text-align: center; margin-top: 25px; }
                .register-prompt { color: #666; font-size: 14px; }
                .gold-link { color: #f27405; text-decoration: none; font-weight: 600; }
                .gold-link:hover { text-decoration: underline; }
            `}</style>

            <div className="form-page">
                <div className="form-fruits">
                    {formFruitPositions.map((pos, index) => (
                        <div key={index} className="form-fruit" style={{
                            top: pos.top, left: pos.left,
                            '--delay': pos.delay,
                            transform: `rotate(${pos.rotate})`
                        }}>
                            {fruits[index % fruits.length]}
                        </div>
                    ))}
                </div>

                <div className="form-card">
                    <button className="back-btn" onClick={() => setShowForm(false)}>
                        ← Back to Home
                    </button>

                    <div className="form-header">
                        <div className="form-logo">🌿 Fresh Bites</div>
                        <h2 className="form-title">Welcome Back!</h2>
                        <p className="form-subtitle">Sign in to continue ordering</p>
                    </div>

                    {error && (
                        <div className="error-container">
                            <span>⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">
                                <span>📧</span> Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">
                                <span>🔒</span> Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="input"
                                required
                            />
                        </div>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Signing in..." : <><span>🥗</span> Sign In & Order <span>→</span></>}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p className="register-prompt">
                            Don't have an account?{" "}
                            <Link to="/register" className="gold-link">Create account →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}