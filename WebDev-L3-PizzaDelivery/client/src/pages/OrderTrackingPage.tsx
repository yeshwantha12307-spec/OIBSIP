import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ChefHat,
  Flame,
  Truck,
  CheckCircle2,
  XCircle,
  MapPin,
  Phone,
  ArrowLeft,
  RefreshCw,
  Receipt,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { api } from '../api/client.js';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const fetchOrder = async (isBackground = false) => {
    if (!id) return;
    if (!isBackground) setLoading(true);
    else setIsPolling(true);

    try {
      const res = await api.get(`/orders/${id}`);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError('Order could not be found');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load order status');
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Poll every 5 seconds to reflect administrator status updates in real time!
    const interval = setInterval(() => {
      fetchOrder(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-oasis-light">
        <div className="w-12 h-12 border-4 border-oasis-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-oasis-muted">Fetching live order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 rounded-3xl bg-oasis-card border border-oasis-border text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-white">Order Not Found</h2>
        <p className="text-sm text-oasis-muted">{error || 'Please verify the order reference number.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-oasis-red text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          View All Orders
        </Link>
      </div>
    );
  }

  // Stepper definition
  const steps: Array<{ status: OrderStatus; label: string; desc: string; icon: any }> = [
    {
      status: 'PLACED',
      label: 'Order Placed',
      desc: 'Payment verified & order queued',
      icon: Clock,
    },
    {
      status: 'PREPARING',
      label: 'Chefs Preparing',
      desc: 'Hand-stretching dough & saucing',
      icon: ChefHat,
    },
    {
      status: 'BAKING',
      label: 'Stone Oven Baking',
      desc: '450°C wood-fired oven blistering',
      icon: Flame,
    },
    {
      status: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      desc: 'Insulated hot thermal box in transit',
      icon: Truck,
    },
    {
      status: 'DELIVERED',
      label: 'Delivered',
      desc: 'Bon Appetit! Enjoy your pizza',
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case 'PENDING_PAYMENT':
        return -1;
      case 'PLACED':
        return 0;
      case 'PREPARING':
        return 1;
      case 'BAKING':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-oasis-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Orders
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-oasis-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Polling (Every 5s)
          </div>
          <button
            onClick={() => fetchOrder(false)}
            className="p-2 rounded-xl border border-oasis-border bg-oasis-card hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
            title="Refresh order now"
          >
            <RefreshCw className={`w-4 h-4 ${isPolling ? 'animate-spin text-oasis-amber' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Order Status Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-oasis-border/60">
          <div>
            <span className="text-xs font-bold text-oasis-amber uppercase tracking-widest block mb-1">
              Order Reference
            </span>
            <h1 className="font-serif text-3xl font-black text-white">#{order.orderNumber}</h1>
            <p className="text-xs text-oasis-muted mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Stepper Progress Visualizer */}
        {!isCancelled ? (
          <div className="pt-2 pb-6">
            <div className="relative">
              {/* Stepper line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-oasis-dark -translate-y-1/2 rounded-full z-0">
                <div
                  className="h-full bg-gradient-to-r from-oasis-red via-oasis-amber to-emerald-400 rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIdx / (steps.length - 1)) * 100))}%`,
                  }}
                ></div>
              </div>

              {/* Step items */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;

                  return (
                    <div
                      key={step.status}
                      className={`flex md:flex-col items-center md:text-center gap-4 md:gap-3 p-3 rounded-2xl transition-all ${
                        isCurrent
                          ? 'bg-oasis-red/10 border border-oasis-red/40 shadow-glow-red'
                          : isCompleted
                          ? 'opacity-90'
                          : 'opacity-40'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                          isCurrent
                            ? 'bg-oasis-red text-white scale-110 shadow-lg'
                            : isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-oasis-dark text-slate-500 border border-oasis-border'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="text-left md:text-center">
                        <h4
                          className={`font-serif text-sm font-bold ${
                            isCurrent ? 'text-oasis-red' : isCompleted ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-oasis-muted mt-0.5 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-4">
            <XCircle className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-bold text-base">This order has been cancelled</h3>
              <p className="text-xs text-rose-300 mt-0.5">
                If you were charged in error or need assistance, please contact our support desk.
              </p>
            </div>
          </div>
        )}

        {/* Status Timeline History */}
        {order.statusTimeline && order.statusTimeline.length > 0 && (
          <div className="pt-4 border-t border-oasis-border/60">
            <h3 className="font-bold text-xs uppercase tracking-wider text-oasis-muted mb-3">
              Kitchen & Delivery Updates
            </h3>
            <div className="space-y-2">
              {order.statusTimeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full bg-oasis-amber mt-1.5 shrink-0"></span>
                  <div>
                    <span className="text-white font-semibold">{item.status}</span>
                    {item.note && <span className="text-slate-300"> — {item.note}</span>}
                    <span className="text-[10px] text-oasis-muted block">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Details Grid: Delivery Address & Itemized Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delivery Destination */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-oasis-red" />
            Delivery Destination
          </h3>

          <div className="text-sm text-slate-300 space-y-2 bg-oasis-dark/80 p-4 rounded-2xl border border-white/5">
            <p className="font-medium text-white">{order.deliveryAddress.street}</p>
            <p>
              {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.postalCode}
            </p>
            <p className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs text-oasis-amber">
              <Phone className="w-3.5 h-3.5" />
              Contact: {order.deliveryAddress.phone}
            </p>
            {order.deliveryAddress.instructions && (
              <p className="text-xs text-slate-400 italic pt-1">
                Note: "{order.deliveryAddress.instructions}"
              </p>
            )}
          </div>
        </div>

        {/* Itemized Order Receipt Snapshot */}
        <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl space-y-4">
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-oasis-amber" />
            Itemized Order Snapshot
          </h3>

          <div className="space-y-3 divide-y divide-white/5 text-xs">
            {order.items.map((item, i) => (
              <div key={i} className="pt-2 first:pt-0 flex justify-between gap-4">
                <div>
                  <span className="font-bold text-white block">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-slate-400">
                    Crust: {item.base?.name} | Sauce: {item.sauce?.name} | Cheese: {item.cheese?.name}
                  </span>
                  {item.veggies?.length > 0 && (
                    <span className="text-slate-400 block">
                      Toppings: {item.veggies.map((v) => v.name).join(', ')}
                    </span>
                  )}
                </div>
                <span className="font-bold text-white whitespace-nowrap">₹{item.itemTotalPrice}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-oasis-border/60 text-xs space-y-1.5 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="text-white">₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-white">₹{order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-white/5 font-bold text-sm text-white">
              <span>Total Paid (Razorpay)</span>
              <span className="font-serif text-xl text-oasis-amber">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
