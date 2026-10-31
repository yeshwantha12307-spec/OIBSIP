import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Flame,
  User as UserIcon,
  LogOut,
  Shield,
  Menu as MenuIcon,
  X,
  Clock,
  Compass,
  Sparkles,
  MapPin,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { useFulfillment } from '../context/FulfillmentContext.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCartDrawer } = useCart();
  const { mode, selectedOutlet, deliveryAddress, openFulfillmentModal } = useFulfillment();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-[#D92D20] text-white shadow-glow-red'
        : 'text-[#38251F] hover:text-[#D92D20] hover:bg-[#F2E8DC]/50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FFF8EF]/95 border-b border-[#F2E8DC] transition-all shadow-warm-sm">
      {/* 1. Persistent Top Fulfillment Bar (KFC/Domino's Model) */}
      <div className="bg-[#1C1310] text-[#FFFCF7] px-4 sm:px-6 lg:px-8 py-1.5 border-b border-[#38251F] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <button
            type="button"
            onClick={openFulfillmentModal}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D92D20] text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-[#B91C1C] transition-colors shrink-0 shadow-sm"
          >
            {mode === 'delivery' ? '🛵 Delivery' : '🥡 Takeaway'}
            <ChevronDown className="w-3 h-3" />
          </button>

          <span
            onClick={openFulfillmentModal}
            className="text-[11px] text-amber-200/90 font-medium truncate cursor-pointer hover:underline flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-[#F59E0B] shrink-0" />
            {mode === 'delivery' ? (
              <span>{deliveryAddress.street}, {deliveryAddress.city}</span>
            ) : (
              <span>Pick up at <strong>{selectedOutlet.name}</strong> ({selectedOutlet.neighborhood})</span>
            )}
          </span>
        </div>

        {/* Right Info */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-amber-100/70 font-semibold shrink-0">
          <span className="flex items-center gap-1 text-[#F59E0B]">
            <Clock className="w-3 h-3" />
            {mode === 'delivery' ? 'ETA ~30-35 mins' : `Pickup in ~${selectedOutlet.pickupTimeMin} mins`}
          </span>
          <span className="hidden md:inline text-white/30">•</span>
          <span className="hidden md:inline">🔥 450°C Wood-Fired Live</span>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] shadow-[0_0_16px_rgba(217,45,32,0.4)] group-hover:scale-105 transition-all overflow-hidden shrink-0">
            <img
              src="/oasis-logo.png"
              alt="Oasis Pizza Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <span className="font-serif text-2xl font-black tracking-tight text-[#38251F] group-hover:text-[#D92D20] transition-colors leading-tight block">
              OASIS <span className="text-[#D92D20] font-sans font-light">PIZZA</span>
            </span>
            <span className="block text-[10px] text-[#765747] tracking-widest uppercase font-extrabold">
              Wood-Fired Artisanal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/menu" className={navLinkClass}>
            Craft Menu
          </NavLink>
          <NavLink to="/builder" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#D97706] animate-pulse" />
              Pizza Studio
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#D92D20] text-white uppercase font-extrabold tracking-wider">
                Builder
              </span>
            </span>
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#765747]" />
              My Orders
            </span>
          </NavLink>
        </nav>

        {/* Right Action Icons: Animation Preview, Cart & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin shortcut if admin */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 text-xs font-bold hover:bg-[#FDE68A] transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {/* Loader Preview Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('oasis-preview-loader'))}
            title="Preview Hearth Loading Animation"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#D92D20]/10 via-[#F59E0B]/10 to-[#D92D20]/10 hover:from-[#D92D20]/20 hover:to-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#D97706] hover:text-[#D92D20] text-xs font-bold transition-all shadow-warm-sm group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] group-hover:rotate-45 transition-transform" />
            <span>Hearth Loader</span>
          </button>

          {/* Slide-in Express Cart Drawer Trigger Button */}
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border border-[#F2E8DC] bg-[#FFFCF7] hover:border-[#D92D20]/50 text-[#38251F] transition-all hover:scale-105 active:scale-95 shadow-warm-sm flex items-center gap-2"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#D92D20]" />
            <span className="hidden sm:inline font-serif font-black text-xs text-[#38251F]">
              Cart
            </span>
            {itemCount > 0 && (
              <span className="sm:static absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D92D20] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-[#FFF8EF] animate-bounce shadow-sm">
                {itemCount}
              </span>
            )}
          </button>

          {/* User Account Button & Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:border-[#D92D20]/50 transition-all text-left shadow-warm-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#D92D20]/15 text-[#D92D20] flex items-center justify-center font-bold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-[#38251F] leading-none">{user?.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-[#765747] uppercase tracking-wider font-semibold">{user?.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-lg p-2 z-50 animate-in fade-in-50 zoom-in-95"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#F2E8DC] mb-1">
                    <p className="text-xs text-[#765747]">Signed in as</p>
                    <p className="text-sm font-bold text-[#38251F] truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/50 rounded-xl transition-colors font-medium"
                  >
                    <UserIcon className="w-4 h-4 text-[#D92D20]" />
                    My Profile
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/50 rounded-xl transition-colors font-medium"
                  >
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    Order History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#D97706] hover:bg-[#FEF3C7] rounded-xl transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Console
                    </Link>
                  )}

                  <div className="pt-1 mt-1 border-t border-[#F2E8DC]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#D92D20] hover:bg-[#FDF2F2] rounded-xl transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#38251F] hover:text-[#D92D20] hover:bg-[#F2E8DC]/40 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold bg-[#D92D20] hover:bg-[#A91F18] text-white shadow-glow-red transition-all hover:scale-105 active:scale-95"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-2 rounded-xl text-[#38251F] hover:bg-[#F2E8DC]/50 border border-[#F2E8DC]"
            aria-label="Toggle mobile menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#FFFCF7] border-b border-[#F2E8DC] p-4 space-y-3 animate-in slide-in-from-top-3">
          <NavLink
            to="/"
            onClick={() => setMobileNavOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#38251F] hover:bg-[#F2E8DC]/40"
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            onClick={() => setMobileNavOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#38251F] hover:bg-[#F2E8DC]/40"
          >
            Craft Menu
          </NavLink>
          <NavLink
            to="/builder"
            onClick={() => setMobileNavOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#D92D20] hover:bg-[#F2E8DC]/40"
          >
            🔥 Custom Pizza Studio
          </NavLink>
          <NavLink
            to="/orders"
            onClick={() => setMobileNavOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#38251F] hover:bg-[#F2E8DC]/40"
          >
            My Orders
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileNavOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-[#D97706] bg-[#FEF3C7]"
            >
              Admin Dashboard
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};
