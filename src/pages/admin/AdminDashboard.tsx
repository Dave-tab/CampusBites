import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DataService } from '../../services/dataService';
import { OrderStatus } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Shield,
  Users,
  Store,
  Clock,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  Award,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [ordersTrigger, setOrdersTrigger] = useState(0);

  useEffect(() => {
    const handleSync = () => setOrdersTrigger((prev) => prev + 1);
    window.addEventListener('storage', handleSync);
    window.addEventListener('campusbites_vendor_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('campusbites_vendor_updated', handleSync);
    };
  }, []);

  const analytics = DataService.getPlatformAnalytics();
  const pendingApps = DataService.getVendorApplications().filter((a) => a.verification_status === 'PENDING');
  const recentOrders = DataService.getOrders().slice(0, 8);
  const vendors = DataService.getVendors().filter((v) => v.verification_status === 'APPROVED');
  const orders = DataService.getOrders();

  const handleAdminUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (!currentUser) return;
    DataService.updateOrderStatusByAdmin({
      parentOrderId: orderId,
      newStatus,
      adminUserId: currentUser.id,
      adminName: currentUser.full_name || 'Admin',
    });
    setOrdersTrigger((prev) => prev + 1);
    window.dispatchEvent(new Event('storage'));
  };

  // Prepare chart data: Sales by Vendor
  const vendorSalesData = vendors.map((v) => {
    const vOrders = DataService.getVendorOrders(v.id).filter(
      (vo) => vo.vendorOrder.status === 'DELIVERED' || vo.vendorOrder.status === 'PICKED_UP'
    );
    const totalSales = vOrders.reduce((sum, vo) => sum + vo.vendorOrder.subtotal, 0);
    return {
      name: v.business_name.length > 15 ? v.business_name.substring(0, 15) + '...' : v.business_name,
      revenue: totalSales,
      ordersCount: vOrders.length,
    };
  });

  // Prepare chart data: Fulfillment breakdown
  const deliveryCount = orders.filter((o) => o.fulfillment_method === 'DELIVERY').length;
  const pickupCount = orders.filter((o) => o.fulfillment_method === 'CAMPUS_PICKUP').length;

  const fulfillmentData = [
    { name: 'Campus Delivery', value: deliveryCount, color: '#d97706' },
    { name: 'Campus Pickup', value: pickupCount, color: '#059669' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Admin Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-600" /> Platform Administration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              Control Center
            </span>
          </div>
          <p className="text-xs text-slate-500">Monitor users, verify vendor applications, oversee orders, & view analytics</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/vendors/pending">
            <Button
              size="sm"
              className={pendingApps.length > 0 ? 'bg-amber-600 hover:bg-amber-700 border-amber-600' : ''}
              leftIcon={<Store className="w-4 h-4" />}
            >
              Pending Approvals ({pendingApps.length})
            </Button>
          </Link>

          <Link to="/admin/analytics">
            <Button variant="outline" size="sm" leftIcon={<BarChart3 className="w-4 h-4" />}>
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 text-white shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.total_students}</p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active campus users</span>
        </Card>

        <Card className="p-4 bg-amber-50/70 border-amber-200 text-amber-900">
          <div className="flex items-center justify-between text-amber-800 text-xs">
            <span className="font-bold uppercase tracking-wider">Pending Applications</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.pending_vendor_applications}</p>
          <span className="text-[10px] text-amber-700 block mt-0.5">Requires vendor verification</span>
        </Card>

        <Card className="p-4 bg-emerald-50/70 border-emerald-200 text-emerald-900">
          <div className="flex items-center justify-between text-emerald-800 text-xs">
            <span className="font-bold uppercase tracking-wider">Approved Vendors</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.total_approved_vendors}</p>
          <span className="text-[10px] text-emerald-700 block mt-0.5">Active food spots</span>
        </Card>

        <Card className="p-4 bg-indigo-50/70 border-indigo-200 text-indigo-900">
          <div className="flex items-center justify-between text-indigo-800 text-xs">
            <span className="font-bold uppercase tracking-wider">Total Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black mt-2">₦{analytics.total_revenue.toLocaleString()}</p>
          <span className="text-[10px] text-indigo-700 block mt-0.5">From {analytics.completed_orders} completed orders</span>
        </Card>
      </div>

      {/* Pending Vendor Applications Banner */}
      {pendingApps.length > 0 && (
        <Card className="p-5 border-2 border-amber-300 bg-amber-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{pendingApps.length} Vendor Application(s) Awaiting Review</span>
            </div>

            <Link to="/admin/vendors/pending">
              <Button size="sm" className="bg-amber-600 border-amber-600" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Review Now
              </Button>
            </Link>
          </div>

          <p className="text-xs text-amber-800 leading-relaxed">
            New vendors cannot manage meals or receive orders until verified by an administrator.
          </p>
        </Card>
      )}

      {/* Visual Analytics Section: Bar Chart & Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Sales Bar Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" /> Vendor Revenue Breakdown (₦)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#d97706" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Fulfillment Share Donut Chart */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Fulfillment Method Share
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fulfillmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name} (${entry.value})`}
                >
                  {fulfillmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Vendor Performance Leaderboard */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" /> Vendor Performance Leaderboard
          </h3>
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Food Spots</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Vendor Business Name</th>
                <th className="p-3">Location Type</th>
                <th className="p-3">Fulfilled Sub-Orders</th>
                <th className="p-3">Total Earnings</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendorSalesData.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{v.name}</td>
                  <td className="p-3 text-slate-600">On Campus</td>
                  <td className="p-3 font-semibold text-slate-800">{v.ordersCount} completed</td>
                  <td className="p-3 font-black text-slate-900">₦{v.revenue.toLocaleString()}</td>
                  <td className="p-3 font-bold text-amber-700">★ 4.8</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Platform Activity Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600" /> Platform Order Audit & Supervision
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              ⚡ Orders route directly to vendor kitchen panels for instant confirmation. Admins supervise platform activity and maintain emergency override authority.
            </p>
          </div>
          <Link to="/admin/analytics" className="text-xs font-bold text-emerald-700 hover:underline shrink-0">
            View Analytics & Charts →
          </Link>
        </div>

        <Card className="overflow-hidden p-0 border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Fulfillment</th>
                  <th className="p-3.5">Vendor Sub-Orders & Live Progress</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Overall Status</th>
                  <th className="p-3.5">Placed At</th>
                  <th className="p-3.5 text-right">Admin Emergency Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-black text-slate-900">{ord.order_reference}</td>
                    <td className="p-3.5 font-medium text-slate-900">{ord.student_name}</td>
                    <td className="p-3.5">
                      <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px]">
                        {ord.fulfillment_method === 'DELIVERY' ? 'Delivery' : 'Pickup'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-col gap-1">
                        {ord.vendor_orders.map((vo) => (
                          <div key={vo.id} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-slate-800">{vo.vendor_name}:</span>
                            <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                              vo.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                              vo.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                              vo.status === 'PREPARING' ? 'bg-indigo-100 text-indigo-800' :
                              vo.status === 'DELIVERED' || vo.status === 'PICKED_UP' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {vo.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-black text-slate-900">₦{ord.total_amount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <Badge status={ord.status} />
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3.5 text-right">
                      {ord.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdminUpdateStatus(ord.id, 'CONFIRMED')}
                          leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                        >
                          Force Confirm
                        </Button>
                      )}
                      {ord.status === 'CONFIRMED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdminUpdateStatus(ord.id, 'PREPARING')}
                        >
                          Force Prep
                        </Button>
                      )}
                      {ord.status === 'PREPARING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAdminUpdateStatus(
                              ord.id,
                              ord.fulfillment_method === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP'
                            )
                          }
                        >
                          Force Out
                        </Button>
                      )}
                      {(ord.status === 'READY_FOR_PICKUP' || ord.status === 'OUT_FOR_DELIVERY') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleAdminUpdateStatus(
                              ord.id,
                              ord.fulfillment_method === 'DELIVERY' ? 'DELIVERED' : 'PICKED_UP'
                            )
                          }
                        >
                          Force Completed
                        </Button>
                      )}
                      {(ord.status === 'DELIVERED' || ord.status === 'PICKED_UP') && (
                        <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                          ✓ Completed
                        </span>
                      )}
                      {(ord.status === 'CANCELLED' || ord.status === 'REJECTED') && (
                        <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
