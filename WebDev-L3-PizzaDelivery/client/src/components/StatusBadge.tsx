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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#198754] border border-[#198754]/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#198754] animate-pulse"></span>
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
            Low Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDF2F2] text-[#D92D20] border border-[#D92D20]/30 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]"></span>
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F2E8DC] text-[#38251F]">
            {status}
          </span>
        );
    }
  }

  // Order status badge styling
  const config: Record<OrderStatus, { label: string; bg: string; text: string; border: string; pulse?: boolean }> = {
    PENDING_PAYMENT: {
      label: 'Pending Payment',
      bg: 'bg-[#FEF3C7]',
      text: 'text-[#D97706]',
      border: 'border-[#D97706]/40',
      pulse: true,
    },
    PLACED: {
      label: 'Order Placed',
      bg: 'bg-[#EFF6FF]',
      text: 'text-[#2563EB]',
      border: 'border-[#2563EB]/40',
      pulse: true,
    },
    PREPARING: {
      label: 'Chefs Preparing',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#D92D20]',
      border: 'border-[#D92D20]/40',
      pulse: true,
    },
    BAKING: {
      label: 'Stone Oven Baking',
      bg: 'bg-[#FFF7ED]',
      text: 'text-[#EA580C]',
      border: 'border-[#EA580C]/40',
      pulse: true,
    },
    OUT_FOR_DELIVERY: {
      label: 'Out for Delivery',
      bg: 'bg-[#FAF5FF]',
      text: 'text-[#9333EA]',
      border: 'border-[#9333EA]/40',
      pulse: true,
    },
    DELIVERED: {
      label: 'Delivered',
      bg: 'bg-[#EBF7EE]',
      text: 'text-[#198754]',
      border: 'border-[#198754]/40',
      pulse: false,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-[#FDF2F2]',
      text: 'text-[#A91F18]',
      border: 'border-[#A91F18]/40',
      pulse: false,
    },
  };

  const current = config[status as OrderStatus] || {
    label: status,
    bg: 'bg-[#F2E8DC]',
    text: 'text-[#38251F]',
    border: 'border-[#E6D9C8]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${current.bg} ${current.text} ${current.border} shadow-sm`}
    >
      {current.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>}
      {current.label}
    </span>
  );
};
