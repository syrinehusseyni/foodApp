import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/userApi";

const fruitPositions = Array.from({ length: 15 }, (_, i) => ({
    top: `${(i * 37 + 13) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    fontSize: `${30 + (i * 7) % 40}px`,
    duration: `${5 + (i * 3) % 10}s`,
    delay: `${(i * 1.5) % 5}s`,
    opacity: 0.1 + (i % 3) * 0.03
}));

const fruits = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'];

export default function UserRegister() {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
        setError("Passwords do not match!");
        return;
    }

    setLoading(true);
    try {
        const data = await registerUser({
            fullName,
            username,
            email,
            password,
            role: "USER"
        });

        if (data.id) {
            // ← Save userId after registration
            localStorage.setItem("registeredUserId", data.id);
            localStorage.setItem("registeredEmail", email);
            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => navigate("/"), 2000);
        } else {
            setError("Registration failed. Please try again.");
        }
    } catch (err) {
        setError("Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
};

    return (
        <>
            <style>{`
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Poppins', sans-serif; background: #f7efe6; overflow-x: hidden; }

                @keyframes floatFruit {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                @keyframes formSlide {
                    0% { opacity: 0; transform: scale(0.9) translateY(30px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }

                .register-page {
                    min-height: 100vh;
                    background: #f7efe6;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 40px 20px;
                    position: relative;
                    overflow: hidden;
                }
                .floating-fruits {
                    position: fixed; top: 0; left: 0;
                    width: 100%; height: 100%;
                    pointer-events: none; z-index: 1; overflow: hidden;
                }
                .fruit {
                    position: absolute; opacity: 0.12;
                    animation: floatFruit var(--duration) ease-in-out infinite;
                    animation-delay: var(--delay);
                }
                .register-card {
                    background: white;
                    padding: 50px;
                    border-radius: 30px;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                    position: relative;
                    z-index: 10;
                    animation: formSlide 0.6s ease;
                }
                .back-btn {
                    background: none; border: 1px solid #f27405;
                    color: #f27405; font-size: 14px; cursor: pointer;
                    margin-bottom: 30px; padding: 8px 15px; border-radius: 30px;
                    display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s ease;
                }
                .back-btn:hover { background: #f27405; color: white; transform: translateX(-5px); }
                .form-header { text-align: center; margin-bottom: 35px; }
                .form-logo { font-size: 24px; font-weight: 700; color: #4caf50; margin-bottom: 10px; }
                .form-title { color: #333; font-size: 26px; font-weight: 700; margin-bottom: 8px; }
                .form-subtitle { color: #777; font-size: 14px; }

                .input-row {
                    display: flex; gap: 15px; margin-bottom: 0;
                }
                .input-row .input-group { flex: 1; }

                .input-group { margin-bottom: 20px; }
                .label {
                    display: flex; align-items: center; gap: 8px;
                    color: #666; font-size: 12px; font-weight: 600;
                    margin-bottom: 8px; letter-spacing: 0.5px;
                }
                .input {
                    width: 100%; padding: 14px 18px; border-radius: 12px;
                    border: 1px solid #ddd; font-size: 15px;
                    transition: all 0.3s ease; outline: none;
                }
                .input:focus {
                    border-color: #f27405;
                    box-shadow: 0 0 0 3px rgba(242,116,5,0.1);
                    transform: translateY(-2px);
                }
                .input:hover { border-color: #f27405; }

                .error-container {
                    display: flex; align-items: center; gap: 10px;
                    background: #fff1f0; border: 1px solid #ffcdd2;
                    padding: 12px 18px; border-radius: 12px; margin-bottom: 20px;
                }
                .error-text { color: #d32f2f; font-size: 13px; }
                .success-container {
                    display: flex; align-items: center; gap: 10px;
                    background: #f0fff4; border: 1px solid #c8e6c9;
                    padding: 12px 18px; border-radius: 12px; margin-bottom: 20px;
                }
                .success-text { color: #2e7d32; font-size: 13px; }

                .submit-btn {
                    width: 100%; padding: 16px;
                    background: linear-gradient(135deg, #f27405, #e06600);
                    color: white; border: none; border-radius: 50px;
                    font-size: 16px; font-weight: 600; cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(242,116,5,0.3);
                    display: flex; align-items: center;
                    justify-content: center; gap: 10px;
                    margin-top: 10px;
                }
                .submit-btn:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 15px 40px rgba(242,116,5,0.4);
                }
                .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

                .form-footer { text-align: center; margin-top: 25px; }
                .login-prompt { color: #666; font-size: 14px; }
                .orange-link { color: #f27405; text-decoration: none; font-weight: 600; }
                .orange-link:hover { text-decoration: underline; }

                .password-strength {
                    height: 4px; border-radius: 2px; margin-top: 8px;
                    background: #eee; overflow: hidden;
                }
                .password-strength-bar {
                    height: 100%; border-radius: 2px; transition: all 0.3s ease;
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

            <div className="register-page">
                <div className="register-card">
                    <button className="back-btn" onClick={() => navigate("/")}>
                        ← Back to Home
                    </button>

                    <div className="form-header">
                        <div className="form-logo">🌿 Fresh Bites</div>
                        <h2 className="form-title">Create Account</h2>
                        <p className="form-subtitle">Join us and start ordering delicious food!</p>
                    </div>

                    {error && (
                        <div className="error-container">
                            <span>⚠️</span>
                            <span className="error-text">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="success-container">
                            <span>✅</span>
                            <span className="success-text">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Full Name + Username */}
                        <div className="input-row">
                            <div className="input-group">
                                <label className="label">
                                    <span>👤</span> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="label">
                                    <span>🏷️</span> Username
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="johndoe"
                                    className="input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
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

                        {/* Password + Confirm */}
                        <div className="input-row">
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
                                {/* Password strength bar */}
                                <div className="password-strength">
                                    <div className="password-strength-bar" style={{
                                        width: password.length === 0 ? '0%' :
                                               password.length < 6 ? '33%' :
                                               password.length < 10 ? '66%' : '100%',
                                        backgroundColor: password.length === 0 ? '#eee' :
                                                        password.length < 6 ? '#f44336' :
                                                        password.length < 10 ? '#ff9800' : '#4caf50'
                                    }} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="label">
                                    <span>🔐</span> Confirm
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    className="input"
                                    style={{
                                        borderColor: confirm && confirm !== password ? '#f44336' :
                                                    confirm && confirm === password ? '#4caf50' : '#ddd'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Creating account..." : (
                                <><span>🌿</span> Create Account <span>→</span></>
                            )}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p className="login-prompt">
                            Already have an account?{" "}
                            <Link to="/" className="orange-link">Sign in →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}