
import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Alert = {
  id: string;
  message: string;
  level: 'error' | 'warning';
  count: number;
  timestamp: Date;
};

const AlertBanner = ({ alerts = [] }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (alerts.length > 0) {
      setVisible(true);
    }
  }, [alerts]);

  if (!visible || alerts.length === 0) return null;

  const totalErrorCount = alerts.reduce((total, alert) => total + alert.count, 0);

  return (
    <div className="fixed top-16 inset-x-0 flex justify-center z-20 animate-fade-slide-down">
      <div className="glass-accent max-w-3xl w-full mx-4 p-3 rounded-lg border border-log-error/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-log-error mr-2" />
            <span className="font-medium">
              {alerts.length === 1 
                ? alerts[0].message 
                : `${alerts.length} alert${alerts.length > 1 ? 's' : ''} detected`}
              {totalErrorCount > alerts.length && ` (${totalErrorCount} occurrences)`}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
