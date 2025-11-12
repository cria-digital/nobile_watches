import { Notification, NotificationType } from "@/lib/constants/sellWatch";
import { useCallback, useState } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, title: string, message: string) => {
      const id = Math.random().toString(36).substr(2, 9);
      const notification: Notification = { id, type, title, message };

      setNotifications(prev => [...prev, notification]);

      // Remove automaticamente após 5 segundos
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
