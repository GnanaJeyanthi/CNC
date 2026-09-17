import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreatorDashboard from "./pages/dashboard/CreatorDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import Workshops from "./pages/Workshops";
import WorkshopDetail from "./pages/WorkshopDetail";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import AttendanceDashboard from "./pages/dashboard/AttendanceDashboard";
import CreatorAnalytics from "./pages/dashboard/CreatorAnalytics";
import UserAnalytics from "./pages/dashboard/UserAnalytics";
import ProfileSettings from "./pages/ProfileSettings";
import CategoryManagement from "./pages/dashboard/CategoryManagement";
import ContactPage from "./pages/Contact";
import About from "./pages/About";
import CategoriesExplore from "./pages/CategoriesExplore";
import DailyGames from "./pages/DailyGames";

import { AuthContext } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import CastNCartAssistant from "./components/chatbot/CastNCartAssistant";

const Live = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink text-cream text-3xl font-semibold">
    Live Workshops
  </div>
);

const Sell = () => (
  <div className="min-h-screen flex items-center justify-center bg-ink text-cream text-3xl font-semibold">
    Become a Creator
  </div>
);

// Protected Route
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink text-cream">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If no role required, allow any authenticated user
  if (role && user.role !== role && user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-ink">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/live" element={<Workshops />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/workshops/:id" element={<WorkshopDetail />} />
            <Route path="/categories" element={<CategoriesExplore />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/games" element={<DailyGames />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/creator"
              element={
                <ProtectedRoute role="Creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/dashboard/attendance" element={<ProtectedRoute role="Creator"><AttendanceDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/analytics"  element={<ProtectedRoute role="Creator"><CreatorAnalytics /></ProtectedRoute>} />
            <Route path="/dashboard/categories" element={<ProtectedRoute role="Creator"><CategoryManagement /></ProtectedRoute>} />

            <Route path="/dashboard/user"           element={<ProtectedRoute role="User"><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/user/analytics" element={<ProtectedRoute role="User"><UserAnalytics /></ProtectedRoute>} />

            {/* Shared – any authenticated user */}
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Floating AI Chatbot Assistant */}
          <CastNCartAssistant />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;