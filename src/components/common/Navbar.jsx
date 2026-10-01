import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/Ireserve-logo-design.png';
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('ireserve-theme') !== 'dark';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const theme = isLightMode ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('ireserve-theme', theme);
  }, [isLightMode]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await getMyNotifications();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch (error) {
        console.error('Failed to load notifications', error);
      }
    };

    loadNotifications();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleTheme = () => setIsLightMode((current) => !current);

  const handleReadNotification = async (notification) => {
    if (notification.readAt) return;

    try {
      await markNotificationAsRead(notification._id);
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleReadAllNotifications = async () => {
    if (!unreadCount) return;

    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({
        ...item,
        readAt: item.readAt || new Date().toISOString(),
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-3">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center justify-self-start" aria-label="Ireserve home">
            <img
              src={logo}
              alt="Ireserve logo"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-self-center gap-4">
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
          <div className="flex items-center md:justify-self-end gap-2 sm:gap-4">
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
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((current) => !current)}
                    aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                    aria-expanded={showNotifications}
                    className="relative h-9 rounded-lg border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-xl">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
                        <h2 className="text-sm font-semibold text-white">Notifications</h2>
                        <button
                          type="button"
                          onClick={handleReadAllNotifications}
                          className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                          disabled={!unreadCount}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="py-5 text-center text-sm text-slate-500">No notifications yet.</p>
                        ) : notifications.map((notification) => (
                          <button
                            type="button"
                            key={notification._id}
                            onClick={() => handleReadNotification(notification)}
                            className={`block w-full border-b border-slate-800 px-2 py-3 text-left last:border-0 hover:bg-slate-800/70 ${notification.readAt ? 'opacity-60' : ''}`}
                          >
                            <p className="text-sm font-medium text-slate-200">{notification.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">{notification.message}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-slate-400 hidden sm:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
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
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              className="md:hidden h-9 w-9 rounded-lg border border-slate-700 text-lg leading-none hover:bg-slate-800 transition"
            >
              {isMenuOpen ? '×' : '☰'}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1">
            <Link
              to="/listings"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 transition"
            >
              Explore Workspaces
            </Link>
            {user && (
              <Link
                to={`/dashboard/${user.role}`}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 transition capitalize"
              >
                Dashboard ({user.role})
              </Link>
            )}
            {!user && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;