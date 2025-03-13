import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  type: 'error' | 'warning';
  read: boolean;
}

export interface AlertSettings {
  errorCountThreshold: number;
  errorRateThreshold: number;
  warningRateThreshold: number;
  timeWindowMinutes: number;
  enableEmailNotifications: boolean;
  enableSystemNotifications: boolean;
  emailRecipients: string[];
}

interface AlertContextType {
  settings: AlertSettings;
  alerts: Alert[];
  updateSettings: (newSettings: Partial<AlertSettings>) => void;
  checkAlertConditions: (logs: any[]) => void;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  clearAlerts: () => void;
}

const defaultSettings: AlertSettings = {
  errorCountThreshold: 5,
  errorRateThreshold: 10, 
  warningRateThreshold: 20,
  timeWindowMinutes: 10,
  enableEmailNotifications: false,
  enableSystemNotifications: true,
  emailRecipients: [],
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastAlertTimes, setLastAlertTimes] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedAlerts = localStorage.getItem('alertHistory');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      })));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('alertHistory', JSON.stringify(alerts));
  }, [alerts]);

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('alertSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const addAlert = (title: string, message: string, type: 'error' | 'warning') => {
    const now = Date.now();
    const alertKey = `${type}-${title}`;
    const cooldownPeriod = 5 * 60 * 1000; 
    if (lastAlertTimes[alertKey] && (now - lastAlertTimes[alertKey]) < cooldownPeriod) {
      return null;
    }
    setLastAlertTimes(prev => ({
      ...prev,
      [alertKey]: now
    }));

    const newAlert: Alert = {
      id: now.toString(),
      title,
      message,
      timestamp: new Date(),
      type,
      read: false
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); 
    return newAlert;
  };

  const markAlertAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAlertsAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const sendEmailNotification = async (message: string) => {
    if (!settings.enableEmailNotifications || settings.emailRecipients.length === 0) return;
    console.log('Sending email notification:', message, 'to:', settings.emailRecipients);
  };

  const sendSystemNotification = async (title: string, message: string) => {
    if (!settings.enableSystemNotifications) return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    }
  };

  const checkAlertConditions = (logs: any[]) => {
    if (!logs.length) return;

    const now = new Date();
    const timeWindow = settings.timeWindowMinutes * 60 * 1000;
    const recentLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() > now.getTime() - timeWindow
    );

    if (recentLogs.length === 0) return; 


    const recentErrors = recentLogs.filter(log => log.level === 'error');
    if (recentErrors.length >= settings.errorCountThreshold) {
      const message = `${recentErrors.length} errors detected in the last ${settings.timeWindowMinutes} minutes`;
      const alert = addAlert('Error Count Alert', message, 'error');
      
      if (alert) { 
        toast({
          title: alert.title,
          description: alert.message,
          variant: "destructive",
        });
        sendEmailNotification(message);
        sendSystemNotification(alert.title, alert.message);
      }
    }


    const errorRate = (recentErrors.length / recentLogs.length) * 100;
    if (errorRate >= settings.errorRateThreshold) {
      const message = `Error rate of ${errorRate.toFixed(1)}% exceeds threshold of ${settings.errorRateThreshold}%`;
      const alert = addAlert('Error Rate Alert', message, 'error');
      
      if (alert) {
        toast({
          title: alert.title,
          description: alert.message,
          variant: "destructive",
        });
        sendEmailNotification(message);
        sendSystemNotification(alert.title, alert.message);
      }
    }


    const recentWarnings = recentLogs.filter(log => log.level === 'warning');
    const warningRate = (recentWarnings.length / recentLogs.length) * 100;
    if (warningRate >= settings.warningRateThreshold) {
      const message = `Warning rate of ${warningRate.toFixed(1)}% exceeds threshold of ${settings.warningRateThreshold}%`;
      const alert = addAlert('Warning Rate Alert', message, 'warning');
      
      if (alert) {
        toast({
          title: alert.title,
          description: alert.message,
          variant: "warning",
        });
        sendEmailNotification(message);
        sendSystemNotification(alert.title, alert.message);
      }
    }
  };

  return (
    <AlertContext.Provider value={{ 
      settings, 
      alerts,
      updateSettings, 
      checkAlertConditions,
      markAlertAsRead,
      markAllAlertsAsRead,
      clearAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};