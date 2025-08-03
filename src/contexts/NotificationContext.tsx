"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, XCircle, Info, X } from "lucide-react";

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
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification = { ...notification, id };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto remove after duration
      const duration = notification.duration || 5000;
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification]
  );

  const success = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "success", title, message });
    },
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "error", title, message, duration: 7000 });
    },
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "warning", title, message });
    },
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addNotification({ type: "info", title, message });
    },
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

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "info":
        return "bg-blue-50 border-blue-200";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(
            notification.type
          )} border rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm text-gray-600 mt-1">
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
