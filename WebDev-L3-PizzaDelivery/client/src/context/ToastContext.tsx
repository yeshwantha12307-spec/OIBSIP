import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const id = `${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container floating bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-[#D92D20] shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" />,
            info: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
          };

          const borders = {
            success: 'border-[#198754]/30 bg-[#FFFCF7]',
            error: 'border-[#D92D20]/30 bg-[#FFFCF7]',
            warning: 'border-[#D97706]/30 bg-[#FFFCF7]',
            info: 'border-[#2563EB]/30 bg-[#FFFCF7]',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border shadow-warm-lg transition-all duration-300 animate-in slide-in-from-bottom-3 ${
                borders[toast.type]
              }`}
            >
              <div className="flex items-center gap-3">
                {icons[toast.type]}
                <p className="text-sm font-semibold text-[#38251F] leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#765747] hover:text-[#38251F] transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
