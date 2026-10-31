import React, { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { InventoryAlert } from '../../types/index.js';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.js';

export const AdminAlertsPage: React.FC = () => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/alerts');
      if (res.success && Array.isArray(res.data)) {
        setAlerts(res.data);
      }
    } catch (err) {
      showToast((err as Error).message || 'Failed to load alerts history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleTriggerAudit = async () => {
    setAuditing(true);
    try {
      const res = await api.post('/inventory/check-alerts');
      showToast(res.message || 'Audit check executed successfully', 'success');
      fetchAlerts();
    } catch (err) {
      showToast((err as Error).message || 'Failed to trigger audit', 'error');
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-black text-[#38251F]">Low-Stock Alert History</h1>
          <p className="text-sm text-[#765747] mt-1 font-medium">
            Automated node-cron scheduler alert dispatches and resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAlerts}
            className="p-2.5 rounded-2xl border border-[#F2E8DC] bg-[#FFFCF7] hover:bg-[#F2E8DC] text-[#38251F] transition-colors shadow-warm-sm"
            title="Refresh alerts"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleTriggerAudit}
            disabled={auditing}
            className="px-4 py-2.5 rounded-2xl bg-[#D92D20] hover:bg-[#A91F18] text-white font-bold text-xs flex items-center gap-2 shadow-glow-red transition-all active:scale-95 disabled:opacity-50"
          >
            {auditing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <BellRing className="w-4 h-4" />
            )}
            Trigger Scheduler Check Now
          </button>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFCF7] border border-[#F2E8DC] shadow-warm-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#765747] animate-pulse">Loading alert history...</div>
        ) : alerts.length === 0 ? (
          <div className="py-20 text-center space-y-2 text-[#765747]">
            <span className="text-4xl block">🔔</span>
            <p className="font-bold text-[#38251F] text-base">No low-stock alerts triggered yet</p>
            <p className="text-xs">
              All ingredients are currently stocked above their minimum safety thresholds.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F2E8DC] text-[#765747] uppercase tracking-wider font-bold">
                  <th className="pb-3">Alert Triggered</th>
                  <th className="pb-3">Ingredient</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Breach Level</th>
                  <th className="pb-3">Threshold Limit</th>
                  <th className="pb-3">Email Sent To</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Resolution State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2E8DC]">
                {alerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-[#FFF8EF] transition-colors">
                    <td className="py-4 text-[#765747] whitespace-nowrap font-medium">
                      {new Date(alert.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 font-bold text-[#38251F]">{alert.ingredientName}</td>
                    <td className="py-4 capitalize text-[#765747] font-medium">{alert.category}</td>
                    <td className="py-4 font-bold text-[#D92D20]">
                      {alert.currentQuantity} {alert.unit}
                    </td>
                    <td className="py-4 text-[#765747] font-medium">
                      {alert.lowStockThreshold} {alert.unit}
                    </td>
                    <td className="py-4 text-[#765747] flex items-center gap-1.5 font-medium">
                      <Mail className="w-3.5 h-3.5 text-[#9C8577]" />
                      {alert.sentToEmail}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          alert.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/30'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {alert.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolved{' '}
                          {alert.resolvedAt &&
                            `(${new Date(alert.resolvedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })})`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#D92D20] font-bold animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Unresolved Breach
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
