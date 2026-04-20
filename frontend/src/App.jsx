import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Auth pages
import UserLogin from "./pages/auth/UserLogin";
import UserRegister from "./pages/auth/UserRegister";
import AdminLogin from "./pages/auth/AdminLogin";
import RestaurantLogin from "./pages/auth/RestaurantLogin";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageRestaurants from "./pages/admin/ManageRestaurants";
import ManageDeliverers from "./pages/admin/ManageDeliverers";

// User pages
import RestaurantList from "./pages/user/RestaurantList";
import MenuItems from "./pages/user/MenuItems";
import Cart from "./pages/user/Cart";
import MyOrders from "./pages/user/MyOrders";
import TrackDelivery from "./pages/user/TrackDelivery";

// Restaurant pages
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard";
import ManageMenu from "./pages/restaurant/ManageMenu";
import IncomingOrders from "./pages/restaurant/IncomingOrders";

// Deliverer pages
import DelivererLogin from "./pages/auth/DelivererLogin";
import AvailableDeliveries from "./pages/deliverer/AvailableDeliveries";

// Protected Route
const ProtectedRoute = ({ children, allowedRole }) => {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/deliverer/login" element={<DelivererLogin />} />

        {/* Admin routes */}
<Route path="/admin/login" element={<AdminLogin />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/restaurants" element={<ManageRestaurants />} />
<Route path="/admin/deliverers" element={<ManageDeliverers />} />
        <Route path="/admin/restaurants" element={
          <ProtectedRoute allowedRole="ROLE_ADMIN">
            <ManageRestaurants />
          </ProtectedRoute>
        } />
        <Route path="/admin/deliverers" element={
          <ProtectedRoute allowedRole="ROLE_ADMIN">
            <ManageDeliverers />
          </ProtectedRoute>
        } />

        {/* User routes */}
        <Route path="/restaurants" element={
          <ProtectedRoute allowedRole="ROLE_USER">
            <RestaurantList />
          </ProtectedRoute>
        } />
        <Route path="/restaurants/:id/menu" element={
          <ProtectedRoute allowedRole="ROLE_USER">
            <MenuItems />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute allowedRole="ROLE_USER">
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/my-orders" element={
          <ProtectedRoute allowedRole="ROLE_USER">
            <MyOrders />
          </ProtectedRoute>
        } />
        <Route path="/track/:deliveryId" element={
          <ProtectedRoute allowedRole="ROLE_USER">
            <TrackDelivery />
          </ProtectedRoute>
        } />

        {/* Restaurant routes */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
        <Route path="/restaurant/menu" element={<ManageMenu />} />
        <Route path="/restaurant/orders" element={<IncomingOrders />} />

        {/* Deliverer routes */}
        <Route path="/deliverer/dashboard" element={<AvailableDeliveries />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;