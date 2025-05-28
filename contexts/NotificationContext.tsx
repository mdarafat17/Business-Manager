import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Notification, NotificationType, NotificationContextType } from '../types';
import { generateId } from '../utils/helpers';
import { NOTIFICATION_TIMEOUT_MS } from '../constants';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const newNotification: Notification = {
      id: generateId(),
      message,
      type,
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);

    setTimeout(() => {
      removeNotification(newNotification.id);
    }, NOTIFICATION_TIMEOUT_MS);
  }, [removeNotification]);


  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
