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
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Inventory Audit Trail</h1>
          <p className="text-sm text-[#765747] mt-1 font-medium">
            Immutable log of all automated customer order deductions, manual restocks, and calibration adjustments.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-warm-sm self-start sm:self-auto"
          title="Refresh audit logs"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Logs Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#765747] animate-pulse">Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#765747]">
            <span className="text-4xl block">📜</span>
            <p className="font-bold text-[#38251F] text-base">No logs recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2E8DC] text-[#765747] uppercase tracking-wider font-bold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Change Amount</th>
                  <th className="pb-3">Stock Before / After</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Performed By</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E8DC]">
                {logs.map((log) => {
                  const isPositive = log.changeAmount > 0;
                  return (
                    <tr key={log._id} className="hover:bg-[#FFF8EF] transition-colors">
                      <td className="py-4 text-[#765747] whitespace-nowrap font-medium">
                        {new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-4 font-bold text-[#38251F]">{log.ingredientName}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
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
                      <td className="py-4 text-[#765747]">
                        {log.previousQuantity} → <strong className="text-[#38251F]">{log.newQuantity}</strong>
                      </td>
                      <td className="py-4">
                        <span className="capitalize px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2E8DC] text-[#38251F] border border-[#E6D9C8]">
                          {log.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-[#765747] font-medium">{log.performedBy}</td>
                      <td className="py-4 text-[#765747] max-w-xs truncate font-medium">{log.notes || '—'}</td>
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
