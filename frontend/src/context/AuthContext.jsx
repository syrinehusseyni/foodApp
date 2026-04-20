import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [userId, setUserId] = useState(localStorage.getItem("userId") || null);

    const login = (token, role, userId = null) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        if (userId) localStorage.setItem("userId", userId);
        setToken(token);
        setRole(role);
        setUserId(userId);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        setToken(null);
        setRole(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);