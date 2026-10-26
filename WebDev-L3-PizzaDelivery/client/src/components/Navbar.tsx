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
    `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-oasis-red bg-oasis-red/10 border border-oasis-red/30'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-oasis-dark/85 border-b border-oasis-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-oasis-red to-orange-600 flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
            <span className="text-xl">🍕</span>
          </div>
          <div>
            <span className="font-serif text-2xl font-black tracking-tight text-white group-hover:text-oasis-red transition-colors">
              OASIS <span className="text-oasis-amber font-sans font-light">PIZZA</span>
            </span>
            <span className="block text-[10px] text-oasis-muted tracking-widest uppercase font-semibold">
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
              <Flame className="w-4 h-4 text-oasis-amber animate-pulse" />
              Pizza Builder
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-oasis-red text-white uppercase font-bold tracking-wider">
                Custom
              </span>
            </span>
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-oasis-amber/15 text-oasis-amber border border-oasis-amber/30 text-xs font-semibold hover:bg-oasis-amber/25 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}

          {/* Cart Button */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl border border-oasis-border bg-oasis-card hover:border-oasis-red/50 text-white transition-all hover:scale-105 active:scale-95"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-oasis-light" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-oasis-red text-white text-[11px] font-bold flex items-center justify-center border-2 border-oasis-dark animate-bounce">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account Button & Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-oasis-border bg-oasis-card hover:border-oasis-amber/50 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-oasis-amber/20 text-oasis-amber flex items-center justify-center font-bold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-white leading-none">{user?.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-oasis-muted uppercase tracking-wider">{user?.role}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-oasis-card border border-oasis-border shadow-2xl p-2 z-50 animate-in fade-in-50 zoom-in-95"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-oasis-border/60 mb-1">
                    <p className="text-xs text-oasis-muted">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Clock className="w-4 h-4 text-oasis-amber" />
                    Order History
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-oasis-amber hover:bg-oasis-amber/10 rounded-xl transition-colors font-medium"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-left mt-1 border-t border-oasis-border/60"
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
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-oasis-red hover:bg-oasis-red-hover text-white transition-all shadow-md active:scale-95"
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-oasis-border bg-oasis-card text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-oasis-border/60 bg-oasis-dark/95 backdrop-blur-2xl px-4 py-5 space-y-3 animate-in slide-in-from-top-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
          >
            Craft Menu
          </Link>
          <Link
            to="/builder"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-oasis-amber bg-oasis-amber/10 border border-oasis-amber/20 font-medium"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-oasis-amber" />
              Custom Pizza Builder
            </span>
            <span className="text-xs bg-oasis-red text-white px-2 py-0.5 rounded-full font-bold">NEW</span>
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-xl text-slate-200 hover:bg-white/5 font-medium"
          >
            My Orders
          </Link>

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-oasis-amber bg-oasis-amber/15 border border-oasis-amber/30 font-medium"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-4 border-t border-oasis-border/60 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-oasis-border text-white font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-oasis-red text-white font-semibold shadow-md"
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
