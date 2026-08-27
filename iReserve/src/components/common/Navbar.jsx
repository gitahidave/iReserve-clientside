import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('ireserve-theme') === 'light';
  });

  useEffect(() => {
    const theme = isLightMode ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ireserve-theme', theme);
  }, [isLightMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => setIsLightMode((current) => !current);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-500 tracking-tight">iReserve</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/listings" className="text-slate-300 hover:text-white transition">
              Explore Workspaces
            </Link>
            
            {user && (
              <Link 
                to={`/dashboard/${user.role}`} 
                className="text-slate-300 hover:text-white transition capitalize"
              >
                Dashboard ({user.role})
              </Link>
            )}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
              title={`Switch to ${isLightMode ? 'dark' : 'light'} mode`}
              className="h-9 w-9 rounded-lg border border-slate-700 text-lg leading-none hover:bg-slate-800 transition"
            >
              {isLightMode ? '☾' : '☀'}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-300 px-4 py-2 text-sm font-medium hover:text-white transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;