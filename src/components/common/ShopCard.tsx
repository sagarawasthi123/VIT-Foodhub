import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Shop } from '../../types';
import { Card } from '../ui/card';
import { CrowdBadge } from './Badges';

interface ShopCardProps {
  shop: Shop;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Link to={`/student/shops/${shop.id}`}>
      <Card className="overflow-hidden p-0 transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="h-32 overflow-hidden bg-muted">
          <img src={shop.image} alt={shop.name} className="h-full w-full object-cover" />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-tight">{shop.name}</h3>
            <CrowdBadge crowd={shop.crowd} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{shop.category}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
            </div>
            <span
              className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                shop.status === 'open'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {shop.status === 'open' ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
