import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Order, RiderProfile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Bike,
  PackageCheck,
  Clock,
  MapPin,
  Store,
  CheckCircle2,
  Calendar,
  DollarSign,
  ChevronRight,
  Phone,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react';

export const RiderDeliveries: React.FC = () => {
  const { currentUser } = useAuth();
  const [rider, setRider] = useState<RiderProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadDeliveries = useCallback(() => {
    if (!currentUser) return;
    const r = DataService.getRiderByUserId(currentUser.id) || DataService.getRiders()[0];
    setRider(r);
    if (r) {
      setActiveOrders(DataService.getRiderActiveDeliveries(r.id));
      setCompletedOrders(DataService.getRiderCompletedDeliveries(r.id));
    }
  }, [currentUser]);

  useEffect(() => {
    loadDeliveries();
    window.addEventListener('storage', loadDeliveries);
    return () => window.removeEventListener('storage', loadDeliveries);
  }, [loadDeliveries]);

  const displayedOrders = (activeTab === 'ACTIVE' ? activeOrders : completedOrders).filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.order_reference.toLowerCase().includes(q) ||
      (o.student_name && o.student_name.toLowerCase().includes(q)) ||
      (o.delivery_details?.delivery_location && o.delivery_details.delivery_location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bike className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Deliveries & Route Log</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active missions, past drop-offs, proof notes, and trip fares.
          </p>
        </div>

        <Link to="/rider/dashboard">
          <Button variant="primary" className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
            Open Radar →
          </Button>
        </Link>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Active Deliveries ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed History ({completedOrders.length})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ref, hostel, student..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Delivery Cards List */}
      {displayedOrders.length === 0 ? (
        <EmptyState
          title={activeTab === 'ACTIVE' ? 'No Active Delivery Tasks' : 'No Completed Deliveries Yet'}
          description={
            activeTab === 'ACTIVE'
              ? 'Visit the Campus Delivery Radar to claim available orders.'
              : 'Completed delivery trips and verified handovers will appear here.'
          }
          actionLabel={activeTab === 'ACTIVE' ? 'Go to Delivery Radar' : undefined}
          onAction={activeTab === 'ACTIVE' ? () => (window.location.href = '/rider/dashboard') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const vendorNames = order.vendor_orders.map((v) => v.vendor_name).join(', ');

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded-lg">
                        #{order.order_reference}
                      </span>
                      <Badge
                        variant={isDelivered ? 'success' : order.status === 'OUT_FOR_DELIVERY' ? 'info' : 'warning'}
                        className="text-[10px] font-bold uppercase"
                      >
                        {order.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      +₦{(order.delivery_fee || 500).toLocaleString()}
                    </span>
                  </div>

                  {/* Route points */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-600">
                      <Store className="w-3.5 h-3.5 text-indigo-600 mt-0.5 shrink-0" />
                      <span className="font-medium truncate">
                        <strong>Pickup:</strong> {vendorNames}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <span className="font-medium">
                        <strong>Drop-off:</strong> {order.delivery_details?.delivery_location || 'Campus'}
                      </span>
                    </div>
                  </div>

                  {order.delivery_proof_note && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Proof:</span> {order.delivery_proof_note}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {order.completed_at
                      ? `Delivered ${new Date(order.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : `Created ${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1"
                  >
                    <span>View Manifest</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MANIFEST DETAIL MODAL */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Delivery Manifest #${selectedOrder.order_reference}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Student:</span>
                <span className="font-bold text-slate-800">{selectedOrder.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-bold text-slate-800">{selectedOrder.student_phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Address:</span>
                <span className="font-bold text-slate-800">
                  {selectedOrder.delivery_details?.delivery_location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Status:</span>
                <Badge variant={selectedOrder.status === 'DELIVERED' ? 'success' : 'warning'}>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Handover OTP:</span>
                <span className="font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                  {selectedOrder.delivery_otp || 'Verified'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Vendor Meal Packages</p>
              {selectedOrder.vendor_orders.map((vo) => (
                <div key={vo.id} className="p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-bold text-indigo-900">
                    <span>{vo.vendor_name}</span>
                    <span>Status: {vo.status}</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {vo.items.map((it) => (
                      <li key={it.id} className="py-1 flex justify-between text-slate-600">
                        <span>
                          {it.quantity}x {it.meal_name_snapshot}
                        </span>
                        <span>₦{it.subtotal.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
