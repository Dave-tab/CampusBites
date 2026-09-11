import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { OrderStatus } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Phone,
  Search,
  Building,
  Utensils,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const VendorOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const vendor = currentUser ? DataService.getVendorByOwnerId(currentUser.id) : undefined;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [actionToast, setActionToast] = useState<string | null>(null);

  React.useEffect(() => {
    const handleStorage = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<{ parentId: string; vordId: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!vendor) return null;

  const vendorOrders = DataService.getVendorOrders(vendor.id);

  const filtered = vendorOrders.filter(({ parentOrder, vendorOrder }) => {
    const matchesSearch =
      parentOrder.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      parentOrder.student_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      vendorOrder.status === statusFilter ||
      (statusFilter === 'ACTIVE' && ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(vendorOrder.status));

    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (parentOrderId: string, vendorOrderId: string, newStatus: OrderStatus) => {
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
      const statusLabel = newStatus.replace(/_/g, ' ');
      setActionToast(`Order status updated to ${statusLabel} successfully!`);
      setTimeout(() => setActionToast(null), 4000);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleRejectOrder = () => {
    if (!currentUser || !selectedOrderIds || !rejectionReason.trim()) return;
    DataService.updateVendorOrderStatus({
      parentOrderId: selectedOrderIds.parentId,
      vendorOrderId: selectedOrderIds.vordId,
      newStatus: 'REJECTED',
      actorUserId: currentUser.id,
      actorName: vendor.business_name,
      rejectionReason,
    });
    setRefreshTrigger((prev) => prev + 1);
    setActionToast('Order portion rejected.');
    setTimeout(() => setActionToast(null), 4000);
    setRejectModalOpen(false);
    setSelectedOrderIds(null);
    setRejectionReason('');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" /> Vendor Sub-Orders Queue
          </h1>
          <p className="text-xs text-slate-500">
            Process orders for {vendor.business_name}. Confirm, prepare, and update statuses independently.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            All ({vendorOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('PREPARING')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'PREPARING' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Preparing
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Active Queue
          </button>
        </div>
      </div>

      {/* Action Toast Feedback Banner */}
      {actionToast && (
        <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by reference code or student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 rounded-xl outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-12 h-12 text-slate-300" />}
          title="No Orders Found"
          description="There are no vendor sub-orders matching the selected filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(({ parentOrder, vendorOrder }) => (
            <Card key={vendorOrder.id} className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 text-slate-800 rounded-xl font-mono font-black text-sm">
                    {parentOrder.order_reference}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{parentOrder.student_name}</span>
                      <span className="text-xs text-slate-500">({parentOrder.student_phone})</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Placed: {new Date(vendorOrder.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                    {parentOrder.fulfillment_method === 'DELIVERY' ? 'Campus Delivery' : 'Campus Pickup'}
                  </span>
                  <Badge status={vendorOrder.status} />
                </div>
              </div>

              {/* Delivery Details */}
              {parentOrder.delivery_details && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" /> Delivery Address:
                    </span>
                    <span>{parentOrder.delivery_details.delivery_location}</span>
                  </div>
                  {parentOrder.delivery_details.contact_phone && (
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {parentOrder.delivery_details.contact_phone}
                    </span>
                  )}
                </div>
              )}

              {/* Vendor Items Table */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-900">Your Menu Items in this Order:</span>
                <div className="space-y-1.5">
                  {vendorOrder.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                      <span className="font-medium text-slate-900">
                        <span className="font-bold">{it.quantity}x</span> {it.meal_name_snapshot}
                      </span>
                      <span className="font-black text-slate-900">₦{it.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-bold text-slate-900">
                  Subtotal: <span className="text-amber-700 font-black text-sm">₦{vendorOrder.subtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {vendorOrder.status === 'PENDING' && (
                    <>
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
                          setSelectedOrderIds({ parentId: parentOrder.id, vordId: vendorOrder.id });
                          setRejectModalOpen(true);
                        }}
                        leftIcon={<XCircle className="w-4 h-4" />}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {vendorOrder.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(parentOrder.id, vendorOrder.id, 'PREPARING')}
                      leftIcon={<Utensils className="w-4 h-4" />}
                    >
                      Start Preparing
                    </Button>
                  )}

                  {vendorOrder.status === 'PREPARING' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateStatus(
                          parentOrder.id,
                          vendorOrder.id,
                          parentOrder.fulfillment_method === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP'
                        )
                      }
                      leftIcon={<Truck className="w-4 h-4" />}
                    >
                      {parentOrder.fulfillment_method === 'DELIVERY' ? 'Mark Out for Delivery' : 'Mark Ready for Pickup'}
                    </Button>
                  )}

                  {(vendorOrder.status === 'READY_FOR_PICKUP' || vendorOrder.status === 'OUT_FOR_DELIVERY') && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
                      onClick={() =>
                        handleUpdateStatus(
                          parentOrder.id,
                          vendorOrder.id,
                          parentOrder.fulfillment_method === 'DELIVERY' ? 'DELIVERED' : 'PICKED_UP'
                        )
                      }
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      {parentOrder.fulfillment_method === 'DELIVERY' ? 'Mark Delivered' : 'Mark Picked Up'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Order Items">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a mandatory rejection reason for the student.
          </p>

          <Input
            label="Rejection Reason*"
            placeholder="e.g. Item currently out of stock..."
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
