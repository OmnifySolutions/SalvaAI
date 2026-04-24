"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type ToastNotification = {
  id: string;
  title: string;
  body: string;
  urgency: "emergency" | "urgent" | "routine";
  locationName: string | null;
  channel: string;
  createdAt: string;
};

type NotificationContextValue = {
  toasts: ToastNotification[];
  pushToast: (n: Omit<ToastNotification, "id">) => void;
  dismissToast: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue>({
  toasts: [],
  pushToast: () => {},
  dismissToast: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const pushToast = useCallback((n: Omit<ToastNotification, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { ...n, id }]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, pushToast, dismissToast }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
