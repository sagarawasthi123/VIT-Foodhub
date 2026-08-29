import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  accent?: 'green' | 'orange' | 'red' | 'blue';
}

export function StatCard({ title, value, icon, className, accent = 'green' }: StatCardProps) {
  const accents = {
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  };
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', accents[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
