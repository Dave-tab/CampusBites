import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { UserRole } from '../../types';
import { Shield, User, Store, Bike, ChevronDown } from 'lucide-react';

interface RoleSwitcherProps {
  mobileInline?: boolean;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ mobileInline = false }) => {
  const { currentUser, loginAsDemoRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for storage events to update vendor lists dynamically
  useEffect(() => {
    const handleSync = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('campusbites_vendor_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campusbites_vendor_updated', handleSync);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle outside clicks and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const approvedVendors = DataService.getApprovedVendors();

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case 'STUDENT':
        return `Student (${currentUser?.full_name?.split(' ')[0] || 'David'})`;
      case 'VENDOR': {
        const v = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : null;
        if (v) return `Vendor (${v.business_name.length > 12 ? v.business_name.substring(0, 12) + '...' : v.business_name})`;
        return `Vendor (${currentUser?.full_name?.split(' ')[0] || 'Console'})`;
      }
      case 'ADMIN':
        return 'Admin Console';
      case 'RIDER':
        return `Rider (${currentUser?.full_name?.split(' ')[0] || 'Tunde'})`;
      default:
        return 'Guest';
    }
  };

  const getRoleBadgeColor = (role: UserRole | null) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200/70';
      case 'VENDOR':
        return 'bg-indigo-100 text-indigo-900 border-indigo-200 hover:bg-indigo-200/70';
      case 'ADMIN':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200/70';
      case 'RIDER':
        return 'bg-sky-100 text-sky-900 border-sky-200 hover:bg-sky-200/70';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
    }
  };

  return (
    <div ref={dropdownRef} className={mobileInline ? 'w-full text-left' : 'relative inline-block text-left'}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`${
          mobileInline ? 'w-full justify-between' : 'inline-flex'
        } inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.01] active:scale-95 cursor-pointer select-none ${getRoleBadgeColor(
          currentUser?.role || null
        )}`}
        title="Switch User Role for Testing"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">{getRoleLabel(currentUser?.role || null)}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`${
            mobileInline
              ? 'mt-2 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-2 text-slate-800 space-y-1'
              : 'absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 text-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto'
          }`}
        >
          {!mobileInline && (
            <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Demo Role Switcher
                </p>
                <p className="text-xs text-slate-500">Switch role to test platform consoles</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 text-xs sm:hidden"
                aria-label="Close switcher"
              >
                ✕
              </button>
            </div>
          )}

          <div className="py-1 space-y-1">
            {/* Student */}
            <button
              type="button"
              onClick={() => {
                loginAsDemoRole('STUDENT');
                setIsOpen(false);
                navigate('/student/home');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                currentUser?.role === 'STUDENT' ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">Student Account</p>
                <p className="text-[10px] text-slate-500 truncate">Order meals, track orders & view history</p>
              </div>
            </button>

            {/* Rider */}
            <button
              type="button"
              onClick={() => {
                loginAsDemoRole('RIDER');
                setIsOpen(false);
                navigate('/rider/dashboard');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                currentUser?.role === 'RIDER' ? 'bg-sky-50 text-sky-900 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shrink-0">
                <Bike className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">Campus Rider (Tunde)</p>
                <p className="text-[10px] text-slate-500 truncate">Accept deliveries, navigate & verify OTP</p>
              </div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => {
                loginAsDemoRole('ADMIN');
                setIsOpen(false);
                navigate('/admin/dashboard');
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                currentUser?.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">Platform Administrator</p>
                <p className="text-[10px] text-slate-500 truncate">Approve vendors, view analytics & monitor</p>
              </div>
            </button>

            {/* Approved Vendors Header & List */}
            <div className="pt-2 pb-1 px-3 border-t border-slate-100 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Approved Vendor Consoles ({approvedVendors.length})
              </span>
            </div>

            {approvedVendors.map((vendor) => {
              const isSelected = currentUser?.role === 'VENDOR' && currentUser?.id === vendor.owner_id;
              return (
                <button
                  key={vendor.id}
                  type="button"
                  onClick={() => {
                    loginAsDemoRole('VENDOR', vendor.owner_id);
                    setIsOpen(false);
                    navigate('/vendor/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                    <Store className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{vendor.business_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{vendor.address}</p>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
