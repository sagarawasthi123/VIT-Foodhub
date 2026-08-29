import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../lib/utils';

export function NotificationsPage() {
  const { notifications, markAsRead, markAllRead, unreadCount } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all read</Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={cn('p-4 cursor-pointer hover:shadow-md transition-shadow', !n.read && 'border-primary/30 bg-primary/5')}
            onClick={() => markAsRead(n.id)}
          >
            <div className="flex items-start gap-3">
              {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
