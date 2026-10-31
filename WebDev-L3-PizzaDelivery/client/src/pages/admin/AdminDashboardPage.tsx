import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Flame,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Order, Ingredient } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, invRes] = await Promise.all([
        api.get('/orders/admin/all'),
        api.get('/inventory?lowStockOnly=true'),
      ]);

      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (invRes.success) setLowStockItems(invRes.data || []);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualAudit = async () => {
    setAuditing(true);
    try {
      const res = await api.post('/inventory/check-alerts');
      showToast(res.message || 'Inventory audit executed.', 'success');
      fetchData();
    } catch (err) {
      showToast((err as Error).message || 'Audit trigger failed', 'error');
    } finally {
      setAuditing(false);
    }
  };

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Operations Dashboard</h1>
          <p className="text-sm text-[#765747] mt-1 font-medium">
            Real-time kitchen orders, financial volume, and live ingredient safety levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-warm-sm"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleManualAudit}
            disabled={auditing}
            className="px-4 py-2.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs flex items-center gap-2 shadow-glow-amber transition-all active:scale-95"
          >
            {auditing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Flame className="w-4 h-4 text-white" />
            )}
            Run Inventory Audit & Email Check
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#765747] uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#EBF7EE] text-[#198754] flex items-center justify-center font-bold border border-[#198754]/20">
              ₹
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-[#38251F] block">
            ₹{totalRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#198754] font-bold mt-1 block">Verified paid orders</span>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#765747] uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center border border-[#D97706]/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-[#38251F] block">{orders.length}</span>
          <span className="text-[11px] text-[#765747] mt-1 block font-medium">{completedOrders} delivered</span>
        </div>

        {/* Active Kitchen Orders */}
        <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#765747] uppercase tracking-wider">
              Active in Kitchen
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FDF2F2] text-[#D92D20] flex items-center justify-center border border-[#D92D20]/20">
              <Flame className="w-5 h-5 text-[#D92D20] animate-pulse" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-[#D92D20] block">{activeOrders}</span>
          <span className="text-[11px] text-[#D92D20] font-bold mt-1 block">Queued, Baking, or In Transit</span>
        </div>

        {/* Low Stock Items */}
        <div className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#765747] uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center border border-[#D97706]/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-[#D97706] block">
            {lowStockItems.length}
          </span>
          <span className="text-[11px] text-[#D97706] font-bold mt-1 block">Below safety threshold</span>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#38251F]">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#D92D20] hover:text-[#A91F18] transition-colors inline-flex items-center gap-1"
            >
              View All Orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-[#765747] animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#765747]">No orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F2E8DC] text-[#765747] uppercase">
                    <th className="pb-3 font-bold">Order</th>
                    <th className="pb-3 font-bold">Customer</th>
                    <th className="pb-3 font-bold">Items</th>
                    <th className="pb-3 font-bold">Total</th>
                    <th className="pb-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2E8DC]">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order._id} className="hover:bg-[#FFF8EF] transition-colors">
                      <td className="py-3.5 font-bold text-[#38251F]">#{order.orderNumber}</td>
                      <td className="py-3.5 text-[#765747] font-medium">{order.user?.name || 'Customer'}</td>
                      <td className="py-3.5 text-[#765747]">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} pizza(s)
                      </td>
                      <td className="py-3.5 font-bold text-[#38251F]">₹{order.totalAmount}</td>
                      <td className="py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist (Right 4 Cols) */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#38251F] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              Low Stock Watch
            </h2>
            <Link
              to="/admin/inventory"
              className="text-xs font-bold text-[#D92D20] hover:text-[#A91F18] transition-colors"
            >
              Restock
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-6 rounded-3xl bg-[#EBF7EE] border border-[#198754]/25 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#198754] mx-auto" />
              <p className="text-xs font-bold text-[#38251F]">All Stock Levels Healthy</p>
              <p className="text-[11px] text-[#198754]">
                All bases, sauces, and toppings are above their threshold limits.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-[#38251F] text-xs block">{item.name}</span>
                    <span className="text-[10px] text-[#765747] uppercase tracking-wider font-semibold">
                      {item.category} • Min: {item.lowStockThreshold} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#D92D20] block">
                      {item.availableQuantity} {item.unit}
                    </span>
                    <span className="text-[10px] text-[#765747]">Remaining</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
