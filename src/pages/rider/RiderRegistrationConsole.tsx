import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { RiderVehicleType, RiderProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  Bike,
  CheckCircle2,
  ShieldCheck,
  Zap,
  DollarSign,
  MapPin,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building,
  Navigation,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

const VEHICLE_OPTIONS: { type: RiderVehicleType; label: string; icon: string; desc: string }[] = [
  {
    type: 'BICYCLE',
    label: 'Campus Bicycle',
    icon: '🚲',
    desc: 'Zero fuel cost, easy hostel pathway navigation & green transport',
  },
  {
    type: 'MOTORBIKE',
    label: 'Motorbike / Okada',
    icon: '🛵',
    desc: 'High speed deliveries between far off-campus vendors and hostels',
  },
  {
    type: 'SCOOTER',
    label: 'Electric Scooter',
    icon: '🛴',
    desc: 'Fast, smooth campus sidewalk cruising for small quick food orders',
  },
  {
    type: 'ON_FOOT',
    label: 'Walker / On-Foot Courier',
    icon: '👟',
    desc: 'Short-range deliveries inside your specific hostel block or quad',
  },
];

const CAMPUS_ZONES = [
  { value: 'All Campus Zones', label: 'All Campus Zones (Maximum Delivery Orders)' },
  { value: 'Male Hostels Quad', label: 'Male Hostels (Kuti, Mellanby, Tedder, Bello)' },
  { value: 'Female Hostels Quad', label: 'Female Hostels (Queen Idia, Queen Elizabeth, Awo)' },
  { value: 'Faculty Complex & Blocks', label: 'Faculty Complex (Science, Tech, Arts, Law)' },
  { value: 'Postgraduate & Staff Quarters', label: 'Postgraduate & Staff Quarters' },
  { value: 'Off-Campus Annex & Stalls', label: 'Off-Campus Commercial Stalls & Gates' },
];

export const RiderRegistrationConsole: React.FC = () => {
  const { currentUser, loginAsDemoRole } = useAuth();
  const navigate = useNavigate();

  const existingRider = currentUser ? DataService.getRiderByUserId(currentUser.id) : undefined;

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+234 812 000 0000');
  const [studentMatric, setStudentMatric] = useState('CB/2026/' + Math.floor(1000 + Math.random() * 9000));
  const [vehicleType, setVehicleType] = useState<RiderVehicleType>(existingRider?.vehicle_type || 'BICYCLE');
  const [vehiclePlate, setVehiclePlate] = useState(existingRider?.vehicle_plate || 'CAMPUS-ECO-01');
  const [campusZone, setCampusZone] = useState(existingRider?.campus_zone || 'All Campus Zones');
  const [bankName, setBankName] = useState('Kuda Microfinance Bank');
  const [accountNumber, setAccountNumber] = useState('2019482910');
  const [accountName, setAccountName] = useState(currentUser?.full_name || 'David Ayantade');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const riderId = existingRider?.id || `rider-${Date.now()}`;
      const newRiderProfile: RiderProfile = {
        id: riderId,
        user_id: currentUser?.id || `user-rider-${Date.now()}`,
        full_name: fullName,
        email: email,
        phone: phone,
        vehicle_type: vehicleType,
        vehicle_plate: vehiclePlate,
        campus_zone: campusZone,
        is_online: true,
        rating: existingRider?.rating || 5.0,
        total_deliveries: existingRider?.total_deliveries || 0,
        today_deliveries: existingRider?.today_deliveries || 0,
        total_earnings: existingRider?.total_earnings || 0,
        today_earnings: existingRider?.today_earnings || 0,
        wallet_balance: existingRider?.wallet_balance || 2500, // Welcome signup bonus
        created_at: existingRider?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      DataService.saveRider(newRiderProfile);

      // Create notification
      if (currentUser) {
        DataService.addNotification({
          recipient_user_id: currentUser.id,
          type: 'SYSTEM',
          title: '🎉 Rider Fleet Verification Active!',
          message: `Welcome to the CampusBites Dispatch Fleet! You can now accept deliveries across ${campusZone}.`,
        });
      }

      // Switch active role to RIDER in demo context
      loginAsDemoRole('RIDER');

      setIsSubmitting(false);
      setSubmittedSuccess(true);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Console Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-amber-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              <Bike className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Campus Dispatch Fleet
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Instant Activation
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Rider Registration & Verification Console
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Deliver meals between classes, earn ₦1,000+ per delivery run, and withdraw earnings instantly.
              </p>
            </div>
          </div>

          <Link to="/rider/dashboard" className="self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => loginAsDemoRole('RIDER')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Switch to Rider Mode</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Quick Fleet Benefits Highlight */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs p-2.5 rounded-xl">
            <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">Keep 100% Tips & Fees</p>
              <p className="text-[10px] text-slate-400">Direct wallet crediting</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs p-2.5 rounded-xl">
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">Flexible Schedules</p>
              <p className="text-[10px] text-slate-400">Toggle Online / Offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-black/20 backdrop-blur-xs p-2.5 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-black text-white">Secure OTP Delivery</p>
              <p className="text-[10px] text-slate-400">Verified student handoff</p>
            </div>
          </div>
        </div>
      </div>

      {submittedSuccess ? (
        /* Success State View */
        <Card className="p-8 sm:p-10 text-center space-y-6 border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50/50 to-white shadow-xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rider Account Successfully Activated!</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              You are now registered as an active campus dispatch rider for <span className="font-bold text-slate-900">{campusZone}</span> with your <span className="font-bold text-slate-900">{vehicleType.replace(/_/g, ' ')}</span>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Rider Name:</span>
              <span className="font-extrabold text-slate-900">{fullName}</span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Vehicle Mode:</span>
              <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {vehicleType} ({vehiclePlate})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500 font-semibold">Assigned Zone:</span>
              <span className="font-extrabold text-slate-900">{campusZone}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Status:</span>
              <span className="font-black text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                VERIFIED & ONLINE
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/rider/dashboard')}
              leftIcon={<Navigation className="w-5 h-5" />}
              className="w-full sm:w-auto font-black shadow-lg"
            >
              Launch Rider Dispatch Console
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/rider/deliveries')}
              leftIcon={<Bike className="w-5 h-5" />}
              className="w-full sm:w-auto font-bold"
            >
              View Available Delivery Jobs
            </Button>
          </div>
        </Card>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Student Details */}
          <Card className="p-6 sm:p-7 space-y-5 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">1. Student Courier Profile</h3>
                <p className="text-xs text-slate-500">Provide your verified student identification details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Ayantade"
                required
              />
              <Input
                label="Student Matric / ID Number"
                value={studentMatric}
                onChange={(e) => setStudentMatric(e.target.value)}
                placeholder="e.g. CB/2026/8942"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number (SMS & WhatsApp)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 812 000 0000"
                required
              />
              <Input
                label="Student Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusbites.edu"
                required
              />
            </div>
          </Card>

          {/* Step 2: Fleet & Vehicle Selection */}
          <Card className="p-6 sm:p-7 space-y-5 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">2. Delivery Transport & Equipment</h3>
                <p className="text-xs text-slate-500">Choose how you plan to deliver food across campus</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Your Vehicle Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VEHICLE_OPTIONS.map((opt) => {
                  const isSelected = vehicleType === opt.type;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setVehicleType(opt.type)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-3xl shrink-0">{opt.icon}</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-sm text-slate-900">{opt.label}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Vehicle Plate / Campus Tag Number"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="e.g. CAMPUS-ECO-01 or N/A"
              />
              <Select
                label="Primary Operating Campus Zone"
                value={campusZone}
                onChange={(e) => setCampusZone(e.target.value)}
                options={CAMPUS_ZONES}
              />
            </div>
          </Card>

          {/* Step 3: Payout Account (Instant Earnings) */}
          <Card className="p-6 sm:p-7 space-y-5 border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">3. Earnings Payout Account</h3>
                <p className="text-xs text-slate-500">
                  Deliveries and student tips are automatically paid into this account
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Bank Name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Kuda, OPay, GTBank"
                required
              />
              <Input
                label="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit NUBAN"
                required
              />
              <Input
                label="Account Name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Full Name on Account"
                required
              />
            </div>
          </Card>

          {/* Terms & Submit Button */}
          <Card className="p-6 space-y-5 border-slate-200 bg-slate-50/80">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed font-medium">
                I agree to the <span className="font-bold text-slate-900">CampusBites Dispatch Code of Conduct</span>. I
                promise to handle all student food orders with proper hygiene, verify 4-digit student delivery OTPs,
                and observe all campus road and pedestrian safety rules.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">Instant Verification:</span> No wait time for verified
                students.
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                disabled={!agreedTerms || !fullName || !phone}
                leftIcon={<Bike className="w-5 h-5" />}
                className="w-full sm:w-auto font-black shadow-md"
              >
                Complete Rider Registration & Launch Console
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};
