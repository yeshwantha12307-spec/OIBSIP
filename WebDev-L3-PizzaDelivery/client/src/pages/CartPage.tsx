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
  ShieldCheck,
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
        <div className="w-24 h-24 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] flex items-center justify-center mx-auto text-4xl shadow-warm-md">
          🍕
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F]">Your Cart is Hungry!</h1>
          <p className="text-[#765747] text-sm max-w-md mx-auto">
            You haven't added any pizzas yet. Browse our craft menu or create your dream pizza in the custom pizza studio.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/menu"
            className="px-6 py-3.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-sm shadow-glow-red transition-all active:scale-95"
          >
            Explore Craft Menu
          </Link>
          <Link
            to="/builder"
            className="px-6 py-3.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] text-[#D97706] font-bold text-sm hover:bg-[#FFF8EF] transition-all shadow-warm-sm"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F2E8DC]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F]">Your Pizza Cart</h1>
          <p className="text-sm text-[#765747] mt-1">
            Review your pizzas and proceed to secure Razorpay test checkout.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#D92D20] hover:text-[#A91F18] font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl hover:bg-[#FDF2F2]"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Columns: Itemized Pizzas List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free delivery incentive bar */}
          <div className="p-5 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-[#38251F] font-bold">
                <Truck className="w-4 h-4 text-[#D97706]" />
                {amountNeededForFreeDelivery > 0
                  ? `Add ₹${amountNeededForFreeDelivery} more to unlock FREE Delivery!`
                  : '🎉 Congratulations! You have unlocked FREE Delivery!'}
              </span>
              <span className="font-extrabold text-[#D97706]">{progressToFreeDelivery}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#FFF8EF] overflow-hidden border border-[#F2E8DC]">
              <div
                className="h-full bg-gradient-to-r from-[#D97706] to-[#198754] transition-all duration-500 rounded-full"
                style={{ width: `${progressToFreeDelivery}%` }}
              ></div>
            </div>
          </div>

          {/* Cart items */}
          {cart.map((item) => (
            <div
              key={item.cartItemId}
              className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-serif text-lg font-bold text-[#38251F]">{item.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      item.type === 'custom'
                        ? 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30'
                        : 'bg-[#D92D20]/10 text-[#D92D20] border border-[#D92D20]/25'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>

                {/* Ingredients summary */}
                <div className="text-xs text-[#765747] space-y-1">
                  <p>
                    <span className="text-[#38251F] font-bold">Crust:</span> {item.base.name} |{' '}
                    <span className="text-[#38251F] font-bold">Sauce:</span> {item.sauce.name} |{' '}
                    <span className="text-[#38251F] font-bold">Cheese:</span> {item.cheese.name}
                  </p>
                  {item.veggies.length > 0 && (
                    <p>
                      <span className="text-[#38251F] font-bold">Toppings:</span>{' '}
                      {item.veggies.map((v) => v.name).join(', ')}
                    </p>
                  )}
                </div>

                <div className="text-xs text-[#D97706] font-bold">
                  ₹{item.unitPrice} each
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2E8DC]">
                <div className="flex items-center gap-2 bg-[#FFF8EF] p-1 rounded-2xl border border-[#F2E8DC] shadow-sm">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-7 h-7 rounded-xl bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-serif font-bold text-sm text-[#38251F]">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-7 h-7 rounded-xl bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[90px]">
                  <span className="font-serif text-xl font-black text-[#38251F] block">
                    ₹{item.unitPrice * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeItem(item.cartItemId)}
                  className="p-2 rounded-xl text-[#765747] hover:text-[#D92D20] hover:bg-[#FDF2F2] transition-colors"
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
          <div className="p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#38251F]">Order Summary</h2>

            <div className="space-y-3 text-sm border-b border-[#F2E8DC] pb-4">
              <div className="flex justify-between text-[#765747]">
                <span>Subtotal</span>
                <span className="font-bold text-[#38251F]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#765747]">
                <span>GST (5%)</span>
                <span className="font-bold text-[#38251F]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#765747]">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-[#198754] uppercase text-xs">FREE</span>
                ) : (
                  <span className="font-bold text-[#38251F]">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-[#38251F] text-base">Grand Total</span>
              <span className="font-serif text-3xl font-black text-[#D92D20]">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#765747] font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-[#198754]" />
              Razorpay Sandbox Integration • Instant Testing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
