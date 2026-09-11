import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { RoleSwitcher } from '../ui/RoleSwitcher';
import { CampusBiteLogo } from '../ui/CampusBiteLogo';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User,
  LogOut,
  Store,
  ChevronDown,
  CheckCheck,
  Menu,
  X,
  ChevronRight,
  Home,
  Clock,
  LayoutDashboard,
  Bike,
  Wallet,
  ArrowLeft,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route changes
  useEffect(() => {
    setShowNotifications(false);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle outside clicks and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
        setMobileMenuOpen(false);
      }
    };

    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications, showUserMenu]);

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'ADMIN') return '/admin/dashboard';
    if (currentUser.role === 'VENDOR') return '/vendor/dashboard';
    if (currentUser.role === 'RIDER') return '/rider/dashboard';
    return '/student/home';
  };

  const isDashboardPage = [
    '/',
    '/student/home',
    '/vendor/dashboard',
    '/rider/dashboard',
    '/admin/dashboard',
    '/login',
    '/signup',
  ].includes(location.pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo, Mobile Back Button & Platform Name */}
          <div className="flex items-center gap-1 sm:gap-2">
            {!isDashboardPage && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer"
                aria-label="Go Back"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to={getDashboardPath()} className="flex items-center group">
              <CampusBiteLogo size="sm" />
            </Link>
          </div>

          {/* Center Role Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
            {currentUser?.role === 'STUDENT' && (
              <>
                <Link
                  to="/student/home"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Explore Meals
                </Link>
                <Link
                  to="/student/vendors"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Vendors
                </Link>
                <Link
                  to="/student/orders"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Active Orders
                </Link>
                <Link
                  to="/student/history"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Order History
                </Link>
              </>
            )}

            {currentUser?.role === 'VENDOR' && (
              <>
                <Link
                  to="/vendor/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Vendor Dashboard
                </Link>
                <Link
                  to="/vendor/meals"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Manage Meals
                </Link>
                <Link
                  to="/vendor/orders"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Vendor Orders
                </Link>
              </>
            )}

            {currentUser?.role === 'RIDER' && (
              <>
                <Link
                  to="/rider/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Delivery Radar
                </Link>
                <Link
                  to="/rider/deliveries"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  My Deliveries
                </Link>
                <Link
                  to="/rider/earnings"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Earnings & Payouts
                </Link>
              </>
            )}

            {currentUser?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Overview
                </Link>
                <Link
                  to="/admin/vendors/pending"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Vendor Approvals
                </Link>
                <Link
                  to="/admin/vendors"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  All Vendors
                </Link>
                <Link
                  to="/admin/analytics"
                  className="px-3 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs transition-all"
                >
                  Platform Analytics
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Role Switcher for Academic Demo (hidden on small mobile to fit hamburger cleanly) */}
            <div className="hidden sm:block">
              <RoleSwitcher />
            </div>

            {/* Cart Button (for Students) */}
            {currentUser?.role === 'STUDENT' && (
              <Link
                to="/student/cart"
                className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="View Multi-Vendor Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 bg-amber-600 text-white text-[10px] font-bold rounded-full border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
                aria-expanded={showNotifications}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-900">In-App Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.related_order_id && currentUser?.role === 'STUDENT') {
                              navigate(`/student/orders/${n.related_order_id}`);
                            } else if (n.related_order_id && currentUser?.role === 'VENDOR') {
                              navigate(`/vendor/orders/${n.related_order_id}`);
                            } else if (n.type === 'VENDOR_VERIFICATION' && currentUser?.role === 'ADMIN') {
                              navigate('/admin/vendors/pending');
                            }
                            setShowNotifications(false);
                          }}
                          className={`p-3.5 cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.is_read ? 'bg-amber-50/40 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Menu (Desktop/Tablet) */}
            <div ref={userMenuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                aria-expanded={showUserMenu}
              >
                <img
                  src={
                    currentUser?.profile_image ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                  }
                  alt={currentUser?.full_name || 'User'}
                  loading="lazy"
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-100"
                />
                <span className="hidden md:block text-xs font-semibold text-slate-800 max-w-28 truncate">
                  {currentUser?.full_name || 'Account'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded uppercase">
                      Role: {currentUser?.role}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5 text-xs">
                    {currentUser?.role === 'STUDENT' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Student Profile
                      </Link>
                    )}

                    {currentUser?.role === 'VENDOR' && (
                      <Link
                        to="/vendor/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700"
                      >
                        <Store className="w-4 h-4 text-slate-400" />
                        Vendor Profile
                      </Link>
                    )}

                    {currentUser?.role === 'RIDER' && (
                      <>
                        <Link
                          to="/rider/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700"
                        >
                          <Bike className="w-4 h-4 text-slate-400" />
                          Delivery Radar
                        </Link>
                        <Link
                          to="/rider/earnings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700"
                        >
                          <Wallet className="w-4 h-4 text-slate-400" />
                          Earnings & Wallet
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2.5 text-slate-700 hover:text-amber-600 hover:bg-slate-100 rounded-xl transition-transform active:scale-95 md:hidden focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Slide-out Drawer */}
      {mobileMenuOpen && createPortal(
        <div className="md:hidden fixed inset-0 z-[99999] overflow-hidden">
          {/* Dark Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Drawer */}
          <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200">
            {/* Drawer Top Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <CampusBiteLogo size="xs" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Info Card */}
            {currentUser && (
              <div className="p-4 bg-amber-50/50 border-b border-amber-100/80">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      currentUser.profile_image ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                    }
                    alt={currentUser.full_name}
                    loading="lazy"
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-200 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white uppercase">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Role Switcher for Mobile */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Switch Role</p>
              <RoleSwitcher mobileInline={true} />
            </div>

            {/* Navigation Links according to Active Role */}
            <div className="p-4 space-y-1 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Navigation Menu
              </p>

              {currentUser?.role === 'STUDENT' && (
                <div className="space-y-1">
                  <Link
                    to="/student/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-amber-600" />
                      <span>Explore Meals</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/student/vendors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-amber-600" />
                      <span>Food Vendors</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/student/cart"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                      <span>My Cart</span>
                    </div>
                    {cartCount > 0 ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-600 text-white rounded-full">
                        {cartCount}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    )}
                  </Link>

                  <Link
                    to="/student/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>My Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/student/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>Student Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              )}

              {currentUser?.role === 'VENDOR' && (
                <div className="space-y-1">
                  <Link
                    to="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                      <span>Vendor Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/vendor/meals"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-indigo-600" />
                      <span>Manage Meals</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/vendor/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Vendor Orders</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/vendor/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-indigo-600" />
                      <span>Vendor Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              )}

              {currentUser?.role === 'RIDER' && (
                <div className="space-y-1">
                  <Link
                    to="/rider/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Bike className="w-4 h-4 text-sky-600" />
                      <span>Delivery Radar</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/rider/deliveries"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-sky-600" />
                      <span>My Deliveries</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/rider/earnings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-sky-50 hover:text-sky-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-sky-600" />
                      <span>Earnings & Payouts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              )}

              {currentUser?.role === 'ADMIN' && (
                <div className="space-y-1">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>Overview</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/admin/vendors/pending"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Vendor Approvals</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/admin/vendors"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>All Vendors</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>

                  <Link
                    to="/admin/analytics"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
                      <span>Platform Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Drawer Action */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80">
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

