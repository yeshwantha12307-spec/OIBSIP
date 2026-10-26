import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-oasis-amber text-oasis-dark shadow-md'
        : 'text-slate-300 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="min-h-screen bg-oasis-dark text-oasis-light flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-oasis-card border-r border-oasis-border/60 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          {/* Logo & Portal Tag */}
          <div>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-oasis-red to-orange-600 flex items-center justify-center shadow-glow-red">
                <span className="text-xl">🍕</span>
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  OASIS PIZZA
                </span>
                <span className="text-[10px] text-oasis-amber font-bold tracking-widest uppercase flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <NavLink to="/admin/dashboard" className={linkClass}>
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Overview
            </NavLink>
            <NavLink to="/admin/orders" className={linkClass}>
              <ShoppingBag className="w-4 h-4 shrink-0" />
              Order Management
            </NavLink>
            <NavLink to="/admin/inventory" className={linkClass}>
              <Layers className="w-4 h-4 shrink-0" />
              Inventory Stock
            </NavLink>
            <NavLink to="/admin/logs" className={linkClass}>
              <History className="w-4 h-4 shrink-0" />
              Inventory Audit Logs
            </NavLink>
            <NavLink to="/admin/alerts" className={linkClass}>
              <BellRing className="w-4 h-4 shrink-0" />
              Low-Stock Alerts
            </NavLink>
          </nav>
        </div>

        {/* Bottom User Info & Storefront return */}
        <div className="pt-6 border-t border-oasis-border/60 space-y-3">
          <div className="text-xs">
            <span className="text-oasis-muted block">Logged in Administrator</span>
            <span className="font-bold text-white truncate block">{user?.email}</span>
          </div>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-oasis-border bg-oasis-dark text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
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
