import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  MapPin,
  Lock,
  LogOut,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { api } from '../api/client.js';

export const ProfilePage: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [resending, setResending] = useState(false);
  const [address, setAddress] = useState({
    street: 'B-402, Sunset Boulevard, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    phone: '+91 98201 23456',
  });
  const [addressSaved, setAddressSaved] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      const res = await api.post('/auth/resend-verification', { email: user.email });
      showToast(res.message || 'Verification link sent to your email!', 'success');
    } catch (err) {
      showToast((err as Error).message || 'Failed to dispatch verification email', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaved(true);
    showToast('Delivery address preferences saved!', 'success');
    setTimeout(() => setAddressSaved(false), 3000);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-md flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D92D20] to-[#A91F18] text-white flex items-center justify-center font-serif text-3xl font-black shadow-glow-red shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="font-serif text-3xl font-black text-[#38251F]">{user.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 uppercase tracking-wider">
                {user.role}
              </span>
              {user.isVerified ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#198754] border border-[#198754]/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FDF2F2] text-[#D92D20] border border-[#D92D20]/30 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Unverified
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-[#765747] flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-[#765747]" />
            {user.email}
          </p>

          {!user.isVerified && (
            <div className="pt-2">
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="text-xs font-bold text-[#D92D20] hover:underline flex items-center gap-1.5"
              >
                {resending ? 'Sending...' : 'Resend verification link'}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#FDF2F2] text-[#D92D20] text-xs font-bold flex items-center gap-2 transition-colors shadow-sm shrink-0"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/orders"
          className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/40 transition-all shadow-warm-sm hover:shadow-warm-md flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-center text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#38251F]">Order History & Receipts</h3>
              <p className="text-xs text-[#765747]">Track live delivery orders and view receipts</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#765747] group-hover:text-[#D92D20] transition-colors" />
        </Link>

        {isAdmin ? (
          <Link
            to="/admin/dashboard"
            className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D97706]/40 transition-all shadow-warm-sm hover:shadow-warm-md flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#D97706]/20 flex items-center justify-center text-[#D97706] group-hover:bg-[#D97706] group-hover:text-white transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#38251F]">Admin Operations Portal</h3>
                <p className="text-xs text-[#765747]">Manage orders, stocks, alerts, and audit logs</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#765747] group-hover:text-[#D97706] transition-colors" />
          </Link>
        ) : (
          <Link
            to="/builder"
            className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] hover:border-[#D92D20]/40 transition-all shadow-warm-sm hover:shadow-warm-md flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] flex items-center justify-center text-[#D92D20] group-hover:bg-[#D92D20] group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#38251F]">Custom Pizza Studio</h3>
                <p className="text-xs text-[#765747]">Craft unique pizzas with 5 bases & 5 sauces</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#765747] group-hover:text-[#D92D20] transition-colors" />
          </Link>
        )}
      </div>

      {/* Saved Delivery Address Preferences */}
      <div className="p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F2E8DC]">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#38251F] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D92D20]" />
              Default Delivery Address
            </h2>
            <p className="text-xs text-[#765747]">
              This address will be pre-filled during checkout for fast ordering.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-[#38251F]">Street Address</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">State</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Postal Code</label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#38251F]">Phone Number</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20]"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold shadow-glow-red transition-all"
            >
              {addressSaved ? 'Saved Successfully!' : 'Save Address Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

