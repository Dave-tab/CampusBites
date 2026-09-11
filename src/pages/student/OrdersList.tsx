import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { Order } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ReviewModal } from '../../components/ui/ReviewModal';
import { Clock, Search, ChevronRight, ShoppingBag, Utensils, Star, CheckCircle2 } from 'lucide-react';

interface OrdersListProps {
  historyOnly?: boolean;
}

export const OrdersList: React.FC<OrdersListProps> = ({ historyOnly = false }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const isHistoryRoute = historyOnly || location.pathname.includes('/history');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(isHistoryRoute ? 'COMPLETED' : 'ALL');
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null);

  const orders = currentUser ? DataService.getOrdersByStudent(currentUser.id) : [];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_reference.toLowerCase().includes(search.toLowerCase()) ||
      o.vendor_orders.some((vo) => vo.vendor_name?.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)) ||
      (statusFilter === 'COMPLETED' && ['DELIVERED', 'PICKED_UP'].includes(o.status)) ||
      (statusFilter === 'CANCELLED' && ['CANCELLED', 'REJECTED', 'PARTIALLY_CANCELLED'].includes(o.status));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-600" />
            {isHistoryRoute ? 'Completed Order History' : 'My Orders & History'}
          </h1>
          <p className="text-xs text-slate-500">
            {isHistoryRoute
              ? 'View past completed orders and leave ratings & reviews for vendor kitchens'
              : 'Track active orders in real-time or view past meal order history'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Active Ticker
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'COMPLETED' ? 'bg-amber-600 text-white shadow-xs font-bold' : 'hover:bg-slate-200/60'
            }`}
          >
            Completed History
          </button>
          <button
            onClick={() => setStatusFilter('CANCELLED')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'CANCELLED' ? 'bg-white text-slate-900 shadow-xs' : 'hover:bg-slate-200/60'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search order reference or vendor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-sm text-slate-900 rounded-xl focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12 text-slate-300" />}
          title="No Orders Found"
          description={
            orders.length === 0
              ? "You haven't placed any orders yet. Try ordering a delicious meal from campus vendors!"
              : "No orders match your current filter."
          }
          action={
            <Link to="/student/home">
              <button className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700">
                Explore Campus Meals
              </button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isCompleted = ['DELIVERED', 'PICKED_UP'].includes(order.status);
            const reviewsForOrder = DataService.getReviewsForOrder(order.id);
            const hasReviewed = reviewsForOrder.length > 0;

            return (
              <Card key={order.id} className="p-5 hover:border-amber-400 group transition-all space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link to={`/student/orders/${order.id}`} className="font-mono font-black text-slate-900 text-base hover:text-amber-600 transition-colors">
                          {order.order_reference}
                        </Link>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {order.fulfillment_method === 'DELIVERY' ? 'Delivery' : 'Pickup'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        Placed on {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <Badge status={order.status} />
                    <span className="text-base font-black text-slate-900">₦{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sub-Orders Breakdown */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Vendors:</span>
                  {order.vendor_orders.map((vo) => (
                    <span key={vo.id} className="bg-slate-100 px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-800">
                      {vo.vendor_name} ({vo.items.length} items)
                    </span>
                  ))}
                </div>

                {/* Bottom Bar Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    {isCompleted && (
                      <button
                        onClick={() => setSelectedOrderForReview(order)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          hasReviewed
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                        <span>{hasReviewed ? 'View / Update Review' : '⭐ Write a Review'}</span>
                      </button>
                    )}
                  </div>

                  <Link
                    to={`/student/orders/${order.id}`}
                    className="text-xs text-amber-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-auto"
                  >
                    View Full Order Tracker <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedOrderForReview && (
        <ReviewModal
          isOpen={!!selectedOrderForReview}
          onClose={() => setSelectedOrderForReview(null)}
          order={selectedOrderForReview}
        />
      )}
    </div>
  );
};
