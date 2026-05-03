import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_ALERTS } from '../utils/mockData';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markRead = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts((prev) => [{ id: `a${Date.now()}`, read: false, ts: new Date().toISOString(), ...alert }, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider value={{ alerts, unreadCount, markRead, markAllRead, addAlert }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
