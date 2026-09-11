import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataService } from '../../services/dataService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Clock, Truck, ArrowRight, ShoppingBag } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const order = DataService.getOrderById(id || '');

  if (!order) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link to="/student/orders">
          <Button size="sm">View All Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Success Hero Card */}
      <Card className="p-8 text-center space-y-4 border-2 border-emerald-200 bg-emerald-50/30">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-xs text-slate-600">
            Thank you for your order. The vendors have been notified and will process your items shortly.
          </p>
        </div>

        <div className="inline-block bg-white px-4 py-2 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 block uppercase">Order Reference</span>
          <span className="text-xl font-black text-amber-600 font-mono tracking-wider">{order.order_reference}</span>
        </div>
      </Card>

      {/* Details Summary */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-600" /> Order Summary
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Fulfillment Method</span>
            <span className="font-bold text-slate-900">
              {order.fulfillment_method === 'DELIVERY' ? 'Campus Delivery' : 'Campus Pickup'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Overall Status</span>
            <Badge status={order.status} />
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total Amount</span>
            <span className="font-black text-slate-900">₦{order.total_amount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Placed At</span>
            <span className="font-semibold text-slate-900">
              {new Date(order.created_at).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        </div>

        {order.delivery_details && (
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1">
            <span className="font-bold text-slate-900 block flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-amber-600" /> Delivery Address
            </span>
            <p className="text-slate-700">{order.delivery_details.delivery_location}</p>
            <p className="text-slate-500">Contact: {order.delivery_details.contact_phone}</p>
          </div>
        )}

        {/* Vendors Sub-Orders Breakdown */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-900 block">Sub-orders Sent to Vendors:</span>
          {order.vendor_orders.map((vo) => (
            <div key={vo.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 block">{vo.vendor_name}</span>
                <span className="text-[11px] text-slate-500">{vo.items.length} item(s) • ₦{vo.subtotal.toLocaleString()}</span>
              </div>
              <Badge status={vo.status} />
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link to={`/student/orders/${order.id}`} className="flex-1">
            <Button className="w-full" size="lg" leftIcon={<Clock className="w-4 h-4" />}>
              Track Order Status & Progress
            </Button>
          </Link>
          <Link to="/student/home">
            <Button variant="outline" size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
