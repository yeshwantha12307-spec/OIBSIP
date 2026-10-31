import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Flame,
  Truck,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useFulfillment } from '../context/FulfillmentContext.js';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
    itemCount,
  } = useCart();

  const { mode, selectedOutlet, deliveryAddress, openFulfillmentModal } = useFulfillment();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 500;
  const progressToFreeDelivery = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="absolute inset-0 bg-[#1C1310]/70 backdrop-blur-sm transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-[#FFF8EF] shadow-2xl flex flex-col border-l border-[#F2E8DC]"
            >
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 bg-[#FFFCF7] border-b border-[#F2E8DC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] p-0.5 shadow-glow-red overflow-hidden shrink-0">
                    <img src="/oasis-logo.png" alt="Oasis" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-lg font-black text-[#38251F]">Your Pizza Order</h2>
                      <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#D92D20] text-white font-extrabold">
                        {itemCount}
                      </span>
                    </div>
                    {/* Fulfillment Switch Link */}
                    <button
                      type="button"
                      onClick={() => {
                        closeCartDrawer();
                        openFulfillmentModal();
                      }}
                      className="text-[11px] text-[#D97706] hover:text-[#D92D20] font-bold flex items-center gap-1 transition-colors mt-0.5"
                    >
                      <span>
                        {mode === 'delivery'
                          ? `🛵 Delivering to ${deliveryAddress.city}`
                          : `🥡 Pickup at ${selectedOutlet.neighborhood}`}
                      </span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCartDrawer}
                  className="p-2 rounded-xl text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/50 transition-colors"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Delivery Bar (KFC / Domino's style motivator) */}
              <div className="p-3 bg-[#FEF3C7]/60 border-b border-[#F59E0B]/20">
                <div className="flex items-center justify-between text-xs font-bold text-[#38251F] mb-1.5">
                  <span className="flex items-center gap-1.5 text-[#D97706]">
                    <Truck className="w-3.5 h-3.5" />
                    {subtotal >= freeDeliveryThreshold ? (
                      <span className="text-[#198754]">🎉 You unlocked FREE Delivery!</span>
                    ) : (
                      <span>Add ₹{amountNeededForFree} more for FREE Delivery</span>
                    )}
                  </span>
                  <span className="tabular-nums font-mono text-[11px]">{progressToFreeDelivery}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#E6D9C8] overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#D97706] to-[#198754]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeDelivery}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Items Scroll List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] flex items-center justify-center mx-auto text-3xl shadow-warm-sm">
                      🍕
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif font-black text-lg text-[#38251F]">Your cart is hungry!</p>
                      <p className="text-xs text-[#765747] max-w-xs mx-auto">
                        Explore our wood-fired craft pizzas or create your own custom slice!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        closeCartDrawer();
                        navigate('/menu');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#D92D20] text-white text-xs font-bold shadow-glow-red hover:bg-[#A91F18] transition-all"
                    >
                      Explore Craft Menu
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/40 transition-all shadow-warm-sm space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {item.type === 'custom' ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FEF3C7] text-[#D97706]">
                                Custom
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#EBF7EE] text-[#198754]">
                                Craft
                              </span>
                            )}
                            <h4 className="font-serif font-bold text-sm text-[#38251F] leading-tight">
                              {item.name}
                            </h4>
                          </div>

                          {/* Ingredient Pills Summary */}
                          <p className="text-[11px] text-[#765747] line-clamp-1">
                            {item.base.name} • {item.sauce.name} • {item.cheese.name}
                            {item.veggies.length > 0 && ` • +${item.veggies.length} toppings`}
                          </p>
                        </div>

                        {/* Price */}
                        <span className="font-serif font-black text-sm text-[#38251F] shrink-0">
                          ₹{item.unitPrice * item.quantity}
                        </span>
                      </div>

                      {/* Stepper & Remove */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#F2E8DC]/60">
                        <span className="text-[11px] text-[#765747]">₹{item.unitPrice} each</span>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#F2E8DC] rounded-xl bg-[#FFF8EF] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                              className="p-1.5 text-[#765747] hover:text-[#D92D20] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-[#38251F] tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                              className="p-1.5 text-[#765747] hover:text-[#D92D20] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.cartItemId)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-[#D92D20] hover:bg-[#FDF2F2] transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Sticky Checkout Bar */}
              {cart.length > 0 && (
                <div className="p-4 bg-[#FFFCF7] border-t border-[#F2E8DC] space-y-3 shadow-lg">
                  {/* Bill Breakdown */}
                  <div className="space-y-1.5 text-xs text-[#765747]">
                    <div className="flex justify-between">
                      <span>Item Subtotal</span>
                      <span className="font-semibold text-[#38251F]">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & GST (5%)</span>
                      <span className="font-semibold text-[#38251F]">₹{tax}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Partner Fee</span>
                      {deliveryFee === 0 ? (
                        <span className="font-bold text-[#198754]">FREE</span>
                      ) : (
                        <span className="font-semibold text-[#38251F]">₹{deliveryFee}</span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-[#F2E8DC] flex justify-between items-baseline font-black text-sm text-[#38251F]">
                      <span className="font-serif text-base">To Pay</span>
                      <span className="font-serif text-lg text-[#D92D20]">₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    type="button"
                    onClick={handleCheckoutClick}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-extrabold text-sm flex items-center justify-between shadow-glow-red transition-all active:scale-[0.98]"
                  >
                    <span>Proceed to Express Checkout</span>
                    <span className="flex items-center gap-1 font-serif text-base">
                      ₹{grandTotal}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#765747]">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="hover:text-[#D92D20] transition-colors"
                    >
                      Clear Cart
                    </button>
                    <span className="flex items-center gap-1 text-[#198754] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      100% Secure Checkout
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

