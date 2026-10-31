import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ShoppingBag, AlertCircle, ChevronRight, Eye } from 'lucide-react';
import { Order } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { OrderHistorySkeleton } from '../components/SkeletonLoader.js';
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F]">Order History</h1>
          <p className="text-sm text-[#765747] mt-1">
            Loading your artisanal pizza orders...
          </p>
        </div>
        <OrderHistorySkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F]">Order History</h1>
        <p className="text-sm text-[#765747] mt-1">
          View all your previous artisanal pizza orders and track active kitchen deliveries.
        </p>
      </div>

      {error ? (
        <div className="p-6 rounded-3xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] p-8 space-y-4 shadow-warm-sm">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-center mx-auto text-3xl shadow-sm">
            🍕
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#38251F]">No Orders Placed Yet</h3>
          <p className="text-sm text-[#765747] max-w-sm mx-auto">
            Ready for your first hot stone-oven pizza? Browse our craft menu or build your own custom recipe!
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="px-6 py-3.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-sm font-bold shadow-glow-red transition-all inline-flex items-center gap-2"
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
              className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/40 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-lg font-bold text-[#38251F]">#{order.orderNumber}</h3>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-xs text-[#765747] font-medium">
                  Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                <div className="text-xs text-[#765747]">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-[#F2E8DC]">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#765747] block">Total Paid</span>
                  <span className="font-serif text-2xl font-black text-[#38251F]">
                    ₹{order.totalAmount.toFixed(2)}
                  </span>
                </div>

                <Link
                  to={`/orders/${order.orderNumber}`}
                  className="px-5 py-2.5 rounded-2xl bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] border border-[#F2E8DC] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 hover:text-[#D92D20]"
                >
                  <Eye className="w-4 h-4" />
                  Track Live
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
