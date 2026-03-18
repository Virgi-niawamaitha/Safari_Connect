import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ToastType } from '../types';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }, []);

  const colors: Record<ToastType, string> = {
    success: '#0ea371',
    error:   '#ef4444',
    warning: '#f59e0b',
    info:    '#3b82f6',
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
            color: '#fff', background: colors[t.type], boxShadow: '0 8px 24px rgba(0,0,0,.15)',
            animation: 'slideUp .25s ease', maxWidth: 320,
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  return useContext(ToastContext);
}
