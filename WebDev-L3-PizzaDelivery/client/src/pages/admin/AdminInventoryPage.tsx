import React, { useEffect, useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  X,
  Flame,
} from 'lucide-react';
import { Ingredient, StockStatus } from '../../types/index.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminInventoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Adjustment Modal State
  const [adjustingItem, setAdjustingItem] = useState<Ingredient | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('manual_restock');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = categoryFilter === 'ALL' ? '/inventory' : `/inventory?category=${categoryFilter}`;
      const res = await api.get(url);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to fetch inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [categoryFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setSaving(true);
    try {
      const res = await api.post(`/inventory/adjust/${adjustingItem._id}`, {
        newQuantity: Number(newQuantity),
        reason: adjustReason,
        notes: adjustNotes,
      });

      if (res.success) {
        showToast(`Stock updated for ${adjustingItem.name} to ${newQuantity} ${adjustingItem.unit}`, 'success');
        setAdjustingItem(null);
        fetchInventory();
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to update stock', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Inventory Management</h1>
          <p className="text-sm text-[#765747] mt-1 font-medium">
            Real-time kitchen inventory quantities, low-stock safety thresholds, and atomic stock controls.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-warm-sm self-start sm:self-auto"
          title="Refresh inventory"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'base', label: 'Bases' },
            { id: 'sauce', label: 'Sauces' },
            { id: 'cheese', label: 'Cheeses' },
            { id: 'veggie', label: 'Veggies' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                categoryFilter === cat.id
                  ? 'bg-[#D92D20] text-white shadow-glow-red'
                  : 'bg-[#FFF8EF] text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] border border-[#F2E8DC]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#765747] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredient..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-xs text-[#38251F] placeholder:text-[#765747] focus:outline-none focus:border-[#D92D20] transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#765747] animate-pulse">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#765747]">
            <span className="text-4xl block">📦</span>
            <p className="font-bold text-[#38251F] text-base">No ingredients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2E8DC] text-[#765747] uppercase tracking-wider font-bold">
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Available Quantity</th>
                  <th className="pb-3">Safety Threshold</th>
                  <th className="pb-3">Price Modifier</th>
                  <th className="pb-3">Stock Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E8DC]">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-[#FFF8EF] transition-colors">
                    <td className="py-4 font-bold text-[#38251F]">
                      {item.name}
                      <span className="block text-[11px] text-[#765747] font-normal">
                        {item.description}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E8DC] text-[#38251F] border border-[#E6D9C8]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-[#38251F]">
                      {item.availableQuantity} {item.unit}
                    </td>
                    <td className="py-4 text-[#765747] font-medium">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="py-4 font-bold text-[#D97706]">
                      {item.priceModifier === 0 ? 'Free' : `+₹${item.priceModifier}`}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={item.stockStatus || 'IN_STOCK'} type="stock" />
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingItem(item);
                          setNewQuantity(item.availableQuantity);
                          setAdjustReason('manual_restock');
                          setAdjustNotes('');
                        }}
                        className="px-3.5 py-1.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] hover:bg-[#F2E8DC] text-[#38251F] font-semibold text-xs inline-flex items-center gap-1.5 transition-colors shadow-warm-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#D97706]" />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-[#38251F]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFCF7] border border-[#F2E8DC] rounded-3xl p-6 sm:p-8 space-y-6 shadow-warm-xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#F2E8DC]">
              <div>
                <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block">
                  Inventory Stock Adjustment
                </span>
                <h3 className="font-serif text-xl font-bold text-[#38251F] mt-0.5">{adjustingItem.name}</h3>
                <p className="text-xs text-[#765747] mt-0.5">
                  Current stock: <strong className="text-[#38251F]">{adjustingItem.availableQuantity} {adjustingItem.unit}</strong>
                </p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-2xl text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                  New Quantity ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-sm focus:outline-none focus:border-[#D92D20] shadow-inner transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-xs focus:outline-none focus:border-[#D92D20] shadow-inner transition-colors font-medium"
                >
                  <option value="manual_restock">Manual Restock / Shipment Received</option>
                  <option value="spoilage_adjustment">Kitchen Spoilage / Expired</option>
                  <option value="order_cancellation_restore">Order Cancellation Restock</option>
                  <option value="initial_seed">Inventory Recount / Calibration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#38251F] uppercase tracking-wider mb-1.5">
                  Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Received fresh batch from supplier"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF8EF] border border-[#F2E8DC] text-[#38251F] text-xs placeholder:text-[#765747] focus:outline-none focus:border-[#D92D20] shadow-inner transition-colors font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFF8EF] text-[#765747] hover:text-[#38251F] hover:bg-[#F2E8DC] text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white text-xs font-bold shadow-glow-red transition-all"
                >
                  {saving ? 'Updating...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
