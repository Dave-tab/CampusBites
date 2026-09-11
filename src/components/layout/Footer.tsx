import React from 'react';
import { Link } from 'react-router-dom';
import { CampusBiteLogo } from '../ui/CampusBiteLogo';
import { Heart, ShieldCheck, Clock, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <CampusBiteLogo size="sm" variant="light" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-300">
            <Link to="/student/home" className="hover:text-amber-400 transition-colors">Explore Meals</Link>
            <Link to="/student/vendors" className="hover:text-amber-400 transition-colors">Vendors</Link>
            <Link to="/vendor/application" className="hover:text-amber-400 transition-colors">Partner as Vendor</Link>
            <Link to="/rider/dashboard" className="hover:text-amber-400 transition-colors">Rider Dispatch</Link>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Vested Quality
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-400" /> 15-25m Delivery
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Campus Bite Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Campus Foodies
          </p>
        </div>
      </div>
    </footer>
  );
};
