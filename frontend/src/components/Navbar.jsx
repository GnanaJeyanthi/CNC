import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar({ transparent = false }) {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/signin");
  };

  const isTransparent = transparent && !isScrolled;

  const navClasses = isTransparent
    ? "fixed top-0 w-full z-50 bg-transparent transition-all duration-300 py-6 px-8 lg:px-14"
    : "sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border transition-all duration-300 py-4 px-8 lg:px-14";

  const getLinkClass = (path) => {
    const isActive = location.pathname === path || (path === "/workshops" && location.pathname === "/live");
    if (isTransparent) {
      return isActive 
        ? "font-bold text-white border-b-2 border-white pb-0.5 drop-shadow-md transition-all"
        : "font-medium text-white/90 hover:text-white drop-shadow-md transition-colors";
    }
    return isActive
      ? "font-bold text-primary border-b-2 border-primary pb-0.5 transition-all"
      : "font-medium text-textMuted hover:text-primary transition-colors";
  };

  const logoTextClass = isTransparent ? "text-white drop-shadow-md" : "text-textMain";

  return (
    <nav className={navClasses}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className={`flex items-center gap-2 font-bold text-2xl tracking-tight ${logoTextClass}`}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          CastNCart
        </Link>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm">
          <Link to="/" className={getLinkClass("/")}>Home</Link>
          <Link to="/categories" className={getLinkClass("/categories")}>Categories</Link>
          <Link to="/workshops" className={getLinkClass("/workshops")}>Live Workshops</Link>
          <Link to="/marketplace" className={getLinkClass("/marketplace")}>Marketplace</Link>
          <Link to="/games" className={`flex items-center gap-1.5 ${getLinkClass("/games")}`}>
            <span className="text-base">🧩</span>
            <span>Daily Puzzles</span>
          </Link>
          <Link to="/about" className={getLinkClass("/about")}>About</Link>
          <Link to="/contact" className={getLinkClass("/contact")}>Contact</Link>
        </div>

        {/* Auth Buttons / Profile */}
        <div className="flex items-center gap-4 relative">
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors bg-white">
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
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 animate-fade-in text-textMain">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to={user.role === 'Creator' ? '/dashboard/creator' : '/dashboard/user'}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/games"
                    className="block px-4 py-2 text-sm text-amber-700 font-semibold hover:bg-amber-50 transition flex items-center gap-1.5"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>🧩</span> Daily Puzzles
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
          </div>
        ) : (
            <>
              <Link
                to="/signin"
                className={`text-sm ${isTransparent ? 'font-bold text-white hover:text-gray-200 drop-shadow-md' : 'font-medium text-textMain hover:text-primary transition-colors'}`}
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="bg-primary text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md border border-blue-600"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}