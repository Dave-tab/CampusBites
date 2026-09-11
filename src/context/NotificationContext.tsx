import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
  toastMessage: { title: string; message: string } | null;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  const refreshNotifications = useCallback(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const userNotifs = DataService.getNotificationsForUser(currentUser.id);
    setNotifications(userNotifs);
  }, [currentUser]);

  useEffect(() => {
    refreshNotifications();
    // Poll for changes to simulate real-time status notifications
    const interval = setInterval(() => {
      refreshNotifications();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentUser, refreshNotifications]);

  const markAsRead = (id: string) => {
    DataService.markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    if (currentUser) {
      DataService.markAllNotificationsAsRead(currentUser.id);
      refreshNotifications();
    }
  };

  const clearToast = () => setToastMessage(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
