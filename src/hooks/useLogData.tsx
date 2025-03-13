import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface LogDetail {
  metadata: {
    userId: string;
    requestId: string;
  };
  stack: string;
}

export interface Log {
  _id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  details: LogDetail;
  __v: number;
}

interface LogStats {
  total: number;
  byLevel: {
    error: number;
    warning: number;
    info: number;
  };
  bySources: {
    [key: string]: number;
  };
}

interface LogFilter {
  startDate: Date | null;
  endDate: Date | null;
  level: string;
  query: string;
}

interface AlertThresholds {
  errorCountThreshold: number; 
  errorRateThreshold: number;
  timeWindowMinutes: number;
}

const DEFAULT_REFRESH_INTERVAL = 5000; 
const DEFAULT_ALERT_THRESHOLDS = {
  errorCountThreshold: 3,
  errorRateThreshold: 0.1, // 10%
  timeWindowMinutes: 10,
};

const BASE_URL = import.meta.env.VITE_REACT_API_URL;

const fetchLogs = async (filters: LogFilter): Promise<Log[]> => {
  const params = new URLSearchParams();
  
  if (filters.startDate) {
    params.append('startDate', filters.startDate.toISOString());
  }
  
  if (filters.endDate) {
    params.append('endDate', filters.endDate.toISOString());
  }
  
  if (filters.level && filters.level !== 'all') {
    params.append('level', filters.level);
  }
  
  if (filters.query) {
    params.append('query', filters.query);
  }
  
  const url = `${BASE_URL}/api/logs${params.toString() ? `?${params.toString()}` : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    let logs = data.success ? data.data : [];
    
    // Client-side search if query exists
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.source.toLowerCase().includes(searchTerm) ||
        log.level.toLowerCase().includes(searchTerm) ||
        log.details?.stack?.toLowerCase().includes(searchTerm) ||
        log.details?.metadata?.userId?.toLowerCase().includes(searchTerm) ||
        log.details?.metadata?.requestId?.toLowerCase().includes(searchTerm)
      );
    }
    
    return logs;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

const fetchStats = async (): Promise<LogStats> => {
  try {
    const response = await fetch(`${BASE_URL}/api/stats`);
    const data = await response.json();
    return data.success ? data.data : { total: 0, byLevel: { error: 0, warning: 0, info: 0 }, bySources: {} };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, byLevel: { error: 0, warning: 0, info: 0 }, bySources: {} };
  }
};

const useLogData = (initialFilters: LogFilter = { startDate: null, endDate: null, level: '', query: '' }) => {
  const [filters, setFilters] = useState<LogFilter>(initialFilters);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [alertThresholds, setAlertThresholds] = useState<AlertThresholds>(DEFAULT_ALERT_THRESHOLDS);
  const [activeAlerts, setActiveAlerts] = useState<Array<{ id: string; message: string; level: string; count: number; timestamp: Date }>>([]);
  
  // Fetch logs with React Query
  const { 
    data: logs, 
    isLoading: logsLoading, 
    error: logsError,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['logs', filters],
    queryFn: () => fetchLogs(filters),
    refetchInterval: autoRefresh ? DEFAULT_REFRESH_INTERVAL : false,
  });
  

  const { 
    data: stats, 
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: autoRefresh ? DEFAULT_REFRESH_INTERVAL : false,
  });
  
 
  const applyFilters = useCallback((newFilters: LogFilter) => {
    setFilters(newFilters);
  }, []);
  

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);
  
  useEffect(() => {
    if (!logs || logs.length === 0) return;
 
    const now = new Date();
    const timeWindow = alertThresholds.timeWindowMinutes * 60 * 1000; // convert to ms
    
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return now.getTime() - logTime.getTime() < timeWindow;
    });
 
    const errorLogs = recentLogs.filter(log => log.level === 'error');
    const errorCount = errorLogs.length;

    const errorRate = recentLogs.length > 0 ? errorCount / recentLogs.length : 0;
    
    const newAlerts = [];
    

    if (errorCount >= alertThresholds.errorCountThreshold) {
      newAlerts.push({
        id: `error-count-${Date.now()}`,
        message: `${errorCount} errors detected in the last ${alertThresholds.timeWindowMinutes} minutes`,
        level: 'error',
        count: errorCount,
        timestamp: new Date(),
      });
    }
    
    if (errorRate >= alertThresholds.errorRateThreshold) {
      newAlerts.push({
        id: `error-rate-${Date.now()}`,
        message: `Error rate of ${(errorRate * 100).toFixed(1)}% exceeds threshold of ${(alertThresholds.errorRateThreshold * 100).toFixed(1)}%`,
        level: 'error',
        count: errorCount,
        timestamp: new Date(),
      });
    }
    
    if (newAlerts.length > 0) {
      setActiveAlerts(prev => [...newAlerts, ...prev].slice(0, 5)); // Keep the 5 most recent alerts
    }
  }, [logs, alertThresholds]);

  const refreshData = useCallback(() => {
    refetchLogs();
    refetchStats();
  }, [refetchLogs, refetchStats]);
  
  return {
    logs,
    stats,
    filters,
    applyFilters,
    logsLoading,
    statsLoading,
    logsError,
    autoRefresh,
    toggleAutoRefresh,
    refreshData,
    activeAlerts,
    alertThresholds,
    setAlertThresholds,
  };
};

export default useLogData;