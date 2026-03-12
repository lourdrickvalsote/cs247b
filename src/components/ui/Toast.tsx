import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

type ToastType = 'error' | 'success';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 200);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon = toast.type === 'error' ? AlertCircle : CheckCircle;
  const bgColor = toast.type === 'error' ? 'bg-jet-50 dark:bg-jet-800 border-jet-100 dark:border-jet-700' : 'bg-forest-50 dark:bg-forest-950 border-forest-100 dark:border-forest-800';
  const iconColor = toast.type === 'error' ? 'text-jet-600 dark:text-jet-300' : 'text-forest dark:text-forest-300';

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 p-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-200 ${bgColor} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <p className="text-sm text-jet dark:text-jet-100 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-jet-300 dark:text-jet-500 hover:text-jet-500 dark:hover:text-jet-300">
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 rounded-full" style={{ animation: 'shrink 4s linear forwards' }} />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
