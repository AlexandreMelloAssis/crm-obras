"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationTone = "success" | "error" | "warning" | "info";

type NotificationInput = {
  title?: string;
  message: string;
  tone?: NotificationTone;
  durationMs?: number;
};

type NotificationItem = NotificationInput & {
  id: string;
  tone: NotificationTone;
};

type NotificationContextValue = {
  notify: (input: NotificationInput) => string;
  dismiss: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const counterRef = useRef(0);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, tone = "info", durationMs = 4500 }: NotificationInput) => {
      const normalizedMessage = message.trim();
      if (!normalizedMessage) return "";

      counterRef.current += 1;
      const id = `notification-${counterRef.current}`;

      setItems((current) => [
        ...current,
        {
          id,
          title,
          message: normalizedMessage,
          tone,
          durationMs,
        },
      ]);

      window.setTimeout(() => dismiss(id), durationMs);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      notify,
      dismiss,
    }),
    [dismiss, notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="notification-stack" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div key={item.id} className={`notification-toast notification-${item.tone}`} role="status">
            <div style={{ display: "grid", gap: "0.25rem" }}>
              {item.title ? <strong>{item.title}</strong> : null}
              <span>{item.message}</span>
            </div>
            <button
              type="button"
              className="notification-close"
              onClick={() => dismiss(item.id)}
              aria-label="Fechar notificacao"
            >
              x
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
