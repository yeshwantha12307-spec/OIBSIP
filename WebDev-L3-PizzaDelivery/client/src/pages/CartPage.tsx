import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Flame,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart, subtotal, tax, deliveryFee, grandTotal } =
    useCart();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 500;
  const progressToFreeDelivery = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-oasis-card border border-oasis-border flex items-center justify-center mx-auto text-4xl shadow-xl">
          🍕
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-white">Your Cart is Hungry!</h1>
          <p className="text-oasis-muted text-sm max-w-md mx-auto">
            You haven't added any pizzas yet. Browse our craft menu or create your dream pizza in the custom builder.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/menu"
            className="px-6 py-3.5 rounded-xl bg-oasis-red hover:bg-oasis-red-hover text-white font-semibold text-sm shadow-md transition-all active:scale-95"
          >
            Explore Craft Menu
          </Link>
          <Link
            to="/builder"
            className="px-6 py-3.5 rounded-xl border border-oasis-border bg-oasis-card text-oasis-amber font-semibold text-sm hover:border-oasis-amber/50 transition-all"
          >
            Launch Pizza Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-oasis-border/60">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">Your Pizza Cart</h1>
          <p className="text-sm text-oasis-muted mt-1">
            Review your pizzas and proceed to secure Razorpay test checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Itemized Pizzas List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free delivery incentive bar */}
          <div className="p-4 rounded-2xl bg-oasis-card border border-oasis-border/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Truck className="w-4 h-4 text-oasis-amber" />
                {amountNeededForFreeDelivery > 0
                  ? `Add ₹${amountNeededForFreeDelivery} more to unlock FREE Delivery!`
                  : '🎉 Congratulations! You have unlocked FREE Delivery!'}
              </span>
              <span className="font-bold text-oasis-amber">{progressToFreeDelivery}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-oasis-dark overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-oasis-amber to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeDelivery}%` }}
              ></div>
            </div>
          </div>

          {/* Cart items */}
          {cart.map((item) => (
            <div
              key={item.cartItemId}
              className="p-5 rounded-2xl bg-oasis-card border border-oasis-border/60 hover:border-oasis-border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg font-bold text-white">{item.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'custom'
                        ? 'bg-oasis-amber/20 text-oasis-amber border border-oasis-amber/30'
                        : 'bg-oasis-red/20 text-oasis-red border border-oasis-red/30'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Ingredients summary */}
                <div className="text-xs text-slate-400 space-y-0.5">
                  <p>
                    <span className="text-slate-300 font-medium">Crust:</span> {item.base.name} |{' '}
                    <span className="text-slate-300 font-medium">Sauce:</span> {item.sauce.name} |{' '}
                    <span className="text-slate-300 font-medium">Cheese:</span> {item.cheese.name}
                  </p>
                  {item.veggies.length > 0 && (
                    <p>
                      <span className="text-slate-300 font-medium">Toppings:</span>{' '}
                      {item.veggies.map((v) => v.name).join(', ')}
                    </p>
                  )}
                </div>

                <div className="text-xs text-oasis-amber font-semibold">
                  ₹{item.unitPrice} each
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <div className="flex items-center gap-2 bg-oasis-dark p-1 rounded-xl border border-oasis-border">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-bold text-sm text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <span className="font-serif text-lg font-bold text-white block">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right 4 Columns: Bill Summary */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-2xl space-y-6">
            <h2 className="font-serif text-xl font-bold text-white">Order Summary</h2>

            <div className="space-y-3 text-sm border-b border-oasis-border/60 pb-4">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-medium text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST (5%)</span>
                <span className="font-medium text-white">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-400 uppercase text-xs">FREE</span>
                ) : (
                  <span className="font-medium text-white">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-white text-base">Grand Total</span>
              <span className="font-serif text-3xl font-black text-oasis-amber">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-oasis-red hover:bg-oasis-red-hover text-white font-bold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-oasis-muted">
              🔒 Powered by Razorpay Test Sandbox. No real money charged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
