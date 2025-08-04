"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = uuidv4();
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      const duration = notification.duration ?? 5000;
      setTimeout(() => removeNotification(id), duration);
    },
    [removeNotification]
  );

  const success = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "success", title, message }),
    [addNotification]
  );
  const error = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "error", title, message, duration: 7000 }),
    [addNotification]
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "warning", title, message }),
    [addNotification]
  );
  const info = useCallback(
    (title: string, message?: string) =>
      addNotification({ type: "info", title, message }),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <XCircle className="text-red-500" size={20} />;
      case "warning":
        return <AlertCircle className="text-yellow-500" size={20} />;
      case "info":
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBg = (type: Notification["type"]) => {
    const base =
      "border rounded-lg shadow-lg animate-in slide-in-from-right duration-300";
    switch (type) {
      case "success":
        return `${base} bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700`;
      case "error":
        return `${base} bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700`;
      case "warning":
        return `${base} bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700`;
      case "info":
        return `${base} bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700`;
    }
  };

  if (!notifications.length) return null;

  return (
    <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 space-y-2 w-[calc(100%-1rem)] sm:w-auto max-w-[90%] sm:max-w-sm">
      {notifications.map((n) => (
        <div key={n.id} className={getBg(n.type) + " p-3 sm:p-4"}>
          <div className="flex items-start space-x-2 sm:space-x-3">
            {getIcon(n.type)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {n.title}
              </h4>
              {n.message && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {n.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  return context;
}
