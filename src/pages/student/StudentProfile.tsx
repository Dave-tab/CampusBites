import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { User, Phone, Mail, GraduationCap, Clock, CheckCircle2, Bike, Store, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentProfile: React.FC = () => {
  const { currentUser } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) return null;

  const orders = DataService.getOrdersByStudent(currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      full_name: fullName,
      phone,
      updated_at: new Date().toISOString(),
    };
    DataService.saveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Account Profile</h1>
          <p className="text-xs text-slate-500">Manage personal contact details and review order metrics</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-amber-50/50 border-amber-200 text-amber-900">
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">Total Orders Placed</span>
          <p className="text-2xl font-black mt-1">{orders.length}</p>
        </Card>

        <Card className="p-4 bg-indigo-50/50 border-indigo-200 text-indigo-900">
          <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-700">User Role</span>
          <p className="text-2xl font-black mt-1">Student</p>
        </Card>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Email Address (Locked)"
            value={currentUser.email}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Contact Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />

          <div className="pt-2">
            <Button type="submit">Save Profile Changes</Button>
          </div>
        </form>
      </Card>

      {/* Campus Opportunities */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-black text-slate-900">Campus Opportunities & Fleet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/rider/registration" className="block">
            <Card className="p-4 hover:border-amber-400 transition-all hover:shadow-md group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Become a Campus Rider
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Earn ₦1,000+ per delivery run</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Card>
          </Link>

          <Link to="/vendor/application" className="block">
            <Card className="p-4 hover:border-indigo-400 transition-all hover:shadow-md group flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Register a Food Stall
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Join as verified vendor</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};
