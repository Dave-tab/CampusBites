import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DataService } from '../../services/dataService';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Search, Store, MapPin, Star, Phone, ChevronRight } from 'lucide-react';

export const VendorsList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState<'ALL' | 'CAMPUS' | 'OFF_CAMPUS'>('ALL');

  const approvedVendors = DataService.getApprovedVendors();

  const filtered = approvedVendors.filter((v) => {
    const matchesSearch =
      v.business_name.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.address.toLowerCase().includes(search.toLowerCase());

    const matchesLoc = locationFilter === 'ALL' || v.location_type === locationFilter;
    return matchesSearch && matchesLoc;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-6 h-6 text-amber-600" />
            Approved Food Vendors
          </h1>
          <p className="text-xs text-slate-500">
            Discover verified campus eateries and off-campus spots verified by administration.
          </p>
        </div>

        {/* Location Filter Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
          <button
            onClick={() => setLocationFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            All Vendors
          </button>
          <button
            onClick={() => setLocationFilter('CAMPUS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationFilter === 'CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            On Campus
          </button>
          <button
            onClick={() => setLocationFilter('OFF_CAMPUS')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              locationFilter === 'OFF_CAMPUS' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Off Campus
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by vendor name, cuisine, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 rounded-xl focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((vendor) => {
          const meals = DataService.getMealsByVendor(vendor.id);
          return (
            <Link key={vendor.id} to={`/student/vendors/${vendor.id}`}>
              <Card className="h-full overflow-hidden hover:border-amber-400 group transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={vendor.banner_image}
                      alt={vendor.business_name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge status={vendor.location_type} />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {vendor.business_name}
                      </h3>
                      {vendor.rating && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {vendor.rating}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{vendor.description}</p>

                    <div className="space-y-1 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{vendor.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{vendor.phone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{meals.length} Available Meals</span>
                  <span className="text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Browse Menu <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
