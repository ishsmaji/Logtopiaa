import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, Bell, BookmarkPlus, DownloadIcon, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Log } from '@/hooks/useLogData';
import { convertLogsToCSV, downloadCSV } from '@/utils/exportUtils';
import { useLogSettings } from '@/hooks/useLogSettings';

interface LogTableProps {
  logs?: Log[];
  isLoading?: boolean;
  onViewDetails: (log: Log) => void;
  selectedLogs?: Log[];
  onLogSelect?: (log: Log) => void;
}

const LogLevelIcon = ({ level }: { level: string }) => {
  const iconProps = { className: "h-4 w-4 mr-1.5" };
  
  switch (level) {
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

const getLevelClass = (level: string) => {
  switch (level) {
    case 'error':
      return 'text-log-error bg-log-error/10';
    case 'warning':
      return 'text-log-warning bg-log-warning/10';
    case 'info':
      return 'text-log-info bg-log-info/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const LogTable: React.FC<LogTableProps> = ({ 
  logs = [], 
  isLoading = false, 
  onViewDetails 
}) => {
  const { settings } = useLogSettings();
  const { toast } = useToast();



  const handleBookmark = (logId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    toast({
      title: "Log Bookmarked",
      description: "This log has been saved to your bookmarks.",
    });
  };

  const handleExport = () => {
    if (!logs?.length) return;
    
    const csv = convertLogsToCSV(logs);
    const filename = `logs-export-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    downloadCSV(csv, filename);
    
    toast({
      title: "Logs Exported",
      description: `${logs.length} logs have been exported to ${filename}`,
    });
  };

  if (isLoading) {
    return (
      <div className="glass rounded-lg p-8 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading logs...</h3>
          <p className="text-muted-foreground">
            Please wait while we fetch the latest logs.
          </p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="glass rounded-lg p-8 text-center animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No logs found</h3>
          <p className="text-muted-foreground">
            No logs match your current filter criteria. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-4 animate-fade-in overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Logs</h2>
        <Button onClick={handleExport} variant="outline" size="sm">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-white/5">
            {settings.visibleColumns.timestamp && (
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Timestamp
              </th>
            )}
            {settings.visibleColumns.level && (
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Level
              </th>
            )}
            {settings.visibleColumns.source && (
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Source
              </th>
            )}
            {settings.visibleColumns.message && (
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Message
              </th>
            )}
            <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {logs.map((log) => (
            <tr
              key={log._id}
              className="hover:bg-accent/10 transition-colors cursor-pointer"
              onClick={() => onViewDetails(log)}
            >
              {settings.visibleColumns.timestamp && (
                <td className="py-3 px-4 text-sm whitespace-nowrap font-mono text-muted-foreground">
                  {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
                </td>
              )}
              {settings.visibleColumns.level && (
                <td className="py-3 px-4">
                  <span className={`log-level ${getLevelClass(log.level)}`}>
                    <LogLevelIcon level={log.level} />
                    {log.level.toUpperCase()}
                  </span>
                </td>
              )}
              {settings.visibleColumns.source && (
                <td className="py-3 px-4 text-sm whitespace-nowrap">
                  {log.source}
                </td>
              )}
              {settings.visibleColumns.message && (
                <td className="py-3 px-4 text-sm overflow-hidden overflow-ellipsis max-w-xs">
                  {log.message}
                </td>
              )}
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View Details</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
