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
  RefreshCw,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Order Management</h1>
          <p className="text-sm text-[#765747] mt-1 font-medium">
            Monitor incoming customer orders and progress kitchen status lifecycle in real time.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-warm-sm self-start sm:self-auto"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', ...statusOptions].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                statusFilter === st
                  ? 'bg-[#D92D20] text-white shadow-glow-red'
                  : 'bg-[#FFF8EF] text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] border border-[#F2E8DC]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-xs text-[#38251F] placeholder:text-[#765747] focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#765747] animate-pulse">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#765747]">
            <span className="text-4xl block">📦</span>
            <p className="font-bold text-[#38251F] text-base">No orders found</p>
            <p className="text-xs">Try selecting a different status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2E8DC] text-[#765747] uppercase tracking-wider font-bold">
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
              <tbody className="divide-y divide-[#F2E8DC]">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#FFF8EF] transition-colors">
                    <td className="py-4 font-bold text-[#38251F]">#{order.orderNumber}</td>
                    <td className="py-4 text-[#765747]">
                      <span className="font-bold text-[#38251F] block">{order.user?.name}</span>
                      <span className="text-[11px] text-[#765747]">{order.deliveryAddress?.phone}</span>
                    </td>
                    <td className="py-4 text-[#765747] whitespace-nowrap font-medium">
                      {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 text-[#765747] font-medium">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} pizza(s)
                    </td>
                    <td className="py-4 font-black font-serif text-[#38251F]">₹{order.totalAmount}</td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          order.paymentStatus === 'paid'
                            ? 'bg-[#EBF7EE] text-[#198754] border border-[#198754]/30'
                            : 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30'
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
                        className="px-3.5 py-1.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D92D20]" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#FFFCF7] border border-[#F2E8DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-warm-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#F2E8DC]">
              <div>
                <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                  Order Inspection
                </span>
                <h3 className="font-serif text-2xl font-black text-[#38251F]">#{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-[#765747] mt-0.5 font-medium">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-[#765747] hover:text-[#38251F] hover:bg-[#FFF8EF] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Status Update Box */}
            <div className="p-5 rounded-3xl bg-[#FFF8EF] border border-[#F2E8DC] space-y-3 shadow-inner">
              <span className="text-xs font-bold text-[#D92D20] uppercase tracking-wider block">
                Update Order Status
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#38251F] font-bold mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-[#38251F] text-xs font-bold focus:outline-none focus:border-[#D92D20]"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#38251F] font-bold mb-1">
                    Status Update Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Baking in Deck #3, Driver on way"
                    className="w-full px-3 py-2 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] text-[#38251F] text-xs focus:outline-none focus:border-[#D92D20]"
                  />
                </div>
              </div>
              <button
                onClick={() => handleUpdateStatus(selectedOrder._id, newStatus, statusNote)}
                disabled={updating}
                className="w-full py-3 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold shadow-glow-red transition-all flex items-center justify-center gap-1.5"
              >
                {updating ? 'Saving Status...' : 'Apply Status Transition'}
              </button>
            </div>

            {/* Delivery Address */}
            <div className="p-4 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] space-y-1 text-xs">
              <span className="font-bold text-[#38251F] flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#D92D20]" />
                Delivery Destination
              </span>
              <p className="text-[#38251F] font-medium">{selectedOrder.deliveryAddress.street}</p>
              <p className="text-[#765747]">
                {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} —{' '}
                {selectedOrder.deliveryAddress.postalCode}
              </p>
              <p className="text-[#D97706] font-bold pt-1">Contact: {selectedOrder.deliveryAddress.phone}</p>
            </div>

            {/* Items Snapshot */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#38251F] uppercase tracking-wider block">
                Preserved Order Items Snapshot
              </span>
              <div className="space-y-2 text-xs divide-y divide-[#F2E8DC]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 flex justify-between gap-4">
                    <div>
                      <span className="font-bold text-[#38251F] block">
                        {item.quantity}x {item.name} ({item.type})
                      </span>
                      <span className="text-[#765747]">
                        Crust: {item.base?.name} (+₹{item.base?.price}) | Sauce: {item.sauce?.name} (+₹
                        {item.sauce?.price}) | Cheese: {item.cheese?.name} (+₹{item.cheese?.price})
                      </span>
                      {item.veggies?.length > 0 && (
                        <span className="text-[#765747] block">
                          Toppings: {item.veggies.map((v) => `${v.name} (+₹${v.price})`).join(', ')}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#D97706] whitespace-nowrap">
                      ₹{item.itemTotalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total Footer */}
            <div className="pt-3 border-t border-[#F2E8DC] flex items-center justify-between text-xs">
              <span className="text-[#765747]">
                Subtotal: ₹{selectedOrder.subtotal} | GST: ₹{selectedOrder.tax} | Delivery: ₹
                {selectedOrder.deliveryFee}
              </span>
              <span className="font-serif text-2xl font-black text-[#D92D20]">
                Total: ₹{selectedOrder.totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
