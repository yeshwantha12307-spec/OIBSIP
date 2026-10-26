import React, { useEffect, useState } from 'react';
import { History, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { InventoryLog } from '../../types/index.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminInventoryLogsPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/logs?limit=100');
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-white">Inventory Audit Trail</h1>
          <p className="text-sm text-oasis-muted mt-1">
            Immutable log of all automated customer order deductions, manual restocks, and calibration adjustments.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl border border-oasis-border bg-oasis-card hover:bg-white/5 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
          title="Refresh audit logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-3xl bg-oasis-card border border-oasis-border shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-oasis-muted animate-pulse">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-oasis-muted">
            <span className="text-4xl block">📜</span>
            <p className="font-semibold text-white">No logs recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-oasis-border/60 text-oasis-muted uppercase tracking-wider font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Change Amount</th>
                  <th className="pb-3">Stock Before / After</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Performed By</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => {
                  const isPositive = log.changeAmount > 0;
                  return (
                    <tr key={log._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-4 font-bold text-white">{log.ingredientName}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {isPositive ? `+${log.changeAmount}` : log.changeAmount}
                        </span>
                      </td>
                      <td className="py-4 text-slate-300">
                        {log.previousQuantity} → <strong className="text-white">{log.newQuantity}</strong>
                      </td>
                      <td className="py-4">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-oasis-dark text-slate-300 border border-white/5">
                          {log.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{log.performedBy}</td>
                      <td className="py-4 text-slate-300 max-w-xs truncate">{log.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
