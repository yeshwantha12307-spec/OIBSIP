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
          <h1 className="font-serif text-3xl font-black text-white">Inventory Management</h1>
          <p className="text-sm text-oasis-muted mt-1">
            Real-time kitchen inventory quantities, low-stock safety thresholds, and atomic stock controls.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="p-2.5 rounded-xl border border-oasis-border bg-oasis-card hover:bg-white/5 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh inventory"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-oasis-card border border-oasis-border">
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-oasis-amber text-oasis-dark'
                  : 'bg-oasis-dark text-slate-300 hover:text-white border border-oasis-border/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-oasis-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredient..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-oasis-dark border border-oasis-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-oasis-amber transition-colors"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-oasis-muted animate-pulse">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-oasis-muted">
            <span className="text-4xl block">📦</span>
            <p className="font-semibold text-white">No ingredients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-oasis-border/60 text-oasis-muted uppercase tracking-wider font-semibold">
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Available Quantity</th>
                  <th className="pb-3">Safety Threshold</th>
                  <th className="pb-3">Price Modifier</th>
                  <th className="pb-3">Stock Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 font-bold text-white">
                      {item.name}
                      <span className="block text-[11px] text-oasis-muted font-normal">
                        {item.description}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-white">
                      {item.availableQuantity} {item.unit}
                    </td>
                    <td className="py-4 text-slate-400">
                      {item.lowStockThreshold} {item.unit}
                    </td>
                    <td className="py-4 font-bold text-oasis-amber">
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
                        className="px-3 py-1.5 rounded-xl border border-oasis-border bg-oasis-dark hover:bg-white/10 text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-oasis-amber" />
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-oasis-card border border-oasis-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-oasis-border/60">
              <div>
                <span className="text-xs font-bold text-oasis-amber uppercase tracking-wider block">
                  Inventory Stock Adjustment
                </span>
                <h3 className="font-serif text-xl font-bold text-white">{adjustingItem.name}</h3>
                <p className="text-xs text-oasis-muted">
                  Current stock: {adjustingItem.availableQuantity} {adjustingItem.unit}
                </p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Quantity ({adjustingItem.unit}) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-oasis-dark border border-oasis-border text-white text-sm focus:outline-none focus:border-oasis-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Reason for Adjustment *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-oasis-dark border border-oasis-border text-white text-xs focus:outline-none focus:border-oasis-amber"
                >
                  <option value="manual_restock">Manual Restock / Shipment Received</option>
                  <option value="spoilage_adjustment">Kitchen Spoilage / Expired</option>
                  <option value="order_cancellation_restore">Order Cancellation Restock</option>
                  <option value="initial_seed">Inventory Recount / Calibration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Audit Notes (Optional)
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Received fresh batch from supplier"
                  className="w-full px-4 py-2.5 rounded-xl bg-oasis-dark border border-oasis-border text-white text-xs focus:outline-none focus:border-oasis-amber"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-oasis-border bg-oasis-dark text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-oasis-amber hover:bg-amber-400 text-oasis-dark text-xs font-bold transition-all"
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
