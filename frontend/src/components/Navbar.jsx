import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token"); // or however auth is cleared
    setUser(null);
    navigate("/signin");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8 lg:px-14 py-4">
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 font-bold text-2xl text-textMain tracking-tight"
      >
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        CastNCart
      </Link>

      {/* Navigation */}
      <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-textMuted">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
        <Link to="/live" className="hover:text-primary transition-colors">Live Workshops</Link>
        <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
        <Link to="/sell" className="hover:text-primary transition-colors">Become a Creator</Link>
        <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </div>

      {/* Auth Buttons / Profile */}
      <div className="flex items-center gap-4 relative">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 animate-fade-in">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Link
                  to={user.role === 'Creator' ? '/creator/dashboard' : '/user/dashboard'}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/signin"
              className="text-sm font-medium text-textMain hover:text-primary transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/signup"
              className="bg-primary text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}