import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { ReviewModal } from '../../components/ui/ReviewModal';
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Store,
  XCircle,
  History,
  Phone,
  MapPin,
  HelpCircle,
  Star,
  MessageSquare,
  Bike,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

export const OrderTracker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const order = DataService.getOrderById(id || '');
  const statusHistory = order ? DataService.getStatusHistory(order.id) : [];
  const reviewsForOrder = order ? DataService.getReviewsForOrder(order.id) : [];
  const isOrderCompleted = order && ['DELIVERED', 'PICKED_UP'].includes(order.status);

  if (!order) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link to="/student/orders">
          <Button size="sm">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Determine active step index for the visual progress stepper
  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY_FOR_PICKUP':
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'PICKED_UP':
      case 'DELIVERED':
        return 4;
      case 'CANCELLED':
      case 'REJECTED':
      case 'PARTIALLY_CANCELLED':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(order.status);

  const steps = [
    { label: 'Order Placed', desc: 'Received by system' },
    { label: 'Confirmed', desc: 'Accepted by vendor(s)' },
    { label: 'Preparing', desc: 'Meals cooking fresh' },
    {
      label: order.fulfillment_method === 'DELIVERY' ? 'Out for Delivery' : 'Ready for Pickup',
      desc: order.fulfillment_method === 'DELIVERY' ? 'Rider on the way' : 'Collect at vendor stall',
    },
    {
      label: order.fulfillment_method === 'DELIVERY' ? 'Delivered' : 'Picked Up',
      desc: 'Completed',
    },
  ];

  const handleCancelOrder = () => {
    if (!currentUser) return;
    setIsCancelling(true);
    const success = DataService.cancelOrder(order.id, currentUser.id, cancelReason);
    setIsCancelling(false);
    setCancelModalOpen(false);
    if (!success) {
      alert('Order cannot be cancelled once vendor preparation has started.');
    }
  };

  const canCancel = order.vendor_orders.every((vo) => vo.status === 'PENDING' || vo.status === 'CONFIRMED');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/student/orders" className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 font-mono tracking-wider">
                {order.order_reference}
              </h1>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        {canCancel && order.status !== 'CANCELLED' && order.status !== 'REJECTED' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setCancelModalOpen(true)}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Cancel Order
          </Button>
        )}
      </div>

      {/* Completed Order Review Callout */}
      {isOrderCompleted && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-slate-950 p-5 rounded-2xl shadow-md border border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/90 rounded-2xl text-amber-700 shadow-xs">
              <Star className="w-6 h-6 fill-amber-500 text-amber-500 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-950">How Was Your Meal & Campus Delivery?</h3>
              <p className="text-xs font-medium text-slate-900/80">
                {reviewsForOrder.length > 0
                  ? `You submitted ${reviewsForOrder.length} review(s) for this order! Click to view or write another.`
                  : 'Rate vendor food quality, portion size, and delivery speed to help fellow campus students!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{reviewsForOrder.length > 0 ? 'View / Write Review' : '⭐ Rate & Review Order'}</span>
          </button>
        </div>
      )}

      {/* Visual Order Progress Stepper */}
      {currentStep >= 0 ? (
        <Card className="p-6 space-y-4 border border-slate-200 bg-white">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status Progress</h3>

          <div className="relative flex items-center justify-between max-w-2xl mx-auto py-2">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-0" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-600 transition-all duration-500 -z-0"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((st, idx) => {
              const isCompleted = idx < currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={st.label} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100'
                        : isCurrent
                        ? 'bg-amber-600 text-white ring-4 ring-amber-200 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-bold mt-2 ${isCurrent ? 'text-amber-700' : 'text-slate-700'}`}>
                    {st.label}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block max-w-20">{st.desc}</span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>This order was {order.status.toLowerCase().replace(/_/g, ' ')}. No active tracking is available.</span>
        </div>
      )}

      {/* Multi-Vendor Sub-Orders Progress */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" /> Multi-Vendor Sub-Orders Breakdown
        </h3>

        <div className="space-y-4 divide-y divide-slate-100">
          {order.vendor_orders.map((vo) => (
            <div key={vo.id} className="pt-4 first:pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{vo.vendor_name}</h4>
                  <span className="text-xs text-slate-500">Subtotal: ₦{vo.subtotal.toLocaleString()}</span>
                </div>
                <Badge status={vo.status} />
              </div>

              {vo.rejection_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  <span className="font-bold block">Vendor Rejection Note:</span>
                  {vo.rejection_reason}
                </div>
              )}

              {/* Items List */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                {vo.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      {item.image_url && (
                        <img src={item.image_url} alt="" loading="lazy" className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <span>
                        <span className="font-bold text-slate-900">{item.quantity}x</span> {item.meal_name_snapshot}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900">₦{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery / Fulfillment Details & Security OTP */}
      {order.fulfillment_method === 'DELIVERY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* OTP Security Card */}
          <Card className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Delivery Handover OTP
              </span>
              <span className="text-[10px] font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-full">
                Security Code
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 text-center shadow-xs space-y-1">
              <p className="text-[11px] text-slate-500 font-medium">Give this code to your rider at delivery:</p>
              <div className="text-3xl font-black font-mono tracking-[0.35em] text-slate-900">
                {order.delivery_otp || '7429'}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verifies delivery completion and safeguards your food.</span>
            </p>
          </Card>

          {/* Assigned Campus Rider Card */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-sky-600" />
                Assigned Campus Rider
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  order.rider_name ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {order.rider_name ? 'Rider Assigned' : 'Finding Rider...'}
              </span>
            </div>

            {order.rider_name ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{order.rider_name}</h4>
                    <p className="text-xs text-slate-500">
                      Vehicle: {order.rider_vehicle_type || 'Bicycle'} • Campus Logistics
                    </p>
                  </div>
                  {order.rider_phone && (
                    <a
                      href={`tel:${order.rider_phone}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  📍 Destination: <strong>{order.delivery_details?.delivery_location}</strong>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700">Order broadcasted to Campus Riders</p>
                <p className="text-[11px] text-slate-400">
                  A rider in your hostel zone will claim and collect your hot meal shortly.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Delivery / Fulfillment Details */}
      {order.delivery_details && (
        <Card className="p-6 space-y-3">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-600" /> Delivery Address & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Delivery Location</span>
              <span className="font-bold text-slate-900">{order.delivery_details.delivery_location}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Landmark / Description</span>
              <span className="font-semibold text-slate-800">{order.delivery_details.location_description || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Recipient Phone</span>
              <span className="font-bold text-slate-900">{order.delivery_details.contact_phone}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Delivery Instructions</span>
              <span className="font-semibold text-slate-800">{order.delivery_details.delivery_instructions || 'None'}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Status History Audit Log */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-600" /> Order Status History & Audit Trail
        </h3>

        <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-100">
          {statusHistory.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No history recorded yet.</p>
          ) : (
            statusHistory.map((h) => (
              <div key={h.id} className="relative pl-7 space-y-1">
                <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-amber-600 ring-4 ring-amber-100" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{h.actor_name || 'System'}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge status={h.new_status} />
                  {h.note && <span className="text-slate-500 font-normal">({h.note})</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel order <span className="font-bold text-slate-900">{order.order_reference}</span>? Vendors will be notified immediately.
          </p>

          <Input
            label="Reason for Cancellation (Optional)"
            placeholder="e.g. Ordered by mistake, wrong delivery address..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleCancelOrder}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      {order && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          order={order}
        />
      )}
    </div>
  );
};
