import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-xl bg-[#F2E8DC]/70 ${className}`} />
);

export const PizzaCardSkeleton: React.FC = () => (
  <div className="bg-[#FFFCF7] rounded-3xl border border-[#F2E8DC] p-5 shadow-warm-sm flex flex-col justify-between h-[430px]">
    <div className="space-y-4">
      <Skeleton className="w-full h-52 rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-5 rounded-full" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-6 rounded-lg" />
      <Skeleton className="w-full h-4 rounded-md" />
      <Skeleton className="w-2/3 h-4 rounded-md" />
    </div>
    <div className="pt-4 border-t border-[#F2E8DC] flex items-center justify-between">
      <Skeleton className="w-20 h-7 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>
    </div>
  </div>
);

export const PizzaDetailsSkeleton: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
    <div className="lg:col-span-6 space-y-4">
      <Skeleton className="w-full h-96 lg:h-[480px] rounded-3xl" />
    </div>
    <div className="lg:col-span-6 space-y-6">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-28 h-6 rounded-full" />
        </div>
        <Skeleton className="w-4/5 h-10 rounded-xl" />
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-full h-24 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="pt-6 border-t border-[#F2E8DC] flex gap-4">
        <Skeleton className="w-32 h-14 rounded-2xl" />
        <Skeleton className="flex-1 h-14 rounded-2xl" />
      </div>
    </div>
  </div>
);

export const OrderHistorySkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-6 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-36 h-6 rounded-lg" />
            <Skeleton className="w-24 h-6 rounded-full" />
          </div>
          <Skeleton className="w-48 h-4 rounded-md" />
          <Skeleton className="w-3/4 h-4 rounded-md" />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6">
          <Skeleton className="w-24 h-8 rounded-lg" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => (
  <tr className="border-b border-[#F2E8DC]">
    {Array.from({ length: cols }).map((_, idx) => (
      <td key={idx} className="py-4 px-3">
        <Skeleton className="w-full h-5 rounded-md" />
      </td>
    ))}
  </tr>
);

