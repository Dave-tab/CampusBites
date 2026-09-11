import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Store, Search, ShieldCheck, ShieldAlert, Star, MapPin, Phone, ExternalLink } from 'lucide-react';

export const AdminVendorsList: React.FC = () => {
  const { loginAsDemoRole } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const handleSync = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('campusbites_vendor_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campusbites_vendor_updated', handleSync);
    };
  }, []);

  const vendors = DataService.getVendors();

  const handleToggleSuspend = (vendorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    DataService.updateVendorStatus(vendorId, newStatus);
    setRefreshTrigger((prev) => prev + 1);
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('campusbites_vendor_updated'));
  };

  const handleSwitchToVendor = (ownerId: string) => {
    loginAsDemoRole('VENDOR', ownerId);
    navigate('/vendor/dashboard');
  };

  const filtered = vendors.filter(
    (v) =>
      v.business_name.toLowerCase().includes(search.toLowerCase()) ||
      v.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-600" /> All Platform Vendors
          </h1>
          <p className="text-xs text-slate-500">Manage vendor listings, review ratings, and suspend/re-activate vendor stalls</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search vendors by business name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm rounded-xl outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((vendor) => {
          const meals = DataService.getMealsByVendor(vendor.id);
          const vOrders = DataService.getVendorOrders(vendor.id);

          return (
            <Card key={vendor.id} className="p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{vendor.business_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge status={vendor.verification_status} />
                      <Badge status={vendor.location_type} />
                    </div>
                  </div>

                  {vendor.rating && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {vendor.rating}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">{vendor.description}</p>

                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                  <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <span className="font-bold text-slate-900 block">{meals.length}</span>
                    <span>Menu Dishes</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                    <span className="font-bold text-slate-900 block">{vOrders.length}</span>
                    <span>Sub-orders</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-xs"
                  onClick={() => handleSwitchToVendor(vendor.owner_id)}
                  leftIcon={<ExternalLink className="w-3 h-3 text-indigo-600" />}
                >
                  Vendor Console
                </Button>

                {vendor.verification_status === 'APPROVED' && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleToggleSuspend(vendor.id, 'APPROVED')}
                    leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                  >
                    Suspend
                  </Button>
                )}

                {vendor.verification_status === 'SUSPENDED' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 cursor-pointer"
                    onClick={() => handleToggleSuspend(vendor.id, 'SUSPENDED')}
                    leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  >
                    Re-Activate
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
