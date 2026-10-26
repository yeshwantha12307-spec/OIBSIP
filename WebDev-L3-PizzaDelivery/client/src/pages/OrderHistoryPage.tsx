import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ShoppingBag, AlertCircle, ChevronRight } from 'lucide-react';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../api/client.js';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my');
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError('Failed to load past orders');
        }
      } catch (err) {
        setError((err as Error).message || 'Unable to retrieve order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-oasis-light">
        <div className="w-12 h-12 border-4 border-oasis-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-oasis-muted">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Order History</h1>
        <p className="text-sm text-oasis-muted mt-1">
          View all your previous artisanal pizza orders and track active kitchen deliveries.
        </p>
      </div>

      {error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-oasis-card rounded-3xl border border-oasis-border p-8 space-y-4">
          <div className="w-20 h-20 rounded-full bg-oasis-dark border border-white/5 flex items-center justify-center mx-auto text-3xl">
            🍕
          </div>
          <h3 className="font-serif text-xl font-bold text-white">No Orders Placed Yet</h3>
          <p className="text-sm text-oasis-muted max-w-sm mx-auto">
            Ready for your first hot stone-oven pizza? Browse our craft menu or build your own custom recipe!
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="px-6 py-3 rounded-xl bg-oasis-red hover:bg-oasis-red-hover text-white text-sm font-bold shadow-md transition-all inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-6 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-oasis-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-lg font-bold text-white">#{order.orderNumber}</h3>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-xs text-oasis-muted">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className="text-xs text-slate-300">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-left md:text-right">
                  <span className="text-xs text-oasis-muted block">Total Paid</span>
                  <span className="font-serif text-xl font-bold text-oasis-amber">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="px-4 py-2.5 rounded-xl border border-oasis-border bg-oasis-dark hover:bg-white/5 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  Track Live
                  <ChevronRight className="w-4 h-4 text-oasis-amber" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
