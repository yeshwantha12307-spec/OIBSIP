import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminOrdersPage: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PLACED');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'ALL' ? '/orders/admin/all' : `/orders/admin/all?status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/orders/admin/status/${orderId}`, {
        status,
        note: note || `Kitchen status updated to ${status}`,
      });

      if (res.success) {
        showToast(`Order status updated to ${status}`, 'success');
        setSelectedOrder(res.data);
        fetchOrders();
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to update order status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusOptions: OrderStatus[] = [
    'PENDING_PAYMENT',
    'PLACED',
    'PREPARING',
    'BAKING',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-black text-white">Order Management</h1>
        <p className="text-sm text-oasis-muted mt-1">
          Monitor incoming customer orders and progress kitchen status lifecycle in real time.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-oasis-card border border-oasis-border">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', ...statusOptions].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-oasis-amber text-oasis-dark'
                  : 'bg-oasis-dark text-slate-300 hover:text-white border border-oasis-border/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-oasis-dark border border-oasis-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-oasis-amber transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-oasis-muted animate-pulse">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-oasis-muted">
            <span className="text-4xl block">📦</span>
            <p className="font-semibold text-white">No orders found</p>
            <p className="text-xs">Try selecting a different status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-oasis-border/60 text-oasis-muted uppercase tracking-wider font-semibold">
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total Amount</th>
                  <th className="pb-3">Payment</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white">#{order.orderNumber}</td>
                    <td className="py-4 text-slate-300">
                      <span className="font-semibold text-white block">{order.user?.name}</span>
                      <span className="text-[11px] text-slate-400">{order.deliveryAddress?.phone}</span>
                    </td>
                    <td className="py-4 text-slate-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 text-slate-300">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} pizza(s)
                    </td>
                    <td className="py-4 font-bold text-oasis-amber">₹{order.totalAmount}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setStatusNote('');
                        }}
                        className="px-3 py-1.5 rounded-xl border border-oasis-border bg-oasis-dark hover:bg-white/10 text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-oasis-amber" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-oasis-card border border-oasis-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-oasis-border/60">
              <div>
                <span className="text-xs font-bold text-oasis-amber uppercase tracking-wider block">
                  Order Inspection
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-oasis-muted mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Status Update Box */}
            <div className="p-4 rounded-2xl bg-oasis-dark border border-oasis-amber/30 space-y-3">
              <span className="text-xs font-bold text-oasis-amber uppercase tracking-wider block">
                Update Order Status
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-oasis-card border border-oasis-border text-white text-xs focus:outline-none focus:border-oasis-amber"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                    Status Update Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Baking in Deck #3, Driver on way"
                    className="w-full px-3 py-2 rounded-xl bg-oasis-card border border-oasis-border text-white text-xs focus:outline-none focus:border-oasis-amber"
                  />
                </div>
              </div>
              <button
                onClick={() => handleUpdateStatus(selectedOrder._id, newStatus, statusNote)}
                disabled={updating}
                className="w-full py-2.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                {updating ? 'Saving Status...' : 'Apply Status Transition'}
              </button>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-2xl bg-oasis-dark/60 border border-white/5 space-y-1 text-xs">
              <span className="font-bold text-white flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-oasis-red" />
                Delivery Destination
              </span>
              <p className="text-slate-300">{selectedOrder.deliveryAddress.street}</p>
              <p className="text-slate-400">
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} —{' '}
                {selectedOrder.deliveryAddress.postalCode}
              </p>
              <p className="text-oasis-amber pt-1">Contact: {selectedOrder.deliveryAddress.phone}</p>
            </div>

            {/* Items Snapshot */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Preserved Order Items Snapshot
              </span>
              <div className="space-y-2 text-xs divide-y divide-white/5">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between gap-4">
                    <div>
                      <span className="font-bold text-white block">
                        {item.quantity}x {item.name} ({item.type})
                      </span>
                      <span className="text-slate-400">
                        Crust: {item.base?.name} (+₹{item.base?.price}) | Sauce: {item.sauce?.name} (+₹
                        {item.sauce?.price}) | Cheese: {item.cheese?.name} (+₹{item.cheese?.price})
                      </span>
                      {item.veggies?.length > 0 && (
                        <span className="text-slate-400 block">
                          Toppings: {item.veggies.map((v) => `${v.name} (+₹${v.price})`).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-oasis-amber whitespace-nowrap">
                      ₹{item.itemTotalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total Footer */}
            <div className="pt-3 border-t border-oasis-border/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Subtotal: ₹{selectedOrder.subtotal} | GST: ₹{selectedOrder.tax} | Delivery: ₹
                {selectedOrder.deliveryFee}
              </span>
              <span className="font-serif text-xl font-bold text-white">
                Total: ₹{selectedOrder.totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
