import type { OrderStatus } from '../../types';
import { ORDER_FLOW } from '../../services/orderService';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrderStatusTrackerProps {
  status: OrderStatus;
  orientation?: 'horizontal' | 'vertical';
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
};

export function OrderStatusTracker({ status, orientation = 'horizontal' }: OrderStatusTrackerProps) {
  const currentIdx = ORDER_FLOW.indexOf(status);

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col gap-1">
        {ORDER_FLOW.map((s, idx) => {
          const done = idx <= currentIdx;
          const current = idx === currentIdx;
          return (
            <div key={s} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                    done
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted bg-background text-muted-foreground',
                    current && 'ring-4 ring-primary/20'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{idx + 1}</span>}
                </div>
                {idx < ORDER_FLOW.length - 1 && (
                  <div className={cn('w-0.5 h-6', done ? 'bg-primary' : 'bg-muted')} />
                )}
              </div>
              <span className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>
                {STATUS_LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {ORDER_FLOW.map((s, idx) => {
        const done = idx <= currentIdx;
        const current = idx === currentIdx;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted bg-background text-muted-foreground',
                  current && 'ring-4 ring-primary/20'
                )}
              >
                {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{idx + 1}</span>}
              </div>
              <span className="mt-1 text-[10px] font-medium text-center w-16">{STATUS_LABELS[s]}</span>
            </div>
            {idx < ORDER_FLOW.length - 1 && (
              <div className={cn('h-0.5 flex-1 mx-1 -mt-5', done ? 'bg-primary' : 'bg-muted')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
