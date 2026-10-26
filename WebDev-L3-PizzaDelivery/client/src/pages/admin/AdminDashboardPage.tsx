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

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-white">Operations Dashboard</h1>
          <p className="text-sm text-oasis-muted mt-1">
            Real-time kitchen orders, financial volume, and live ingredient safety levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-oasis-border bg-oasis-card hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleManualAudit}
            disabled={auditing}
            className="px-4 py-2.5 rounded-xl bg-oasis-amber hover:bg-amber-400 text-oasis-dark font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            {auditing ? (
              <div className="w-3.5 h-3.5 border-2 border-oasis-dark border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Flame className="w-4 h-4 text-oasis-dark" />
            )}
            Run Inventory Audit & Email Check
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-oasis-muted uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-white block">
            ₹{totalRevenue.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-400 mt-1 block">Verified paid orders</span>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-oasis-muted uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-oasis-amber/10 text-oasis-amber flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-white block">{orders.length}</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime volume</span>
        </div>

        {/* Active Kitchen Orders */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-oasis-muted uppercase tracking-wider">
              Active in Kitchen
            </span>
            <div className="w-10 h-10 rounded-xl bg-oasis-red/10 text-oasis-red flex items-center justify-center">
              <Flame className="w-5 h-5 text-oasis-red animate-pulse" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-oasis-red block">{activeOrders}</span>
          <span className="text-[11px] text-oasis-red mt-1 block">Queued, Baking, or In Transit</span>
        </div>

        {/* Low Stock Items */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-oasis-muted uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <span className="font-serif text-3xl font-black text-amber-400 block">
            {lowStockItems.length}
          </span>
          <span className="text-[11px] text-amber-300 mt-1 block">Below safety threshold</span>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Orders List (Left 8 Cols) */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-oasis-card border border-oasis-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-white">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-oasis-amber hover:text-white transition-colors inline-flex items-center gap-1"
            >
              View All Orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-oasis-muted animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-oasis-muted">No orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-oasis-border/60 text-oasis-muted uppercase">
                    <th className="pb-3 font-semibold">Order</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Items</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-white">#{order.orderNumber}</td>
                      <td className="py-3.5 text-slate-300">{order.user?.name || 'Customer'}</td>
                      <td className="py-3.5 text-slate-400">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} pizza(s)
                      </td>
                      <td className="py-3.5 font-bold text-oasis-amber">₹{order.totalAmount}</td>
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
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-oasis-card border border-oasis-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock Watch
            </h2>
            <Link
              to="/admin/inventory"
              className="text-xs font-bold text-oasis-amber hover:text-white transition-colors"
            >
              Restock
            </Link>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-white">All Stock Levels Healthy</p>
              <p className="text-[11px] text-emerald-300">
                All bases, sauces, and toppings are above their threshold limits.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl bg-oasis-dark border border-oasis-border/60 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{item.name}</span>
                    <span className="text-[10px] text-oasis-muted uppercase tracking-wider">
                      {item.category} • Threshold: {item.lowStockThreshold} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-rose-400 block">
                      {item.availableQuantity} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-400">Remaining</span>
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
