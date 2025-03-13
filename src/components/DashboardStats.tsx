import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface DashboardStatsProps {
  totalLogs: number;
  errorRate: number;
  lastErrorTime: Date | null;
  recentErrors: number;
}

const DashboardStats = ({
  totalLogs,
  errorRate,
  lastErrorTime,
  recentErrors,
}: DashboardStatsProps) => {
  const formatLastError = (date: Date | null) => {
    if (!date) return 'No errors';
    const distance = formatDistanceToNow(date, { addSuffix: true });
    if (distance.includes('less than a minute')) {
      return 'less than a minute ago';
    }
    return distance;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
            <p className="text-2xl font-bold">{totalLogs}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Error Rate (1h)</p>
            <p className="text-2xl font-bold">{errorRate.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Last Error</p>
            <p className="text-2xl font-bold">{formatLastError(lastErrorTime)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Recent Errors</p>
            <p className="text-2xl font-bold">{recentErrors}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats; 