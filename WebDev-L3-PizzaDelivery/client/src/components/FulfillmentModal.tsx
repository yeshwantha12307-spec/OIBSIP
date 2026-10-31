import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Store,
  Clock,
  Phone,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useFulfillment } from '../context/FulfillmentContext.js';

export const FulfillmentModal: React.FC = () => {
  const {
    mode,
    setMode,
    selectedOutlet,
    setSelectedOutlet,
    configuredOutlets,
    deliveryAddress,
    updateDeliveryAddress,
    isFulfillmentModalOpen,
    closeFulfillmentModal,
  } = useFulfillment();

  const [activeTab, setActiveTab] = useState<'delivery' | 'takeaway'>(mode);
  const [addressForm, setAddressForm] = useState(deliveryAddress);

  if (!isFulfillmentModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMode(activeTab);
    if (activeTab === 'delivery') {
      updateDeliveryAddress(addressForm);
    }
    closeFulfillmentModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeFulfillmentModal}
          className="absolute inset-0 bg-[#1C1310]/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#FFF8EF] rounded-3xl border border-[#F2E8DC] shadow-warm-lg overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-[#FFFCF7] border-b border-[#F2E8DC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] p-0.5 shadow-glow-red overflow-hidden shrink-0">
                <img src="/oasis-logo.png" alt="Oasis" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-black text-[#38251F]">Select Order Mode</h3>
                <p className="text-xs text-[#765747]">How would you like to receive your artisan pizza?</p>
              </div>
            </div>

            <button
              onClick={closeFulfillmentModal}
              className="p-2 rounded-xl text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs (KFC/Domino's Style) */}
          <div className="p-6 pb-2">
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#F2E8DC]/60 border border-[#F2E8DC]">
              <button
                type="button"
                onClick={() => setActiveTab('delivery')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'delivery'
                    ? 'bg-[#D92D20] text-white shadow-glow-red'
                    : 'text-[#765747] hover:text-[#38251F]'
                }`}
              >
                <span>🛵 Delivery</span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full font-bold">
                  ~30m
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('takeaway')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'takeaway'
                    ? 'bg-[#D92D20] text-white shadow-glow-red'
                    : 'text-[#765747] hover:text-[#38251F]'
                }`}
              >
                <span>🥡 Takeaway / Pickup</span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-white/20 rounded-full font-bold">
                  ~15m
                </span>
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {activeTab === 'delivery' ? (
              <form id="fulfillment-form" onSubmit={handleSave} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/60 border border-[#F59E0B]/30 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#D97706] shrink-0" />
                  <p className="text-xs text-[#765747] font-medium">
                    Fresh from our stone oven to your doorstep in <strong className="text-[#38251F]">30-35 mins</strong>. Free delivery on orders over ₹500!
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#38251F] mb-1">
                      Street Address & Apt / Flat
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="e.g., Flat 4B, Hill View Apartments, Hill Road"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs text-[#38251F] focus:outline-none focus:border-[#D92D20]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#38251F] mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs text-[#38251F] focus:outline-none focus:border-[#D92D20]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#38251F] mb-1">Postal Code (PIN)</label>
                      <input
                        type="text"
                        required
                        value={addressForm.postalCode}
                        onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                        placeholder="e.g., 400050"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs text-[#38251F] focus:outline-none focus:border-[#D92D20]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#38251F] mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FFFCF7] border border-[#F2E8DC] text-xs text-[#38251F] focus:outline-none focus:border-[#D92D20]"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#765747] uppercase tracking-wider">
                  Select Oasis Stone Oven Hearth for Pickup:
                </p>

                {configuredOutlets.map((outlet) => {
                  const isSelected = selectedOutlet.id === outlet.id;
                  return (
                    <div
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(outlet)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#FFFCF7] border-[#D92D20] shadow-warm-md'
                          : 'bg-[#FFFCF7]/70 border-[#F2E8DC] hover:border-[#D92D20]/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-black text-sm text-[#38251F]">
                            {outlet.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FEF3C7] text-[#D97706] font-bold">
                            {outlet.neighborhood}
                          </span>
                        </div>
                        <p className="text-xs text-[#765747]">{outlet.address}, {outlet.city}</p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#765747]">
                          <span className="flex items-center gap-1 text-[#198754] font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            Ready in ~{outlet.pickupTimeMin} mins
                          </span>
                          <span>•</span>
                          <span>Open: {outlet.openHours}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'border-[#D92D20] bg-[#D92D20]' : 'border-[#F2E8DC]'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-6 bg-[#FFFCF7] border-t border-[#F2E8DC] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={closeFulfillmentModal}
              className="px-4 py-2.5 rounded-xl border border-[#F2E8DC] text-xs font-bold text-[#765747] hover:bg-[#F2E8DC]/40 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold flex items-center gap-2 shadow-glow-red transition-all"
            >
              <span>Confirm {activeTab === 'delivery' ? 'Delivery Address' : 'Pickup Kitchen'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
