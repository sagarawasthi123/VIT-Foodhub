import { Link } from 'react-router-dom';
import { Store, Clock } from 'lucide-react';
import type { Order } from '../../types';
import { Card } from '../ui/card';
import { StatusBadge } from './Badges';

interface OrderCardProps {
  order: Order;
  to?: string;
  action?: React.ReactNode;
}

export function OrderCard({ order, to, action }: OrderCardProps) {
  const content = (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">#{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Store className="h-3.5 w-3.5" /> {order.shopName}
          </div>
        </div>
        <span className="font-bold">₹{order.totalAmount}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {order.items.map((it, idx) => (
          <span key={idx} className="text-xs bg-muted rounded-full px-2 py-0.5">
            {it.quantity}× {it.name}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> Pickup: {order.estimatedPickupTime}
        </span>
        {action}
      </div>
    </Card>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return content;
}
