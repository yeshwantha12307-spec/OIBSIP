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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'text-[#D92D20] bg-[#D92D20]/10 border border-[#D92D20]/25 shadow-sm'
        : 'text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/50'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#FFF8EF]/90 border-b border-[#F2E8DC] transition-all shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] shadow-[0_0_15px_rgba(217,45,32,0.35)] group-hover:scale-105 transition-all overflow-hidden shrink-0">
            <img
              src="/oasis-logo.png"
              alt="Oasis Pizza Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <span className="font-serif text-2xl font-black tracking-tight text-[#38251F] group-hover:text-[#D92D20] transition-colors">
              OASIS <span className="text-[#D92D20] font-sans font-light">PIZZA</span>
            </span>
            <span className="block text-[10px] text-[#765747] tracking-widest uppercase font-bold">
              Wood-Fired Artisanal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/menu" className={navLinkClass}>
            Craft Menu
          </NavLink>
          <NavLink to="/builder" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#D97706] animate-pulse" />
              Pizza Builder
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#D92D20] text-white uppercase font-extrabold tracking-wider">
                Studio
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

        {/* Right Action Icons: Cart & Profile */}
        <div className="flex items-center gap-3">
          {/* Admin shortcut if admin */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 text-xs font-bold hover:bg-[#FDE68A] transition-colors shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}

          {/* Loader Preview Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('oasis-preview-loader'))}
            title="Preview Hearth Loading Animation"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#D92D20]/10 via-[#F59E0B]/10 to-[#D92D20]/10 hover:from-[#D92D20]/20 hover:to-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#D97706] hover:text-[#D92D20] text-xs font-bold transition-all shadow-warm-sm group"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] group-hover:rotate-45 transition-transform" />
            <span className="hidden sm:inline">Animation Preview</span>
          </button>

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl border border-[#F2E8DC] bg-[#FFFCF7] hover:border-[#D92D20]/50 text-[#38251F] transition-all hover:scale-105 active:scale-95 shadow-warm-sm"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#38251F]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#D92D20] text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-[#FFF8EF] animate-bounce shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

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
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#D97706] hover:bg-[#FEF3C7] rounded-xl transition-colors font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#D92D20] hover:bg-[#FDF2F2] rounded-xl transition-colors text-left mt-1 border-t border-[#F2E8DC] font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC]/40 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#D92D20] hover:bg-[#A91F18] text-white transition-all shadow-glow-red active:scale-95"
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#F2E8DC] bg-[#FFFCF7] text-[#38251F] hover:bg-[#F2E8DC]/40 shadow-warm-sm"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#F2E8DC] bg-[#FFF8EF] px-4 py-5 space-y-3 shadow-warm-lg animate-in slide-in-from-top-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-[#38251F] hover:bg-[#F2E8DC]/60 font-semibold text-sm"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-[#38251F] hover:bg-[#F2E8DC]/60 font-semibold text-sm"
          >
            Craft Menu
          </Link>
          <Link
            to="/builder"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[#D92D20] bg-[#D92D20]/10 border border-[#D92D20]/25 font-bold text-sm"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#D97706]" />
              Custom Pizza Builder
            </span>
            <span className="text-[10px] bg-[#D92D20] text-white px-2 py-0.5 rounded-full font-extrabold uppercase">HOT</span>
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-[#38251F] hover:bg-[#F2E8DC]/60 font-semibold text-sm"
          >
            My Orders
          </Link>

          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#38251F] hover:bg-[#F2E8DC]/60 font-semibold text-sm"
            >
              <UserIcon className="w-4 h-4 text-[#D92D20]" />
              My Profile
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#D97706] bg-[#FEF3C7] border border-[#D97706]/30 font-bold text-sm"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-4 border-t border-[#F2E8DC] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-[#F2E8DC] bg-[#FFFCF7] text-[#38251F] font-bold text-sm shadow-warm-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#D92D20] text-white font-bold text-sm shadow-glow-red"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
