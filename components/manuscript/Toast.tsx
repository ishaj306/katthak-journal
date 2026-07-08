"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<ToastTone, string> = {
  success: "check_circle",
  error: "error",
  info: "auto_stories",
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast-enter pointer-events-auto flex items-center gap-3 border border-secondary bg-surface px-5 py-3 shadow-lg"
            style={{
              boxShadow: "inset 0 0 0 1px rgba(184,137,62,0.4), 0 6px 20px rgba(78,6,22,0.12)",
            }}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                color: t.tone === "error" ? "#ba1a1a" : "#7e570d",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {TONE_ICON[t.tone]}
            </span>
            <span className="font-serif text-body-md text-on-surface">
              {t.message}
            </span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // No-op fallback so components never crash outside the provider.
    return { toast: () => {} };
  }
  return ctx;
}
