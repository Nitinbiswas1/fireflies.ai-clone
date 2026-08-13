"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let _nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++_nextId;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 p-3.5 rounded-lg shadow-lg border text-sm animate-in slide-in-from-bottom-2 duration-200 ${
              t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
