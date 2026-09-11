import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { NewOrderToastContainer, ToastOrderInfo } from '../../components/vendor/NewOrderToast';
import { playNewOrderChime } from '../../lib/audioNotification';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  Utensils,
  DollarSign,
  AlertTriangle,
  Store,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Bell,
  Eye,
  Phone,
  MapPin,
  Calendar,
  Truck,
  FileText,
} from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const vendor = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : undefined;

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVOrd, setSelectedVOrd] = useState<{ parentId: string; vordId: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Order Details Modal state
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<{ parentOrder: any; vendorOrder: any } | null>(null);

  // Real-time toast state
  const [newOrderToasts, setNewOrderToasts] = useState<ToastOrderInfo[]>([]);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  // Populate initial seen order IDs
  useEffect(() => {
    if (!vendor) return;
    const initialVendorOrders = DataService.getVendorOrders(vendor.id);
    initialVendorOrders.forEach((vo) => {
      seenOrderIdsRef.current.add(vo.vendorOrder.id);
    });
    initializedRef.current = true;
  }, [vendor?.id]);

  // Real-time listener for new order events
  useEffect(() => {
    if (!vendor) return;

    const checkForNewOrders = () => {
      const currentOrders = DataService.getVendorOrders(vendor.id);
      const brandNewToasts: ToastOrderInfo[] = [];

      currentOrders.forEach(({ parentOrder, vendorOrder }) => {
        if (vendorOrder.status === 'PENDING' && !seenOrderIdsRef.current.has(vendorOrder.id)) {
          seenOrderIdsRef.current.add(vendorOrder.id);

          brandNewToasts.push({
            id: `toast-${vendorOrder.id}-${Date.now()}`,
            parentOrderId: parentOrder.id,
            vendorOrderId: vendorOrder.id,
            orderRef: parentOrder.order_reference,
            studentName: parentOrder.student_name,
            studentPhone: parentOrder.student_phone,
            fulfillmentMethod: parentOrder.fulfillment_method,
            items: vendorOrder.items.map((i) => ({
              quantity: i.quantity,
              mealName: i.meal_name_snapshot,
              subtotal: i.subtotal,
            })),
            totalSubtotal: vendorOrder.subtotal,
            createdAt: parentOrder.created_at,
          });
        }
      });

      if (brandNewToasts.length > 0) {
        setNewOrderToasts((prev) => [...brandNewToasts, ...prev]);
        playNewOrderChime();
      }
    };

    const handleOrderNotification = () => {
      setRefreshTrigger((prev) => prev + 1);
      checkForNewOrders();
    };

    window.addEventListener('storage', handleOrderNotification);
    window.addEventListener('campusbites_new_order_placed', handleOrderNotification);

    return () => {
      window.removeEventListener('storage', handleOrderNotification);
      window.removeEventListener('campusbites_new_order_placed', handleOrderNotification);
    };
  }, [vendor?.id]);

  if (!vendor) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-4 max-w-xl mx-auto my-8">
        <Store className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Vendor Profile Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You are logged in as a Vendor user, but no vendor business record is associated with your account yet. Submit a vendor application to get verified by administration.
        </p>
        <Link to="/vendor/application">
          <Button size="sm">Submit Vendor Application</Button>
        </Link>
      </div>
    );
  }

  // Handle application state checks
  if (vendor.verification_status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in duration-200">
        <Card className="p-8 text-center space-y-4 border-2 border-amber-200 bg-amber-50/40">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-10 h-10 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Pending Verification</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your vendor application for <span className="font-bold text-slate-900">{vendor.business_name}</span> has been received and is currently under review by the administrator.
            </p>
          </div>
          <Badge status="PENDING" />
          <p className="text-[11px] text-slate-400">
            Once approved by the platform admin, your vendor dashboard and meal management capabilities will unlock automatically.
          </p>
        </Card>
      </div>
    );
  }

  if (vendor.verification_status === 'REJECTED') {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in duration-200">
        <Card className="p-8 text-center space-y-4 border-2 border-rose-200 bg-rose-50/40">
          <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <XCircle className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Not Approved</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your vendor application for <span className="font-bold text-slate-900">{vendor.business_name}</span> was rejected by administration.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs text-rose-800 text-left max-w-md mx-auto">
            <span className="font-bold block mb-1">Rejection Reason:</span>
            {vendor.rejection_reason || 'Incomplete documentation or invalid campus location specs.'}
          </div>
          <Link to="/vendor/application">
            <Button size="sm">Update & Resubmit Application</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const meals = DataService.getMealsByVendor(vendor.id);
  const vendorOrders = DataService.getVendorOrders(vendor.id);

  const pendingOrders = vendorOrders.filter((vo) => vo.vendorOrder.status === 'PENDING');
  const preparingOrders = vendorOrders.filter((vo) => vo.vendorOrder.status === 'PREPARING');
  const readyOrders = vendorOrders.filter(
    (vo) => vo.vendorOrder.status === 'READY_FOR_PICKUP' || vo.vendorOrder.status === 'OUT_FOR_DELIVERY'
  );
  const completedOrders = vendorOrders.filter(
    (vo) => vo.vendorOrder.status === 'DELIVERED' || vo.vendorOrder.status === 'PICKED_UP'
  );

  const totalEarnings = completedOrders.reduce((sum, vo) => sum + vo.vendorOrder.subtotal, 0);

  const handleUpdateStatus = React.useCallback((parentOrderId: string, vendorOrderId: string, newStatus: OrderStatus) => {
    if (!currentUser) return;
    const result = DataService.updateVendorOrderStatus({
      parentOrderId,
      vendorOrderId,
      newStatus,
      actorUserId: currentUser.id,
      actorName: vendor.business_name,
    });
    if (result) {
      setRefreshTrigger((prev) => prev + 1);
      const label = newStatus.replace(/_/g, ' ');
      setActionToast(`Order status updated to ${label} successfully!`);
      setTimeout(() => setActionToast(null), 4000);
    }
    // Trigger re-render
    window.dispatchEvent(new Event('storage'));
  }, [currentUser, vendor?.business_name]);

  const handleRejectOrder = () => {
    if (!currentUser || !selectedVOrd || !rejectionReason) return;
    DataService.updateVendorOrderStatus({
      parentOrderId: selectedVOrd.parentId,
      vendorOrderId: selectedVOrd.vordId,
      newStatus: 'REJECTED',
      actorUserId: currentUser.id,
      actorName: vendor.business_name,
      rejectionReason,
    });
    setRefreshTrigger((prev) => prev + 1);
    setActionToast('Order rejected.');
    setTimeout(() => setActionToast(null), 4000);
    setRejectModalOpen(false);
    setSelectedVOrd(null);
    setRejectionReason('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleOpenOrderDetails = React.useCallback((parentOrderId: string) => {
    if (!vendor) return;
    const allOrders = DataService.getVendorOrders(vendor.id);
    const found = allOrders.find((o) => o.parentOrder.id === parentOrderId);
    if (found) {
      setSelectedOrderDetails(found);
      setOrderDetailsModalOpen(true);
    }
    setTimeout(() => {
      const el = document.getElementById(`order-card-${parentOrderId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [vendor?.id]);

  const handleConfirmFromToast = React.useCallback((parentOrderId: string, vendorOrderId: string) => {
    handleUpdateStatus(parentOrderId, vendorOrderId, 'CONFIRMED');
    setNewOrderToasts((prev) => prev.filter((t) => t.vendorOrderId !== vendorOrderId));
  }, [handleUpdateStatus]);

  const handleDismissToast = React.useCallback((toastId: string) => {
    setNewOrderToasts((prev) => prev.filter((t) => t.id !== toastId));
  }, []);

  const handleSimulateNewOrder = () => {
    if (!vendor) return;
    const vendorMeals = DataService.getMealsByVendor(vendor.id);
    if (vendorMeals.length === 0) return;

    const randomMeal = vendorMeals[Math.floor(Math.random() * vendorMeals.length)];
    const studentNames = ['Amina Bello', 'Chidi Okafor', 'Tunde Folorunsho', 'Kemi Adebayo', 'David Ayantade'];
    const randomStudent = studentNames[Math.floor(Math.random() * studentNames.length)];

    DataService.createMultiVendorOrder({
      student_id: `demo-student-${Date.now()}`,
      student_name: randomStudent,
      student_phone: `+234 81${Math.floor(10000000 + Math.random() * 90000000)}`,
      fulfillment_method: Math.random() > 0.5 ? 'DELIVERY' : 'CAMPUS_PICKUP',
      cartItems: [
        {
          meal: randomMeal,
          quantity: Math.floor(1 + Math.random() * 2),
          vendor: vendor,
        },
      ],
      delivery_details: {
        delivery_location: 'Moremi Hall, Block A, Room 108',
        location_description: 'Near Porter Lodge',
        contact_phone: '+234 812 345 6789',
        delivery_instructions: 'Ring phone on arrival',
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Real-Time Toast Notifications Container */}
      <NewOrderToastContainer
        toasts={newOrderToasts}
        onConfirm={handleConfirmFromToast}
        onDismiss={handleDismissToast}
        onReviewDetails={handleOpenOrderDetails}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{vendor.business_name}</h1>
            <Badge status="APPROVED" />
          </div>
          <p className="text-xs text-slate-500">Vendor Management Dashboard • Real-time order queue</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleSimulateNewOrder}
            variant="outline"
            size="sm"
            className="border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 font-bold"
            leftIcon={<Sparkles className="w-4 h-4 text-amber-600" />}
          >
            Simulate Student Order
          </Button>
          <Link to="/vendor/meals">
            <Button variant="outline" size="sm" leftIcon={<Utensils className="w-4 h-4" />}>
              Manage Meals
            </Button>
          </Link>
          <Link to="/vendor/orders">
            <Button size="sm" leftIcon={<Clock className="w-4 h-4" />}>
              View All Orders ({vendorOrders.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Toast Feedback Banner */}
      {actionToast && (
        <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-amber-50/60 border-amber-200 text-amber-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Pending Orders</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black mt-2 text-amber-900">{pendingOrders.length}</p>
          <span className="text-[10px] text-amber-700 block mt-0.5">Requires immediate confirmation</span>
        </Card>

        <Card className="p-4 bg-indigo-50/60 border-indigo-200 text-indigo-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">In Preparation</span>
            <Utensils className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black mt-2 text-indigo-900">{preparingOrders.length}</p>
          <span className="text-[10px] text-indigo-700 block mt-0.5">Kitchen actively cooking</span>
        </Card>

        <Card className="p-4 bg-teal-50/60 border-teal-200 text-teal-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">Ready / Dispatched</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-3xl font-black mt-2 text-teal-900">{readyOrders.length}</p>
          <span className="text-[10px] text-teal-700 block mt-0.5">Pickup / Delivery ready</span>
        </Card>

        <Card className="p-4 bg-emerald-50/60 border-emerald-200 text-emerald-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Completed Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black mt-2 text-emerald-900">₦{totalEarnings.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 block mt-0.5">{completedOrders.length} fulfilled sub-orders</span>
        </Card>
      </div>

      {/* Pending Action Required Queue Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Action Required: New Pending Orders
          </h2>
          <span className="text-xs font-semibold text-slate-500">{pendingOrders.length} pending</span>
        </div>

        {pendingOrders.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No pending orders waiting for confirmation right now.
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map(({ parentOrder, vendorOrder }) => (
              <Card id={`order-card-${parentOrder.id}`} key={vendorOrder.id} className="p-5 border-amber-300 bg-amber-50/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {parentOrder.order_reference}
                      </span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {parentOrder.fulfillment_method === 'DELIVERY' ? 'Campus Delivery' : 'Campus Pickup'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Customer: <span className="font-bold">{parentOrder.student_name}</span> ({parentOrder.student_phone})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenOrderDetails(parentOrder.id)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(parentOrder.id, vendorOrder.id, 'CONFIRMED')}
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      Confirm Order
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setSelectedVOrd({ parentId: parentOrder.id, vordId: vendorOrder.id });
                        setRejectModalOpen(true);
                      }}
                      leftIcon={<XCircle className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Items snapshot */}
                <div className="pt-3 space-y-1.5 text-xs text-slate-700">
                  <span className="font-bold block text-slate-900">Requested Items for {vendor.business_name}:</span>
                  {vendorOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between bg-white p-2 rounded-xl border border-slate-100">
                      <span>
                        <span className="font-bold text-slate-900">{item.quantity}x</span> {item.meal_name_snapshot}
                      </span>
                      <span className="font-bold text-slate-900">₦{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Comprehensive Order Details Modal */}
      <Modal
        isOpen={orderDetailsModalOpen}
        onClose={() => setOrderDetailsModalOpen(false)}
        title={selectedOrderDetails ? `Order Details #${selectedOrderDetails.parentOrder.order_reference}` : 'Order Details'}
      >
        {selectedOrderDetails && (
          <div className="space-y-4 text-xs">
            {/* Status & Method Summary Header */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-semibold block text-[11px]">Current Status</span>
                <Badge status={selectedOrderDetails.vendorOrder.status} />
              </div>
              <div className="text-right">
                <span className="text-slate-500 font-semibold block text-[11px]">Fulfillment Method</span>
                <span className="font-bold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1 mt-0.5">
                  {selectedOrderDetails.parentOrder.fulfillment_method === 'DELIVERY' ? (
                    <>
                      <Truck className="w-3 h-3" /> Campus Delivery
                    </>
                  ) : (
                    <>
                      <Utensils className="w-3 h-3" /> Campus Pickup
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Student & Contact Info */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1.5">
              <span className="font-extrabold text-amber-950 text-[11px] block uppercase tracking-wide">
                Customer Info
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrderDetails.parentOrder.student_name}</p>
                  <p className="text-slate-600 flex items-center gap-1 text-xs mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedOrderDetails.parentOrder.student_phone || 'No phone provided'}</span>
                  </p>
                </div>
                {selectedOrderDetails.parentOrder.student_phone && (
                  <a
                    href={`tel:${selectedOrderDetails.parentOrder.student_phone}`}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>
                )}
              </div>
            </div>

            {/* Delivery Location / Instructions */}
            {selectedOrderDetails.parentOrder.fulfillment_method === 'DELIVERY' && selectedOrderDetails.parentOrder.delivery_details && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" /> Delivery Address
                </span>
                <p className="font-extrabold text-slate-800 text-xs">
                  {selectedOrderDetails.parentOrder.delivery_details.delivery_location}
                </p>
                {selectedOrderDetails.parentOrder.delivery_details.location_description && (
                  <p className="text-slate-600 italic">
                    Landmark: {selectedOrderDetails.parentOrder.delivery_details.location_description}
                  </p>
                )}
                {selectedOrderDetails.parentOrder.delivery_details.delivery_instructions && (
                  <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200 text-[11px] mt-1">
                    <span className="font-bold">Instructions: </span>
                    {selectedOrderDetails.parentOrder.delivery_details.delivery_instructions}
                  </p>
                )}
              </div>
            )}

            {/* Itemized Meal List */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900 block">Requested Items ({selectedOrderDetails.vendorOrder.items.length}):</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedOrderDetails.vendorOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">{item.meal_name_snapshot}</p>
                      <p className="text-slate-500 text-[11px]">
                        {item.quantity} x ₦{item.unit_price_snapshot.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">₦{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-200 font-extrabold text-sm text-slate-900">
                <span>Vendor Portion Subtotal</span>
                <span className="text-amber-700">₦{selectedOrderDetails.vendorOrder.subtotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              {selectedOrderDetails.vendorOrder.status === 'PENDING' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setOrderDetailsModalOpen(false);
                      setSelectedVOrd({
                        parentId: selectedOrderDetails.parentOrder.id,
                        vordId: selectedOrderDetails.vendorOrder.id,
                      });
                      setRejectModalOpen(true);
                    }}
                  >
                    Reject Portion
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleUpdateStatus(selectedOrderDetails.parentOrder.id, selectedOrderDetails.vendorOrder.id, 'CONFIRMED');
                      setOrderDetailsModalOpen(false);
                    }}
                  >
                    Confirm Order
                  </Button>
                </>
              )}

              {selectedOrderDetails.vendorOrder.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrderDetails.parentOrder.id, selectedOrderDetails.vendorOrder.id, 'PREPARING');
                    setOrderDetailsModalOpen(false);
                  }}
                >
                  Start Preparing Meal
                </Button>
              )}

              {selectedOrderDetails.vendorOrder.status === 'PREPARING' && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleUpdateStatus(selectedOrderDetails.parentOrder.id, selectedOrderDetails.vendorOrder.id, 'READY_FOR_PICKUP');
                    setOrderDetailsModalOpen(false);
                  }}
                >
                  Mark Ready
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={() => setOrderDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Order Reason Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Order Portion">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a mandatory reason for rejecting this order so the student is notified clearly.
          </p>

          <Input
            label="Rejection Reason*"
            placeholder="e.g. Chicken out of stock, kitchen closed..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" disabled={!rejectionReason.trim()} onClick={handleRejectOrder}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
