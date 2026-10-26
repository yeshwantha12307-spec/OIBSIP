import React from 'react';
import { OrderStatus, StockStatus } from '../types/index.js';

interface StatusBadgeProps {
  status: OrderStatus | StockStatus | string;
  type?: 'order' | 'stock';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order' }) => {
  if (type === 'stock') {
    switch (status) {
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  }

  // Order status badge styling
  const config: Record<OrderStatus, { label: string; bg: string; text: string; border: string; pulse?: boolean }> = {
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      pulse: true,
    },
    PLACED: {
      label: 'Order Placed',
      bg: 'bg-sky-500/15',
      text: 'text-sky-400',
      border: 'border-sky-500/30',
      pulse: true,
    },
    PREPARING: {
      label: 'Chefs Preparing',
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      pulse: true,
    },
    BAKING: {
      label: 'In Wood-Stone Oven',
      bg: 'bg-orange-500/15',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      pulse: true,
    },
    OUT_FOR_DELIVERY: {
      label: 'Out for Delivery',
      bg: 'bg-purple-500/15',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      pulse: true,
    },
    DELIVERED: {
      label: 'Delivered',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      pulse: false,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      pulse: false,
    },
  };

  const current = config[status as OrderStatus] || {
    label: status,
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
    >
      {current.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>}
      {current.label}
    </span>
  );
};
