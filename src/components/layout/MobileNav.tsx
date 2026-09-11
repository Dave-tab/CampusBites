import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { Home, Store, ShoppingBag, Clock, Bell, LayoutDashboard, Bike, Wallet } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentUser } = useAuth();
  const { cartCount } = useCart();
  const { unreadCount } = useNotifications();

  if (!currentUser) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {currentUser.role === 'STUDENT' && (
          <>
            <NavLink
              to="/student/home"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Home className="w-5 h-5" />
              <span>Explore</span>
            </NavLink>

            <NavLink
              to="/student/vendors"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Store className="w-5 h-5" />
              <span>Vendors</span>
            </NavLink>

            <NavLink
              to="/student/cart"
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-4 h-4 px-1 bg-amber-600 text-white text-[9px] font-bold rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </NavLink>

            <NavLink
              to="/student/orders"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Clock className="w-5 h-5" />
              <span>Orders</span>
            </NavLink>
          </>
        )}

        {currentUser.role === 'RIDER' && (
          <>
            <NavLink
              to="/rider/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Bike className="w-5 h-5" />
              <span>Radar</span>
            </NavLink>

            <NavLink
              to="/rider/deliveries"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Clock className="w-5 h-5" />
              <span>Deliveries</span>
            </NavLink>

            <NavLink
              to="/rider/earnings"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Wallet className="w-5 h-5" />
              <span>Earnings</span>
            </NavLink>
          </>
        )}

        {currentUser.role === 'VENDOR' && (
          <>
            <NavLink
              to="/vendor/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/vendor/meals"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Store className="w-5 h-5" />
              <span>Meals</span>
            </NavLink>

            <NavLink
              to="/vendor/orders"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Clock className="w-5 h-5" />
              <span>Orders</span>
            </NavLink>
          </>
        )}

        {currentUser.role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/admin/vendors/pending"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Clock className="w-5 h-5" />
              <span>Approvals</span>
            </NavLink>

            <NavLink
              to="/admin/vendors"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              <Store className="w-5 h-5" />
              <span>Vendors</span>
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};
