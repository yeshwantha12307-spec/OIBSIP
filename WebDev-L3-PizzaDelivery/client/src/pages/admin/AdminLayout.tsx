import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  History,
  BellRing,
  ArrowLeft,
  Shield,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${
      isActive
        ? 'bg-[#D92D20] text-white shadow-glow-red'
        : 'text-[#765747] hover:text-[#38251F] hover:bg-[#FFF8EF] border border-transparent'
    }`;

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Order Management' },
    { to: '/admin/inventory', icon: Layers, label: 'Inventory Stock' },
    { to: '/admin/logs', icon: History, label: 'Inventory Logs' },
    { to: '/admin/alerts', icon: BellRing, label: 'Low-Stock Alerts' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#38251F] flex flex-col md:flex-row selection:bg-[#D92D20] selection:text-white">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#FFFCF7] border-b border-[#F2E8DC] shadow-warm-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] shadow-[0_0_10px_rgba(217,45,32,0.3)] overflow-hidden shrink-0">
            <img
              src="/oasis-logo.png"
              alt="Oasis Pizza Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-serif font-black text-lg text-[#38251F]">
            OASIS <span className="text-[#D92D20]">ADMIN</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-xl border border-[#F2E8DC] text-[#38251F] bg-[#FFF8EF]"
          aria-label="Toggle admin navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#FFFCF7] border-b border-[#F2E8DC] p-4 space-y-2 animate-in slide-in-from-top-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={linkClass}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
          <div className="pt-2 border-t border-[#F2E8DC]">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#765747] hover:text-[#38251F]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Storefront
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#FFFCF7] border-r border-[#F2E8DC] p-6 flex-col justify-between shrink-0 shadow-warm-sm">
        <div className="space-y-8">
          {/* Logo & Portal Tag */}
          <div>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] shadow-[0_0_15px_rgba(217,45,32,0.35)] group-hover:scale-105 transition-all overflow-hidden shrink-0">
                <img
                  src="/oasis-logo.png"
                  alt="Oasis Pizza Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-black tracking-tight text-[#38251F] block">
                  OASIS PIZZA
                </span>
                <span className="text-[10px] text-[#D97706] font-extrabold tracking-widest uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Info & Storefront return */}
        <div className="pt-6 border-t border-[#F2E8DC] space-y-3">
          <div className="text-xs">
            <span className="text-[#765747] block font-medium">Logged in Administrator</span>
            <span className="font-bold text-[#38251F] truncate block">{user?.email}</span>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-xs font-bold text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Pizzeria Store
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
