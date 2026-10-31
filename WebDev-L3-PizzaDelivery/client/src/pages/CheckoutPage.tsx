import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  MapPin,
  Phone,
  FileText,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../api/client.js';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, tax, deliveryFee, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '',
    phone: '',
    instructions: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDeliveryAddress((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fireSuccessConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D92D20', '#D97706', '#198754', '#E6D9C8'],
    });
  };

  const handlePayWithRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deliveryAddress.street.trim() || !deliveryAddress.phone.trim() || !deliveryAddress.postalCode.trim()) {
      showToast('Please fill in your delivery street, phone number, and postal code.', 'warning');
      return;
    }

    if (!isAuthenticated) {
      showToast('Please sign in or register to complete your order.', 'info');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Prepare raw items for server pricing verification and stock validation
      const rawItems = cart.map((item) => ({
        type: item.type,
        pizzaId: item.pizzaId,
        name: item.name,
        baseId: item.base.id,
        sauceId: item.sauce.id,
        cheeseId: item.cheese.id,
        veggieIds: item.veggies.map((v) => v.id),
        quantity: item.quantity,
      }));

      // 2. Call backend to create Order and Razorpay Order
      const orderRes = await api.post('/orders', {
        rawItems,
        deliveryAddress,
        notes: deliveryAddress.instructions,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize order');
      }

      const { order, razorpay } = orderRes;

      // 3. Check if window.Razorpay SDK is loaded
      if (typeof window.Razorpay === 'undefined') {
        throw new Error('Razorpay payment gateway SDK failed to load. Please check your internet connection.');
      }

      // 4. Initialize Razorpay Checkout Modal
      const options = {
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency || 'INR',
        name: 'Oasis Pizza',
        description: `Order #${order.orderNumber} - Artisan Wood-Fired Pizza`,
        image: '/pizza-icon.svg',
        order_id: razorpay.orderId,
        handler: async function (response: any) {
          try {
            showToast('Verifying payment signature with secure server...', 'info');

            // 5. Backend verification of HMAC SHA-256 signature and atomic inventory deduction
            const verifyRes = await api.post('/payments/verify', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              fireSuccessConfetti();
              clearCart();
              showToast('Payment verified! Your pizzas are being prepared 🍕', 'success', 5000);
              navigate(`/orders/${order.orderNumber}`);
            } else {
              throw new Error(verifyRes.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            setErrorMessage((err as Error).message);
            showToast((err as Error).message || 'Payment verification failed', 'error');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: deliveryAddress.phone,
        },
        theme: {
          color: '#D92D20',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            api.post('/payments/failed', {
              razorpayOrderId: razorpay.orderId,
              error: 'Customer dismissed checkout modal',
            }).catch(() => {});
            showToast('Payment window was closed.', 'warning');
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setErrorMessage(response.error?.description || 'Payment transaction failed.');
        api.post('/payments/failed', {
          razorpayOrderId: razorpay.orderId,
          error: response.error,
        }).catch(() => {});
        showToast(response.error?.description || 'Payment failed', 'error');
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage((err as Error).message || 'Failed to initiate checkout.');
      showToast((err as Error).message || 'Failed to initiate checkout', 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-[#38251F]">Checkout & Delivery</h1>
        <p className="text-sm text-[#765747] mt-1">
          Provide your hot delivery destination and complete test payment via Razorpay.
        </p>
      </div>

      {errorMessage && (
        <div className="p-5 rounded-3xl bg-[#FDF2F2] border border-[#D92D20]/30 text-[#D92D20] flex items-center gap-3 shadow-warm-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handlePayWithRazorpay} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Delivery Address Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-7 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#38251F] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D92D20]" />
              Delivery Destination
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                  Street Address & Flat / House No. *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={deliveryAddress.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 402, Sunset Heights, 12th Main Rd"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={deliveryAddress.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={deliveryAddress.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={deliveryAddress.postalCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 400001"
                    className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={deliveryAddress.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. 9876543210 (For delivery rider call)"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#765747]" />
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="instructions"
                  rows={2}
                  value={deliveryAddress.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g. Ring the bell twice, leave at front door, extra napkins please"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Test Payment Notice Box */}
          <div className="p-6 rounded-3xl bg-[#FEF3C7] border border-[#D97706]/30 text-xs text-[#38251F] space-y-2 shadow-warm-sm">
            <div className="flex items-center gap-2 font-bold text-sm text-[#D97706]">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              Razorpay Test Mode Notice
            </div>
            <p className="leading-relaxed text-[#765747]">
              This application operates in <strong>Razorpay Test Mode</strong> for academic evaluation. No real payment cards will be charged. You can use standard test credentials provided in the Razorpay popup to simulate authorization and verification.
            </p>
          </div>
        </div>

        {/* Right 5 Columns: Final Review & Pay Button */}
        <div className="lg:col-span-5 sticky top-28 space-y-6">
          <div className="p-7 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#38251F]">Order Review</h2>

            {/* Items summary */}
            <div className="max-h-60 overflow-y-auto pr-1 space-y-3 divide-y divide-[#F2E8DC] scrollbar-thin">
              {cart.map((item) => (
                <div key={item.cartItemId} className="pt-2 first:pt-0 flex justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#38251F] block">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="text-[#765747]">{item.base.name}, {item.sauce.name}</span>
                  </div>
                  <span className="font-bold text-[#38251F]">₹{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 pt-4 border-t border-[#F2E8DC] text-xs text-[#765747]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-[#38251F] font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-[#38251F] font-bold">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="text-[#198754] font-bold uppercase text-[11px]">FREE</span>
                ) : (
                  <span className="text-[#38251F] font-bold">₹{deliveryFee.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#F2E8DC] text-sm font-bold text-[#38251F]">
                <span>Total to Pay</span>
                <span className="font-serif text-2xl font-black text-[#D92D20]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] disabled:bg-slate-400 text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-glow-red hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing Test Payment...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 text-[#FEF3C7]" />
                  Pay ₹{grandTotal.toFixed(2)} with Razorpay
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-xs text-[#765747] pt-2 border-t border-[#F2E8DC]">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#198754]" />
                Atomic Inventory
              </span>
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#198754]" />
                HMAC SHA-256
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
