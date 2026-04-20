import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8089";

export default function AdminLogin() {
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
            const res = await fetch(`${API}/api/admin/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                return;
            }
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("adminEmail", data.username || email);
            navigate("/admin/dashboard");
        } catch (err) {
            setError("Connection error. Is admin-service running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:'Poppins',sans-serif; }
                @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .page { min-height:100vh; background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460); display:flex; align-items:center; justify-content:center; }
                .card { background:white; border-radius:24px; padding:50px 45px; width:420px; box-shadow:0 30px 80px rgba(0,0,0,0.4); animation:fadeInUp 0.7s ease; }
                .icon { font-size:50px; text-align:center; margin-bottom:10px; }
                .title { font-size:26px; font-weight:800; color:#1a1a2e; text-align:center; margin-bottom:6px; }
                .subtitle { color:#888; font-size:14px; text-align:center; margin-bottom:30px; }
                .badge { display:flex; justify-content:center; margin-bottom:25px; }
                .badge-inner { background:#e8eaf6; color:#1a237e; padding:6px 14px; border-radius:20px; font-size:12px; font-weight:700; }
                .label { font-size:13px; font-weight:600; color:#444; margin-bottom:8px; display:block; }
                .input-wrapper { position:relative; margin-bottom:20px; }
                .input-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:16px; }
                input { width:100%; padding:13px 14px 13px 42px; border:2px solid #e8e8e8; border-radius:12px; font-size:14px; outline:none; transition:all 0.3s; font-family:'Poppins',sans-serif; }
                input:focus { border-color:#1a1a2e; box-shadow:0 0 0 3px rgba(26,26,46,0.1); }
                .btn { width:100%; padding:15px; border:none; border-radius:12px; background:linear-gradient(135deg,#1a1a2e,#16213e); color:white; font-size:15px; font-weight:700; cursor:pointer; transition:all 0.3s; font-family:'Poppins',sans-serif; margin-top:8px; }
                .btn:hover { transform:translateY(-2px); box-shadow:0 10px 30px rgba(26,26,46,0.4); }
                .btn:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
                .error { background:#fff3f3; border:1px solid #ffcdd2; color:#c62828; padding:12px 16px; border-radius:10px; font-size:13px; margin-bottom:20px; text-align:center; }
                .back { text-align:center; margin-top:20px; font-size:13px; color:#888; }
                .back a { color:#1a1a2e; font-weight:600; text-decoration:none; }
            `}</style>

            <div className="page">
                <div className="card">
                    <div className="icon">🔐</div>
                    <h1 className="title">Admin Portal</h1>
                    <p className="subtitle">Sign in to manage Fresh Bites</p>
                    <div className="badge"><span className="badge-inner">🔵 Admin Service — Port 8089</span></div>

                    {error && <div className="error">⚠️ {error}</div>}

                    <form onSubmit={handleLogin}>
                        <label className="label">Email</label>
                        <div className="input-wrapper">
                            <span className="input-icon">📧</span>
                            <input type="email" placeholder="admin@freshbites.tn"
                                value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <label className="label">Password</label>
                        <div className="input-wrapper">
                            <span className="input-icon">🔒</span>
                            <input type="password" placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button className="btn" type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "🚀 Sign In"}
                        </button>
                    </form>
                    <div className="back"><a href="/">← Back to Home</a></div>
                </div>
            </div>
        </>
    );
}