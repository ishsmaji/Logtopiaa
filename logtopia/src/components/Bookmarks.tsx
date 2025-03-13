
import React from 'react';
import { Bookmark } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BookmarksProps {
  onViewDetails: (log: any) => void;
}

const Bookmarks = ({ onViewDetails }: BookmarksProps) => {
  const { bookmarkedLogs, removeBookmark } = useBookmarks();

  if (bookmarkedLogs.length === 0) {
    return (
      <div className="glass-accent rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bookmark className="w-12 h-12 mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2">No Bookmarked Logs</h3>
          <p className="text-muted-foreground">
            Bookmark important logs by clicking the bookmark icon in the log details view
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-accent rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Bookmark className="mr-2 h-5 w-5" />
          Bookmarked Logs
        </h3>
        <span className="text-sm text-muted-foreground">
          {bookmarkedLogs.length} {bookmarkedLogs.length === 1 ? 'log' : 'logs'} bookmarked
        </span>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {bookmarkedLogs.map(log => (
            <div 
              key={log._id}
              className="bg-accent/20 rounded-md p-3 hover:bg-accent/30 transition-colors cursor-pointer"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className={`log-level mr-2 ${log.level === 'error' ? 'level-error' : log.level === 'warning' ? 'level-warning' : 'level-info'}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-sm font-mono">
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                    </span>
                  </div>
                  <p className="font-medium truncate mb-1">{log.message}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span className="truncate">{log.source}</span>
                  </div>
                </div>
                <div className="ml-4 flex items-start space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => onViewDetails(log)}>
                    View
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeBookmark(log._id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Bookmarks;
