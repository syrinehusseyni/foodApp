import React from "react";
import { useNavigate } from "react-router-dom";

export default function DelivererDashboard() {
    const navigate = useNavigate();
    React.useEffect(() => {
        navigate("/deliverer/dashboard");
    }, []);
    return null;
}