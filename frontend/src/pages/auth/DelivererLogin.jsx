import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8083";

export default function DelivererLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/api/delivery/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }
            localStorage.setItem("delivererToken", data.token);
            localStorage.setItem("delivererEmail", data.username || email);
            navigate("/deliverer/dashboard");
        } catch (err) {
            setError("Connection error. Is delivery-service running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; }
                @keyframes floatFruit {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
                    display: flex; align-items: center; justify-content: center;
                    position: relative; overflow: hidden;
                }
                .fruit {
                    position: absolute; opacity: 0.05; font-size: 40px;
                    animation: floatFruit 6s ease-in-out infinite;
                    pointer-events: none;
                }
                .card {
                    background: white; border-radius: 24px;
                    padding: 50px 45px; width: 420px;
                    box-shadow: 0 30px 80px rgba(0,0,0,0.4);
                    animation: fadeInUp 0.7s ease;
                    position: relative; z-index: 10;
                }
                .icon { font-size: 50px; text-align: center; margin-bottom: 10px; }
                .title {
                    font-size: 26px; font-weight: 800; color: #1a1a2e;
                    text-align: center; margin-bottom: 6px;
                }
                .subtitle { color: #888; font-size: 14px; text-align: center; margin-bottom: 35px; }
                .badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: #e8f5e9; color: #2e7d32;
                    padding: 6px 14px; border-radius: 20px;
                    font-size: 12px; font-weight: 700;
                    margin: 0 auto 30px; display: flex;
                    justify-content: center; width: fit-content;
                    margin-left: auto; margin-right: auto;
                }
                .label {
                    font-size: 13px; font-weight: 600; color: #444;
                    margin-bottom: 8px; display: block;
                }
                .input-wrapper { position: relative; margin-bottom: 20px; }
                .input-icon {
                    position: absolute; left: 14px; top: 50%;
                    transform: translateY(-50%); font-size: 16px;
                }
                input {
                    width: 100%; padding: 13px 14px 13px 42px;
                    border: 2px solid #e8e8e8; border-radius: 12px;
                    font-size: 14px; outline: none; transition: all 0.3s;
                    font-family: 'Poppins', sans-serif;
                }
                input:focus { border-color: #2c5364; box-shadow: 0 0 0 3px rgba(44,83,100,0.1); }
                .btn {
                    width: 100%; padding: 15px; border: none; border-radius: 12px;
                    background: linear-gradient(135deg, #2c5364, #203a43);
                    color: white; font-size: 15px; font-weight: 700;
                    cursor: pointer; transition: all 0.3s ease;
                    font-family: 'Poppins', sans-serif; margin-top: 8px;
                }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(44,83,100,0.4); }
                .btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
                .error {
                    background: #fff3f3; border: 1px solid #ffcdd2;
                    color: #c62828; padding: 12px 16px; border-radius: 10px;
                    font-size: 13px; margin-bottom: 20px; text-align: center;
                }
                .back {
                    text-align: center; margin-top: 20px;
                    font-size: 13px; color: #888;
                }
                .back a { color: #2c5364; font-weight: 600; text-decoration: none; }
                .back a:hover { text-decoration: underline; }
            `}</style>

            <div className="page">
                {["🛵","📦","🚀","⚡","🗺️","📍"].map((e, i) => (
                    <div key={i} className="fruit" style={{
                        top: `${(i * 37 + 10) % 90}%`,
                        left: `${(i * 53 + 5) % 90}%`,
                        animationDelay: `${i * 0.8}s`
                    }}>{e}</div>
                ))}
                <div className="card">
                    <div className="icon">🛵</div>
                    <h1 className="title">Deliverer Portal</h1>
                    <p className="subtitle">Sign in to manage your deliveries</p>
                    <div className="badge">🟢 Delivery Service — Port 8083</div>

                    {error && <div className="error">⚠️ {error}</div>}

                    <form onSubmit={handleLogin}>
                        <label className="label">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                placeholder="deliverer@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <label className="label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "🚀 Sign In"}
                        </button>
                    </form>
                    <div className="back">
                        <a href="/">← Back to Home</a>
                    </div>
                </div>
            </div>
        </>
    );
}