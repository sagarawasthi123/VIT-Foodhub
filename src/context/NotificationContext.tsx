import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppNotification } from '../types';
import { mockNotifications } from '../data/mockData';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications([...mockNotifications]);
  }, []);

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function addNotification(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
    setNotifications((prev) => [
      {
        ...n,
        id: `n${Date.now()}`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
