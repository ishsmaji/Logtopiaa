import React from 'react';
import { format } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Log } from '@/hooks/useLogData';
import { useLogSettings } from '@/hooks/useLogSettings';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogDetailsModalProps {
  log: Log | null;
  onClose: () => void;
}

const LogLevelIcon = ({ level }: { level: string }) => {
  const iconProps = { className: "h-5 w-5" };
  
  switch (level) {
    case 'error':
      return <AlertCircle {...iconProps} className="text-log-error" />;
    case 'warning':
      return <AlertTriangle {...iconProps} className="text-log-warning" />;
    case 'info':
      return <Info {...iconProps} className="text-log-info" />;
    default:
      return <Info {...iconProps} />;
  }
};

const LogDetailsModal: React.FC<LogDetailsModalProps> = ({ log, onClose }) => {
  const { settings } = useLogSettings();

  if (!log) return null;

  return (
    <Dialog open={!!log} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <LogLevelIcon level={log.level} />
            <span className="capitalize">{log.level} Log Details</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 p-1">
            {settings.visibleColumns.timestamp && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <div className="font-mono text-sm bg-accent/10 p-2 rounded">
                  {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss.SSS")}
                </div>
              </div>
            )}

            {settings.visibleColumns.level && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Level</label>
                <div className="font-mono text-sm bg-accent/10 p-2 rounded capitalize">
                  {log.level}
                </div>
              </div>
            )}

            {settings.visibleColumns.source && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Source</label>
                <div className="font-mono text-sm bg-accent/10 p-2 rounded">
                  {log.source}
                </div>
              </div>
            )}

            {settings.visibleColumns.message && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Message</label>
                <div className="font-mono text-sm bg-accent/10 p-2 rounded whitespace-pre-wrap">
                  {log.message}
                </div>
              </div>
            )}

            {log.details && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Additional Details</label>
                <pre className="font-mono text-sm bg-accent/10 p-2 rounded overflow-x-auto">
                  {typeof log.details === 'string' 
                    ? log.details 
                    : JSON.stringify(log.details, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogDetailsModal; 