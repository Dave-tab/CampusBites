import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Order, RiderProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Bike,
  Navigation,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Store,
  User,
  PackageCheck,
  ChevronRight,
  Send,
  Zap,
  ArrowRight,
  Star,
  Compass,
} from 'lucide-react';

export const RiderDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // OTP Verification Modal State
  const [otpModalOrder, setOtpModalOrder] = useState<Order | null>(null);
  const [otpValue, setOtpValue] = useState<string>('');
  const [proofNote, setProofNote] = useState<string>('Handed directly to student at delivery point');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Order Details Inspection Modal
  const [inspectionOrder, setInspectionOrder] = useState<Order | null>(null);

  const loadRiderData = useCallback(() => {
    if (!currentUser) return;
    let r = DataService.getRiderByUserId(currentUser.id);
    if (!r) {
      // Create fallback profile if needed
      const riders = DataService.getRiders();
      if (riders.length > 0) {
        r = riders[0];
      } else {
        r = {
          id: `rider-${Date.now()}`,
          user_id: currentUser.id,
          full_name: currentUser.full_name,
          phone: currentUser.phone || '+234 812 000 0000',
          email: currentUser.email,
          vehicle_type: 'BICYCLE',
          vehicle_plate: 'CAMPUS-ECO-01',
          campus_zone: 'All Campus Zones',
          is_online: true,
          rating: 4.9,
          total_deliveries: 12,
          today_deliveries: 2,
          total_earnings: 6000,
          today_earnings: 1000,
          wallet_balance: 4500,
          created_at: new Date().toISOString(),
        };
        DataService.saveRider(r);
      }
    }
    setRider(r);

    if (r) {
      setAvailableOrders(DataService.getAvailableDeliveries());
      setActiveOrders(DataService.getRiderActiveDeliveries(r.id));
      setCompletedOrders(DataService.getRiderCompletedDeliveries(r.id));
    }
  }, [currentUser]);

  useEffect(() => {
    loadRiderData();

    // Listen for storage events for real-time updates across tabs/roles
    const handleStorageChange = () => {
      loadRiderData();
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadRiderData, 4000); // Polling for order radar updates

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [loadRiderData]);

  // Online Toggle
  const handleToggleOnline = () => {
    if (!rider) return;
    const newStatus = DataService.toggleRiderOnline(rider.id);
    setRider({ ...rider, is_online: newStatus });
    setFeedbackMessage({
      type: 'success',
      text: newStatus
        ? '🟢 You are now ONLINE! Ready to receive campus delivery orders.'
        : '⚪ You are now OFFLINE. Delivery radar paused.',
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Claim order
  const handleClaimOrder = (order: Order) => {
    if (!rider) return;
    setActionLoading(order.id);

    const result = DataService.claimDelivery({
      parentOrderId: order.id,
      riderId: rider.id,
      riderName: rider.full_name,
      riderPhone: rider.phone,
      vehicleType: rider.vehicle_type,
    });

    setActionLoading(null);
    if (result.success) {
      setFeedbackMessage({ type: 'success', text: result.message });
      loadRiderData();
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  // Confirm Pickup from Vendor
  const handleConfirmPickup = (order: Order) => {
    if (!rider) return;
    setActionLoading(`pickup-${order.id}`);

    const result = DataService.confirmVendorPickup({
      parentOrderId: order.id,
      riderId: rider.id,
      riderName: rider.full_name,
    });

    setActionLoading(null);
    if (result.success) {
      setFeedbackMessage({ type: 'success', text: 'Meals collected from vendor! You are now en route.' });
      loadRiderData();
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Open OTP Modal
  const handleOpenOtpModal = (order: Order) => {
    setOtpModalOrder(order);
    setOtpValue('');
    setOtpError(null);
    setProofNote('Handed directly to student at delivery point');
  };

  // Submit OTP Verification
  const handleVerifyAndCompleteDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rider || !otpModalOrder) return;

    if (!otpValue.trim()) {
      setOtpError('Please enter the 4-digit verification code.');
      return;
    }

    const result = DataService.completeDeliveryWithOtp({
      parentOrderId: otpModalOrder.id,
      riderId: rider.id,
      riderName: rider.full_name,
      otpCode: otpValue.trim(),
      proofNote: proofNote.trim(),
    });

    if (result.success) {
      setOtpModalOrder(null);
      setFeedbackMessage({
        type: 'success',
        text: `🎉 Order #${otpModalOrder.order_reference} delivered successfully! ₦${(
          otpModalOrder.delivery_fee || 500
        ).toLocaleString()} credited to your wallet.`,
      });
      loadRiderData();
    } else {
      setOtpError(result.message);
    }
  };

  // Inject a live demo delivery order for testability
  const handleSimulateDeliveryOrder = () => {
    const randomHostels = [
      'Fajuyi Hall, Block C, Room 112',
      'Awolowo Hall, Block 4, Flat 18',
      'Moremi Hall of Residence, Wing A, Room 305',
      'SUB Complex Student Lounge',
      'Angola Hall, Block B, Room 104',
      'Postgraduate College Quad, Room 22',
    ];
    const destination = randomHostels[Math.floor(Math.random() * randomHostels.length)];
    const mockStudentId = 'user-student-1';
    const profiles = DataService.getProfiles();
    const studentUser = profiles.find((p) => p.id === mockStudentId) || profiles[0];
    const vendors = DataService.getVendors();
    const targetVendor = vendors[0];

    const newOrder = DataService.createMultiVendorOrder({
      student_id: studentUser.id,
      student_name: studentUser.full_name,
      student_phone: studentUser.phone || '+234 801 234 5678',
      fulfillment_method: 'DELIVERY',
      delivery_details: {
        delivery_location: destination,
        location_description: 'Near staircase gate',
        contact_phone: studentUser.phone || '+234 801 234 5678',
        delivery_instructions: 'Please call me when you reach the gate.',
      },
      cartItems: [
        {
          meal: {
            id: 'meal-1',
            vendor_id: targetVendor?.id || 'vendor-1',
            vendor_name: targetVendor?.business_name || 'Mama Cass Kitchen',
            category_id: 'cat-1',
            name: 'Smokey Party Jollof Rice with Chicken',
            description: 'Delicious hot jollof',
            price: 1800,
            image_url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=600&q=80',
            availability: 'AVAILABLE',
            created_at: new Date().toISOString(),
          },
          vendor: targetVendor || {
            id: 'vendor-1',
            owner_id: 'user-vendor-1',
            business_name: 'Mama Cass Kitchen',
            description: 'Campus cafeteria favourite',
            phone: '+234 802 345 6789',
            location_type: 'CAMPUS',
            address: 'SUB Complex, Room 4',
            verification_status: 'APPROVED',
            rating: 4.8,
            total_orders: 124,
            created_at: new Date().toISOString(),
          },
          quantity: 2,
        },
      ],
    });

    setFeedbackMessage({
      type: 'success',
      text: `🚀 Simulated new delivery request #${newOrder.order_reference} to ${destination}!`,
    });
    loadRiderData();
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const filteredAvailable = availableOrders.filter((order) => {
    if (selectedZone === 'ALL') return true;
    const loc = order.delivery_details?.delivery_location?.toLowerCase() || '';
    if (selectedZone === 'FAJUYI') return loc.includes('fajuyi');
    if (selectedZone === 'AWOLOWO') return loc.includes('awolowo');
    if (selectedZone === 'MOREMI') return loc.includes('moremi');
    if (selectedZone === 'SUB') return loc.includes('sub') || loc.includes('complex');
    return true;
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Toast Notification Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-200 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner / Rider Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pointer-events-none pr-8">
          <Bike className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Campus Logistics Partner
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {rider?.rating || 4.9} Rider Score
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{rider?.full_name || currentUser?.full_name || 'Campus Rider'}</span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-white/10 text-sky-200 font-mono font-medium">
                {rider?.vehicle_plate || 'CAMPUS-ECO-042'}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Delivering hot, authentic campus meals across student halls, faculty quads, and SUB with real-time OTP
              verification.
            </p>
          </div>

          {/* Quick Actions & Online Switch */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Online Status Toggle */}
            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                rider?.is_online
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  rider?.is_online ? 'bg-white animate-ping' : 'bg-slate-400'
                }`}
              />
              <span>{rider?.is_online ? 'Status: ONLINE (Active)' : 'Status: OFFLINE (Paused)'}</span>
            </button>

            {/* Simulate order button for ND2 Demo Testing */}
            <button
              onClick={handleSimulateDeliveryOrder}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all"
              title="Generate a demo delivery order to test radar"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Simulate Order</span>
            </button>

            <button
              onClick={loadRiderData}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all"
              title="Refresh radar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Earnings</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              ₦{(rider?.today_earnings || 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +{rider?.today_deliveries || 0} trips
            </span>
          </div>
          <p className="text-[11px] text-slate-400">₦500 standard campus delivery fee</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Wallet Balance</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              ₦{(rider?.wallet_balance || 0).toLocaleString()}
            </span>
            <Link
              to="/rider/earnings"
              className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
            >
              Withdraw →
            </Link>
          </div>
          <p className="text-[11px] text-slate-400">Instant payout to Nigerian banks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Tasks</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeOrders.length}</span>
            <span className="text-xs text-slate-500">in progress</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {activeOrders.length > 0 ? 'Delivery underway' : 'Ready for next request'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Completed</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{rider?.total_deliveries || 0}</span>
            <span className="text-xs text-slate-500">deliveries</span>
          </div>
          <p className="text-[11px] text-slate-400">99.4% on-time fulfillment rate</p>
        </div>
      </div>

      {/* ACTIVE DELIVERY TASKS SECTION */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h2 className="text-lg font-black text-slate-900">Active Delivery Missions ({activeOrders.length})</h2>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
              In Progress
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeOrders.map((order) => {
              const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
              const vendorNames = order.vendor_orders.map((v) => v.vendor_name).join(' & ');

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-6 space-y-6 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
                          #{order.order_reference}
                        </span>
                        <Badge
                          variant={isOutForDelivery ? 'info' : 'warning'}
                          className="text-xs font-bold uppercase"
                        >
                          {isOutForDelivery ? '🛵 Out for Delivery' : '🍳 Collecting from Vendor'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        Placed {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        Fee: ₦{(order.delivery_fee || 500).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setInspectionOrder(order)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Inspect Items
                      </button>
                    </div>
                  </div>

                  {/* Route Waypoints Visualization */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Step 1: Pickup Point */}
                      <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                              Pickup Kiosk(s)
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Step 1</span>
                          </div>
                          <p className="text-xs font-black text-slate-800 truncate">{vendorNames}</p>
                          <p className="text-[11px] text-slate-500">
                            {order.vendor_orders.reduce((acc, vo) => acc + vo.items.length, 0)} meals total
                          </p>
                        </div>
                      </div>

                      {/* Step 2: Student Delivery Point */}
                      <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs">
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                              Student Destination
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">Step 2</span>
                          </div>
                          <p className="text-xs font-black text-slate-800">
                            {order.delivery_details?.delivery_location || 'Campus Hostel'}
                          </p>
                          {order.delivery_details?.delivery_instructions && (
                            <p className="text-[11px] text-amber-700 font-medium italic truncate">
                              "{order.delivery_details.delivery_instructions}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Student Contact Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {order.student_name || 'Student Customer'}
                        </span>
                        <span className="text-xs text-slate-400">({order.student_phone || 'No phone'})</span>
                      </div>

                      {order.student_phone && (
                        <a
                          href={`tel:${order.student_phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Student</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Rider Step Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {!isOutForDelivery ? (
                      <Button
                        variant="primary"
                        className="w-full sm:flex-1 py-3 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md flex items-center justify-center gap-2"
                        onClick={() => handleConfirmPickup(order)}
                        disabled={actionLoading === `pickup-${order.id}`}
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>
                          {actionLoading === `pickup-${order.id}`
                            ? 'Updating Status...'
                            : 'Confirm Collected from Vendor(s)'}
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        className="w-full sm:flex-1 py-3 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center justify-center gap-2"
                        onClick={() => handleOpenOtpModal(order)}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Student OTP & Complete Handover</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AVAILABLE DELIVERY RADAR QUEUE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-black text-slate-900">Campus Delivery Radar</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-800 rounded-full">
                {filteredAvailable.length} Available
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time feed of unassigned orders requiring delivery across campus zones
            </p>
          </div>

          {/* Campus Zone Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Zones' },
              { id: 'FAJUYI', label: 'Fajuyi Hall' },
              { id: 'AWOLOWO', label: 'Awolowo Hall' },
              { id: 'MOREMI', label: 'Moremi Hall' },
              { id: 'SUB', label: 'SUB / Faculty' },
            ].map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedZone === zone.id
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offline Warning Banner */}
        {!rider?.is_online && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>You are currently <strong>Offline</strong>. Switch to Online to claim active deliveries.</span>
            </div>
            <button
              onClick={handleToggleOnline}
              className="px-3 py-1 font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Go Online
            </button>
          </div>
        )}

        {/* Deliveries List Grid */}
        {filteredAvailable.length === 0 ? (
          <EmptyState
            title="Radar Clear - No Unassigned Deliveries"
            description="All orders are currently covered by riders. Click 'Simulate Order' above to trigger a test delivery request."
            actionLabel="Simulate Test Order"
            onAction={handleSimulateDeliveryOrder}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailable.map((order) => {
              const vendorNames = order.vendor_orders.map((v) => v.vendor_name).join(', ');
              const totalItems = order.vendor_orders.reduce(
                (sum, vo) => sum + vo.items.reduce((iSum, i) => iSum + i.quantity, 0),
                0
              );

              return (
                <div
                  key={order.id}
                  className="bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 p-5 space-y-4 transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        #{order.order_reference}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                        +₦{(order.delivery_fee || 500).toLocaleString()} Payout
                      </span>
                    </div>

                    {/* Waypoint snippet */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <Store className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{vendorNames}</p>
                          <p className="text-[11px] text-slate-500">{totalItems} meal item(s)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">
                            {order.delivery_details?.delivery_location || 'Campus Hostel'}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {order.delivery_details?.location_description || 'Direct delivery'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Est. 4-6 mins</span>
                      <span>{order.student_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectionOrder(order)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold"
                        title="View details"
                      >
                        Inspect
                      </button>
                      <Button
                        variant="primary"
                        className="flex-1 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-xs"
                        disabled={!rider?.is_online || actionLoading === order.id}
                        onClick={() => handleClaimOrder(order)}
                      >
                        {actionLoading === order.id ? 'Claiming...' : 'Claim Delivery 🚴'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* COMPLETED DELIVERIES SUMMARY */}
      {completedOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Recent Completed Deliveries ({completedOrders.length})</span>
            </h3>
            <Link
              to="/rider/deliveries"
              className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
            >
              View Full History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {completedOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800">
                    #{order.order_reference} • {order.delivery_details?.delivery_location || 'Campus'}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Completed {order.completed_at ? new Date(order.completed_at).toLocaleTimeString() : 'Recently'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 text-sm">
                    +₦{(order.delivery_fee || 500).toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">OTP Verified</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OTP HANDOVER VERIFICATION MODAL */}
      {otpModalOrder && (
        <Modal
          isOpen={true}
          onClose={() => setOtpModalOrder(null)}
          title="Verify Student Delivery OTP"
        >
          <form onSubmit={handleVerifyAndCompleteDelivery} className="space-y-5">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                Handover Verification Required
              </p>
              <p>
                Ask <strong>{otpModalOrder.student_name}</strong> for the 4-digit code displayed on their live order
                tracker screen.
              </p>
            </div>

            <div className="space-y-2 text-center py-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Enter 4-Digit Student Code
              </label>
              <div className="max-w-[200px] mx-auto">
                <input
                  type="text"
                  maxLength={4}
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value.replace(/[^0-9]/g, ''));
                    setOtpError(null);
                  }}
                  placeholder="e.g. 7429"
                  className="w-full text-center tracking-[0.5em] text-2xl font-black font-mono py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Hint for demo tester: Code on student screen is{' '}
                <strong className="text-slate-700">{otpModalOrder.delivery_otp || '7429'}</strong>
              </p>
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600">Proof of Delivery Note</label>
              <Input
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="e.g. Handed directly to student at Fajuyi Gate"
                className="text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOtpModalOrder(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm & Credit ₦{(otpModalOrder.delivery_fee || 500).toLocaleString()}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* INSPECTION MODAL */}
      {inspectionOrder && (
        <Modal
          isOpen={true}
          onClose={() => setInspectionOrder(null)}
          title={`Order #${inspectionOrder.order_reference} Details`}
        >
          <div className="space-y-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{inspectionOrder.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Drop-off:</span>
                <span className="font-bold text-slate-800">{inspectionOrder.delivery_details?.delivery_location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Fee:</span>
                <span className="font-bold text-emerald-600">
                  ₦{(inspectionOrder.delivery_fee || 500).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Meal Items to Collect</p>
              {inspectionOrder.vendor_orders.map((vo) => (
                <div key={vo.id} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2">
                  <p className="font-bold text-indigo-900">{vo.vendor_name}</p>
                  <ul className="space-y-1.5">
                    {vo.items.map((it) => (
                      <li key={it.id} className="flex justify-between text-slate-700">
                        <span>
                          {it.quantity}x {it.meal_name_snapshot}
                        </span>
                        <span className="font-semibold">₦{it.subtotal.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setInspectionOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
