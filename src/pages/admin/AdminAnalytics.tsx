import React from 'react';
import { DataService } from '../../services/dataService';
import { Card } from '../../components/ui/Card';
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
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const analytics = DataService.getPlatformAnalytics();
  const vendors = DataService.getVendors().filter((v) => v.verification_status === 'APPROVED');
  const orders = DataService.getOrders();

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

  // Order status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' '),
    count,
  }));

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-600" /> Platform Revenue & Meal Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Comprehensive campus food delivery metrics, vendor sales performance, and fulfillment trends
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-emerald-50/70 border-emerald-200 text-emerald-900">
          <div className="flex items-center justify-between text-xs text-emerald-800">
            <span className="font-bold uppercase tracking-wider">Gross Platform Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black mt-2">₦{analytics.total_revenue.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-700 block mt-0.5">
            Across {analytics.completed_orders} completed orders
          </span>
        </Card>

        <Card className="p-4 bg-amber-50/70 border-amber-200 text-amber-900">
          <div className="flex items-center justify-between text-xs text-amber-800">
            <span className="font-bold uppercase tracking-wider">Total Orders Placed</span>
            <ShoppingBag className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.total_orders}</p>
          <span className="text-[10px] text-amber-700 block mt-0.5">
            Average ₦
            {analytics.total_orders > 0
              ? Math.round(analytics.total_revenue / analytics.total_orders).toLocaleString()
              : 0}{' '}
            per order
          </span>
        </Card>

        <Card className="p-4 bg-indigo-50/70 border-indigo-200 text-indigo-900">
          <div className="flex items-center justify-between text-xs text-indigo-800">
            <span className="font-bold uppercase tracking-wider">Active Vendors</span>
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.total_approved_vendors}</p>
          <span className="text-[10px] text-indigo-700 block mt-0.5">Verified food stalls</span>
        </Card>

        <Card className="p-4 bg-slate-900 text-white shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black mt-2">{analytics.total_students}</p>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active campus users</span>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Sales Comparison Chart */}
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

        {/* Fulfillment Method Breakdown Pie */}
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

      {/* Top Vendors Leaderboard Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          Vendor Performance Leaderboard
        </h3>

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
    </div>
  );
};
