import React from 'react';
import { format } from 'date-fns';
import { X, AlertCircle, AlertTriangle, Info, Copy, Download, Bookmark, BookmarkCheck } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Log } from '@/hooks/useLogData';
import { useBookmarks } from '@/hooks/useBookmarks';
import { convertLogsToCSV, downloadCSV } from '@/utils/exportUtils';

interface LogDetailProps {
  log: Log | null;
  onClose: () => void;
}

const LogDetail = ({ log, onClose }: LogDetailProps) => {
  const { toast } = useToast();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  
  if (!log) return null;
  
  const bookmarked = isBookmarked(log._id);
  
  const getLevelIcon = (level: string) => {
    const iconProps = { className: "h-5 w-5 mr-2" };
    
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
  
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    
    toast({
      title: "Log copied",
      description: "Log details copied to clipboard as JSON",
    });
  };
  
  const handleCopyStack = () => {
    if (log.details?.stack) {
      navigator.clipboard.writeText(log.details.stack);
      
      toast({
        title: "Stack trace copied",
        description: "Stack trace copied to clipboard",
      });
    }
  };
  
  const handleToggleBookmark = () => {
    if (bookmarked) {
      removeBookmark(log._id);
      toast({
        title: "Bookmark removed",
        description: "Log has been removed from bookmarks",
      });
    } else {
      addBookmark(log);
      toast({
        title: "Bookmark added",
        description: "Log has been added to bookmarks",
      });
    }
  };

  const handleExport = () => {
    if (!log) return;
    
    const csv = convertLogsToCSV([log]);
    const filename = `log-${log._id}-${format(new Date(log.timestamp), 'yyyy-MM-dd-HH-mm')}.csv`;
    downloadCSV(csv, filename);
    
    toast({
      title: "Log Exported",
      description: "Log details have been exported to CSV",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="glass w-full max-w-5xl rounded-lg shadow-xl animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center">
            {getLevelIcon(log.level)}
            <h2 className="text-xl font-medium">Log Details</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleToggleBookmark}
              className={bookmarked ? "text-yellow-400" : ""}
            >
              {bookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Message</h3>
              <p className="text-lg font-medium mb-4">{log.message}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Level</h4>
                  <span className={`log-level ${log.level === 'error' ? 'level-error' : log.level === 'warning' ? 'level-warning' : 'level-info'}`}>
                    {log.level.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
                  <p>{log.source}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Timestamp</h4>
                  <p className="font-mono text-sm">
                    {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss.SSS")}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">ID</h4>
                  <p className="font-mono text-sm truncate">{log._id}</p>
                </div>
              </div>
              
              {log.details?.metadata && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Metadata</h3>
                  <div className="bg-accent/20 rounded-md p-3 mb-6">
                    {Object.entries(log.details.metadata).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-4 mb-1">
                        <span className="font-medium text-muted-foreground">{key}</span>
                        <span className="col-span-2 font-mono text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {log.details?.stack && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Stack Trace</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopyStack}>
                    <Copy className="h-3.5 w-3.5 mr-2" />
                    Copy
                  </Button>
                </div>
                <ScrollArea className="h-60 w-full">
                  <pre className="bg-accent/20 rounded-md p-3 overflow-auto text-xs font-mono whitespace-pre-wrap break-words">
                    {log.details.stack}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-4 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={handleCopyJson}>
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copy as JSON
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDetail;
