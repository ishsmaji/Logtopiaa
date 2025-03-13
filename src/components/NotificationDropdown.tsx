import React from 'react';
import { Bell, Check, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAlerts } from '@/contexts/AlertContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, clearAlerts } = useAlerts();
  const unreadCount = alerts.filter(alert => !alert.read).length;

  const getAlertIcon = (type: 'error' | 'warning') => {
    const iconProps = { className: 'h-4 w-4 mr-2' };
    return type === 'error' ? (
      <AlertCircle {...iconProps} className="text-destructive" />
    ) : (
      <AlertTriangle {...iconProps} className="text-warning" />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={markAllAlertsAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={clearAlerts}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          <DropdownMenuGroup>
            {alerts.length === 0 ? (
              <div className="py-4 px-2 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              alerts.map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  className={`px-4 py-2 ${!alert.read ? 'bg-muted/50' : ''}`}
                  onClick={() => markAlertAsRead(alert.id)}
                >
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {alert.title}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuGroup>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown; 